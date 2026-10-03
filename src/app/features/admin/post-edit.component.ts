import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ContentService, PostInput } from '../../data/content.service';
import type { PostStatus } from '../../core/models';
import { slugify } from '../../shared/slug';
import { RichEditorComponent } from './rich-editor.component';
import { ImageFieldComponent } from './image-field.component';

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

@Component({
  selector: 'app-post-edit',
  standalone: true,
  imports: [FormsModule, RouterLink, RichEditorComponent, ImageFieldComponent],
  template: `
    <div class="adm-head">
      <h1>{{ id ? 'Edit post' : 'New post' }}</h1>
      <div class="adm-actions">
        <a routerLink="/admin/posts" class="btn btn--sm btn--ghost">← All posts</a>
        @if (id && model.status === 'published') {
          <a [href]="'/insights/' + model.slug" target="_blank" rel="noopener" class="btn btn--sm btn--ghost">View ↗</a>
        }
      </div>
    </div>

    @if (message(); as m) { <div class="adm-msg" [class.ok]="m.ok" [class.err]="!m.ok">{{ m.text }}</div> }

    @if (ready()) {
      <form class="adm-form" (ngSubmit)="save()">
        <div class="adm-stack">
          <div class="adm-panel adm-stack">
            <div class="field">
              <label for="title">Title</label>
              <input id="title" name="title" class="input" required [(ngModel)]="model.title" (ngModelChange)="onTitle($event)" />
            </div>
            <div class="field">
              <label for="excerpt">Summary</label>
              <textarea id="excerpt" name="excerpt" class="input" rows="3" style="min-height: 0" [(ngModel)]="model.excerpt"></textarea>
              <span class="hint">One or two sentences shown on cards and in link previews.</span>
            </div>
            <div class="field">
              <label>Body</label>
              <app-rich-editor [value]="model.body" (valueChange)="model.body = $event" folder="posts" />
            </div>
          </div>
        </div>

        <div class="adm-stack">
          <div class="adm-panel adm-stack">
            <div class="field">
              <label for="status">Status</label>
              <select id="status" name="status" class="input" [(ngModel)]="model.status" (ngModelChange)="onStatus($event)">
                <option value="draft">Draft (hidden)</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div class="field">
              <label for="pub">Publish date</label>
              <input id="pub" name="pub" type="datetime-local" class="input" [(ngModel)]="publishedLocal" />
              <span class="hint">A future date schedules the post.</span>
            </div>
            <button class="btn" type="submit" [disabled]="saving() || !model.title.trim()">{{ saving() ? 'Saving…' : 'Save' }}</button>
          </div>

          <div class="adm-panel adm-stack">
            <div class="field">
              <label>Cover image</label>
              <app-image-field [value]="model.cover_url" (valueChange)="model.cover_url = $event" folder="posts" />
            </div>
            <div class="field">
              <label for="slug">URL slug</label>
              <input id="slug" name="slug" class="input" required [(ngModel)]="model.slug" (ngModelChange)="slugTouched = true" />
              <span class="hint">/insights/{{ model.slug || '…' }}</span>
            </div>
            <div class="field">
              <label for="tags">Tags</label>
              <input id="tags" name="tags" class="input" [(ngModel)]="tags" placeholder="News, Fieldwork" />
              <span class="hint">Separate with commas.</span>
            </div>
          </div>

          @if (id) {
            <div class="adm-panel">
              @if (confirmDelete()) {
                <p>Delete this post permanently?</p>
                <div class="adm-actions" style="display: flex; gap: .5rem">
                  <button type="button" class="btn btn--sm btn--danger" (click)="remove()">Yes, delete</button>
                  <button type="button" class="btn btn--sm btn--ghost" (click)="confirmDelete.set(false)">Cancel</button>
                </div>
              } @else {
                <button type="button" class="btn btn--sm btn--ghost" (click)="confirmDelete.set(true)">Delete post</button>
              }
            </div>
          }
        </div>
      </form>
    }
  `,
})
export class PostEditComponent implements OnInit {
  @Input() id?: string;

  private content = inject(ContentService);
  private router = inject(Router);

  model: PostInput = { slug: '', title: '', excerpt: '', body: '', cover_url: null, tags: [], status: 'draft', published_at: null };
  tags = '';
  publishedLocal = '';
  slugTouched = false;

  readonly ready = signal(false);
  readonly saving = signal(false);
  readonly confirmDelete = signal(false);
  readonly message = signal<{ ok: boolean; text: string } | null>(null);

  async ngOnInit(): Promise<void> {
    if (this.id) {
      try {
        const p = await this.content.postById(this.id);
        this.model = { slug: p.slug, title: p.title, excerpt: p.excerpt, body: p.body, cover_url: p.cover_url, tags: p.tags, status: p.status, published_at: p.published_at };
        this.tags = p.tags.join(', ');
        this.publishedLocal = toLocalInput(p.published_at);
        this.slugTouched = true;
      } catch (e) {
        this.message.set({ ok: false, text: e instanceof Error ? e.message : String(e) });
        return;
      }
    }
    this.ready.set(true);
  }

  onTitle(title: string): void {
    if (!this.slugTouched) this.model.slug = slugify(title);
  }

  onStatus(status: PostStatus): void {
    if (status === 'published' && !this.publishedLocal) this.publishedLocal = toLocalInput(new Date().toISOString());
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.message.set(null);
    try {
      const input: PostInput = {
        ...this.model,
        title: this.model.title.trim(),
        slug: slugify(this.model.slug || this.model.title),
        tags: this.tags.split(',').map((t) => t.trim()).filter(Boolean),
        published_at: this.publishedLocal ? new Date(this.publishedLocal).toISOString() : null,
      };
      if (input.status === 'published' && !input.published_at) input.published_at = new Date().toISOString();
      const saved = await this.content.savePost(this.id ?? null, input);
      this.model.slug = saved.slug;
      this.message.set({ ok: true, text: input.status === 'published' ? 'Saved and published.' : 'Draft saved.' });
      if (!this.id) this.router.navigate(['/admin/posts', saved.id], { replaceUrl: true });
    } catch (e) {
      const text = e instanceof Error ? e.message : String(e);
      this.message.set({ ok: false, text: text.includes('duplicate') ? 'Another post already uses this URL slug.' : text });
    } finally {
      this.saving.set(false);
    }
  }

  async remove(): Promise<void> {
    try {
      await this.content.deletePost(this.id!);
      await this.content.removeUpload(this.model.cover_url);
      this.router.navigateByUrl('/admin/posts');
    } catch (e) {
      this.message.set({ ok: false, text: e instanceof Error ? e.message : String(e) });
    }
  }
}
