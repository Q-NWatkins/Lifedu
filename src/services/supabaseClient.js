import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client wired for Clerk ↔ Supabase Native Third-Party Auth (TPA).
 *
 * Instead of Supabase managing its own auth session, every outbound request is
 * intercepted and stamped with the caller's live Clerk session token. Supabase
 * validates that token against the configured third-party provider and exposes
 * its claims to Postgres — which is exactly what Row-Level Security policies
 * read (e.g. `auth.jwt() ->> 'sub'`) to decide row access. That's how these
 * browser requests clear the RLS walls without any service-role key.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** True only when real (non-placeholder) Supabase env values are present. */
export function isSupabaseConfigured() {
  return (
    Boolean(SUPABASE_URL) &&
    Boolean(SUPABASE_ANON_KEY) &&
    !SUPABASE_URL.includes('placeholder') &&
    !SUPABASE_ANON_KEY.includes('placeholder')
  );
}

/**
 * Build a Supabase client whose global `fetch` injects the current Clerk token.
 *
 * @param {{ getToken: () => Promise<string|null> }} clerkSession
 *   Any object exposing `getToken()` — Clerk's session/auth object, or a thin
 *   wrapper around `useAuth().getToken`. Called fresh on every request so the
 *   token is always current (Clerk auto-refreshes short-lived tokens).
 */
export function createClerkSupabaseClient(clerkSession) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    // We are NOT using Supabase's own auth session — Clerk owns identity.
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      // Fetch interceptor: dynamically attach the Clerk bearer token.
      fetch: async (input, init = {}) => {
        const token = clerkSession ? await clerkSession.getToken() : null;
        const headers = new Headers(init.headers);
        if (token) headers.set('Authorization', `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      },
    },
  });
}