import { Component, OnInit, inject, signal } from '@angular/core';
import { ContentService } from '../../data/content.service';
import type { GalleryItem } from '../../core/models';

@Component({
  selector: 'app-gallery-admin',
  standalone: true,
  template: `
    <div class="adm-head">
      <h1>Gallery</h1>
      <div class="adm-actions">
        <label class="btn btn--sm upload">
          {{ progress() || '+ Upload photos' }}
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" (change)="upload($event)" [disabled]="!!progress()" />
        </label>
      </div>
    </div>
    @if (error()) { <div class="adm-msg err">{{ error() }}</div> }
    @if (saved()) { <div class="adm-msg ok">{{ saved() }}</div> }

    <div class="grid">
      @for (item of items(); track item.id; let i = $index; let first = $first; let last = $last) {
        <div class="item adm-panel">
          <img [src]="item.image_url" [alt]="item.caption" />
          <input class="input" [value]="item.caption" placeholder="Caption" aria-label="Caption" (change)="caption(item, $any($event.target).value)" />
          <div class="tools">
            <button type="button" class="adm-icon-btn" [disabled]="first || busy()" (click)="move(i, -1)" aria-label="Move earlier">←</button>
            <button type="button" class="adm-icon-btn" [disabled]="last || busy()" (click)="move(i, 1)" aria-label="Move later">→</button>
            @if (pendingDelete() === item.id) {
              <button type="button" class="btn btn--sm btn--danger" (click)="remove(item)">Confirm delete</button>
              <button type="button" class="adm-icon-btn" (click)="pendingDelete.set(null)" aria-label="Cancel">✕</button>
            } @else {
              <button type="button" class="adm-icon-btn del" (click)="pendingDelete.set(item.id)" aria-label="Delete photo">🗑</button>
            }
          </div>
        </div>
      } @empty {
        <div class="adm-panel adm-empty">{{ loading() ? 'Loading…' : 'No photos yet. Upload some above.' }}</div>
      }
    </div>
  `,
  styles: [`
    .upload { position: relative; overflow: hidden; }
    .upload input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; }
    .item { display: grid; gap: .7rem; padding: .8rem !important; }
    .item img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 10px; }
    .item .input { padding: .55rem .75rem; font-size: .9rem; }
    .tools { display: flex; align-items: center; gap: .4rem; }
    .del { margin-left: auto; }
  `],
})
export class GalleryAdminComponent implements OnInit {
  private content = inject(ContentService);

  readonly items = signal<GalleryItem[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly progress = signal('');
  readonly error = signal('');
  readonly saved = signal('');
  readonly pendingDelete = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      this.items.set(await this.content.allGallery());
    } catch (e) {
      this.fail(e);
    } finally {
      this.loading.set(false);
    }
  }

  async upload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    this.error.set('');
    let order = this.items().reduce((m, it) => Math.max(m, it.sort_order), 0);
    for (const [i, file] of files.entries()) {
      this.progress.set(`Uploading ${i + 1} of ${files.length}…`);
      try {
        const url = await this.content.uploadImage(file, 'gallery');
        const caption = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ');
        const item = await this.content.addGalleryItem(url, caption, ++order);
        this.items.update((list) => [...list, item]);
      } catch (e) {
        this.fail(e, file.name);
      }
    }
    this.progress.set('');
    if (files.length && !this.error()) this.flash(`${files.length} photo${files.length > 1 ? 's' : ''} added. Edit the captions below.`);
  }

  async caption(item: GalleryItem, value: string): Promise<void> {
    try {
      await this.content.updateGalleryItem(item.id, { caption: value.trim() });
      this.items.update((list) => list.map((it) => (it.id === item.id ? { ...it, caption: value.trim() } : it)));
      this.flash('Caption saved.');
    } catch (e) {
      this.fail(e);
    }
  }

  async move(index: number, delta: number): Promise<void> {
    const list = [...this.items()];
    const [it] = list.splice(index, 1);
    list.splice(index + delta, 0, it);
    this.items.set(list);
    this.busy.set(true);
    try {
      await Promise.all(list.map((g, i) => (g.sort_order === i + 1 ? null : this.content.updateGalleryItem(g.id, { sort_order: i + 1 }))));
      this.items.set(list.map((g, i) => ({ ...g, sort_order: i + 1 })));
    } catch (e) {
      this.fail(e);
    } finally {
      this.busy.set(false);
    }
  }

  async remove(item: GalleryItem): Promise<void> {
    try {
      await this.content.deleteGalleryItem(item);
      this.items.update((list) => list.filter((it) => it.id !== item.id));
      this.pendingDelete.set(null);
    } catch (e) {
      this.fail(e);
    }
  }

  private fail(e: unknown, context?: string): void {
    const msg = e instanceof Error ? e.message : String(e);
    this.error.set(context ? `${context}: ${msg}` : msg);
  }

  private flash(text: string): void {
    this.saved.set(text);
    setTimeout(() => this.saved.set(''), 3000);
  }
}
