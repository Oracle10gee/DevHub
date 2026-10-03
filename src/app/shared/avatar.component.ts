import { Component, Input } from '@angular/core';

const PALETTE = ['#300066', '#1e73be', '#4f8db3', '#2b3990', '#0a9fd8'];

/** Initials avatar used until a headshot is available. */
@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `<span [style.background]="color">{{ initials }}</span>`,
  styles: [`
    :host { display: inline-block; width: var(--size, 72px); height: var(--size, 72px); }
    span {
      display: grid; place-items: center; width: 100%; height: 100%; border-radius: 50%;
      color: #fff; font: 700 calc(var(--size, 72px) * .34)/1 var(--font-display);
      letter-spacing: .02em; box-shadow: 0 0 0 4px #fff, 0 8px 24px rgb(48 0 102 / .18);
    }
  `],
})
export class AvatarComponent {
  initials = '';
  color = PALETTE[0];

  @Input({ required: true }) set name(value: string) {
    const parts = value.trim().split(/\s+/);
    this.initials = (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
    let hash = 0;
    for (const ch of value) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    this.color = PALETTE[hash % PALETTE.length];
  }
}
