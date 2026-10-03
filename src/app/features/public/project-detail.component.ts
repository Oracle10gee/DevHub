import { Component, Input, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../data/content.service';
import type { Project } from '../../core/models';
import { SeoService } from '../../core/seo.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { RichTextComponent } from '../../shared/rich-text.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink, RevealDirective, RichTextComponent],
  template: `
    @if (loading()) {
      <div class="container pad"><div class="skeleton" style="height: 60vh"></div></div>
    }
    @if (project(); as p) {
      <article>
        <header class="hero">
          @if (p.cover_url) { <img [src]="p.cover_url" alt="" class="bg" /> }
          <div class="shade"></div>
          <div class="container hero-inner">
            <a routerLink="/projects" class="back">← All projects</a>
            <span class="chip" [class.chip--live]="p.status === 'ongoing'">{{ p.status === 'ongoing' ? 'Ongoing' : 'Completed' }}</span>
            <h1>{{ p.title }}</h1>
            <p class="period">{{ p.period_label }}</p>
          </div>
        </header>

        <div class="container body">
          <aside reveal>
            <dl>
              <dt>Client</dt>
              <dd><strong>{{ p.client }}</strong>@if (p.client_detail) {<span>{{ p.client_detail }}</span>}</dd>
              <dt>Timeline</dt>
              <dd>{{ p.period_label }}</dd>
              @if (p.phases.length) {
                <dt>Phases</dt>
                <dd>
                  <ol class="phases">
                    @for (ph of p.phases; track $index) { <li>{{ ph }}</li> }
                  </ol>
                </dd>
              }
            </dl>
            <a routerLink="/contact" class="btn btn--sm">Plan a similar study</a>
          </aside>
          <div reveal [revealDelay]="100">
            <p class="lead">{{ p.summary }}</p>
            <app-rich-text [html]="p.body" />
          </div>
        </div>
      </article>
    } @else if (!loading()) {
      <div class="container pad missing">
        <h1>Project not found</h1>
        <p class="lead">It may have been renamed or removed.</p>
        <a routerLink="/projects" class="btn">Back to projects</a>
      </div>
    }
  `,
  styles: [`
    .pad { padding-block: calc(var(--header-h) + 4rem) 6rem; }
    .hero { position: relative; min-height: 70vh; display: flex; align-items: flex-end; overflow: hidden; background: var(--purple); color: #fff; }
    .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; animation: zoom 20s ease-out forwards; }
    @keyframes zoom { from { transform: scale(1.12); } }
    .shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgb(48 0 102 / .25) 0%, rgb(48 0 102 / .92) 85%); }
    .hero-inner { position: relative; padding-block: calc(var(--header-h) + 3rem) 3.5rem; }
    .back { display: inline-block; color: rgb(255 255 255 / .8); text-decoration: none; font-weight: 600; margin-bottom: 1.5rem; margin-right: 1rem; }
    .back:hover { color: #fff; }
    h1 { color: #fff; max-width: 20ch; font-size: clamp(2.2rem, 5.4vw, 4.4rem); margin-top: 1.2rem; }
    .period { font-style: italic; color: var(--sky); font-size: 1.1rem; margin: 0; }
    .body { display: grid; grid-template-columns: 320px 1fr; gap: clamp(2rem, 6vw, 5rem); padding-block: clamp(3rem, 7vw, 6rem); align-items: start; }
    aside { position: sticky; top: calc(var(--header-h) + 1.5rem); padding: 1.8rem; border-radius: var(--radius); background: var(--lavender-50); border: 1px solid var(--line); }
    dl { margin: 0 0 1.5rem; }
    dt { font: 700 .72rem/1 var(--font-display); letter-spacing: .14em; text-transform: uppercase; color: var(--muted); margin-bottom: .5rem; }
    dd { margin: 0 0 1.4rem; display: grid; gap: .25rem; }
    dd strong { color: var(--purple); font-family: var(--font-display); }
    dd span { color: var(--ink-soft); font-size: .9rem; }
    .phases { margin: 0; padding-left: 1.1rem; display: grid; gap: .35rem; font-size: .92rem; }
    .missing { text-align: center; }
    @media (max-width: 860px) {
      .body { grid-template-columns: 1fr; }
      aside { position: static; order: 2; }
    }
  `],
})
export class ProjectDetailComponent {
  private content = inject(ContentService);
  private seo = inject(SeoService);

  readonly project = signal<Project | null>(null);
  readonly loading = signal(true);

  @Input() set slug(value: string) {
    this.load(value);
  }

  private async load(slug: string): Promise<void> {
    this.loading.set(true);
    this.project.set(null);
    const p = await this.content.projectBySlug(slug);
    this.project.set(p);
    this.loading.set(false);
    if (p) this.seo.set(p.title, p.summary, p.cover_url);
  }
}
