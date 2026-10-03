import { Directive, ElementRef, Input, OnDestroy, OnInit, inject } from '@angular/core';

/** Counts a number up from zero once it scrolls into view. */
@Directive({ selector: '[countUp]', standalone: true })
export class CountUpDirective implements OnInit, OnDestroy {
  @Input({ required: true }) countUp = 0;
  @Input() countSuffix = '';

  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const node = this.el.nativeElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      node.textContent = `${this.countUp}${this.countSuffix}`;
      return;
    }
    node.textContent = `0${this.countSuffix}`;
    this.observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      this.observer?.disconnect();
      const start = performance.now();
      const duration = 1400;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        node.textContent = `${Math.round(this.countUp * eased)}${this.countSuffix}`;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    this.observer.observe(node);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
