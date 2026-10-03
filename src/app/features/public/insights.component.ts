import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../data/content.service';
import type { Post } from '../../core/models';
import { SeoService } from '../../core/seo.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { LogoMarkComponent } from '../../shared/logo-mark.component';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [RouterLink, DatePipe, RevealDirective, LogoMarkComponent],
  template: `
    <section class="page-hero">
      <app-logo-mark class="mark" [spin]="true" />
      <div class="container">
        <p class="eyebrow" reveal>Insights</p>
        <h1 reveal [revealDelay]="80">Notes from <span class="text-gradient">the field.</span></h1>
        <p class="lead" reveal [revealDelay]="160">Project updates, field stories and how we approach research and data.</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        @if (loading()) {
          <div class="skeleton" style="height: 380px"></div>
        } @else {
          @if (featured(); as f) {
            <a class="feature" [routerLink]="['/insights', f.slug]" reveal>
              <div class="feature-media"><img [src]="f.cover_url || fallback" [alt]="f.title" /></div>
              <div class="feature-body">
                <p class="meta">{{ f.published_at | date: 'd MMMM y' }} @for (t of f.tags; track t) { <span class="chip">{{ t }}</span> }</p>
                <h2>{{ f.title }}</h2>
                <p class="lead">{{ f.excerpt }}</p>
                <span class="link-arrow">Read more <span>→</span></span>
              </div>
            </a>
          }
          @if (rest().length) {
            <div class="grid grid-3 more">
              @for (post of rest(); track post.id; let i = $index) {
                <a class="card" [routerLink]="['/insights', post.slug]" reveal [revealDelay]="(i % 3) * 80">
                  <div class="card-media"><img [src]="post.cover_url || fallback" [alt]="post.title" loading="lazy" /></div>
                  <div class="card-body">
                    <p class="meta">{{ post.published_at | date: 'd MMM y' }}</p>
                    <h3>{{ post.title }}</h3>
                    <p class="muted">{{ post.excerpt }}</p>
                  </div>
                </a>
              }
            </div>
          }
          @if (!posts().length) {
            <p class="empty">No posts yet. Check back soon.</p>
          }
        }
      </div>
    </section>
  `,
  styles: [`
    .feature { display: grid; grid-template-columns: 1.2fr 1fr; gap: clamp(1.5rem, 4vw, 3.5rem); align-items: center; text-decoration: none; color: inherit; }
    .feature-media { border-radius: var(--radius-lg); overflow: hidden; aspect-ratio: 16 / 11; box-shadow: var(--shadow); }
    .feature-media img { width: 100%; height: 100%; object-fit: cover; transition: transform .8s var(--ease); }
    .feature:hover .feature-media img { transform: scale(1.04); }
    .feature h2 { font-size: clamp(1.8rem, 3.4vw, 2.8rem); }
    .meta { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; color: var(--muted); font-size: .88rem; margin-bottom: .8rem; }
    .more { margin-top: clamp(3rem, 6vw, 5rem); }
    @media (max-width: 860px) { .feature { grid-template-columns: 1fr; } }
  `],
})
export class InsightsComponent implements OnInit {
  private content = inject(ContentService);

  readonly fallback = '/assets/photos/photo-07.jpeg';
  readonly posts = signal<Post[]>([]);
  readonly loading = signal(true);
  readonly featured = computed(() => this.posts()[0] ?? null);
  readonly rest = computed(() => this.posts().slice(1));

  constructor() {
    inject(SeoService).set('Insights', 'Project updates, field stories and research notes from DevHub Research Limited.');
  }

  async ngOnInit(): Promise<void> {
    this.posts.set(await this.content.publishedPosts());
    this.loading.set(false);
  }
}
