import * as Sentry from '@sentry/react';
import posthog from 'posthog-js';

/**
 * Production instrumentation — Sentry (error/perf) + PostHog (product analytics).
 *
 * Both are strictly ENV-GATED: if a key is missing or still a `placeholder`,
 * that SDK is simply not initialized. Nothing throws, so local dev and any
 * environment without keys run exactly as before. Import and call
 * `initInstrumentation()` once, as early as possible, before the app renders.
 */

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';
const MODE = import.meta.env.MODE;
const IS_PROD = import.meta.env.PROD;

/** A value is "real" only if present and not a leftover placeholder token. */
const isReal = (value) => Boolean(value) && !String(value).toLowerCase().includes('placeholder');

let started = false;

export function initInstrumentation() {
  if (started) return;
  started = true;

  // ── Sentry — crash & performance monitoring ──────────────────────────────
  if (isReal(SENTRY_DSN)) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: MODE,
      integrations: [Sentry.browserTracingIntegration()],
      // Sample lightly in prod to control quota; full detail in dev.
      tracesSampleRate: IS_PROD ? 0.1 : 1.0,
      sendDefaultPii: false,
    });
  } else if (import.meta.env.DEV) {
    console.info('[instrument] Sentry disabled (no VITE_SENTRY_DSN).');
  }

  // ── PostHog — product analytics ──────────────────────────────────────────
  if (isReal(POSTHOG_KEY)) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: true,
      autocapture: true,
      // Don't create anonymous profiles for every visitor.
      person_profiles: 'identified_only',
    });
  } else if (import.meta.env.DEV) {
    console.info('[instrument] PostHog disabled (no VITE_POSTHOG_KEY).');
  }
}

export { posthog, Sentry };