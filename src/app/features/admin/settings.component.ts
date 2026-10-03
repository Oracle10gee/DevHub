import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../data/content.service';
import type { SiteSettings } from '../../core/models';
import { DEFAULT_SETTINGS } from '../../data/site-content';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="adm-head"><h1>Site settings</h1></div>
    @if (message(); as m) { <div class="adm-msg" [class.ok]="m.ok" [class.err]="!m.ok">{{ m.text }}</div> }

    @if (s) {
      <form (ngSubmit)="save()">
        <section class="adm-panel adm-form-block">
          <h2>Home page headline</h2>
          <div class="field"><label for="eyebrow">Small label above the headline</label><input id="eyebrow" name="eyebrow" class="input" [(ngModel)]="s.hero.eyebrow" /></div>
          <div class="field"><label for="htitle">Headline</label><input id="htitle" name="htitle" class="input" [(ngModel)]="s.hero.title" /><span class="hint">The last word is highlighted.</span></div>
          <div class="field"><label for="sub">Supporting text</label><textarea id="sub" name="sub" class="input" rows="3" style="min-height: 0" [(ngModel)]="s.hero.subtitle"></textarea></div>
        </section>

        <section class="adm-panel adm-form-block">
          <h2>Home page numbers</h2>
          @for (stat of s.stats; track stat; let i = $index) {
            <div class="stat-row">
              <div class="field"><label [for]="'v' + i">Number</label><input [id]="'v' + i" [name]="'v' + i" type="number" min="0" class="input" [(ngModel)]="stat.value" /></div>
              <div class="field"><label [for]="'x' + i">Suffix</label><input [id]="'x' + i" [name]="'x' + i" class="input" maxlength="3" [(ngModel)]="stat.suffix" placeholder="+" /></div>
              <div class="field"><label [for]="'l' + i">Label</label><input [id]="'l' + i" [name]="'l' + i" class="input" [(ngModel)]="stat.label" /></div>
              <button type="button" class="adm-icon-btn" (click)="s.stats.splice(i, 1)" aria-label="Remove">✕</button>
            </div>
          }
          @if (s.stats.length < 6) {
            <button type="button" class="btn btn--sm btn--ghost" (click)="s.stats.push({ value: 0, suffix: '', label: '' })">+ Add number</button>
          }
        </section>

        <section class="adm-panel adm-form-block">
          <h2>Contact details</h2>
          <div class="field"><label for="addr">Address</label><input id="addr" name="addr" class="input" [(ngModel)]="s.contact.address" /></div>
          <div class="adm-grid-2">
            <div class="field"><label for="em">Email</label><input id="em" name="em" type="email" class="input" [(ngModel)]="s.contact.email" /></div>
            <div class="field"><label for="ph">Phone</label><input id="ph" name="ph" class="input" [(ngModel)]="s.contact.phone" /></div>
          </div>
        </section>

        <button class="btn save" type="submit" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Save settings' }}</button>
      </form>
    }
  `,
  styles: [`
    .adm-form-block { display: grid; gap: 1.1rem; }
    .stat-row { display: grid; grid-template-columns: 110px 90px 1fr auto; gap: .8rem; align-items: end; }
    .save { margin-top: 1.2rem; }
    @media (max-width: 700px) { .stat-row { grid-template-columns: 1fr 1fr; } }
  `],
})
export class SettingsComponent implements OnInit {
  private content = inject(ContentService);

  s: SiteSettings | null = null;
  readonly saving = signal(false);
  readonly message = signal<{ ok: boolean; text: string } | null>(null);

  async ngOnInit(): Promise<void> {
    const current = await this.content.settings();
    this.s = structuredClone(current ?? DEFAULT_SETTINGS);
  }

  async save(): Promise<void> {
    if (!this.s) return;
    this.saving.set(true);
    this.message.set(null);
    try {
      const stats = this.s.stats
        .filter((st) => st.label.trim())
        .map((st) => ({ value: Number(st.value) || 0, suffix: st.suffix.trim(), label: st.label.trim() }));
      await this.content.saveSetting('hero', this.s.hero);
      await this.content.saveSetting('stats', stats);
      await this.content.saveSetting('contact', this.s.contact);
      this.message.set({ ok: true, text: 'Settings saved. They are live on the website now.' });
    } catch (e) {
      this.message.set({ ok: false, text: e instanceof Error ? e.message : String(e) });
    } finally {
      this.saving.set(false);
    }
  }
}
