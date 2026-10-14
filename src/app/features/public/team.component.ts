import { Component, OnInit, inject, signal } from '@angular/core';
import { CEO } from '../../data/site-content';
import { ContentService } from '../../data/content.service';
import type { TeamMember, TeamNode } from '../../core/models';
import { TeamPeekComponent } from '../../shared/team-peek.component';
import { TeamPeekService } from '../../shared/team-peek.service';
import { SeoService } from '../../core/seo.service';
import { buildTeamTree } from '../../shared/team-tree';
import { RevealDirective } from '../../shared/reveal.directive';
import { LogoMarkComponent } from '../../shared/logo-mark.component';
import { OrgChartComponent } from '../../shared/org-chart.component';
import { FitWidthDirective } from '../../shared/fit-width.directive';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [RevealDirective, LogoMarkComponent, OrgChartComponent, TeamPeekComponent, FitWidthDirective],
  providers: [TeamPeekService],
  template: `
    <section class="page-hero">
      <app-logo-mark class="mark" [spin]="true" />
      <div class="container">
        <p class="eyebrow" reveal>Our people</p>
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
            <p [class.lead]="$first">
              {{ p }}
              @if ($last) {
                <a class="profile-link" [href]="ceo.profileUrl" target="_blank" rel="noopener">See more about Hakeem here <span aria-hidden="true">↗</span></a>
              }
            </p>
          }
        </div>
      </div>
    </section>

    <section class="section section--lavender">
      <div class="container">
        <p class="ghost-title" aria-hidden="true">our people</p>
        <h2 class="sr-only">Management team</h2>
        @if (loading()) {
          <div class="skeleton" style="height: 420px"></div>
        } @else if (management().length) {
          <div class="chart-fit" fitWidth reveal>
            <app-org-chart [nodes]="management()" />
          </div>
          <p class="chart-hint">Hover over or tap a person to see their profile.</p>
          <div class="enumerators" reveal>
            <strong>55+ enumerators and auditors / back-checkers</strong>
            <span>Ethically certified field researchers and quality auditors, trained on every instrument before they go to the field.</span>
          </div>
        }
      </div>
    </section>

    <section class="section team-photo">
      <div class="container">
        <figure reveal>
          <img src="/assets/photos/team-vests.jpeg" alt="The DevHub Research Limited team in DevHub field vests" loading="lazy" />
          <figcaption>
            <strong>One team, in the field.</strong>
            <span>The DevHub Research Limited team.</span>
          </figcaption>
        </figure>
      </div>
    </section>

    <app-team-peek [members]="members()" />
  `,
  styles: [`
    .ceo { display: grid; grid-template-columns: .9fr 1.1fr; gap: clamp(2rem, 6vw, 5rem); align-items: center; }
    .ceo figure { margin: 0; position: relative; }
    .ceo figure img { width: 100%; aspect-ratio: 4 / 4.6; object-fit: cover; object-position: 42% 30%; border-radius: 50% 50% var(--radius-lg) var(--radius-lg); box-shadow: var(--shadow); }
    .ceo figcaption { position: absolute; left: 1.2rem; right: 1.2rem; bottom: 1.2rem; padding: 1rem 1.2rem; border-radius: var(--radius); background: rgb(255 255 255 / .9); backdrop-filter: blur(10px); display: grid; }
    .ceo figcaption strong { font: 800 1.1rem/1.2 var(--font-display); color: var(--purple); }
    .ceo figcaption span { color: var(--muted); font-size: .9rem; }
    .profile-link { display: inline-flex; gap: .3rem; margin-left: .25rem; font-weight: 700; color: var(--blue); text-underline-offset: 3px; white-space: nowrap; }
    .profile-link:hover { color: var(--purple); }

    .team-photo figure { position: relative; margin: 0; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow); }
    .team-photo img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; object-position: center 40%; }
    .team-photo figcaption {
      position: absolute; inset: auto 0 0; display: grid; gap: .2rem; padding: 4rem 2rem 1.6rem;
      background: linear-gradient(transparent, rgb(29 11 59 / .85)); color: #fff;
    }
    .team-photo figcaption strong { font: 800 clamp(1.3rem, 2.6vw, 2rem)/1.15 var(--font-display); }
    .team-photo figcaption span { color: rgb(255 255 255 / .8); }

    /* The chart shrinks to fit the width (see fitWidth) instead of scrolling sideways. */
    .chart-fit { overflow: hidden; padding: 1rem 0 .5rem; }
    .chart-fit app-org-chart { width: max-content; margin-inline: auto; }
    .chart-hint { text-align: center; color: var(--muted); font-size: .88rem; margin: .5rem 0 0; }

    .enumerators {
      position: relative; display: grid; gap: .3rem; text-align: center; max-width: 680px; margin: 1.5rem auto 0;
      padding: 1.4rem 2rem; border-radius: var(--radius); border: 2px solid var(--purple); background: #fff;
    }
    .enumerators strong { font: 800 1.3rem/1.2 var(--font-display); color: var(--purple); }
    .enumerators span { color: var(--ink-soft); }

    @media (max-width: 860px) {
      .ceo { grid-template-columns: 1fr; }
      .team-photo figcaption { padding: 3rem 1.2rem 1.1rem; }
    }
    @media (max-width: 760px) {
      .chart-fit app-org-chart { width: auto; }
    }
  `],
})
export class TeamComponent implements OnInit {
  private content = inject(ContentService);

  readonly ceo = CEO;
  readonly management = signal<TeamNode[]>([]);
  readonly members = signal<TeamMember[]>([]);
  readonly loading = signal(true);

  constructor() {
    inject(SeoService).set('People', 'Meet Hakeem Bishi and the DevHub Research Limited management and field team.');
  }

  async ngOnInit(): Promise<void> {
    const members = (await this.content.team()).filter((m) => m.team === 'management');
    this.members.set(members);
    this.management.set(buildTeamTree(members, 'management'));
    this.loading.set(false);
  }
}
