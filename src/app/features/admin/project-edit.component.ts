import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ContentService, ProjectInput } from '../../data/content.service';
import { slugify } from '../../shared/slug';
import { RichEditorComponent } from './rich-editor.component';
import { ImageFieldComponent } from './image-field.component';

@Component({
  selector: 'app-project-edit',
  standalone: true,
  imports: [FormsModule, RouterLink, RichEditorComponent, ImageFieldComponent],
  template: `
    <div class="adm-head">
      <h1>{{ id ? 'Edit project' : 'New project' }}</h1>
      <div class="adm-actions">
        <a routerLink="/admin/projects" class="btn btn--sm btn--ghost">← All projects</a>
        @if (id && model.published) {
          <a [href]="'/projects/' + model.slug" target="_blank" rel="noopener" class="btn btn--sm btn--ghost">View ↗</a>
        }
      </div>
    </div>

    @if (message(); as m) { <div class="adm-msg" [class.ok]="m.ok" [class.err]="!m.ok">{{ m.text }}</div> }

    @if (ready()) {
      <form class="adm-form" (ngSubmit)="save()">
        <div class="adm-stack">
          <div class="adm-panel adm-stack">
            <div class="field">
              <label for="title">Project title</label>
              <input id="title" name="title" class="input" required [(ngModel)]="model.title" (ngModelChange)="onTitle($event)" />
            </div>
            <div class="adm-grid-2">
              <div class="field">
                <label for="client">Client / PI</label>
                <input id="client" name="client" class="input" [(ngModel)]="model.client" />
              </div>
              <div class="field">
                <label for="period">Timeline label</label>
                <input id="period" name="period" class="input" [(ngModel)]="model.period_label" placeholder="Summer 2026 – ongoing" />
              </div>
            </div>
            <div class="field">
              <label for="detail">Client title &amp; institution</label>
              <input id="detail" name="detail" class="input" [(ngModel)]="model.client_detail" placeholder="Assistant Professor of Economics, Dartmouth College" />
            </div>
            <div class="field">
              <label for="summary">Summary</label>
              <textarea id="summary" name="summary" class="input" rows="3" style="min-height: 0" [(ngModel)]="model.summary"></textarea>
            </div>
            <div class="field">
              <label for="phases">Phases</label>
              <textarea id="phases" name="phases" class="input" rows="4" style="min-height: 0" [(ngModel)]="phases" placeholder="Pilot – baseline (Fall 2024)"></textarea>
              <span class="hint">One phase per line (optional).</span>
            </div>
            <div class="field">
              <label>Full write-up</label>
              <app-rich-editor [value]="model.body" (valueChange)="model.body = $event" folder="projects" />
            </div>
          </div>
        </div>

        <div class="adm-stack">
          <div class="adm-panel adm-stack">
            <div class="field">
              <label for="status">Status</label>
              <select id="status" name="status" class="input" [(ngModel)]="model.status">
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <label class="adm-check"><input type="checkbox" name="published" [(ngModel)]="model.published" /> Visible on website</label>
            <label class="adm-check"><input type="checkbox" name="featured" [(ngModel)]="model.featured" /> Feature on home page</label>
            <button class="btn" type="submit" [disabled]="saving() || !model.title.trim()">{{ saving() ? 'Saving…' : 'Save' }}</button>
          </div>

          <div class="adm-panel adm-stack">
            <div class="field">
              <label>Cover image</label>
              <app-image-field [value]="model.cover_url" (valueChange)="model.cover_url = $event" folder="projects" />
            </div>
            <div class="field">
              <label for="slug">URL slug</label>
              <input id="slug" name="slug" class="input" required [(ngModel)]="model.slug" (ngModelChange)="slugTouched = true" />
              <span class="hint">/projects/{{ model.slug || '…' }}</span>
            </div>
          </div>

          @if (id) {
            <div class="adm-panel">
              @if (confirmDelete()) {
                <p>Delete this project permanently?</p>
                <div style="display: flex; gap: .5rem">
                  <button type="button" class="btn btn--sm btn--danger" (click)="remove()">Yes, delete</button>
                  <button type="button" class="btn btn--sm btn--ghost" (click)="confirmDelete.set(false)">Cancel</button>
                </div>
              } @else {
                <button type="button" class="btn btn--sm btn--ghost" (click)="confirmDelete.set(true)">Delete project</button>
              }
            </div>
          }
        </div>
      </form>
    }
  `,
})
export class ProjectEditComponent implements OnInit {
  @Input() id?: string;

  private content = inject(ContentService);
  private router = inject(Router);

  model: ProjectInput = {
    slug: '', title: '', client: '', client_detail: '', period_label: '', status: 'ongoing', phases: [],
    summary: '', body: '', cover_url: null, featured: false, published: true, sort_order: 0,
  };
  phases = '';
  slugTouched = false;

  readonly ready = signal(false);
  readonly saving = signal(false);
  readonly confirmDelete = signal(false);
  readonly message = signal<{ ok: boolean; text: string } | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      if (this.id) {
        const { id: _id, created_at: _c, updated_at: _u, ...rest } = await this.content.projectById(this.id);
        this.model = rest;
        this.phases = rest.phases.join('\n');
        this.slugTouched = true;
      } else {
        // New projects go to the top of the list.
        const all = await this.content.allProjects();
        this.model.sort_order = all.length ? Math.min(...all.map((p) => p.sort_order)) - 1 : 1;
      }
      this.ready.set(true);
    } catch (e) {
      this.message.set({ ok: false, text: e instanceof Error ? e.message : String(e) });
    }
  }

  onTitle(title: string): void {
    if (!this.slugTouched) this.model.slug = slugify(title);
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.message.set(null);
    try {
      const input: ProjectInput = {
        ...this.model,
        title: this.model.title.trim(),
        slug: slugify(this.model.slug || this.model.title),
        phases: this.phases.split('\n').map((l) => l.trim()).filter(Boolean),
      };
      const saved = await this.content.saveProject(this.id ?? null, input);
      this.model.slug = saved.slug;
      this.message.set({ ok: true, text: 'Project saved.' });
      if (!this.id) this.router.navigate(['/admin/projects', saved.id], { replaceUrl: true });
    } catch (e) {
      const text = e instanceof Error ? e.message : String(e);
      this.message.set({ ok: false, text: text.includes('duplicate') ? 'Another project already uses this URL slug.' : text });
    } finally {
      this.saving.set(false);
    }
  }

  async remove(): Promise<void> {
    try {
      await this.content.deleteProject(this.id!);
      await this.content.removeUpload(this.model.cover_url);
      this.router.navigateByUrl('/admin/projects');
    } catch (e) {
      this.message.set({ ok: false, text: e instanceof Error ? e.message : String(e) });
    }
  }
}
