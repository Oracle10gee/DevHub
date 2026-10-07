import { Component, HostListener, Input, computed, inject, signal } from '@angular/core';
import type { TeamMember } from '../core/models';
import { AvatarComponent } from './avatar.component';
import { TeamPeekService } from './team-peek.service';

const WIDTH = 360;
const EST_HEIGHT = 420;
const GAP = 18;
const EDGE = 12;
const SHEET_BREAKPOINT = 760;

/**
 * Frosted "liquid glass" profile card for a team member. Floats beside the
 * hovered person on desktop; becomes a bottom sheet with a backdrop on phones.
 */
@Component({
  selector: 'app-team-peek',
  standalone: true,
  imports: [AvatarComponent],
  template: `
    @if (peek.active(); as a) {
      <div class="backdrop" [class.pinned]="a.pinned" (click)="peek.close()"></div>
      <aside class="glass" role="dialog" aria-modal="false" [attr.aria-label]="a.member.name"
             [style.left.px]="position().left" [style.top.px]="position().top"
             (mouseenter)="peek.hold()" (mouseleave)="peek.leave()">
        <span class="sheen" aria-hidden="true"></span>
        <button type="button" class="close" (click)="peek.close()" aria-label="Close">✕</button>

        <header>
          <app-avatar [name]="a.member.name" [photo]="a.member.photo_url" />
          <div>
            <h3>{{ a.member.name }}</h3>
            @if (a.member.role) { <p class="role">{{ a.member.role }}</p> }
          </div>
        </header>

        @if (a.member.bio) {
          <p class="bio">{{ a.member.bio }}</p>
        }

        @if (manager() || reports().length) {
          <dl>
            @if (manager(); as m) {
              <div><dt>Reports to</dt><dd>{{ m.name }}</dd></div>
            }
            @if (reports().length) {
              <div>
                <dt>{{ reports().length === 1 ? 'Direct report' : 'Direct reports' }}</dt>
                <dd class="chips">
                  @for (r of reports(); track r.id) { <span>{{ r.name }}</span> }
                </dd>
              </div>
            }
          </dl>
        }
      </aside>
    }
  `,
  styles: [`
    .backdrop { display: none; position: fixed; inset: 0; z-index: 80; }
    .backdrop.pinned { display: block; }

    .glass {
      position: fixed; z-index: 81; width: 360px; max-width: calc(100vw - 24px);
      max-height: calc(100vh - 24px); overflow: hidden auto; padding: 1.5rem 1.5rem 1.3rem;
      border-radius: 30px; color: var(--ink);
      /* Translucent body + heavy blur/saturation = the frosted glass. */
      background:
        radial-gradient(120% 80% at 0% 0%, rgb(175 219 241 / .38), transparent 60%),
        radial-gradient(100% 90% at 100% 100%, rgb(190 160 240 / .32), transparent 60%),
        rgb(255 255 255 / .3);
      -webkit-backdrop-filter: blur(20px) saturate(2);
      backdrop-filter: blur(20px) saturate(2);
      border: 1px solid rgb(255 255 255 / .75);
      /* Bright top edge, soft inner glow, deep ambient shadow. */
      box-shadow:
        inset 0 1.5px 0 rgb(255 255 255 / .95),
        inset 0 -1px 0 rgb(255 255 255 / .35),
        inset 0 0 28px rgb(255 255 255 / .28),
        0 30px 70px -18px rgb(48 0 102 / .45),
        0 8px 24px -8px rgb(48 0 102 / .22);
      transform-origin: var(--origin, left center);
      animation: pop .38s cubic-bezier(.2, 1.3, .4, 1) both;
    }
    @keyframes pop { from { opacity: 0; transform: scale(.9) translateY(8px); filter: blur(6px); } }

    /* Moving specular highlight across the surface. */
    .sheen {
      position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
      background: linear-gradient(115deg, transparent 30%, rgb(255 255 255 / .55) 46%, transparent 58%);
      background-size: 250% 100%; mix-blend-mode: soft-light;
      animation: sheen 1.1s ease-out .1s both;
    }
    @keyframes sheen { from { background-position: 120% 0; } to { background-position: -60% 0; } }

    .close {
      position: absolute; top: .9rem; right: .9rem; width: 32px; height: 32px; border-radius: 50%;
      border: 1px solid rgb(255 255 255 / .8); background: rgb(255 255 255 / .5); color: var(--purple);
      cursor: pointer; font-size: .8rem; display: none; place-items: center;
    }
    .backdrop.pinned ~ .glass .close { display: grid; }

    header { position: relative; display: flex; align-items: center; gap: 1rem; padding-right: 2rem; }
    app-avatar { --size: 76px; flex: none; }
    h3 { margin: 0; font-size: 1.25rem; color: var(--purple); }
    .role { margin: .25rem 0 0; font: 600 .85rem/1.35 var(--font-display); color: var(--blue); }
    .bio { position: relative; margin: 1.1rem 0 0; font-size: .93rem; line-height: 1.65; color: var(--ink); white-space: pre-line; }

    dl { position: relative; margin: 1.1rem 0 0; display: grid; gap: .8rem; }
    dl > div { padding-top: .8rem; border-top: 1px solid rgb(48 0 102 / .12); }
    dt { font: 700 .68rem/1 var(--font-display); letter-spacing: .14em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: .45rem; }
    dd { margin: 0; font-weight: 600; color: var(--purple); }
    .chips { display: flex; flex-wrap: wrap; gap: .35rem; }
    .chips span { padding: .3rem .65rem; border-radius: 999px; font-size: .8rem; background: rgb(255 255 255 / .6); border: 1px solid rgb(255 255 255 / .85); }

    /* Phones: a bottom sheet over a dimmed, blurred page. */
    @media (max-width: 760px) {
      .backdrop, .backdrop.pinned { display: block; background: rgb(29 11 59 / .35); -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px); animation: fade .25s both; }
      .glass { left: 12px !important; right: 12px; top: auto !important; bottom: 12px; width: auto; max-height: 78vh; --origin: center bottom; animation-name: rise; }
      .close { display: grid; }
    }
    @keyframes rise { from { opacity: 0; transform: translateY(40px); } }
    @keyframes fade { from { opacity: 0; } }

    /* Browsers without backdrop blur get a more opaque card so text stays readable. */
    @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
      .glass { background: rgb(250 248 254 / .97); }
    }
    @media (prefers-reduced-motion: reduce) {
      .glass, .sheen, .backdrop { animation: none; }
    }
  `],
})
export class TeamPeekComponent {
  readonly peek = inject(TeamPeekService);

