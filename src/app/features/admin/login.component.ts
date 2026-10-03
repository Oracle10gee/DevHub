import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { FacetsComponent } from '../../shared/facets.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, FacetsComponent],
  template: `
    <div class="wrap">
      <app-facets [seed]="21" />
      <form class="box" (ngSubmit)="forgot() ? sendReset() : signIn()">
        <img src="/assets/brand/logo.svg" alt="DevHub Research Limited" class="logo" />
        <h1>{{ forgot() ? 'Reset password' : 'Admin sign in' }}</h1>

        @if (error()) { <p class="adm-err">{{ error() }}</p> }
        @if (notice()) { <p class="adm-ok">{{ notice() }}</p> }

        <div class="field">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" class="input" required [(ngModel)]="email" autocomplete="username" />
        </div>
        @if (!forgot()) {
          <div class="field">
            <label for="password">Password</label>
            <input id="password" name="password" type="password" class="input" required [(ngModel)]="password" autocomplete="current-password" />
          </div>
        }
        <button class="btn" type="submit" [disabled]="busy()">
          {{ busy() ? 'Please wait…' : forgot() ? 'Send reset link' : 'Sign in' }}
        </button>
        <button type="button" class="linkish" (click)="toggleForgot()">
          {{ forgot() ? '← Back to sign in' : 'Forgot your password?' }}
        </button>
        <a routerLink="/" class="linkish">← Back to website</a>
      </form>
    </div>
  `,
  styles: [`
    .wrap { position: relative; min-height: 100vh; display: grid; place-items: center; padding: 1.5rem; overflow: hidden; }
    .box { position: relative; width: min(420px, 100%); display: grid; gap: 1.1rem; padding: 2.4rem 2rem; border-radius: var(--radius-lg); background: rgb(255 255 255 / .92); backdrop-filter: blur(16px); box-shadow: var(--shadow); }
    .logo { height: 44px; width: auto; margin-bottom: .5rem; }
    h1 { font-size: 1.6rem; color: var(--purple); margin: 0; }
    .btn { width: 100%; }
    .linkish { background: none; border: 0; padding: 0; color: var(--muted); font-size: .9rem; text-align: center; cursor: pointer; text-decoration: none; }
    .linkish:hover { color: var(--purple); }
    .adm-err, .adm-ok { margin: 0; padding: .75rem 1rem; border-radius: 10px; font-size: .9rem; font-weight: 600; }
    .adm-err { background: #fee4e2; color: #b42318; }
    .adm-ok { background: #dcfae6; color: #067647; }
  `],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  readonly forgot = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly notice = signal('');

  toggleForgot(): void {
    this.forgot.set(!this.forgot());
    this.error.set('');
    this.notice.set('');
  }

  async signIn(): Promise<void> {
    await this.run(async () => {
      await this.auth.signIn(this.email.trim(), this.password);
      const next = this.route.snapshot.queryParamMap.get('next');
      this.router.navigateByUrl(next?.startsWith('/admin') ? next : '/admin');
    });
  }

  async sendReset(): Promise<void> {
    await this.run(async () => {
      await this.auth.sendPasswordReset(this.email.trim());
      this.notice.set('If that address belongs to an admin, a reset link is on its way.');
    });
  }

  private async run(fn: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    try {
      await fn();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      this.busy.set(false);
    }
  }
}
