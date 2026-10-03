import { Component, Input, OnInit } from '@angular/core';

interface Facet {
  points: string;
  fill: string;
  delay: number;
}

// Deterministic PRNG so the pattern is identical on every load.
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mix(a: number[], b: number[], t: number): number[] {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

/**
 * The low-poly lavender-to-cyan backdrop from the cover of the company deck,
 * generated as a jittered triangle mesh. Facets shimmer slowly.
 */
@Component({
  selector: 'app-facets',
  standalone: true,
  template: `
    <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      @for (f of facets; track $index) {
        <polygon [attr.points]="f.points" [attr.fill]="f.fill" [style.animation-delay.ms]="f.delay" />
      }
    </svg>
  `,
  styles: [`
    :host { position: absolute; inset: 0; overflow: hidden; }
    svg { width: 100%; height: 100%; }
    polygon { stroke: rgb(255 255 255 / .35); stroke-width: .6; animation: shimmer 9s ease-in-out infinite; }
    @keyframes shimmer { 50% { opacity: .82; } }
    @media (prefers-reduced-motion: reduce) { polygon { animation: none; } }
  `],
})
export class FacetsComponent implements OnInit {
  @Input() seed = 7;
  @Input() cols = 11;
  @Input() rows = 7;

  facets: Facet[] = [];

  ngOnInit(): void {
    const rand = mulberry32(this.seed);
    const w = 1600 / this.cols;
    const h = 1000 / this.rows;
    const pts: number[][][] = [];
    for (let r = 0; r <= this.rows; r++) {
      pts[r] = [];
      for (let c = 0; c <= this.cols; c++) {
        const edgeX = c === 0 || c === this.cols;
        const edgeY = r === 0 || r === this.rows;
        pts[r][c] = [
          c * w + (edgeX ? 0 : (rand() - 0.5) * w * 0.8),
          r * h + (edgeY ? 0 : (rand() - 0.5) * h * 0.8),
        ];
      }
    }

    const cyan = [212, 247, 251];
    const lavender = [216, 208, 246];
    const white = [244, 241, 252];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const [a, b, cc, d] = [pts[r][c], pts[r][c + 1], pts[r + 1][c + 1], pts[r + 1][c]];
        const tris = rand() > 0.5 ? [[a, b, cc], [a, cc, d]] : [[a, b, d], [b, cc, d]];
        for (const tri of tris) {
          const cx = tri.reduce((s, p) => s + p[0], 0) / 3 / 1600;
          const cy = tri.reduce((s, p) => s + p[1], 0) / 3 / 1000;
          const base = mix(cyan, lavender, Math.min(1, Math.max(0, cx * 0.8 + cy * 0.35 + (rand() - 0.5) * 0.25)));
          const rgb = mix(base, white, rand() * 0.45);
          this.facets.push({
            points: tri.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' '),
            fill: `rgb(${rgb.join(' ')})`,
            delay: Math.round(rand() * -9000),
          });
        }
      }
    }
  }
}
