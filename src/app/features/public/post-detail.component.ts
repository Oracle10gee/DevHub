import { Component, Input, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../data/content.service';
import type { Post } from '../../core/models';
import { SeoService } from '../../core/seo.service';
import { RichTextComponent } from '../../shared/rich-text.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, RichTextComponent],
  template: `
    <div class="wrap">
      @if (loading()) {
        <div class="container narrow"><div class="skeleton" style="height: 60vh"></div></div>
      }
      @if (post(); as p) {
        <article>
          <header class="container narrow">
            <a routerLink="/insights" class="back">← All insights</a>
            <p class="meta">
              {{ p.published_at | date: 'd MMMM y' }}
              @for (t of p.tags; track t) { <span class="chip">{{ t }}</span> }
            </p>
            <h1>{{ p.title }}</h1>
            @if (p.excerpt) { <p class="lead">{{ p.excerpt }}</p> }
          </header>
          @if (p.cover_url) {
            <div class="container cover"><img [src]="p.cover_url" [alt]="p.title" /></div>
          }
          <div class="container narrow">
            <app-rich-text [html]="p.body" />
            <hr />
            <a routerLink="/insights" class="link-arrow">More insights <span>→</span></a>
          </div>
        </article>
      } @else if (!loading()) {
        <div class="container narrow missing">
          <h1>Post not found</h1>
          <p class="lead">It may have been unpublished or moved.</p>
          <a routerLink="/insights" class="btn">Back to insights</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .wrap { padding-block: calc(var(--header-h) + 3.5rem) clamp(4rem, 8vw, 7rem); }
    .narrow { max-width: 780px; }
    .back { display: inline-block; color: var(--muted); text-decoration: none; font-weight: 600; margin-bottom: 2rem; }
    .back:hover { color: var(--purple); }
    .meta { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; color: var(--muted); font-size: .9rem; }
    h1 { font-size: clamp(2.2rem, 5vw, 3.8rem); color: var(--purple); }
    .cover { margin-block: 2.5rem 3rem; }
    .cover img { width: 100%; max-height: 640px; object-fit: cover; border-radius: var(--radius-lg); box-shadow: var(--shadow); }
    hr { border: 0; height: 1px; background: var(--line); margin: 3.5rem 0 2rem; }
    .missing { text-align: center; }
  `],
})
export class PostDetailComponent {
  private content = inject(ContentService);
  private seo = inject(SeoService);

  readonly post = signal<Post | null>(null);
  readonly loading = signal(true);

  @Input() set slug(value: string) {
    this.load(value);
  }

  private async load(slug: string): Promise<void> {
    this.loading.set(true);
    this.post.set(null);
    const p = await this.content.postBySlug(slug);
    this.post.set(p);
    this.loading.set(false);
    if (p) this.seo.set(p.title, p.excerpt, p.cover_url);
  }
}
