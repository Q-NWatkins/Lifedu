import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { neuBtn } from '../../styles/neubrutalism.js';

/**
 * Neubrutalist Login / Registration form. Pipes directly into the AuthProvider:
 * it never inspects or sets roles itself — it only forwards credentials to
 * `login` / `register`, which return a frozen session via the auth service.
 */
export default function LoginForm({ compact = false }) {
  const { login, register } = useAuth();
  const { themeConfig } = useTheme();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const cardCls = `rounded-2xl border-4 ${themeConfig.border_color} ${themeConfig.bg_card} ${themeConfig.text_card} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    const action = mode === 'login' ? login : register;
    const result = await action(username, password);
    setBusy(false);
    if (!result.ok) setError(result.error);
    // On success the provider swaps the view; nothing else to do here.
  };

  const swapMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError(null);
  };

  return (
    <div className={`w-full max-w-sm ${cardCls} p-6 ${compact ? '' : 'sm:p-8'}`}>
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-black bg-yellow-300 text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          🔐
        </div>
        <h2 className="mt-4 text-2xl font-black">
          {mode === 'login' ? 'Welcome Back!' : 'Create Your Hero'}
        </h2>
        <p className="mt-1 text-sm font-semibold opacity-70">
          {mode === 'login'
            ? 'Log in to continue your quest.'
            : 'Pick a username and a secret password.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <label className="block">
          <span className="text-xs font-black uppercase tracking-wide opacity-70">Username</span>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-xl border-4 border-black bg-white px-3 py-2.5 text-sm font-bold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] outline-none focus:bg-lime-50"
            placeholder="explorer"
          />
        </label>

        <label className="block">
          <span className="text-xs font-black uppercase tracking-wide opacity-70">Password</span>
          <input
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border-4 border-black bg-white px-3 py-2.5 text-sm font-bold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] outline-none focus:bg-lime-50"
            placeholder="••••••••"
          />
        </label>

        {error && (
          <p
            role="alert"
            className="rounded-lg border-2 border-black bg-red-400 px-3 py-1.5 text-center text-xs font-black text-white"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className={`${neuBtn} w-full bg-green-400 px-4 py-3 text-black hover:bg-green-300 disabled:opacity-60`}
        >
          {busy ? 'Checking…' : mode === 'login' ? 'Log In' : 'Create Account'}
        </button>
      </form>

      <button
        type="button"
        onClick={swapMode}
        className="mt-4 w-full text-center text-xs font-bold underline opacity-80 hover:opacity-100"
      >
        {mode === 'login'
          ? "New here? Create an account"
          : 'Already have an account? Log in'}
      </button>
    </div>
  );
}
