import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ABOUT, CODES, COMPLIANCE, EXPECTATIONS, FOCUS_AREAS } from '../../data/site-content';
import { SeoService } from '../../core/seo.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { LogoMarkComponent } from '../../shared/logo-mark.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, RevealDirective, LogoMarkComponent],
  template: `
    <section class="page-hero">
      <app-logo-mark class="mark" [spin]="true" />
      <div class="container">
        <p class="eyebrow" reveal>About DevHub</p>
        <h1 reveal [revealDelay]="80">Research you can <span class="text-gradient">build on.</span></h1>
        <p class="lead" reveal [revealDelay]="160">{{ about.lead }}</p>
      </div>
    </section>

    <section class="section">
      <div class="container story">
        <figure reveal>
          <img src="/assets/photos/photo-01.jpeg" alt="Enumerators in a DevHub training session" loading="lazy" />
          <figcaption>Every study starts with a trained, briefed and certified field team.</figcaption>
        </figure>
        <div>
          @for (p of about.paragraphs; track p; let i = $index) {
            <p [class.lead]="i === 0" reveal [revealDelay]="i * 80">{{ p }}</p>
          }
          <h3 class="focus-title">Focus areas</h3>
          <div class="focus">
            @for (area of focusAreas; track area) {
              <span class="chip">{{ area }}</span>
            }
          </div>
        </div>
      </div>
    </section>

    <section class="section section--lavender">
      <div class="container">
        <p class="ghost-title" aria-hidden="true">compliance</p>
        <h2 class="sr-only">Compliance</h2>
        <div class="compliance">
          @for (c of compliance; track c.title; let i = $index) {
            <div class="comp" reveal [revealDelay]="i * 70">
              <span class="tick" aria-hidden="true">✓</span>
              <h3>{{ c.title }}</h3>
              <p>{{ c.text }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <section class="values">
      <div class="half light">
        <p class="ghost-title" aria-hidden="true">our expectations</p>
        <h2 class="sr-only">Our expectations</h2>
        <ul>
          @for (e of expectations; track e; let i = $index) {
            <li reveal [revealDelay]="i * 50">{{ e }}</li>
          }
        </ul>
      </div>
      <div class="half dark">
        <app-logo-mark class="values-mark" />
        <p class="ghost-title" aria-hidden="true">our codes</p>
        <h2 class="sr-only">Our codes of conduct</h2>
        <ul>
          @for (c of codes; track c; let i = $index) {
            <li reveal [revealDelay]="i * 50">{{ c }}</li>
          }
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="container next">
        <h2>Meet the people behind the data.</h2>
        <a routerLink="/team" class="btn">Our team <span class="arrow">→</span></a>
      </div>
    </section>
  `,
  styles: [`
    .story { display: grid; grid-template-columns: 1fr 1.1fr; gap: clamp(2rem, 6vw, 5rem); align-items: start; }
    figure { margin: 0; position: sticky; top: calc(var(--header-h) + 2rem); }
    figure img { border-radius: var(--radius-lg); box-shadow: var(--shadow); aspect-ratio: 4 / 3.4; object-fit: cover; width: 100%; }
    figcaption { margin-top: 1rem; color: var(--muted); font-size: .9rem; }
    .focus-title { margin-top: 2.5rem; font-size: 1rem; text-transform: uppercase; letter-spacing: .14em; color: var(--blue); }
    .focus { display: flex; flex-wrap: wrap; gap: .5rem; }
    .compliance { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem; position: relative; }
    .comp { background: #fff; border-radius: var(--radius); padding: 1.8rem 1.5rem; border: 1px solid var(--line); }
    .tick { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 12px; background: var(--purple); color: #fff; font-weight: 800; margin-bottom: 1.2rem; }
    .comp h3 { font-size: 1.1rem; }
    .comp p { color: var(--ink-soft); font-size: .93rem; margin: 0; }

    .values { display: grid; grid-template-columns: 1fr 1fr; }
    .half { position: relative; overflow: hidden; padding: clamp(4rem, 8vw, 7rem) clamp(1.5rem, 6vw, 6rem); }
    .half .ghost-title { font-size: clamp(2.6rem, 6vw, 5rem); margin-bottom: 2rem; }
    .light .ghost-title { color: #cfc4e0; }
    .dark { background: var(--purple); }
    .dark .ghost-title { color: rgb(255 255 255 / .35); }
    .values-mark { position: absolute; width: 520px; aspect-ratio: 1; right: -140px; top: 10%; color: #fff; opacity: .05; }
    .half ul { list-style: none; margin: 0; padding: 0; display: grid; gap: .9rem; position: relative; }
    .half li { font: 800 clamp(1.25rem, 2.2vw, 1.7rem)/1.2 var(--font-display); color: var(--purple); display: flex; align-items: center; gap: .9rem; }
    .half li::before { content: ''; width: 10px; height: 10px; border-radius: 50%; background: currentColor; flex: none; }
    .dark li { color: #fff; }

    .next { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.5rem; }
    .next h2 { margin: 0; max-width: 18ch; }

    @media (max-width: 860px) {
      .story, .values { grid-template-columns: 1fr; }
      figure { position: static; }
    }
  `],
})
export class AboutComponent {
  readonly about = ABOUT;
  readonly focusAreas = FOCUS_AREAS;
  readonly compliance = COMPLIANCE;
  readonly expectations = EXPECTATIONS;
  readonly codes = CODES;

  constructor() {
    inject(SeoService).set('About', ABOUT.lead);
  }
}
