import {
  AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, Output, ViewChild, inject, signal,
} from '@angular/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { ContentService } from '../../data/content.service';

interface Tool {
  label: string;
  title: string;
  run: (e: Editor) => void;
  active?: (e: Editor) => boolean;
}

const TOOLS: Tool[] = [
  { label: 'H2', title: 'Heading', run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(), active: (e) => e.isActive('heading', { level: 2 }) },
  { label: 'H3', title: 'Subheading', run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(), active: (e) => e.isActive('heading', { level: 3 }) },
  { label: 'B', title: 'Bold', run: (e) => e.chain().focus().toggleBold().run(), active: (e) => e.isActive('bold') },
  { label: 'I', title: 'Italic', run: (e) => e.chain().focus().toggleItalic().run(), active: (e) => e.isActive('italic') },
  { label: '•', title: 'Bullet list', run: (e) => e.chain().focus().toggleBulletList().run(), active: (e) => e.isActive('bulletList') },
  { label: '1.', title: 'Numbered list', run: (e) => e.chain().focus().toggleOrderedList().run(), active: (e) => e.isActive('orderedList') },
  { label: '❝', title: 'Quote', run: (e) => e.chain().focus().toggleBlockquote().run(), active: (e) => e.isActive('blockquote') },
  { label: '—', title: 'Divider', run: (e) => e.chain().focus().setHorizontalRule().run() },
  { label: '↶', title: 'Undo', run: (e) => e.chain().focus().undo().run() },
  { label: '↷', title: 'Redo', run: (e) => e.chain().focus().redo().run() },
];

/** WYSIWYG editor producing HTML; images upload straight to Supabase storage. */
@Component({
  selector: 'app-rich-editor',
  standalone: true,
  template: `
    <div class="ed">
      <div class="bar" role="toolbar" aria-label="Formatting">
        @for (t of tools; track t.label) {
          <button type="button" [title]="t.title" [attr.aria-label]="t.title" [class.on]="isOn(t)" (click)="t.run(editor!)">{{ t.label }}</button>
        }
        <button type="button" title="Link" aria-label="Link" [class.on]="linkOn()" (click)="toggleLink()">🔗</button>
        <label class="img-btn" title="Insert image">
          {{ uploading() ? '…' : '🖼' }}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" (change)="insertImage($event)" [disabled]="uploading()" />
        </label>
      </div>
      @if (linkEditing()) {
        <div class="link-row">
          <input #linkInput class="input" type="url" placeholder="https://…" [value]="linkUrl()" (keydown.enter)="applyLink(linkInput.value); $event.preventDefault()" />
          <button type="button" class="btn btn--sm" (click)="applyLink(linkInput.value)">Apply</button>
          <button type="button" class="btn btn--sm btn--ghost" (click)="applyLink('')">Remove</button>
        </div>
      }
      <div #host class="surface prose"></div>
    </div>
    @if (error()) { <p class="form-error">{{ error() }}</p> }
  `,
  styles: [`
    .ed { border: 1.5px solid var(--line); border-radius: var(--radius-sm); background: #fff; overflow: hidden; }
    .ed:focus-within { border-color: var(--purple-500); box-shadow: 0 0 0 4px rgb(106 63 176 / .12); }
    .bar { display: flex; flex-wrap: wrap; gap: .25rem; padding: .5rem; border-bottom: 1px solid var(--line); background: var(--lavender-50); position: sticky; top: 0; z-index: 1; }
    .bar button, .img-btn { min-width: 36px; height: 34px; padding: 0 .55rem; border: 0; border-radius: 8px; background: transparent; cursor: pointer; font: 700 .85rem/34px var(--font-display); color: var(--ink); text-align: center; }
    .bar button:hover, .img-btn:hover { background: #fff; }
    .bar button.on { background: var(--purple); color: #fff; }
    .img-btn { position: relative; display: inline-block; }
    .img-btn input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
    .link-row { display: flex; gap: .5rem; padding: .5rem; border-bottom: 1px solid var(--line); }
    .surface { min-height: 340px; padding: 1.2rem 1.4rem; font-size: 1rem; }
    :host ::ng-deep .ProseMirror { outline: none; min-height: 300px; }
    :host ::ng-deep .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: var(--muted); float: left; height: 0; pointer-events: none; }
    :host ::ng-deep .ProseMirror img.ProseMirror-selectednode { outline: 3px solid var(--cyan); }
  `],
})
export class RichEditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true }) host!: ElementRef<HTMLElement>;
  @Input() value = '';
  @Input() folder: 'posts' | 'projects' = 'posts';
  @Output() valueChange = new EventEmitter<string>();

  private zone = inject(NgZone);
  private content = inject(ContentService);

  readonly tools = TOOLS;
  editor?: Editor;
  private tick = signal(0);
  readonly uploading = signal(false);
  readonly error = signal('');
  readonly linkEditing = signal(false);
  readonly linkUrl = signal('');

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.editor = new Editor({
        element: this.host.nativeElement,
        extensions: [
          StarterKit.configure({ heading: { levels: [2, 3] }, code: false, codeBlock: false }),
          Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener', target: '_blank' } }),
          Image,
        ],
        content: this.value || '',
        onUpdate: ({ editor }) => this.zone.run(() => this.valueChange.emit(editor.isEmpty ? '' : editor.getHTML())),
        onTransaction: () => this.zone.run(() => this.tick.update((n) => n + 1)),
      });
    });
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  isOn(t: Tool): boolean {
    this.tick();
    return !!(this.editor && t.active?.(this.editor));
  }

  linkOn(): boolean {
    this.tick();
    return !!this.editor?.isActive('link');
  }

  toggleLink(): void {
    this.linkUrl.set(this.editor?.getAttributes('link')['href'] ?? '');
    this.linkEditing.set(!this.linkEditing());
  }

  applyLink(url: string): void {
    const chain = this.editor!.chain().focus().extendMarkRange('link');
    const clean = url.trim();
    if (!clean) chain.unsetLink().run();
    else chain.setLink({ href: /^(https?:|mailto:|tel:|\/)/i.test(clean) ? clean : `https://${clean}` }).run();
    this.linkEditing.set(false);
  }

  async insertImage(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.uploading.set(true);
    this.error.set('');
    try {
      const url = await this.content.uploadImage(file, this.folder);
      const alt = prompt('Describe this image for screen readers (optional):') ?? '';
      this.editor!.chain().focus().setImage({ src: url, alt }).run();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      this.uploading.set(false);
    }
  }
}
