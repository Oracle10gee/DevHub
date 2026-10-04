import { Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/auth.service';

/**
 * Admin layout. Styles are unencapsulated so every admin screen shares the
 * same table, form and toolbar classes (all prefixed `adm-`).
 */
@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="adm" [class.nav-open]="navOpen()">
      <aside class="adm-side">
        <a routerLink="/admin" class="adm-brand">
          <img src="/assets/brand/logo.svg" alt="DevHub" />
          <span>CMS</span>
        </a>
        <nav>
          <a routerLink="/admin" routerLinkActive="on" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
          <a routerLink="/admin/posts" routerLinkActive="on">Posts</a>
          <a routerLink="/admin/projects" routerLinkActive="on">Projects</a>
          <a routerLink="/admin/gallery" routerLinkActive="on">Gallery</a>
          <a routerLink="/admin/team" routerLinkActive="on">Team</a>
          <a routerLink="/admin/messages" routerLinkActive="on">Messages</a>
          <a routerLink="/admin/settings" routerLinkActive="on">Site settings</a>
        </nav>
        <div class="adm-user">
          <span>{{ auth.email() }}</span>
          <a href="/" target="_blank" rel="noopener">View site ↗</a>
          <button type="button" (click)="signOut()">Sign out</button>
        </div>
      </aside>
      <div class="adm-main">
        <header class="adm-top">
          <button type="button" class="adm-burger" (click)="navOpen.set(!navOpen())" aria-label="Toggle menu">☰</button>
          <span>DevHub CMS</span>
        </header>
        <div class="adm-content"><router-outlet /></div>
      </div>
    </div>
  `,
  styles: [`
    .adm { display: grid; grid-template-columns: 250px 1fr; min-height: 100vh; background: #f5f3f9; }
    .adm-side { position: sticky; top: 0; height: 100vh; display: flex; flex-direction: column; gap: 2rem; padding: 1.5rem 1rem; background: var(--purple); color: #fff; }
    .adm-brand { display: flex; align-items: center; gap: .6rem; padding: 0 .6rem; text-decoration: none; color: #fff; }
    .adm-brand img { height: 34px; width: auto; filter: brightness(0) invert(1); }
    .adm-brand span { font: 800 .7rem/1 var(--font-display); letter-spacing: .14em; padding: .3rem .5rem; border-radius: 6px; background: rgb(255 255 255 / .15); }
    .adm-side nav { display: grid; gap: .2rem; }
    .adm-side nav a { padding: .75rem .9rem; border-radius: 10px; color: rgb(255 255 255 / .75); text-decoration: none; font: 600 .95rem/1 var(--font-display); transition: background .2s, color .2s; }
    .adm-side nav a:hover { background: rgb(255 255 255 / .08); color: #fff; }
    .adm-side nav a.on { background: #fff; color: var(--purple); }
    .adm-user { margin-top: auto; display: grid; gap: .6rem; padding: 1rem .9rem 0; border-top: 1px solid rgb(255 255 255 / .15); font-size: .85rem; }
    .adm-user span { color: rgb(255 255 255 / .6); word-break: break-all; }
    .adm-user a, .adm-user button { color: #fff; background: none; border: 0; padding: 0; text-align: left; cursor: pointer; text-decoration: none; font-weight: 600; }
    .adm-top { display: none; }
    .adm-content { padding: clamp(1.25rem, 3vw, 2.5rem); max-width: 1200px; }

    @media (max-width: 860px) {
      .adm { grid-template-columns: 1fr; }
      .adm-side { position: fixed; inset: 0 auto 0 0; width: 260px; z-index: 60; transform: translateX(-100%); transition: transform .3s var(--ease); }
      .nav-open .adm-side { transform: none; box-shadow: 0 0 0 100vmax rgb(0 0 0 / .35); }
      .adm-top { display: flex; align-items: center; gap: 1rem; padding: .9rem 1.25rem; background: #fff; border-bottom: 1px solid var(--line); font: 700 1rem/1 var(--font-display); color: var(--purple); }
      .adm-burger { border: 0; background: var(--lavender-50); width: 40px; height: 40px; border-radius: 10px; font-size: 1.2rem; cursor: pointer; }
    }

    /* ─── Shared admin UI ─────────────────────────────────────────── */
    .adm-head { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.8rem; }
    .adm-head h1 { font-size: clamp(1.6rem, 3vw, 2.1rem); margin: 0; color: var(--purple); }
    .adm-head .adm-actions { display: flex; flex-wrap: wrap; gap: .6rem; }
    .adm-panel { background: #fff; border: 1px solid var(--line); border-radius: var(--radius); padding: clamp(1.1rem, 3vw, 1.8rem); }
    .adm-panel + .adm-panel { margin-top: 1.2rem; }
    .adm-panel h2 { font-size: 1.1rem; margin-bottom: 1rem; }
    .adm-table-wrap { overflow-x: auto; }
    .adm-table { width: 100%; border-collapse: collapse; font-size: .93rem; }
    .adm-table th { text-align: left; font: 700 .72rem/1 var(--font-display); letter-spacing: .1em; text-transform: uppercase; color: var(--muted); padding: .8rem; border-bottom: 1px solid var(--line); }
    .adm-table td { padding: .8rem; border-bottom: 1px solid var(--line); vertical-align: middle; }
    .adm-table tr:last-child td { border-bottom: 0; }
    .adm-table a { color: var(--purple); font-weight: 600; text-decoration: none; }
    .adm-table a:hover { text-decoration: underline; }
    .adm-thumb { width: 64px; height: 44px; object-fit: cover; border-radius: 8px; background: var(--lavender); }
    .adm-badge { display: inline-block; padding: .3rem .6rem; border-radius: 999px; font: 700 .72rem/1 var(--font-display); background: var(--lavender); color: var(--purple); }
    .adm-badge.ok { background: #dcfae6; color: #067647; }
    .adm-badge.warn { background: #fef0c7; color: #93370d; }
    .adm-form { display: grid; grid-template-columns: 1fr 320px; gap: 1.2rem; align-items: start; }
    .adm-form .adm-stack { display: grid; gap: 1.2rem; }
    .adm-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .adm-check { display: flex; align-items: center; gap: .6rem; font-weight: 600; cursor: pointer; }
    .adm-check input { width: 18px; height: 18px; accent-color: var(--purple); }
    .adm-msg { padding: .8rem 1rem; border-radius: 10px; font-weight: 600; font-size: .92rem; margin-bottom: 1rem; }
    .adm-msg.ok { background: #dcfae6; color: #067647; }
    .adm-msg.err { background: #fee4e2; color: #b42318; }
    .adm-empty { padding: 2.5rem; text-align: center; color: var(--muted); }
    .adm-icon-btn { border: 1px solid var(--line); background: #fff; width: 34px; height: 34px; border-radius: 8px; cursor: pointer; font-size: .95rem; }
    .adm-icon-btn:hover:not([disabled]) { background: var(--lavender-50); }
    .adm-icon-btn[disabled] { opacity: .4; cursor: default; }
    @media (max-width: 960px) {
      .adm-form, .adm-grid-2 { grid-template-columns: 1fr; }
    }
  `],
})
export class AdminShellComponent {
  readonly auth = inject(AuthService);
  private router = inject(Router);
  readonly navOpen = signal(false);

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.navOpen.set(false));
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    this.router.navigateByUrl('/admin/login');
  }
}
