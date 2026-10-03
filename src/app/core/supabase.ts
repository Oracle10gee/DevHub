import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export const MEDIA_BUCKET = 'media';

export const supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // The default Web Locks implementation deadlocks under zone.js; a single
    // tab only needs the session refresh to run in order, not across tabs.
    lock: async (_name, _timeout, fn) => fn(),
  },
});
