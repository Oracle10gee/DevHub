import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ContentService } from '../../data/content.service';
import { DEFAULT_SETTINGS } from '../../data/site-content';
import { SeoService } from '../../core/seo.service';
import { RevealDirective } from '../../shared/reveal.directive';
import { LogoMarkComponent } from '../../shared/logo-mark.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, RevealDirective, LogoMarkComponent],
  template: `
    <section class="page-hero">
      <app-logo-mark class="mark" [spin]="true" />
      <div class="container">
        <p class="eyebrow" reveal>Contact us</p>
        <h1 reveal [revealDelay]="80">Let's take your question <span class="text-gradient">to the field.</span></h1>
        <p class="lead" reveal [revealDelay]="160">Tell us about your study: the population, the timeline and what you need. We'll get back to you promptly.</p>
      </div>
    </section>

    <section class="section">
      <div class="container layout">
        <form (ngSubmit)="submit()" #f="ngForm" class="form card" reveal>
          @if (sent()) {
            <div class="done">
              <span class="done-icon">✓</span>
              <h2>Message sent</h2>
              <p class="muted">Thank you. We'll be in touch at {{ model.email }}.</p>
              <button type="button" class="btn btn--ghost" (click)="reset()">Send another message</button>
            </div>
          } @else {
            <div class="row">
              <div class="field">
                <label for="name">Your name</label>
                <input id="name" name="name" class="input" required maxlength="200" [(ngModel)]="model.name" autocomplete="name" />
              </div>
              <div class="field">
                <label for="email">Email</label>
                <input id="email" name="email" type="email" class="input" required email maxlength="320" [(ngModel)]="model.email" autocomplete="email" />
              </div>
            </div>
            <div class="field">
              <label for="org">Organisation <span class="hint">(optional)</span></label>
              <input id="org" name="organization" class="input" maxlength="200" [(ngModel)]="model.organization" autocomplete="organization" />
            </div>
            <div class="field">
              <label for="msg">About your study</label>
              <textarea id="msg" name="message" class="input" required maxlength="5000" rows="6" [(ngModel)]="model.message"></textarea>
            </div>
            <!-- Bots fill every field; people never see this one. -->
            <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" [(ngModel)]="honeypot" aria-hidden="true" />
            @if (error()) { <p class="form-error">{{ error() }}</p> }
            <button class="btn" type="submit" [disabled]="f.invalid || sending()">
              {{ sending() ? 'Sending…' : 'Send message' }} <span class="arrow">→</span>
            </button>
          }
        </form>

        <aside reveal [revealDelay]="120">
          <div class="info">
            <h3>Visit</h3>
            <address>{{ contact().address }}</address>
          </div>
          <div class="info">
            <h3>Email</h3>
            <a [href]="'mailto:' + contact().email">{{ contact().email }}</a>
          </div>
          <div class="info">
            <h3>Call</h3>
            <a [href]="telHref()">{{ contact().phone }}</a>
          </div>
          <iframe [src]="mapUrl()" title="Map showing the DevHub office" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </aside>
      </div>
    </section>
  `,
  styles: [`
    .layout { display: grid; grid-template-columns: 1.3fr 1fr; gap: clamp(2rem, 5vw, 4rem); align-items: start; }
    .form { padding: clamp(1.5rem, 4vw, 2.8rem); display: grid; gap: 1.3rem; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.3rem; }
    .form .btn { justify-self: start; }
    .hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
    .done { text-align: center; padding: 2rem 0; display: grid; justify-items: center; gap: .5rem; }
    .done-icon { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: var(--purple); color: #fff; font-size: 1.6rem; margin-bottom: .8rem; }
    aside { display: grid; gap: 1.6rem; }
    .info h3 { font-size: .78rem; letter-spacing: .16em; text-transform: uppercase; color: var(--blue); margin-bottom: .5rem; }
    .info address, .info a { font: 700 1.15rem/1.45 var(--font-display); font-style: normal; color: var(--purple); text-decoration: none; word-break: break-word; }
    .info a:hover { text-decoration: underline; text-underline-offset: 4px; }
    iframe { width: 100%; aspect-ratio: 4 / 3; border: 0; border-radius: var(--radius); box-shadow: var(--shadow-sm); filter: saturate(.85); }
    @media (max-width: 860px) {
      .layout, .row { grid-template-columns: 1fr; }
    }
  `],
})
export class ContactComponent implements OnInit {
  private content = inject(ContentService);
  private sanitizer = inject(DomSanitizer);

  readonly contact = signal(DEFAULT_SETTINGS.contact);
  readonly telHref = computed(() => 'tel:' + this.contact().phone.replace(/[^\d+]/g, ''));
  readonly mapUrl = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://maps.google.com/maps?q=${encodeURIComponent(this.contact().address)}&z=15&output=embed`,
    ),
  );

  model = { name: '', email: '', organization: '', message: '' };
  honeypot = '';
  readonly sending = signal(false);
  readonly sent = signal(false);
  readonly error = signal('');

  constructor() {
    inject(SeoService).set('Contact', 'Get in touch with DevHub Research Limited in Ikoyi, Lagos.');
  }

  async ngOnInit(): Promise<void> {
    this.contact.set((await this.content.settings()).contact);
  }

  async submit(): Promise<void> {
    if (this.honeypot) {
      this.sent.set(true);
      return;
    }
    this.sending.set(true);
    this.error.set('');
    try {
      await this.content.sendMessage({
        name: this.model.name.trim(),
        email: this.model.email.trim(),
        organization: this.model.organization.trim(),
        message: this.model.message.trim(),
      });
      this.sent.set(true);
    } catch {
      this.error.set(`Sorry, your message could not be sent. Please email us at ${this.contact().email}.`);
    } finally {
      this.sending.set(false);
    }
  }

  reset(): void {
    this.model = { name: '', email: '', organization: '', message: '' };
    this.sent.set(false);
  }
}
