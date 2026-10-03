import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

const LINKS = [
  { path: '/about', label: 'About' },
  { path: '/services', label: 'Services' },
  { path: '/projects', label: 'Projects' },
  { path: '/team', label: 'Team' },
  { path: '/insights', label: 'Insights' },
  { path: '/gallery', label: 'Gallery' },
];

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="bar" [class.scrolled]="scrolled()" [class.open]="open()">
      <div class="container inner">
        <a routerLink="/" class="brand" aria-label="DevHub Research Limited home">
          <img src="/assets/brand/logo.svg" alt="DevHub Research Limited" width="157" height="48" />
        </a>

        <nav class="links" aria-label="Main">
          @for (link of links; track link.path) {
            <a [routerLink]="link.path" routerLinkActive="active">{{ link.label }}</a>
          }
        </nav>

        <a routerLink="/contact" class="btn btn--sm cta">Work with us</a>

        <button class="burger" type="button" (click)="open.set(!open())"
                [attr.aria-expanded]="open()" aria-controls="mobile-nav">
          <span class="sr-only">{{ open() ? 'Close menu' : 'Open menu' }}</span>
          <i></i><i></i>
        </button>
      </div>
    </header>

    <div id="mobile-nav" class="drawer" [class.open]="open()" [attr.aria-hidden]="!open()">
      <nav aria-label="Mobile">
        @for (link of links; track link.path; let i = $index) {
          <a [routerLink]="link.path" routerLinkActive="active" [style.--i]="i" [attr.tabindex]="open() ? 0 : -1">
            {{ link.label }}
          </a>
        }
        <a routerLink="/contact" [style.--i]="links.length" [attr.tabindex]="open() ? 0 : -1">Contact</a>
      </nav>
    </div>
  `,
  styles: [`
    .bar {
      position: fixed; inset: 0 0 auto; z-index: 50; height: var(--header-h);
      display: flex; align-items: center;
      transition: background .35s, box-shadow .35s, backdrop-filter .35s;
    }
    .bar.scrolled, .bar.open {
      background: rgb(252 251 254 / .82); backdrop-filter: saturate(1.6) blur(14px);
      box-shadow: 0 1px 0 var(--line);
    }
    .inner { display: flex; align-items: center; gap: 2rem; }
    .brand img { height: 42px; width: auto; }
    .links { display: flex; gap: .3rem; margin-left: auto; }
    .links a {
      position: relative; padding: .55rem .85rem; border-radius: 999px;
      font: 600 .92rem/1 var(--font-display); color: var(--ink); text-decoration: none;
      transition: background .2s, color .2s;
    }
    .links a:hover { background: rgb(48 0 102 / .06); }
    .links a.active { color: var(--purple); background: rgb(48 0 102 / .08); }
    .burger { display: none; }

    .drawer { display: none; }

    @media (max-width: 960px) {
      .links, .cta { display: none; }
      .burger {
        display: grid; place-content: center; gap: 6px; margin-left: auto;
        width: 46px; height: 46px; border-radius: 50%; border: 0; cursor: pointer;
        background: var(--purple);
      }
      .burger i { display: block; width: 18px; height: 2px; background: #fff; border-radius: 2px; transition: transform .35s var(--ease); }
      .open .burger i:first-of-type { transform: translateY(4px) rotate(45deg); }
      .open .burger i:last-of-type { transform: translateY(-4px) rotate(-45deg); }

      .drawer {
        display: block; position: fixed; inset: 0; z-index: 40;
        padding: calc(var(--header-h) + 2rem) var(--gutter) 2rem;
        background: var(--paper); visibility: hidden; opacity: 0;
        transition: opacity .35s, visibility .35s;
      }
      .drawer.open { visibility: visible; opacity: 1; }
      .drawer nav { display: grid; gap: .25rem; }
      .drawer a {
        font: 800 clamp(2rem, 9vw, 3rem)/1.15 var(--font-display); letter-spacing: -.03em;
        color: var(--ink); text-decoration: none; padding: .2rem 0;
        opacity: 0; transform: translateY(16px);
        transition: opacity .5s var(--ease), transform .5s var(--ease), color .2s;
        transition-delay: calc(var(--i) * 45ms);
      }
      .drawer.open a { opacity: 1; transform: none; }
      .drawer a.active, .drawer a:hover { color: var(--purple-500); }
    }
  `],
})
export class HeaderComponent {
  readonly links = LINKS;
  readonly scrolled = signal(false);
  readonly open = signal(false);

  constructor() {
    inject(Router).events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.open.set(false));
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 12);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }
}
