import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { ContentService } from '../../data/content.service';
import type { GalleryItem } from '../../core/models';
import { SeoService } from '../../core/seo.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { LogoMarkComponent } from '../../shared/logo-mark.component';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [RevealDirective, LogoMarkComponent],
  template: `
    <section class="page-hero">
      <app-logo-mark class="mark" [spin]="true" />
      <div class="container">
        <p class="eyebrow" reveal>Gallery</p>
        <h1 reveal [revealDelay]="80">Our people, <span class="text-gradient">at work.</span></h1>
        <p class="lead" reveal [revealDelay]="160">Training sessions, briefings and fieldwork from recent DevHub projects.</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        @if (loading()) {
          <div class="skeleton" style="height: 60vh"></div>
        } @else {
          <div class="masonry">
            @for (item of items(); track item.id; let i = $index) {
              <button type="button" class="tile" (click)="open.set(i)" reveal [revealDelay]="(i % 3) * 70">
                <img [src]="item.image_url" [alt]="item.caption" loading="lazy" />
                @if (item.caption) { <span class="cap">{{ item.caption }}</span> }
              </button>
            } @empty {
              <p class="empty">No photos yet.</p>
            }
          </div>
        }
      </div>
    </section>

    @if (open() !== null) {
      <div class="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" (click)="open.set(null)">
        <button type="button" class="lb-btn close" (click)="open.set(null)" aria-label="Close">✕</button>
        <button type="button" class="lb-btn prev" (click)="step(-1); $event.stopPropagation()" aria-label="Previous photo">←</button>
        <figure (click)="$event.stopPropagation()">
          <img [src]="items()[open()!].image_url" [alt]="items()[open()!].caption" />
          <figcaption>{{ items()[open()!].caption }} <span>{{ open()! + 1 }} / {{ items().length }}</span></figcaption>
        </figure>
        <button type="button" class="lb-btn next" (click)="step(1); $event.stopPropagation()" aria-label="Next photo">→</button>
      </div>
    }
  `,
  styles: [`
    .masonry { columns: 3 300px; column-gap: 1rem; }
    .tile { position: relative; display: block; width: 100%; margin: 0 0 1rem; padding: 0; border: 0; border-radius: var(--radius); overflow: hidden; cursor: zoom-in; break-inside: avoid; background: var(--lavender); }
    .tile img { width: 100%; transition: transform .8s var(--ease); }
    .tile:hover img { transform: scale(1.05); }
    .cap {
      position: absolute; inset: auto 0 0; padding: 2.5rem 1.1rem 1rem; text-align: left;
      background: linear-gradient(transparent, rgb(48 0 102 / .85)); color: #fff; font-weight: 600; font-size: .92rem;
      opacity: 0; transform: translateY(10px); transition: opacity .35s, transform .35s var(--ease);
    }
    .tile:hover .cap, .tile:focus-visible .cap { opacity: 1; transform: none; }
    .lightbox { position: fixed; inset: 0; z-index: 100; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 1rem; padding: 2rem; background: rgb(18 4 38 / .94); animation: fade .25s; }
    @keyframes fade { from { opacity: 0; } }
    figure { margin: 0; display: grid; justify-items: center; gap: 1rem; }
    figure img { max-height: 80vh; width: auto; border-radius: var(--radius-sm); }
    figcaption { color: #fff; text-align: center; }
    figcaption span { display: block; color: rgb(255 255 255 / .5); font-size: .85rem; margin-top: .3rem; }
    .lb-btn { width: 52px; height: 52px; border-radius: 50%; border: 0; background: rgb(255 255 255 / .12); color: #fff; font-size: 1.2rem; cursor: pointer; transition: background .2s; }
    .lb-btn:hover { background: rgb(255 255 255 / .25); }
    .close { position: absolute; top: 1.2rem; right: 1.2rem; }
    @media (max-width: 600px) {
      .lightbox { grid-template-columns: 1fr 1fr; padding: 4rem 1rem 1rem; }
      figure { grid-column: 1 / -1; grid-row: 1; }
      .prev { justify-self: end; } .next { justify-self: start; }
    }
  `],
})
export class GalleryComponent implements OnInit {
  private content = inject(ContentService);

  readonly items = signal<GalleryItem[]>([]);
  readonly loading = signal(true);
  readonly open = signal<number | null>(null);

  constructor() {
    inject(SeoService).set('Gallery', 'Photos from DevHub training sessions, briefings and fieldwork.');
  }

  async ngOnInit(): Promise<void> {
    this.items.set(await this.content.gallery());
    this.loading.set(false);
  }

  step(delta: number): void {
    const n = this.items().length;
    const i = this.open();
    if (i !== null && n) this.open.set((i + delta + n) % n);
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (this.open() === null) return;
    if (e.key === 'Escape') this.open.set(null);
    if (e.key === 'ArrowRight') this.step(1);
    if (e.key === 'ArrowLeft') this.step(-1);
  }
}
