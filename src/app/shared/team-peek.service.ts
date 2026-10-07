import { Injectable, OnDestroy, signal } from '@angular/core';
import type { TeamMember } from '../core/models';

export interface Peek {
  member: TeamMember;
  /** Where the hovered card sits on screen, so the pop-up can open beside it. */
  rect: DOMRect;
  /** Opened by click/tap: stays until dismissed instead of closing on mouse-out. */
  pinned: boolean;
}

const OPEN_DELAY = 140;
const CLOSE_DELAY = 180;

/**
 * Coordinates the team pop-up card. Provided by the Team page so every level
 * of the (recursive) org chart and the pop-up itself share one state.
 */
@Injectable()
export class TeamPeekService implements OnDestroy {
  readonly active = signal<Peek | null>(null);

  private openTimer?: ReturnType<typeof setTimeout>;
  private closeTimer?: ReturnType<typeof setTimeout>;

  /** Hover or keyboard focus: open after a beat so skimming the chart doesn't flicker. */
  hover(member: TeamMember, el: HTMLElement): void {
    this.clearTimers();
    this.openTimer = setTimeout(() => {
      const current = this.active();
      if (current?.pinned) return;
      this.active.set({ member, rect: el.getBoundingClientRect(), pinned: false });
    }, OPEN_DELAY);
  }

  /** Mouse left the card or the pop-up: close shortly unless it re-enters either. */
  leave(): void {
    clearTimeout(this.openTimer);
    if (this.active()?.pinned) return;
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => this.active.set(null), CLOSE_DELAY);
  }

  /** Mouse moved onto the pop-up itself. */
  hold(): void {
    clearTimeout(this.closeTimer);
  }

  /** Click, tap or Enter: pin it open, or close it if it is already pinned on this person. */
  toggle(member: TeamMember, el: HTMLElement): void {
    this.clearTimers();
    const current = this.active();
    if (current?.pinned && current.member.id === member.id) this.active.set(null);
    else this.active.set({ member, rect: el.getBoundingClientRect(), pinned: true });
  }

  close(): void {
    this.clearTimers();
    this.active.set(null);
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  private clearTimers(): void {
    clearTimeout(this.openTimer);
    clearTimeout(this.closeTimer);
  }
}
