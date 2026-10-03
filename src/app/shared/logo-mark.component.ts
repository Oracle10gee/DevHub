import { Component, Input } from '@angular/core';

/**
 * The DevHub magnifier-and-pie motif, redrawn as strokes so it can be scaled
 * up as a background element and animated.
 */
@Component({
  selector: 'app-logo-mark',
  standalone: true,
  template: `
    <svg viewBox="0 0 200 200" aria-hidden="true" [class.spin]="spin">
      <g fill="none" stroke="currentColor" stroke-linecap="round">
        <path class="arc" d="M58 168 A80 80 0 0 1 64 30" stroke-width="12" />
        <path class="arc arc-2" d="M78 158 A62 62 0 0 1 80 46" stroke-width="7" opacity=".55" />
        <circle cx="112" cy="98" r="50" stroke-width="10" />
        <path d="M148 136 L176 172" stroke-width="12" />
      </g>
      <path d="M112 98 L112 56 A42 42 0 0 1 150 112 Z" fill="currentColor" opacity=".35" />
    </svg>
  `,
  styles: [`
    :host { display: block; color: inherit; }
    svg { width: 100%; height: 100%; overflow: visible; }
    .spin .arc { transform-origin: 112px 98px; animation: orbit 24s linear infinite; }
    .spin .arc-2 { animation-duration: 36s; animation-direction: reverse; }
    @keyframes orbit { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { .spin .arc { animation: none; } }
  `],
})
export class LogoMarkComponent {
  @Input() spin = false;
}
