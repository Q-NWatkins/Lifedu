import { ClerkProvider } from '@clerk/clerk-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkConfigured = Boolean(PUBLISHABLE_KEY) && !PUBLISHABLE_KEY.includes('placeholder');

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
    {clerkConfigured ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    ) : (
      <SetupNotice />
    )}
  </StrictMode>,
);