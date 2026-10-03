import { Component, inject } from '@angular/core';
import { CEO, FIELD_LEADS, MANAGEMENT, TEAM_LEADS } from '../../data/site-content';
import { SeoService } from '../../core/seo.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { LogoMarkComponent } from '../../shared/logo-mark.component';
import { AvatarComponent } from '../../shared/avatar.component';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [RevealDirective, LogoMarkComponent, AvatarComponent],
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

        <div class="tree">
          <div class="tier" reveal>
            <div class="person top">
              <app-avatar [name]="ceo.name" style="--size: 96px" />
              <strong>{{ ceo.name }}</strong><span>Principal Consultant</span>
            </div>
          </div>
          <div class="tier" reveal>
            @for (p of management; track p.name) {
              <div class="person"><app-avatar [name]="p.name" /><strong>{{ p.name }}</strong><span>{{ p.role }}</span></div>
            }
          </div>
          <div class="tier" reveal>
            @for (p of fieldLeads; track p.name) {
              <div class="person"><app-avatar [name]="p.name" /><strong>{{ p.name }}</strong><span>{{ p.role }}</span></div>
            }
          </div>
          <div class="enumerators" reveal>
            <strong>30+ enumerators</strong>
            <span>Ethically certified field researchers, trained on every instrument before they go to the field.</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <p class="eyebrow">Team leads &amp; legacy team</p>
        <h2>Leading in the field.</h2>
        <div class="leads">
          @for (p of teamLeads; track p.name; let i = $index) {
            <div class="lead-card" reveal [revealDelay]="i * 80">
              <app-avatar [name]="p.name" style="--size: 84px" />
              <strong>{{ p.name }}</strong><span>{{ p.role }}</span>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styles: [`
    .ceo { display: grid; grid-template-columns: .9fr 1.1fr; gap: clamp(2rem, 6vw, 5rem); align-items: center; }
    figure { margin: 0; position: relative; }
    figure img { width: 100%; aspect-ratio: 4 / 4.6; object-fit: cover; object-position: 42% 30%; border-radius: 50% 50% var(--radius-lg) var(--radius-lg); box-shadow: var(--shadow); }
    figcaption { position: absolute; left: 1.2rem; right: 1.2rem; bottom: 1.2rem; padding: 1rem 1.2rem; border-radius: var(--radius); background: rgb(255 255 255 / .9); backdrop-filter: blur(10px); display: grid; }
    figcaption strong { font: 800 1.1rem/1.2 var(--font-display); color: var(--purple); }
    figcaption span { color: var(--muted); font-size: .9rem; }

    .tree { position: relative; display: grid; gap: 3rem; justify-items: center; }
    .tier { display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem 4rem; position: relative; }
    .tier + .tier::before, .enumerators::before {
      content: ''; position: absolute; left: 50%; top: -3rem; width: 2px; height: 2.4rem; background: var(--purple); opacity: .35;
    }
    .person { display: grid; justify-items: center; text-align: center; gap: .35rem; width: 220px; }
    .person app-avatar { margin-bottom: .6rem; }
    .person strong, .lead-card strong { font: 800 1rem/1.25 var(--font-display); color: var(--purple); }
    .person span, .lead-card span { color: var(--ink-soft); font-size: .9rem; }
    .enumerators {
      position: relative; display: grid; gap: .3rem; text-align: center; max-width: 560px;
      padding: 1.4rem 2rem; border-radius: var(--radius); border: 2px solid var(--purple); background: #fff;
    }
    .enumerators strong { font: 800 1.3rem/1.2 var(--font-display); color: var(--purple); }
    .enumerators span { color: var(--ink-soft); }

    .leads { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.2rem; margin-top: 2rem; }
    .lead-card { display: grid; justify-items: center; text-align: center; gap: .35rem; padding: 2rem 1rem; border-radius: var(--radius); border: 1px solid var(--line); background: #fff; transition: transform .4s var(--ease), box-shadow .4s var(--ease); }
    .lead-card:hover { transform: translateY(-6px); box-shadow: var(--shadow); }
    .lead-card app-avatar { margin-bottom: .8rem; }

    @media (max-width: 860px) {
      .ceo { grid-template-columns: 1fr; }
      .tier { gap: 2rem; }
    }
  `],
})
export class TeamComponent {
  readonly ceo = CEO;
  readonly management = MANAGEMENT;
  readonly fieldLeads = FIELD_LEADS;
  readonly teamLeads = TEAM_LEADS;

  constructor() {
    inject(SeoService).set('Team', 'Meet Hakeem Bishi and the DevHub management, field and team leads.');
  }
}