  private readonly all = signal<TeamMember[]>([]);
  @Input({ required: true }) set members(value: TeamMember[]) {
    this.all.set(value);
  }

  readonly manager = computed(() => {
    const m = this.peek.active()?.member;
    return m?.parent_id ? this.all().find((x) => x.id === m.parent_id) ?? null : null;
  });

  readonly reports = computed(() => {
    const m = this.peek.active()?.member;
    return m ? this.all().filter((x) => x.parent_id === m.id).sort((a, b) => a.sort_order - b.sort_order) : [];
  });

  /** Beside the hovered card: right if it fits, otherwise left, always on screen. */
  readonly position = computed(() => {
    const a = this.peek.active();
    if (!a || window.innerWidth <= SHEET_BREAKPOINT) return { left: EDGE, top: EDGE };
    const { rect } = a;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = rect.right + GAP;
    if (left + WIDTH > vw - EDGE) left = rect.left - GAP - WIDTH;
    left = Math.min(Math.max(left, EDGE), vw - WIDTH - EDGE);
    const top = Math.min(Math.max(rect.top - 24, EDGE), Math.max(EDGE, vh - EST_HEIGHT - EDGE));
    return { left, top };
  });

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.peek.close();
  }

  // The card is fixed to the screen, so it would drift away from its person on scroll.
  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange(): void {
    // (The phone bottom sheet is anchored to the screen edge, so it can stay.)
    if (this.peek.active() && window.innerWidth > SHEET_BREAKPOINT) this.peek.close();
  }
}
