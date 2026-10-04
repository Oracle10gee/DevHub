import { Component, OnInit, inject, signal } from '@angular/core';
import { CEO } from '../../data/site-content';
import { ContentService } from '../../data/content.service';
import type { TeamNode } from '../../core/models';
import { SeoService } from '../../core/seo.service';
import { buildTeamTree } from '../../shared/team-tree';
import { RevealDirective } from '../../shared/reveal.directive';
import { LogoMarkComponent } from '../../shared/logo-mark.component';
import { OrgChartComponent } from '../../shared/org-chart.component';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [RevealDirective, LogoMarkComponent, OrgChartComponent],
  template: `
    <section class="page-hero">
      <app-logo-mark class="mark" [spin]="true" />
      <div class="container">
        <p class="eyebrow" reveal>Our team</p>
        <h1 reveal [revealDelay]="80">The people who <span class="text-gradient">get it right</span> in the field.</h1>
      </div>
    </section>

    <section class="section ceo-wrap">
      <div class="container ceo">
        <figure reveal>
          <img [src]="ceo.photo" [alt]="ceo.name + ' presenting the Lagos Market Redevelopment Project'" />
          <figcaption><strong>{{ ceo.name }}</strong><span>{{ ceo.role }}</span></figcaption>
        </figure>
        <div reveal [revealDelay]="120">
          <p class="eyebrow">About the CEO</p>
          <h2>{{ ceo.name }}</h2>
          @for (p of ceo.bio; track $index) {
            <p [class.lead]="$first">{{ p }}</p>
          }
        </div>
      </div>
    </section>

    <section class="section section--lavender">
      <div class="container">
        <p class="ghost-title" aria-hidden="true">the team</p>
        <h2 class="sr-only">Management team</h2>
        @if (loading()) {
          <div class="skeleton" style="height: 420px"></div>
        } @else if (management().length) {
          <div class="chart-scroll" reveal>
            <app-org-chart [nodes]="management()" />
          </div>
          <div class="enumerators" reveal>
            <strong>30+ enumerators</strong>
            <span>Ethically certified field researchers, trained on every instrument before they go to the field.</span>
          </div>
        }
      </div>
    </section>

    @if (leads().length) {
      <section class="section">
        <div class="container">
          <p class="eyebrow">Team leads &amp; legacy team</p>
          <h2>Leading in the field.</h2>
          <div class="chart-scroll leads" reveal>
            <app-org-chart [nodes]="leads()" />
          </div>
        </div>
      </section>
    }
  `,
  styles: [`
    .ceo { display: grid; grid-template-columns: .9fr 1.1fr; gap: clamp(2rem, 6vw, 5rem); align-items: center; }
    figure { margin: 0; position: relative; }
    figure img { width: 100%; aspect-ratio: 4 / 4.6; object-fit: cover; object-position: 42% 30%; border-radius: 50% 50% var(--radius-lg) var(--radius-lg); box-shadow: var(--shadow); }
    figcaption { position: absolute; left: 1.2rem; right: 1.2rem; bottom: 1.2rem; padding: 1rem 1.2rem; border-radius: var(--radius); background: rgb(255 255 255 / .9); backdrop-filter: blur(10px); display: grid; }
    figcaption strong { font: 800 1.1rem/1.2 var(--font-display); color: var(--purple); }
    figcaption span { color: var(--muted); font-size: .9rem; }

    /* Wide charts scroll sideways instead of squashing. */
    .chart-scroll { overflow-x: auto; padding: 1rem 0 1.5rem; }
    .chart-scroll app-org-chart { min-width: max-content; margin-inline: auto; }
    .leads { margin-top: 1.5rem; }

    .enumerators {
      position: relative; display: grid; gap: .3rem; text-align: center; max-width: 560px; margin: 1.5rem auto 0;
      padding: 1.4rem 2rem; border-radius: var(--radius); border: 2px solid var(--purple); background: #fff;
    }
    .enumerators strong { font: 800 1.3rem/1.2 var(--font-display); color: var(--purple); }
    .enumerators span { color: var(--ink-soft); }

    @media (max-width: 860px) {
      .ceo { grid-template-columns: 1fr; }
    }
    @media (max-width: 760px) {
      .chart-scroll app-org-chart { min-width: 0; }
    }
  `],
})
export class TeamComponent implements OnInit {
  private content = inject(ContentService);

  readonly ceo = CEO;
  readonly management = signal<TeamNode[]>([]);
  readonly leads = signal<TeamNode[]>([]);
  readonly loading = signal(true);

  constructor() {
    inject(SeoService).set('Team', 'Meet Hakeem Bishi and the DevHub management, field and team leads.');
  }

  async ngOnInit(): Promise<void> {
    const members = await this.content.team();
    this.management.set(buildTeamTree(members, 'management'));
    this.leads.set(buildTeamTree(members, 'leads'));
    this.loading.set(false);
  }
}
