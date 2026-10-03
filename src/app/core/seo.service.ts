import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const SITE = 'DevHub Research Limited';
const DEFAULT_DESCRIPTION =
  'DevHub Research Limited is a Lagos-based research and data consulting firm specialising in end-to-end field research management, data collection and analysis.';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);

  set(pageTitle: string, description = DEFAULT_DESCRIPTION, image?: string | null): void {
    const full = pageTitle ? `${pageTitle} · ${SITE}` : `${SITE} · Research is our forte`;
    this.title.setTitle(full);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: full });
    this.meta.updateTag({ property: 'og:description', content: description });
    if (image) this.meta.updateTag({ property: 'og:image', content: image });
  }
}
