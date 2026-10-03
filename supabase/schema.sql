-- DevHub CMS schema.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run: every statement is idempotent.

create extension if not exists pgcrypto;

-- ─── Admins ────────────────────────────────────────────────────────────────
-- A user can sign in only if Supabase Auth knows them, and can edit content
-- only if their id is in this table.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ─── Content tables ────────────────────────────────────────────────────────
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  excerpt      text not null default '',
  body         text not null default '',
  cover_url    text,
  tags         text[] not null default '{}',
  status       text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  client        text not null default '',
  client_detail text not null default '',
  period_label  text not null default '',
  status        text not null default 'completed' check (status in ('ongoing', 'completed')),
  phases        text[] not null default '{}',
  summary       text not null default '',
  body          text not null default '',
  cover_url     text,
  featured      boolean not null default false,
  published     boolean not null default true,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.gallery_items (
  id         uuid primary key default gen_random_uuid(),
  image_url  text not null,
  caption    text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 1 and 200),
  email        text not null check (char_length(email) between 3 and 320),
  organization text not null default '' check (char_length(organization) <= 200),
  message      text not null check (char_length(message) between 1 and 5000),
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ─── updated_at bookkeeping ────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ─── Row level security ────────────────────────────────────────────────────
alter table public.admins           enable row level security;
alter table public.posts            enable row level security;
alter table public.projects         enable row level security;
alter table public.gallery_items    enable row level security;
alter table public.site_settings    enable row level security;
alter table public.contact_messages enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.posts, public.projects, public.gallery_items, public.site_settings to anon, authenticated;
grant insert, update, delete on public.posts, public.projects, public.gallery_items, public.site_settings to authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant select on public.admins to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- posts: the public sees published posts whose publish date has passed
drop policy if exists "posts public read" on public.posts;
create policy "posts public read" on public.posts
  for select using (
    (status = 'published' and published_at is not null and published_at <= now())
    or public.is_admin()
  );
drop policy if exists "posts admin write" on public.posts;
create policy "posts admin write" on public.posts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- projects
drop policy if exists "projects public read" on public.projects;
create policy "projects public read" on public.projects
  for select using (published or public.is_admin());
drop policy if exists "projects admin write" on public.projects;
create policy "projects admin write" on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- gallery
drop policy if exists "gallery public read" on public.gallery_items;
create policy "gallery public read" on public.gallery_items
  for select using (true);
drop policy if exists "gallery admin write" on public.gallery_items;
create policy "gallery admin write" on public.gallery_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- site settings
drop policy if exists "settings public read" on public.site_settings;
create policy "settings public read" on public.site_settings
  for select using (true);
drop policy if exists "settings admin write" on public.site_settings;
create policy "settings admin write" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- contact messages: anyone may send, only admins may read
drop policy if exists "messages public insert" on public.contact_messages;
create policy "messages public insert" on public.contact_messages
  for insert to anon, authenticated with check (is_read = false);
drop policy if exists "messages admin read" on public.contact_messages;
create policy "messages admin read" on public.contact_messages
  for select to authenticated using (public.is_admin());
drop policy if exists "messages admin update" on public.contact_messages;
create policy "messages admin update" on public.contact_messages
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "messages admin delete" on public.contact_messages;
create policy "messages admin delete" on public.contact_messages
  for delete to authenticated using (public.is_admin());

-- ─── Image storage ─────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());
