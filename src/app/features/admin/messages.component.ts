import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ContentService } from '../../data/content.service';
import type { ContactMessage } from '../../core/models';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="adm-head"><h1>Messages</h1></div>
    @if (error()) { <div class="adm-msg err">{{ error() }}</div> }
    <div class="list">
      @for (m of messages(); track m.id) {
        <article class="adm-panel msg" [class.unread]="!m.is_read">
          <header>
            <div>
              <strong>{{ m.name }}</strong>
              @if (m.organization) { <span class="muted"> · {{ m.organization }}</span> }
              <br /><a [href]="'mailto:' + m.email + '?subject=Re: your enquiry to DevHub'">{{ m.email }}</a>
            </div>
            <time class="muted">{{ m.created_at | date: 'd MMM y, HH:mm' }}</time>
          </header>
          <p>{{ m.message }}</p>
          <footer>
            <a class="btn btn--sm" [href]="'mailto:' + m.email + '?subject=Re: your enquiry to DevHub'" (click)="mark(m, true)">Reply by email</a>
            <button type="button" class="btn btn--sm btn--ghost" (click)="mark(m, !m.is_read)">Mark as {{ m.is_read ? 'unread' : 'read' }}</button>
            @if (pendingDelete() === m.id) {
              <button type="button" class="btn btn--sm btn--danger" (click)="remove(m)">Confirm delete</button>
            } @else {
              <button type="button" class="btn btn--sm btn--ghost" (click)="pendingDelete.set(m.id)">Delete</button>
            }
          </footer>
        </article>
      } @empty {
        <div class="adm-panel adm-empty">{{ loading() ? 'Loading…' : 'No messages yet. Enquiries from the contact page appear here.' }}</div>
      }
    </div>
  `,
  styles: [`
    .list { display: grid; gap: 1rem; }
    .msg.unread { border-left: 4px solid var(--cyan); }
    .msg header { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: .8rem; }
    .msg strong { color: var(--purple); font-family: var(--font-display); }
    .msg header a { color: var(--blue); font-size: .9rem; }
    .msg p { white-space: pre-wrap; color: var(--ink-soft); }
    .msg footer { display: flex; flex-wrap: wrap; gap: .5rem; }
  `],
})
export class MessagesComponent implements OnInit {
  private content = inject(ContentService);
  readonly messages = signal<ContactMessage[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly pendingDelete = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      this.messages.set(await this.content.messages());
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    } finally {
      this.loading.set(false);
    }
  }

  async mark(m: ContactMessage, read: boolean): Promise<void> {
    try {
      await this.content.setMessageRead(m.id, read);
      this.messages.update((list) => list.map((x) => (x.id === m.id ? { ...x, is_read: read } : x)));
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    }
  }

  async remove(m: ContactMessage): Promise<void> {
    try {
      await this.content.deleteMessage(m.id);
      this.messages.update((list) => list.filter((x) => x.id !== m.id));
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : String(e));
    }
  }
}
