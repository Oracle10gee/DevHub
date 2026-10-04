-- DevHub CMS, part 2: editable organogram + email alerts for new messages.
-- Run once in Supabase: SQL Editor → New query → paste → Run. Safe to re-run.

-- ─── Team / organogram ─────────────────────────────────────────────────────
-- Each person optionally reports to another person in the same chart
-- (parent_id). People with no parent are the top of their chart.
create table if not exists public.team_members (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 1 and 120),
  role       text not null default '' check (char_length(role) <= 120),
  photo_url  text,
  team       text not null default 'management' check (team in ('management', 'leads')),
  parent_id  uuid references public.team_members (id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists team_members_parent_idx on public.team_members (parent_id);

drop trigger if exists team_members_touch on public.team_members;
create trigger team_members_touch before update on public.team_members
  for each row execute function public.touch_updated_at();

-- Reject a manager from another chart, or a loop (A reports to B reports to A).
create or replace function public.team_members_check_parent()
returns trigger
language plpgsql
as $$
begin
  if new.parent_id is null then
    return new;
  end if;
  if new.parent_id = new.id then
    raise exception 'A person cannot report to themselves.';
  end if;
  if (select team from public.team_members where id = new.parent_id) is distinct from new.team then
    raise exception 'A person can only report to someone in the same chart.';
  end if;
  if exists (
    with recursive chain as (
      select id, parent_id from public.team_members where id = new.parent_id
      union all
      select t.id, t.parent_id from public.team_members t join chain c on t.id = c.parent_id
    )
    select 1 from chain where id = new.id
  ) then
    raise exception 'That would create a loop: % is above this person in the chart.',
      (select name from public.team_members where id = new.parent_id);
  end if;
  return new;
end;
$$;

drop trigger if exists team_members_parent_check on public.team_members;
create trigger team_members_parent_check before insert or update of parent_id, team on public.team_members
  for each row execute function public.team_members_check_parent();

-- When someone is removed, the people who reported to them move up a level
-- instead of dropping to the top of the chart.
create or replace function public.team_members_reparent()
returns trigger
language plpgsql
as $$
begin
  update public.team_members set parent_id = old.parent_id where parent_id = old.id;
  return old;
end;
$$;

drop trigger if exists team_members_reparent on public.team_members;
create trigger team_members_reparent before delete on public.team_members
  for each row execute function public.team_members_reparent();

alter table public.team_members enable row level security;
grant select on public.team_members to anon, authenticated;
grant insert, update, delete on public.team_members to authenticated;

drop policy if exists "team public read" on public.team_members;
create policy "team public read" on public.team_members
  for select using (true);
drop policy if exists "team admin write" on public.team_members;
create policy "team admin write" on public.team_members
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Starter chart from the company profile deck. Field staff are placed under
-- the Operations Manager; change "Reports to" in the CMS if that's wrong.
insert into public.team_members (id, name, role, team, parent_id, sort_order) values
  ('00000000-0000-4000-8000-000000000001', 'Hakeem Bishi',              'Principal Consultant',                  'management', null, 1),
  ('00000000-0000-4000-8000-000000000002', 'Sodiq Onigbokun',           'Business / Research Operations Manager', 'management', '00000000-0000-4000-8000-000000000001', 1),
  ('00000000-0000-4000-8000-000000000003', 'Omowunmi Folajimi-Senjobi', 'Research Manager',                      'management', '00000000-0000-4000-8000-000000000001', 2),
  ('00000000-0000-4000-8000-000000000004', 'Yusuf Akinkunmi',           'Field Supervisor',                      'management', '00000000-0000-4000-8000-000000000002', 1),
  ('00000000-0000-4000-8000-000000000005', 'Anibijuwon Beatrice',       'Field Manager',                         'management', '00000000-0000-4000-8000-000000000002', 2),
  ('00000000-0000-4000-8000-000000000006', 'Omotayo Kehinde',           'Field Supervisor',                      'management', '00000000-0000-4000-8000-000000000002', 3),
  ('00000000-0000-4000-8000-000000000007', 'Ekene Isichei',             'Team Lead',                             'leads',      null, 1),
  ('00000000-0000-4000-8000-000000000008', 'Susandorcas Obalade',       'Team Lead',                             'leads',      null, 2),
  ('00000000-0000-4000-8000-000000000009', 'Opeyemi Balogun',           'Team Lead',                             'leads',      null, 3),
  ('00000000-0000-4000-8000-000000000010', 'Kehinde Mukaila',           'Team Lead',                             'leads',      null, 4)
on conflict (id) do nothing;

-- ─── Email alerts for new messages ─────────────────────────────────────────
-- Admins choose whether they get alerts; they may change only their own row.
alter table public.admins add column if not exists notify boolean not null default true;
grant update (notify) on public.admins to authenticated;
drop policy if exists "admins update self" on public.admins;
create policy "admins update self" on public.admins
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Set by the email function so each message is emailed at most once.
alter table public.contact_messages add column if not exists notified_at timestamptz;

create extension if not exists pg_net with schema extensions;

-- After a message is saved, ask the notify-new-message Edge Function to email
-- the admins. The call is asynchronous and can never block the message.
create or replace function public.contact_messages_notify()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  perform net.http_post(
    url := 'https://zavfbkbmehevejwlladp.supabase.co/functions/v1/notify-new-message',
    body := jsonb_build_object('id', new.id),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  return new;
exception when others then
  return new;
end;
$$;

drop trigger if exists contact_messages_notify on public.contact_messages;
create trigger contact_messages_notify after insert on public.contact_messages
  for each row execute function public.contact_messages_notify();
