import * as Sentry from '@sentry/react';
import { ClerkProvider } from '@clerk/clerk-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { initInstrumentation } from './instrument.js';
import './index.css';

// Stand up Sentry + PostHog (env-gated) before anything renders.
initInstrumentation();

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkConfigured = Boolean(PUBLISHABLE_KEY) && !PUBLISHABLE_KEY.includes('placeholder');

/** Last-resort fallback shown if a runtime crash escapes React's tree. */
function CrashScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: 'system-ui, sans-serif',
        background: '#1e1b4b',
        color: '#e0e7ff',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <div style={{ fontSize: 48 }}>🛠️</div>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Something went sideways</h1>
        <p style={{ lineHeight: 1.5, opacity: 0.85 }}>
          The app hit an unexpected error and our team has been notified. Please refresh to jump
          back into your quest.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            marginTop: 12,
            padding: '0.6rem 1.25rem',
            fontWeight: 800,
            borderRadius: 12,
            border: '4px solid #000',
            background: '#facc15',
            cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </div>
    </div>
  );
}

/** Friendly staging screen shown until a real Clerk key is present in .env.local. */
function SetupNotice() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: 'system-ui, sans-serif',
        background: '#1e1b4b',
        color: '#e0e7ff',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          border: '4px solid #22d3ee',
          borderRadius: 16,
          padding: '1.5rem 1.75rem',
          background: '#0f172a',
          boxShadow: 'inset 0 0 24px rgba(34,211,238,0.3)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>🔧 Phase 3 — Add your keys</h1>
        <p style={{ lineHeight: 1.5 }}>
          LearnQuest is staged for Clerk + Supabase but no live keys are set yet. Add them to{' '}
          <code>.env.local</code> and restart the dev server:
        </p>
        <pre
          style={{
            background: '#020617',
            padding: '0.75rem',
            borderRadius: 8,
            fontSize: 12,
            overflowX: 'auto',
          }}
        >
{`VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>`}
        </pre>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<CrashScreen />}>
      {clerkConfigured ? (
        <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
          <App />
        </ClerkProvider>
      ) : (
        <SetupNotice />
      )}
    </Sentry.ErrorBoundary>
  </StrictMode>,
);