export type PostStatus = 'draft' | 'published';

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover_url: string | null;
  tags: string[];
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'ongoing' | 'completed';

export interface Project {
  id: string;
  slug: string;
  title: string;
  client: string;
  client_detail: string;
  period_label: string;
  status: ProjectStatus;
  phases: string[];
  summary: string;
  body: string;
  cover_url: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  caption: string;
  sort_order: number;
}

export interface ContactSettings {
  address: string;
  email: string;
  phone: string;
}

export interface HeroSettings {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export interface SiteSettings {
  contact: ContactSettings;
  hero: HeroSettings;
  stats: Stat[];
}

export type TeamChart = 'management' | 'leads';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo_url: string | null;
  team: TeamChart;
  parent_id: string | null;
  sort_order: number;
}

export interface TeamNode {
  member: TeamMember;
  children: TeamNode[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  organization: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
