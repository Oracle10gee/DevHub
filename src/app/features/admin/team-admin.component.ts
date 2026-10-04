import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentService, TeamMemberInput } from '../../data/content.service';
import type { TeamChart, TeamMember } from '../../core/models';
import { buildTeamTree, descendantIds, flattenTeamTree } from '../../shared/team-tree';
import { AvatarComponent } from '../../shared/avatar.component';
import { ImageFieldComponent } from './image-field.component';

interface Draft {
  id: string | null;
  name: string;
  role: string;
  photo_url: string | null;
  parent_id: string | null;
}

const CHARTS: { value: TeamChart; label: string; hint: string }[] = [
  { value: 'management', label: 'Management organogram', hint: 'The main chart on the Team page, from the Principal Consultant down.' },
  { value: 'leads', label: 'Team leads & legacy team', hint: 'The second chart on the Team page. Add team members under each lead.' },
];

@Component({
  selector: 'app-team-admin',
  standalone: true,
  imports: [FormsModule, AvatarComponent, ImageFieldComponent],
  template: `
    <div class="adm-head">
      <h1>Team</h1>
      <div class="adm-actions">
        <a href="/team" target="_blank" rel="noopener" class="btn btn--sm btn--ghost">View page ↗</a>
        <button type="button" class="btn btn--sm" (click)="startAdd(null)">+ Add person</button>
      </div>
    </div>

    <div class="tabs" role="tablist">
      @for (c of charts; track c.value) {
        <button type="button" role="tab" [attr.aria-selected]="chart() === c.value" [class.on]="chart() === c.value" (click)="switchChart(c.value)">
          {{ c.label }} <small>{{ countIn(c.value) }}</small>
        </button>
      }
    </div>
    <p class="muted hint">{{ chartHint() }}</p>

    @if (message(); as m) { <div class="adm-msg" [class.ok]="m.ok" [class.err]="!m.ok">{{ m.text }}</div> }

    @if (draft(); as d) {
      <form class="adm-panel editor" (ngSubmit)="save()">
        <h2>{{ d.id ? 'Edit ' + (d.name || 'person') : 'Add a person' }}</h2>
        <div class="editor-grid">
          <div class="field">
            <label>Photo</label>
            <app-image-field [value]="d.photo_url" (valueChange)="d.photo_url = $event" folder="team" [round]="true" />
          </div>
          <div class="adm-stack">
            <div class="adm-grid-2">
              <div class="field">
                <label for="m-name">Full name</label>
                <input id="m-name" name="name" class="input" required maxlength="120" [(ngModel)]="d.name" />
              </div>
              <div class="field">
                <label for="m-role">Job title</label>
                <input id="m-role" name="role" class="input" maxlength="120" [(ngModel)]="d.role" placeholder="Field Supervisor" />
              </div>
            </div>
            <div class="field">
              <label for="m-parent">Reports to</label>
              <select id="m-parent" name="parent" class="input" [(ngModel)]="d.parent_id">
                <option [ngValue]="null">Nobody (top of the chart)</option>
                @for (o of parentOptions(); track o.member.id) {
                  <option [ngValue]="o.member.id">{{ indent(o.depth) }}{{ o.member.name }}{{ o.member.role ? ' · ' + o.member.role : '' }}</option>
                }
              </select>
              <span class="hint">This sets where they appear in the organogram.</span>
            </div>
            <div class="row-actions">
              <button class="btn btn--sm" type="submit" [disabled]="saving() || !d.name.trim()">{{ saving() ? 'Saving…' : 'Save' }}</button>
              <button class="btn btn--sm btn--ghost" type="button" (click)="draft.set(null)">Cancel</button>
            </div>
          </div>
        </div>
      </form>
    }

    <div class="adm-panel">
      @for (row of rows(); track row.member.id; let first = $first) {
        <div class="person" [style.--depth]="row.depth" [class.root]="row.depth === 0">
          <span class="branch" aria-hidden="true"></span>
          <app-avatar [name]="row.member.name" [photo]="row.member.photo_url" style="--size: 44px" />
          <div class="who">
            <strong>{{ row.member.name }}</strong>
            <span>{{ row.member.role || '—' }}</span>
          </div>
          <div class="tools">
            <button type="button" class="adm-icon-btn" title="Move up among colleagues" aria-label="Move up"
                    [disabled]="busy() || isFirstSibling(row.member)" (click)="move(row.member, -1)">↑</button>
            <button type="button" class="adm-icon-btn" title="Move down among colleagues" aria-label="Move down"
                    [disabled]="busy() || isLastSibling(row.member)" (click)="move(row.member, 1)">↓</button>
            <button type="button" class="btn btn--sm btn--ghost" (click)="startAdd(row.member.id)" title="Add someone who reports to this person">+ Report</button>
            <button type="button" class="btn btn--sm btn--ghost" (click)="startEdit(row.member)">Edit</button>
            @if (pendingDelete() === row.member.id) {
              <button type="button" class="btn btn--sm btn--danger" (click)="remove(row.member)">Confirm</button>
              <button type="button" class="adm-icon-btn" (click)="pendingDelete.set(null)" aria-label="Cancel">✕</button>
            } @else {
              <button type="button" class="adm-icon-btn" (click)="pendingDelete.set(row.member.id)" aria-label="Remove" title="Remove">🗑</button>
            }
          </div>
          @if (pendingDelete() === row.member.id && childCount(row.member) > 0) {
            <p class="warn">Their {{ childCount(row.member) }} direct report{{ childCount(row.member) > 1 ? 's' : '' }} will move up to report to {{ parentName(row.member) }}.</p>
          }
        </div>
      } @empty {
        <p class="adm-empty">{{ loading() ? 'Loading…' : 'Nobody in this chart yet. Click "Add person" to start.' }}</p>
      }
    </div>
  `,
  styles: [`
    .tabs { display: inline-flex; flex-wrap: wrap; gap: .3rem; padding: .35rem; border-radius: 14px; background: #fff; border: 1px solid var(--line); }
    .tabs button { border: 0; background: none; padding: .65rem 1rem; border-radius: 10px; font: 700 .88rem/1 var(--font-display); color: var(--ink-soft); cursor: pointer; }
    .tabs button small { margin-left: .35rem; padding: .15rem .45rem; border-radius: 999px; background: var(--lavender); color: var(--purple); font-size: .72rem; }
    .tabs button.on { background: var(--purple); color: #fff; }
    .tabs button.on small { background: rgb(255 255 255 / .2); color: #fff; }
    .hint { font-size: .9rem; margin: .8rem 0 1.4rem; }
    .editor { margin-bottom: 1.2rem; border-color: var(--purple-500); }
    .editor-grid { display: grid; grid-template-columns: 160px 1fr; gap: 1.5rem; }
    .adm-stack { display: grid; gap: 1rem; }
    .row-actions { display: flex; gap: .5rem; }
    .person {
      display: grid; grid-template-columns: auto auto 1fr auto; align-items: center; gap: .8rem;
      padding: .7rem 0 .7rem calc(var(--depth) * 32px); border-top: 1px solid var(--line);
    }
    .person:first-child { border-top: 0; }
    .branch { width: 14px; height: 14px; border-left: 2px solid var(--lavender); border-bottom: 2px solid var(--lavender); border-bottom-left-radius: 6px; margin-top: -10px; }
    .person.root .branch { visibility: hidden; width: 0; }
    .who { display: grid; min-width: 0; }
    .who strong { font-family: var(--font-display); color: var(--purple); }
    .who span { color: var(--muted); font-size: .88rem; }
    .tools { display: flex; flex-wrap: wrap; align-items: center; gap: .35rem; justify-content: flex-end; }
    .warn { grid-column: 3 / -1; margin: 0; font-size: .85rem; color: #93370d; background: #fef0c7; padding: .5rem .75rem; border-radius: 8px; }
    @media (max-width: 760px) {
      .editor-grid { grid-template-columns: 1fr; }
      .person { grid-template-columns: auto auto 1fr; padding-left: calc(var(--depth) * 18px); }
      .tools { grid-column: 1 / -1; justify-content: flex-start; }
      .warn { grid-column: 1 / -1; }
    }
  `],
})
export class TeamAdminComponent implements OnInit {
  private content = inject(ContentService);

