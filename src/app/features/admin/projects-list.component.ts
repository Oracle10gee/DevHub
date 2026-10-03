import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../data/content.service';
import type { Project } from '../../core/models';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="adm-head">
      <h1>Projects</h1>
      <div class="adm-actions"><a routerLink="/admin/projects/new" class="btn btn--sm">+ New project</a></div>
    </div>
    @if (error()) { <div class="adm-msg err">{{ error() }}</div> }
    <div class="adm-panel adm-table-wrap">
      <table class="adm-table">
        <thead><tr><th>Order</th><th></th><th>Title</th><th>Client</th><th>Status</th><th>Visibility</th></tr></thead>
        <tbody>
          @for (p of projects(); track p.id; let i = $index; let first = $first; let last = $last) {
            <tr>
              <td class="order">
                <button type="button" class="adm-icon-btn" [disabled]="first || busy()" (click)="move(i, -1)" aria-label="Move up">↑</button>
                <button type="button" class="adm-icon-btn" [disabled]="last || busy()" (click)="move(i, 1)" aria-label="Move down">↓</button>
              </td>
              <td><img class="adm-thumb" [src]="p.cover_url || '/assets/brand/favicon.svg'" alt="" /></td>
              <td><a [routerLink]="['/admin/projects', p.id]">{{ p.title }}</a>@if (p.featured) { <span class="adm-badge">★ Home</span> }</td>
              <td>{{ p.client }}</td>
              <td><span class="adm-badge" [class.ok]="p.status === 'ongoing'">{{ p.status }}</span></td>
              <td><span class="adm-badge" [class.warn]="!p.published">{{ p.published ? 'Visible' : 'Hidden' }}</span></td>
            </tr>
          } @empty {
            <tr><td colspan="6" class="adm-empty">{{ loading() ? 'Loading…' : 'No projects yet.' }}</td></tr>
          }
        </tbody>
      </table>
    </div>
    <p class="muted" style="margin-top: 1rem; font-size: .9rem">Use the arrows to set the order projects appear on the website. Projects marked ★ appear on the home page.</p>
  `,
  styles: ['.order { white-space: nowrap; } .order button + button { margin-left: .3rem; } .adm-badge { margin-left: .4rem; }'],
})
export class ProjectsListComponent implements OnInit {
  private content = inject(ContentService);
  readonly projects = signal<Project[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal('');

  async ngOnInit(): Promise<void> {
    try {
      this.projects.set(await this.content.allProjects());
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.loading.set(false);
    }
  }

  async move(index: number, delta: number): Promise<void> {
    const list = [...this.projects()];
    const [item] = list.splice(index, 1);
    list.splice(index + delta, 0, item);
    this.projects.set(list);
    this.busy.set(true);
    try {
      await Promise.all(
        list.map((p, i) =>
          p.sort_order === i + 1 ? null : this.content.saveProject(p.id, { ...strip(p), sort_order: i + 1 }),
        ),
      );
      this.projects.set(list.map((p, i) => ({ ...p, sort_order: i + 1 })));
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.busy.set(false);
    }
  }
}

function strip(p: Project) {
  const { id: _id, created_at: _c, updated_at: _u, ...rest } = p;
  return rest;
}
