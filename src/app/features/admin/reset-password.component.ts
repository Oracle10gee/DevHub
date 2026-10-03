import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { FacetsComponent } from '../../shared/facets.component';

/** Landing page for the emailed reset link; Supabase signs the user in from the URL. */
@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, FacetsComponent],
  template: `
    <div class="wrap">
      <app-facets [seed]="21" />
      <form class="box" (ngSubmit)="save()">
        <img src="/assets/brand/logo.svg" alt="DevHub Research Limited" class="logo" />
        <h1>Choose a new password</h1>
        @if (error()) { <p class="err">{{ error() }}</p> }
        <div class="field">
          <label for="pw">New password</label>
          <input id="pw" name="pw" type="password" class="input" required minlength="8" [(ngModel)]="password" autocomplete="new-password" />
          <span class="hint">At least 8 characters.</span>
        </div>
        <button class="btn" type="submit" [disabled]="busy() || password.length < 8">{{ busy() ? 'Saving…' : 'Save password' }}</button>
      </form>
    </div>
  `,
  styles: [`
    .wrap { position: relative; min-height: 100vh; display: grid; place-items: center; padding: 1.5rem; overflow: hidden; }
    .box { position: relative; width: min(420px, 100%); display: grid; gap: 1.1rem; padding: 2.4rem 2rem; border-radius: var(--radius-lg); background: rgb(255 255 255 / .92); box-shadow: var(--shadow); }
    .logo { height: 44px; width: auto; }
    h1 { font-size: 1.5rem; color: var(--purple); margin: 0; }
    .err { margin: 0; padding: .75rem 1rem; border-radius: 10px; background: #fee4e2; color: #b42318; font-weight: 600; font-size: .9rem; }
  `],
})
export class ResetPasswordComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  password = '';
  readonly busy = signal(false);
  readonly error = signal('');

  async save(): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try {
      await this.auth.updatePassword(this.password);
      await this.auth.signOut();
      this.router.navigateByUrl('/admin/login');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'The reset link may have expired. Request a new one.');
    } finally {
      this.busy.set(false);
    }
  }
}
