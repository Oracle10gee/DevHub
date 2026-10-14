import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ABOUT, CERTIFICATES, CODES, COMPLIANCE, CORE_VALUES, FOCUS_AREAS } from '../../data/site-content';
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
          <figcaption>Training, briefing and building certified teams.</figcaption>
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

        <div class="certs">
          @for (c of certificates; track c.title; let i = $index) {
            <button type="button" class="cert" (click)="openCert.set(i)" reveal [revealDelay]="i * 90" [attr.aria-label]="'View ' + c.title">
              <span class="cert-frame"><img [src]="c.image" [alt]="c.title" loading="lazy" /></span>
              <span class="cert-text">
                <strong>{{ c.title }}</strong>
                <small>{{ c.detail }}</small>
                <span class="cert-view">View certificate ↗</span>
              </span>
            </button>
          }
        </div>
      </div>
    </section>

    @if (openCert() !== null) {
      <div class="lightbox" role="dialog" aria-modal="true" [attr.aria-label]="certificates[openCert()!].title" (click)="openCert.set(null)">
        <button type="button" class="lb-close" (click)="openCert.set(null)" aria-label="Close">✕</button>
        <figure (click)="$event.stopPropagation()">
          <img [src]="certificates[openCert()!].image" [alt]="certificates[openCert()!].title" />
          <figcaption>{{ certificates[openCert()!].title }} · {{ certificates[openCert()!].detail }}</figcaption>
        </figure>
      </div>
    }

    <section class="values">
      <div class="half light">
        <p class="ghost-title" aria-hidden="true">core values</p>
        <h2 class="sr-only">Core values and expectations</h2>
        <ul>
          @for (e of coreValues; track e; let i = $index) {
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
        <a routerLink="/people" class="btn">Our people <span class="arrow">→</span></a>
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

    .certs { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); gap: 1.2rem; margin-top: 2rem; position: relative; }
    .cert {
      display: grid; grid-template-columns: 160px 1fr; gap: 1.4rem; align-items: center; text-align: left;
      padding: 1.1rem; border-radius: var(--radius-lg); border: 1px solid var(--line); background: #fff; cursor: zoom-in;
      transition: transform .4s var(--ease), box-shadow .4s var(--ease);
    }
    .cert:hover { transform: translateY(-5px); box-shadow: var(--shadow); }
    .cert-frame { display: block; aspect-ratio: 4 / 3.2; border-radius: 12px; overflow: hidden; background: var(--lavender-50); box-shadow: inset 0 0 0 1px var(--line); }
    .cert-frame img { width: 100%; height: 100%; object-fit: contain; }
    .cert-text { display: grid; gap: .35rem; }
    .cert-text strong { font: 800 1.05rem/1.25 var(--font-display); color: var(--purple); }
    .cert-text small { color: var(--ink-soft); font-size: .86rem; }
    .cert-view { margin-top: .4rem; font: 700 .85rem/1 var(--font-display); color: var(--blue); }
    .lightbox { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 2rem; background: rgb(18 4 38 / .92); animation: fade .25s; }
    @keyframes fade { from { opacity: 0; } }
    .lightbox figure { position: static; margin: 0; display: grid; justify-items: center; gap: 1rem; }
    .lightbox img { max-height: 84vh; width: auto; max-width: 100%; border-radius: 8px; aspect-ratio: auto; object-fit: contain; box-shadow: 0 30px 80px rgb(0 0 0 / .5); }
    .lightbox figcaption { color: #fff; text-align: center; margin: 0; }
    .lb-close { position: absolute; top: 1.2rem; right: 1.2rem; width: 48px; height: 48px; border-radius: 50%; border: 0; background: rgb(255 255 255 / .14); color: #fff; font-size: 1.1rem; cursor: pointer; }
    @media (max-width: 520px) { .cert { grid-template-columns: 1fr; } }

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
  readonly coreValues = CORE_VALUES;
  readonly certificates = CERTIFICATES;
  readonly openCert = signal<number | null>(null);
  readonly codes = CODES;

  constructor() {
    inject(SeoService).set('About', ABOUT.lead);
  }

  @HostListener('document:keydown.escape')
  closeCert(): void {
    this.openCert.set(null);
  }
}
