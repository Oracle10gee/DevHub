import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './footer.component';
import { HeaderComponent } from './header.component';

@Component({
  selector: 'app-site-shell',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <a class="skip" href="#main">Skip to content</a>
    <app-header />
    <main id="main"><router-outlet /></main>
    <app-footer />
  `,
  styles: [`
    .skip { position: absolute; left: 1rem; top: -4rem; z-index: 100; padding: .7rem 1rem; background: var(--purple); color: #fff; border-radius: 8px; }
    .skip:focus { top: 1rem; }
    main { min-height: 60vh; }
  `],
})
export class SiteShellComponent {}
