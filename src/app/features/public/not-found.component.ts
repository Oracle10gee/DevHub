import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';
import { LogoMarkComponent } from '../../shared/logo-mark.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, LogoMarkComponent],
  template: `
    <section class="page-hero nf">
      <app-logo-mark class="mark" [spin]="true" />
      <div class="container">
        <p class="eyebrow">404</p>
        <h1>We searched. <span class="text-gradient">No data here.</span></h1>
        <p class="lead">The page you're looking for doesn't exist or has moved.</p>
        <a routerLink="/" class="btn">Back to home <span class="arrow">→</span></a>
      </div>
    </section>
  `,
  styles: ['.nf { min-height: 80vh; display: flex; align-items: center; }'],
})
export class NotFoundComponent {
  constructor() {
    inject(SeoService).set('Page not found');
  }
}
