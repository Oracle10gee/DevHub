import { Injectable, computed, signal } from '@angular/core';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly session = signal<Session | null>(null);
  readonly isAdmin = signal(false);
  readonly email = computed(() => this.session()?.user.email ?? '');

  private ready: Promise<void>;

  constructor() {
    this.ready = this.load();
    supabase.auth.onAuthStateChange((_event, session) => {
      this.session.set(session);
      if (!session) this.isAdmin.set(false);
    });
  }

  /** Resolves once the stored session (if any) and admin status are known. */
  async whenReady(): Promise<void> {
    await this.ready;
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.ready = this.load();
    await this.ready;
    if (!this.isAdmin()) {
      await this.signOut();
      throw new Error('This account is not an administrator.');
    }
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
    this.session.set(null);
    this.isAdmin.set(false);
  }

  async sendPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/admin/reset-password`,
    });
    if (error) throw error;
  }

  async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }

  private async load(): Promise<void> {
    const { data } = await supabase.auth.getSession();
    this.session.set(data.session);
    if (!data.session) {
      this.isAdmin.set(false);
      return;
    }
    const { data: row } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', data.session.user.id)
      .maybeSingle();
    this.isAdmin.set(!!row);
  }
}