  readonly charts = CHARTS;
  readonly members = signal<TeamMember[]>([]);
  readonly chart = signal<TeamChart>('management');
  readonly draft = signal<Draft | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly busy = signal(false);
  readonly pendingDelete = signal<string | null>(null);
  readonly message = signal<{ ok: boolean; text: string } | null>(null);

  readonly tree = computed(() => buildTeamTree(this.members(), this.chart()));
  readonly rows = computed(() => flattenTeamTree(this.tree()));
  readonly chartHint = computed(() => CHARTS.find((c) => c.value === this.chart())!.hint);

  /** Anyone in this chart except the person being edited and those below them. */
  readonly parentOptions = computed(() => {
    const d = this.draft();
    const blocked = d?.id ? descendantIds(this.tree(), d.id) : new Set<string>();
    return this.rows().filter((r) => !blocked.has(r.member.id));
  });

  async ngOnInit(): Promise<void> {
    try {
      this.members.set(await this.content.allTeam());
    } catch (e) {
      this.fail(e);
    } finally {
      this.loading.set(false);
    }
  }

  countIn(chart: TeamChart): number {
    return this.members().filter((m) => m.team === chart).length;
  }

  switchChart(chart: TeamChart): void {
    this.chart.set(chart);
    this.draft.set(null);
    this.pendingDelete.set(null);
  }

