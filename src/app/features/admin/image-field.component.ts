import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { ContentService } from '../../data/content.service';

/** Cover-image picker: drop or choose a file, it uploads and emits the URL. */
@Component({
  selector: 'app-image-field',
  standalone: true,
  template: `
    <div class="drop" [class.over]="over()" (dragover)="$event.preventDefault(); over.set(true)" (dragleave)="over.set(false)" (drop)="onDrop($event)">
      @if (value) {
        <img [src]="value" alt="Cover preview" />
      } @else {
        <span class="ph">{{ uploading() ? 'Uploading…' : 'Drop an image here or click to choose' }}</span>
      }
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" (change)="onPick($event)" [disabled]="uploading()" aria-label="Choose image" />
      @if (uploading()) { <div class="busy">Uploading…</div> }
    </div>
    @if (value) {
      <button type="button" class="clear" (click)="valueChange.emit(null)">Remove image</button>
    }
    @if (error()) { <p class="form-error">{{ error() }}</p> }
  `,
  styles: [`
    .drop { position: relative; aspect-ratio: 16 / 10; border: 2px dashed var(--lavender); border-radius: var(--radius-sm); overflow: hidden; display: grid; place-items: center; background: var(--lavender-50); transition: border-color .2s, background .2s; }
    .drop.over { border-color: var(--purple-500); background: #fff; }
    .drop img { width: 100%; height: 100%; object-fit: cover; }
    .ph { color: var(--muted); font-size: .88rem; text-align: center; padding: 1rem; }
    input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
    .busy { position: absolute; inset: 0; display: grid; place-items: center; background: rgb(255 255 255 / .8); font-weight: 700; color: var(--purple); }
    .clear { margin-top: .5rem; background: none; border: 0; padding: 0; color: var(--danger); font-size: .85rem; font-weight: 600; cursor: pointer; }
  `],
})
export class ImageFieldComponent {
  @Input() value: string | null = null;
  @Input() folder: 'posts' | 'projects' | 'gallery' = 'posts';
  @Output() valueChange = new EventEmitter<string | null>();

  private content = inject(ContentService);
  readonly uploading = signal(false);
  readonly over = signal(false);
  readonly error = signal('');

  onPick(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) this.upload(file);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.over.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file?.type.startsWith('image/')) this.upload(file);
  }

  private async upload(file: File): Promise<void> {
    this.uploading.set(true);
    this.error.set('');
    try {
      this.valueChange.emit(await this.content.uploadImage(file, this.folder));
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      this.uploading.set(false);
    }
  }
}
