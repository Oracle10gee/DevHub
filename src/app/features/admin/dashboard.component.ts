import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../data/content.service';
import type { ContactMessage, Post } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="adm-head">
      <h1>Dashboard</h1>
      <div class="adm-actions">
        <a routerLink="/admin/posts/new" class="btn btn--sm">+ New post</a>
        <a routerLink="/admin/projects/new" class="btn btn--sm btn--ghost">+ New project</a>
      </div>
    </div>

    @if (error()) {
      <div class="adm-msg err">
        Couldn't reach the database: {{ error() }}. If this is a fresh setup, run supabase/schema.sql in the Supabase SQL editor.
      </div>
    }

    <div class="tiles">
      <a routerLink="/admin/posts" class="tile"><strong>{{ counts().posts }}</strong><span>Posts</span></a>
      <a routerLink="/admin/projects" class="tile"><strong>{{ counts().projects }}</strong><span>Projects</span></a>
      <a routerLink="/admin/gallery" class="tile"><strong>{{ counts().gallery }}</strong><span>Gallery photos</span></a>
      <a routerLink="/admin/messages" class="tile" [class.hot]="counts().unread > 0"><strong>{{ counts().unread }}</strong><span>Unread messages</span></a>
    </div>

    <div class="cols">
      <section class="adm-panel">
        <h2>Recently edited posts</h2>
        @for (p of posts(); track p.id) {
          <a class="row" [routerLink]="['/admin/posts', p.id]">
            <span>{{ p.title }}</span>
            <span class="adm-badge" [class.ok]="p.status === 'published'" [class.warn]="p.status === 'draft'">{{ p.status }}</span>
          </a>
        } @empty {
          <p class="adm-empty">No posts yet. <a routerLink="/admin/posts/new">Write the first one</a>.</p>
        }
      </section>

      <section class="adm-panel">
        <h2>Latest messages</h2>
        @for (m of messages(); track m.id) {
          <a class="row" routerLink="/admin/messages">
            <span><strong [class.unread]="!m.is_read">{{ m.name }}</strong> <small>{{ m.created_at | date: 'd MMM' }}</small><br /><small class="muted">{{ m.message.slice(0, 80) }}{{ m.message.length > 80 ? '…' : '' }}</small></span>
          </a>
        } @empty {
          <p class="adm-empty">No messages yet.</p>
        }
      </section>
    </div>
  `,
  styles: [`
    .tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.2rem; }
    .tile { display: grid; gap: .3rem; padding: 1.4rem; border-radius: var(--radius); background: #fff; border: 1px solid var(--line); text-decoration: none; color: inherit; transition: transform .3s var(--ease), box-shadow .3s; }
    .tile:hover { transform: translateY(-3px); box-shadow: var(--shadow-sm); }
    .tile strong { font: 800 2.2rem/1 var(--font-display); color: var(--purple); }
    .tile span { color: var(--muted); font-weight: 600; }
    .tile.hot { background: var(--purple); }
    .tile.hot strong, .tile.hot span { color: #fff; }
    .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
    .cols .adm-panel + .adm-panel { margin-top: 0; }
    .row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: .8rem 0; border-top: 1px solid var(--line); text-decoration: none; color: inherit; }
    .row:hover span:first-child { color: var(--purple); }
    .unread::after { content: ' •'; color: var(--cyan); }
    @media (max-width: 960px) { .cols { grid-template-columns: 1fr; } }
  `],
})
export class DashboardComponent implements OnInit {
  private content = inject(ContentService);

  readonly counts = signal({ posts: 0, projects: 0, gallery: 0, unread: 0 });
  readonly posts = signal<Post[]>([]);
  readonly messages = signal<ContactMessage[]>([]);
  readonly error = signal('');

  async ngOnInit(): Promise<void> {
    try {
      const [counts, posts, messages] = await Promise.all([
        this.content.counts(),
        this.content.allPosts(),
        this.content.messages(),
      ]);
      this.counts.set(counts);
      this.posts.set(posts.slice(0, 5));
      this.messages.set(messages.slice(0, 5));
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    }
  }
}
