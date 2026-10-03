import { Component, Input } from '@angular/core';
import type { IconName } from '../data/site-content';

/** Line icons for the five areas of expertise. */
@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @switch (name) {
        @case ('academic') {
          <path d="M4 16 24 8l20 8-20 8z" /><path d="M12 20v9c0 3 5.4 5 12 5s12-2 12-5v-9" /><path d="M44 16v10" />
          <circle cx="33" cy="35" r="5" /><path d="m37 39 5 5" />
        }
        @case ('market') {
          <path d="M8 40V28M16 40V20M24 40V26" /><path d="M10 10a8 8 0 1 0 8 8h-8z" /><path d="M28 10h14M28 16h10M28 22h14" />
          <circle cx="34" cy="33" r="6" /><path d="m38.5 37.5 5 5" />
        }
        @case ('policy') {
          <rect x="10" y="6" width="24" height="32" rx="3" /><path d="M16 14h12M16 20h8" />
          <path d="M16 28c0 5 3 8 6 9 3-1 6-4 6-9v-4l-6-2-6 2z" /><path d="m19.5 29 2 2 3.5-4" />
          <circle cx="36" cy="22" r="6" /><path d="m40.5 26.5 4 4" />
        }
        @case ('design') {
          <rect x="8" y="6" width="26" height="36" rx="2" /><path d="M14 34h14M14 38h10" />
          <circle cx="21" cy="19" r="9" /><path d="M21 13v6l-3 4h6l-3-4" /><path d="m28 26 10 10" />
        }
        @case ('data') {
          <path d="M6 14a3 3 0 0 1 3-3h9l4 4h17a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" />
          <circle cx="32" cy="29" r="7" /><path d="M32 22v7h7" /><path d="M32 18v-2M32 42v-2M43 29h-2M23 29h-2" />
        }
      }
    </svg>
  `,
  styles: [':host { display: inline-block; width: 48px; height: 48px; } svg { width: 100%; height: 100%; }'],
})
export class IconComponent {
  @Input({ required: true }) name!: IconName;
}
