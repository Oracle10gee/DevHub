import { Injectable } from '@angular/core';
import { MEDIA_BUCKET, supabase } from '../core/supabase';
import type { ContactMessage, GalleryItem, Post, Project, SiteSettings, TeamMember } from '../core/models';
import { DEFAULT_SETTINGS, FALLBACK_GALLERY, FALLBACK_PROJECTS, FALLBACK_TEAM } from './site-content';
import { compressImage } from '../shared/image';

export type PostInput = Omit<Post, 'id' | 'created_at' | 'updated_at'>;
export type ProjectInput = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type TeamMemberInput = Omit<TeamMember, 'id'>;
export type UploadFolder = 'posts' | 'projects' | 'gallery' | 'team';

// `bio` arrives with supabase/003_team_bio.sql; default it so the site works before that runs.
function toMember(row: Partial<TeamMember>): TeamMember {
  return { ...(row as TeamMember), bio: row.bio ?? '' };
}

export interface ContactInput {
  name: string;
  email: string;
  organization: string;
  message: string;
}

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

@Injectable({ providedIn: 'root' })
export class ContentService {
  private settingsCache?: Promise<SiteSettings>;

  // ─── Public reads ────────────────────────────────────────────────────────

  async publishedPosts(limit?: number): Promise<Post[]> {
    let q = supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false });
    if (limit) q = q.limit(limit);
    const { data, error } = await q;
    return error ? [] : (data as Post[]);
  }

  async postBySlug(slug: string): Promise<Post | null> {
    const { data } = await supabase.from('posts').select('*').eq('slug', slug).maybeSingle();
    return (data as Post | null) ?? null;
  }

  async projects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('sort_order')
      .order('created_at', { ascending: false });
    return error ? FALLBACK_PROJECTS : (data as Project[]);
  }

  async projectBySlug(slug: string): Promise<Project | null> {
    const { data, error } = await supabase.from('projects').select('*').eq('slug', slug).maybeSingle();
    if (error) return FALLBACK_PROJECTS.find((p) => p.slug === slug) ?? null;
    return (data as Project | null) ?? null;
  }

  async gallery(): Promise<GalleryItem[]> {
    const { data, error } = await supabase.from('gallery_items').select('*').order('sort_order');
    return error ? FALLBACK_GALLERY : (data as GalleryItem[]);
  }

  async team(): Promise<TeamMember[]> {
    const { data, error } = await supabase.from('team_members').select('*').order('sort_order');
    return error ? FALLBACK_TEAM : (data as Partial<TeamMember>[]).map(toMember);
  }

  settings(): Promise<SiteSettings> {
    this.settingsCache ??= this.loadSettings();
    return this.settingsCache;
  }

  async sendMessage(input: ContactInput): Promise<void> {
    unwrap(await supabase.from('contact_messages').insert(input));
  }

  private async loadSettings(): Promise<SiteSettings> {
    const { data, error } = await supabase.from('site_settings').select('key, value');
    if (error || !data) return DEFAULT_SETTINGS;
    const rows = Object.fromEntries(data.map((r) => [r.key, r.value]));
    return {
      contact: { ...DEFAULT_SETTINGS.contact, ...(rows['contact'] ?? {}) },
      hero: { ...DEFAULT_SETTINGS.hero, ...(rows['hero'] ?? {}) },
      stats: Array.isArray(rows['stats']) ? rows['stats'] : DEFAULT_SETTINGS.stats,
    };
  }

  // ─── Admin: posts ────────────────────────────────────────────────────────

  async allPosts(): Promise<Post[]> {
    return unwrap(await supabase.from('posts').select('*').order('updated_at', { ascending: false })) as Post[];
  }

  async postById(id: string): Promise<Post> {
    return unwrap(await supabase.from('posts').select('*').eq('id', id).single()) as Post;
  }

  async savePost(id: string | null, input: PostInput): Promise<Post> {
    const q = id
      ? supabase.from('posts').update(input).eq('id', id).select().single()
      : supabase.from('posts').insert(input).select().single();
    return unwrap(await q) as Post;
  }

  async deletePost(id: string): Promise<void> {
    unwrap(await supabase.from('posts').delete().eq('id', id));
  }

  // ─── Admin: projects ─────────────────────────────────────────────────────

  async allProjects(): Promise<Project[]> {
    return unwrap(await supabase.from('projects').select('*').order('sort_order')) as Project[];
  }

  async projectById(id: string): Promise<Project> {
    return unwrap(await supabase.from('projects').select('*').eq('id', id).single()) as Project;
  }

  async saveProject(id: string | null, input: ProjectInput): Promise<Project> {
    const q = id
      ? supabase.from('projects').update(input).eq('id', id).select().single()
      : supabase.from('projects').insert(input).select().single();
    return unwrap(await q) as Project;
  }

  async deleteProject(id: string): Promise<void> {
    unwrap(await supabase.from('projects').delete().eq('id', id));
  }

  // ─── Admin: gallery ──────────────────────────────────────────────────────

  async allGallery(): Promise<GalleryItem[]> {
    return unwrap(await supabase.from('gallery_items').select('*').order('sort_order')) as GalleryItem[];
  }

  async addGalleryItem(image_url: string, caption: string, sort_order: number): Promise<GalleryItem> {
    return unwrap(
      await supabase.from('gallery_items').insert({ image_url, caption, sort_order }).select().single(),
    ) as GalleryItem;
  }

  async updateGalleryItem(id: string, patch: Partial<Pick<GalleryItem, 'caption' | 'sort_order'>>): Promise<void> {
    unwrap(await supabase.from('gallery_items').update(patch).eq('id', id));
  }

  async deleteGalleryItem(item: GalleryItem): Promise<void> {
    unwrap(await supabase.from('gallery_items').delete().eq('id', item.id));
    await this.removeUpload(item.image_url);
  }

  // ─── Admin: team ─────────────────────────────────────────────────────────

  async allTeam(): Promise<TeamMember[]> {
    const rows = unwrap(await supabase.from('team_members').select('*').order('sort_order')) as Partial<TeamMember>[];
    return rows.map(toMember);
  }

  async saveTeamMember(id: string | null, input: TeamMemberInput): Promise<TeamMember> {
    const q = id
      ? supabase.from('team_members').update(input).eq('id', id).select('*').single()
      : supabase.from('team_members').insert(input).select('*').single();
    return toMember(unwrap(await q) as Partial<TeamMember>);
  }

  async setTeamOrder(id: string, sort_order: number): Promise<void> {
    unwrap(await supabase.from('team_members').update({ sort_order }).eq('id', id));
  }

  /** People who reported to this person move up to report to their manager (handled in the database). */
  async deleteTeamMember(member: TeamMember): Promise<void> {
    unwrap(await supabase.from('team_members').delete().eq('id', member.id));
    await this.removeUpload(member.photo_url);
  }

  // ─── Admin: email alerts ─────────────────────────────────────────────────

  async alertsEnabled(userId: string): Promise<boolean> {
    const row = unwrap(await supabase.from('admins').select('notify').eq('user_id', userId).single()) as { notify: boolean };
    return row.notify;
  }

  async setAlertsEnabled(userId: string, notify: boolean): Promise<void> {
    unwrap(await supabase.from('admins').update({ notify }).eq('user_id', userId));
  }

  // ─── Admin: settings & messages ──────────────────────────────────────────

  async saveSetting<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]): Promise<void> {
    unwrap(await supabase.from('site_settings').upsert({ key, value }));
    this.settingsCache = undefined;
  }

  async messages(): Promise<ContactMessage[]> {
    return unwrap(
      await supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
    ) as ContactMessage[];
  }

  async setMessageRead(id: string, is_read: boolean): Promise<void> {
    unwrap(await supabase.from('contact_messages').update({ is_read }).eq('id', id));
  }

  async deleteMessage(id: string): Promise<void> {
    unwrap(await supabase.from('contact_messages').delete().eq('id', id));
  }

  async counts(): Promise<{ posts: number; projects: number; gallery: number; unread: number }> {
    const count = async (table: string, filter?: [string, unknown]) => {
      let q = supabase.from(table).select('*', { count: 'exact', head: true });
      if (filter) q = q.eq(filter[0], filter[1]);
      const { count: n } = await q;
      return n ?? 0;
    };
    const [posts, projects, gallery, unread] = await Promise.all([
      count('posts'),
      count('projects'),
      count('gallery_items'),
      count('contact_messages', ['is_read', false]),
    ]);
    return { posts, projects, gallery, unread };
  }

  // ─── Admin: uploads ──────────────────────────────────────────────────────

  /** Compresses an image in the browser, uploads it and returns its public URL. */
  async uploadImage(file: File, folder: UploadFolder): Promise<string> {
    const blob = await compressImage(file);
    const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/gif' ? 'gif' : 'jpg';
    const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, {
      contentType: blob.type,
      cacheControl: '31536000',
    });
    if (error) throw new Error(error.message);
    return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
  }

  /** Deletes a file this site uploaded; bundled /assets images are left alone. */
  async removeUpload(url: string | null | undefined): Promise<void> {
    const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`;
    const at = url?.indexOf(marker) ?? -1;
    if (!url || at < 0) return;
    await supabase.storage.from(MEDIA_BUCKET).remove([url.slice(at + marker.length)]);
  }
}
