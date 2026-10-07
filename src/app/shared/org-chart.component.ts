import { Component, Input, inject } from '@angular/core';
import type { TeamNode } from '../core/models';
import { AvatarComponent } from './avatar.component';
import { TeamPeekService } from './team-peek.service';

/**
 * Draws a reporting hierarchy of any depth. Renders itself recursively for
 * each level; connector lines are pure CSS. Collapses to an indented list on
 * narrow screens.
 */
@Component({
  selector: 'app-org-chart',
  standalone: true,
  imports: [AvatarComponent],
  template: `
    <ul class="level" [class.nested]="nested">
      @for (n of nodes; track n.member.id) {
        <li>
          <div class="node" [class.top]="!nested && nodes.length === 1" #card
               tabindex="0" role="button" aria-haspopup="dialog"
               [attr.aria-label]="'About ' + n.member.name"
               (mouseenter)="peek?.hover(n.member, card)" (mouseleave)="peek?.leave()"
               (focus)="peek?.hover(n.member, card)" (blur)="peek?.leave()"
               (click)="peek?.toggle(n.member, card)"
               (keydown.enter)="peek?.toggle(n.member, card)"
               (keydown.space)="peek?.toggle(n.member, card); $event.preventDefault()">
            <app-avatar [name]="n.member.name" [photo]="n.member.photo_url" />
            <strong>{{ n.member.name }}</strong>
            @if (n.member.role) { <span>{{ n.member.role }}</span> }
          </div>
          @if (n.children.length) {
            <app-org-chart [nodes]="n.children" [nested]="true" />
          }
        </li>
      }
    </ul>
  `,
  styles: [`
    :host { --line: rgb(48 0 102 / .3); --gap: 28px; display: block; }
    .level { display: flex; justify-content: center; margin: 0; padding: 0; list-style: none; position: relative; }
    .level.nested { padding-top: var(--gap); }
    .level.nested::before {
      content: ''; position: absolute; top: 0; left: 50%; height: var(--gap); border-left: 2px solid var(--line);
    }
    li { position: relative; display: flex; flex-direction: column; align-items: center; padding: var(--gap) 10px 0; }
    li::before, li::after {
      content: ''; position: absolute; top: 0; right: 50%; width: 50%; height: var(--gap); border-top: 2px solid var(--line);
    }
    li::after { right: auto; left: 50%; border-left: 2px solid var(--line); }
    li:only-child::before, li:only-child::after { display: none; }
    li:only-child { padding-top: 0; }
    li:first-child::before, li:last-child::after { border: 0 none; }
    li:last-child::before { border-right: 2px solid var(--line); border-radius: 0 10px 0 0; }
    li:first-child::after { border-radius: 10px 0 0 0; }
    .level:not(.nested) > li:only-child { padding-top: 0; }

    .node {
      display: grid; justify-items: center; text-align: center; gap: .3rem; width: 190px;
      padding: 1.1rem .8rem 1rem; border-radius: var(--radius); background: #fff;
      border: 1px solid var(--line); box-shadow: var(--shadow-sm);
      transition: transform .35s var(--ease), box-shadow .35s var(--ease);
      cursor: pointer;
    }
    .node:hover { transform: translateY(-4px); box-shadow: var(--shadow); }
    .node app-avatar { --size: 64px; margin-bottom: .4rem; }
    .node.top { width: 220px; border-color: var(--purple); }
    .node.top app-avatar { --size: 88px; }
    strong { font: 800 .95rem/1.25 var(--font-display); color: var(--purple); }
    span { color: var(--ink-soft); font-size: .82rem; line-height: 1.35; }

    @media (max-width: 760px) {
      .level, .level.nested { display: block; padding: 0; }
      .level.nested { margin-left: 22px; padding-left: 18px; border-left: 2px solid var(--line); }
      .level.nested::before, li::before, li::after { display: none; }
      li, li:only-child { display: block; padding: .6rem 0 0; }
      .node, .node.top { width: auto; grid-template-columns: auto 1fr; grid-template-rows: auto auto; justify-items: start; text-align: left; column-gap: .9rem; row-gap: .1rem; padding: .8rem 1rem; }
      .node app-avatar, .node.top app-avatar { --size: 48px; grid-row: span 2; margin: 0; align-self: center; }
      strong { align-self: end; }
    }
  `],
})
export class OrgChartComponent {
  @Input({ required: true }) nodes: TeamNode[] = [];
  @Input() nested = false;

  /** Present on the Team page; absent anywhere the chart is shown without pop-ups. */
  readonly peek = inject(TeamPeekService, { optional: true });
}
