import { AfterViewInit, Directive, ElementRef, OnDestroy, inject } from '@angular/core';

/**
 * Shrinks the host's first child (with CSS zoom) so it always fits the host's
 * width, never enlarging it. Used for the organogram, which grows sideways as
 * people are added, so it stays on one screen without a horizontal scrollbar.
 */
@Directive({ selector: '[fitWidth]', standalone: true })
export class FitWidthDirective implements AfterViewInit, OnDestroy {
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: ResizeObserver;
  private frame = 0;

  ngAfterViewInit(): void {
    if (typeof ResizeObserver === 'undefined') return;
    this.observer = new ResizeObserver(() => this.schedule());
    this.observer.observe(this.host.nativeElement);
    const child = this.host.nativeElement.firstElementChild;
    if (child) this.observer.observe(child);
    this.schedule();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
  }

  private schedule(): void {
    cancelAnimationFrame(this.frame);
    this.frame = requestAnimationFrame(() => this.fit());
  }

  private fit(): void {
    const host = this.host.nativeElement;
    const child = host.firstElementChild as HTMLElement | null;
    if (!child) return;
    const current = child.style.getPropertyValue('zoom');
    child.style.setProperty('zoom', '1');
    const natural = child.scrollWidth;
    const available = host.clientWidth;
    const next = natural > available && natural > 0 ? Math.max(0.5, available / natural).toFixed(3) : '1';
    // Setting the same value again doesn't resize anything, so the observer settles.
    child.style.setProperty('zoom', next === current ? current : next);
  }
}