  indent(depth: number): string {
    return '   '.repeat(depth) + (depth ? '└ ' : '');
  }

  startAdd(parentId: string | null): void {
    this.message.set(null);
    this.draft.set({ id: null, name: '', role: '', photo_url: null, parent_id: parentId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  startEdit(m: TeamMember): void {
    this.message.set(null);
    this.draft.set({ id: m.id, name: m.name, role: m.role, photo_url: m.photo_url, parent_id: m.parent_id });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async save(): Promise<void> {
    const d = this.draft();
    if (!d) return;
    this.saving.set(true);
    this.message.set(null);
    try {
      const existing = d.id ? this.members().find((m) => m.id === d.id) : undefined;
      const moved = !existing || existing.parent_id !== d.parent_id;
      const input: TeamMemberInput = {
        name: d.name.trim(),
        role: d.role.trim(),
        photo_url: d.photo_url,
        team: this.chart(),
        parent_id: d.parent_id,
        // New arrivals (or people moved under someone new) go last among their colleagues.
        sort_order: moved ? this.nextOrder(d.parent_id) : existing!.sort_order,
      };
      const saved = await this.content.saveTeamMember(d.id, input);
      if (existing && existing.photo_url && existing.photo_url !== saved.photo_url) {
        await this.content.removeUpload(existing.photo_url);
      }
      this.members.update((list) => (d.id ? list.map((m) => (m.id === saved.id ? saved : m)) : [...list, saved]));
      this.draft.set(null);
      this.message.set({ ok: true, text: `${saved.name} saved.` });
    } catch (e) {
      this.fail(e);
    } finally {
      this.saving.set(false);
    }
  }

  async remove(m: TeamMember): Promise<void> {
    try {
      await this.content.deleteTeamMember(m);
      // The database moved their reports up a level; mirror that locally.
      this.members.update((list) =>
        list.filter((x) => x.id !== m.id).map((x) => (x.parent_id === m.id ? { ...x, parent_id: m.parent_id } : x)),
      );
      this.pendingDelete.set(null);
      this.message.set({ ok: true, text: `${m.name} removed.` });
    } catch (e) {
      this.fail(e);
    }
  }

  async move(m: TeamMember, delta: number): Promise<void> {
    const siblings = this.siblings(m);
    const i = siblings.findIndex((s) => s.id === m.id);
    const j = i + delta;
    if (j < 0 || j >= siblings.length) return;
    [siblings[i], siblings[j]] = [siblings[j], siblings[i]];
    const updates = siblings.map((s, idx) => ({ ...s, sort_order: idx + 1 }));
    this.members.update((list) => list.map((x) => updates.find((u) => u.id === x.id) ?? x));
    this.busy.set(true);
    try {
      await Promise.all(updates.map((u) => this.content.setTeamOrder(u.id, u.sort_order)));
    } catch (e) {
      this.fail(e);
    } finally {
      this.busy.set(false);
    }
  }

  isFirstSibling(m: TeamMember): boolean {
    return this.siblings(m)[0]?.id === m.id;
  }

  isLastSibling(m: TeamMember): boolean {
    const s = this.siblings(m);
    return s[s.length - 1]?.id === m.id;
  }

  childCount(m: TeamMember): number {
    return this.members().filter((x) => x.parent_id === m.id).length;
  }

  parentName(m: TeamMember): string {
    return this.members().find((x) => x.id === m.parent_id)?.name ?? 'the top of the chart';
  }

  /** Colleagues with the same manager, in display order. */
  private siblings(m: TeamMember): TeamMember[] {
    const rowsOrder = this.rows().map((r) => r.member.id);
    return this.members()
      .filter((x) => x.team === m.team && x.parent_id === m.parent_id)
      .sort((a, b) => rowsOrder.indexOf(a.id) - rowsOrder.indexOf(b.id));
  }

  private nextOrder(parentId: string | null): number {
    const peers = this.members().filter((x) => x.team === this.chart() && x.parent_id === parentId);
    return peers.reduce((max, p) => Math.max(max, p.sort_order), 0) + 1;
  }

  private fail(e: unknown): void {
    this.message.set({ ok: false, text: e instanceof Error ? e.message : String(e) });
  }
}
