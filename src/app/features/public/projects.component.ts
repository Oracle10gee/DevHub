import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../data/content.service';
import type { Project } from '../../core/models';
import { SeoService } from '../../core/seo.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { LogoMarkComponent } from '../../shared/logo-mark.component';

type Filter = 'all' | 'ongoing' | 'completed';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [RouterLink, RevealDirective, LogoMarkComponent],
  template: `
    <section class="page-hero">
      <app-logo-mark class="mark" [spin]="true" />
      <div class="container">
        <p class="eyebrow" reveal>Our projects</p>
        <h1 reveal [revealDelay]="80">Studies we've taken <span class="text-gradient">to the field.</span></h1>
        <p class="lead" reveal [revealDelay]="160">
          Research partnerships with universities, business schools and planning firms across urban development, markets, mobility and livelihoods.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="filters" role="tablist" aria-label="Filter projects">
          @for (f of filters; track f.value) {
            <button role="tab" type="button" [attr.aria-selected]="filter() === f.value" [class.on]="filter() === f.value" (click)="filter.set(f.value)">
              {{ f.label }}
            </button>
          }
        </div>

        @if (loading()) {
          <div class="grid grid-2">
            <div class="skeleton" style="height: 420px"></div>
            <div class="skeleton" style="height: 420px"></div>
          </div>
        } @else {
          <div class="grid grid-2">
            @for (p of visible(); track p.id; let i = $index) {
              <a class="card project" [routerLink]="['/projects', p.slug]" reveal [revealDelay]="(i % 2) * 100">
                <div class="card-media">
                  <img [src]="p.cover_url || '/assets/photos/photo-07.jpeg'" [alt]="p.title" loading="lazy" />
                  <span class="chip status" [class.chip--live]="p.status === 'ongoing'">{{ p.status === 'ongoing' ? 'Ongoing' : 'Completed' }}</span>
                </div>
                <div class="card-body">
                  <p class="period">{{ p.period_label }}</p>
                  <h3>{{ p.title }}</h3>
                  <p class="muted">{{ p.summary }}</p>
                  <p class="client"><span>Client</span> {{ p.client }}</p>
                </div>
              </a>
            } @empty {
              <p class="empty">No projects to show yet.</p>
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    .filters { display: inline-flex; gap: .3rem; padding: .35rem; border-radius: 999px; background: var(--lavender-50); border: 1px solid var(--line); margin-bottom: 2.5rem; }
    .filters button { border: 0; background: none; padding: .65rem 1.2rem; border-radius: 999px; font: 700 .88rem/1 var(--font-display); color: var(--ink-soft); cursor: pointer; transition: background .25s, color .25s; }
    .filters button.on { background: var(--purple); color: #fff; }
    .card-media { position: relative; }
    .status { position: absolute; top: 1rem; left: 1rem; }
    .period { font: 600 .85rem/1 var(--font-display); color: var(--blue); margin-bottom: .7rem; font-style: italic; }
    .client { margin: 1rem 0 0; padding-top: 1rem; border-top: 1px solid var(--line); font-weight: 600; color: var(--purple); }
    .client span { display: inline-block; margin-right: .5rem; font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
  `],
})
export class ProjectsComponent implements OnInit {
  private content = inject(ContentService);

  readonly filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
  ];
  readonly filter = signal<Filter>('all');
  readonly projects = signal<Project[]>([]);
  readonly loading = signal(true);
  readonly visible = computed(() => {
    const f = this.filter();
    return f === 'all' ? this.projects() : this.projects().filter((p) => p.status === f);
  });

  constructor() {
    inject(SeoService).set('Projects', 'Field research projects delivered by DevHub for universities, business schools and planning firms.');
  }

  async ngOnInit(): Promise<void> {
    this.projects.set(await this.content.projects());
    this.loading.set(false);
  }
}
