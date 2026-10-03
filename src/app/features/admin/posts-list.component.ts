import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../data/content.service';
import type { Post } from '../../core/models';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="adm-head">
      <h1>Posts</h1>
      <div class="adm-actions">
        <input class="input search" type="search" placeholder="Search posts…" [value]="query()" (input)="query.set($any($event.target).value)" />
        <a routerLink="/admin/posts/new" class="btn btn--sm">+ New post</a>
      </div>
    </div>
    @if (error()) { <div class="adm-msg err">{{ error() }}</div> }
    <div class="adm-panel adm-table-wrap">
      <table class="adm-table">
        <thead><tr><th></th><th>Title</th><th>Status</th><th>Published</th><th>Updated</th></tr></thead>
        <tbody>
          @for (p of filtered(); track p.id) {
            <tr>
              <td><img class="adm-thumb" [src]="p.cover_url || '/assets/brand/favicon.svg'" alt="" /></td>
              <td><a [routerLink]="['/admin/posts', p.id]">{{ p.title }}</a></td>
              <td><span class="adm-badge" [class.ok]="p.status === 'published'" [class.warn]="p.status === 'draft'">{{ p.status }}</span></td>
              <td>{{ p.published_at ? (p.published_at | date: 'd MMM y') : '—' }}</td>
              <td>{{ p.updated_at | date: 'd MMM y, HH:mm' }}</td>
            </tr>
          } @empty {
            <tr><td colspan="5" class="adm-empty">{{ loading() ? 'Loading…' : 'No posts yet.' }}</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: ['.search { width: 240px; padding: .6rem .9rem; }'],
})
export class PostsListComponent implements OnInit {
  private content = inject(ContentService);
  readonly posts = signal<Post[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly query = signal('');
  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    return q ? this.posts().filter((p) => p.title.toLowerCase().includes(q)) : this.posts();
  });

  async ngOnInit(): Promise<void> {
    try {
      this.posts.set(await this.content.allPosts());
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.loading.set(false);
    }
  }
}
