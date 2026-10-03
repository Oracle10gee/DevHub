import { Component, Input, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

/** Renders admin-authored HTML after stripping anything unsafe. */
@Component({
  selector: 'app-rich-text',
  standalone: true,
  template: `<div class="prose" [innerHTML]="safe"></div>`,
})
export class RichTextComponent {
  private sanitizer = inject(DomSanitizer);
  safe: SafeHtml = '';

  @Input() set html(value: string | null | undefined) {
    const clean = DOMPurify.sanitize(value ?? '', { ADD_ATTR: ['target', 'rel'] });
    this.safe = this.sanitizer.bypassSecurityTrustHtml(clean);
  }
}
