import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EXPERTISE, PROCESS, SERVICES } from '../../data/site-content';
import { SeoService } from '../../core/seo.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { LogoMarkComponent } from '../../shared/logo-mark.component';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [RouterLink, RevealDirective, LogoMarkComponent, IconComponent],
  template: `
    <section class="page-hero">
      <app-logo-mark class="mark" [spin]="true" />
      <div class="container">
        <p class="eyebrow" reveal>Services</p>
        <h1 reveal [revealDelay]="80">Everything a study needs, <span class="text-gradient">end to end.</span></h1>
        <p class="lead" reveal [revealDelay]="160">
          From the first draft of a questionnaire to a clean, documented dataset, we manage the whole field research lifecycle, or the parts you need.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container areas">
        @for (e of expertise; track e.slug; let i = $index) {
          <article class="area" [id]="e.slug" [style.--col]="e.color" reveal>
            <div class="area-icon"><app-icon [name]="e.icon" /></div>
            <div>
              <span class="area-no">0{{ i + 1 }}</span>
              <h2>{{ e.title }}</h2>
              <p class="lead">{{ e.blurb }}</p>
            </div>
            <ul>
              @for (pt of e.points; track pt) {
                <li>{{ pt }}</li>
              }
            </ul>
          </article>
        }
      </div>
    </section>

    <section class="section section--lavender">
      <div class="container">
        <p class="eyebrow">What we deliver</p>
        <h2>Services</h2>
        <div class="grid grid-3 svc">
          @for (s of services; track s.title; let i = $index) {
            <div class="card card-body" reveal [revealDelay]="(i % 3) * 80">
              <span class="svc-no">{{ i + 1 }}</span>
              <h3>{{ s.title }}</h3>
              <p class="muted">{{ s.text }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <p class="eyebrow">Our process</p>
        <h2>Six steps, one standard.</h2>
        <ol class="timeline">
          @for (p of process; track p.step; let i = $index) {
            <li reveal [revealDelay]="i * 60">
              <span>{{ p.step }}</span>
              <div><h3>{{ p.title }}</h3><p class="muted">{{ p.text }}</p></div>
            </li>
          }
        </ol>
        <a routerLink="/contact" class="btn">Discuss your study <span class="arrow">→</span></a>
      </div>
    </section>
  `,
  styles: [`
    .areas { display: grid; gap: 1.2rem; }
    .area {
      --col: var(--purple);
      display: grid; grid-template-columns: auto 1.4fr 1fr; gap: 2rem; align-items: center;
      padding: clamp(1.6rem, 4vw, 2.6rem); border-radius: var(--radius-lg);
      background: var(--col); color: #fff; scroll-margin-top: calc(var(--header-h) + 1rem);
    }
    .area-icon { display: grid; place-items: center; width: 96px; height: 96px; border-radius: 24px; background: rgb(255 255 255 / .12); }
    .area-icon app-icon { width: 56px; height: 56px; }
    .area-no { font: 800 .8rem/1 var(--font-display); letter-spacing: .12em; color: rgb(255 255 255 / .55); }
    .area h2 { color: #fff; font-size: clamp(1.6rem, 3vw, 2.3rem); margin: .4rem 0 .6rem; }
    .area .lead { color: rgb(255 255 255 / .85); margin: 0; font-size: 1.05rem; }
    .area ul { list-style: none; margin: 0; padding: 0; display: grid; gap: .6rem; }
    .area li { padding: .7rem 1rem; border-radius: 12px; background: rgb(255 255 255 / .1); font-weight: 500; }
    .svc { margin-top: 2rem; }
    .svc-no { display: inline-grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; background: var(--lavender); color: var(--purple); font: 800 .9rem/1 var(--font-display); margin-bottom: 1rem; }
    .timeline { list-style: none; padding: 0; margin: 2.5rem 0 3rem; display: grid; gap: 0; }
    .timeline li { display: grid; grid-template-columns: 80px 1fr; gap: 1.5rem; padding: 1.4rem 0; border-top: 1px solid var(--line); }
    .timeline li span { font: 800 2rem/1 var(--font-display); color: var(--purple); }
    .timeline h3 { margin-bottom: .2rem; }
    .timeline p { margin: 0; }
    @media (max-width: 860px) {
      .area { grid-template-columns: 1fr; gap: 1.2rem; }
      .area-icon { width: 72px; height: 72px; }
    }
  `],
})
export class ServicesComponent {
  readonly expertise = EXPERTISE;
  readonly services = SERVICES;
  readonly process = PROCESS;

  constructor() {
    inject(SeoService).set(
      'Services',
      'Research design, survey programming, digital and in-person data collection, focus groups, secondary data sourcing and field team management.',
    );
  }
}
