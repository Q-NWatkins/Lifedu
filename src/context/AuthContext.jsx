import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { registerUser, verifyCredentials } from '../systems/mockAuthService.js';

/**
 * Session auth context.
 *
 * The session is held in React state ONLY (never localStorage/sessionStorage) —
 * a persisted role string would be trivially editable by a user and become a
 * client-side privilege-escalation vector. On refresh the user re-authenticates.
 *
 * The session object itself is frozen by mockAuthService before it ever reaches
 * state, and the exposed context value is frozen too, so neither can be mutated
 * (e.g. flipping `role` to 'admin') from DevTools.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);

  const login = useCallback(async (username, password) => {
    const result = await verifyCredentials(username, password);
    if (!result) return { ok: false, error: 'Invalid username or password.' };
    setSession(result); // already Object.freeze'd by the service
    return { ok: true };
  }, []);

  const register = useCallback(async (username, password) => {
    try {
      const result = await registerUser(username, password);
      setSession(result);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => setSession(null), []);

  const value = useMemo(
    () =>
      Object.freeze({
        session,
        isAuthenticated: Boolean(session),
        // Derived strictly from the frozen session — not independently settable.
        isAdmin: session?.role === 'admin',
        login,
        register,
        logout,
      }),
    [session, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
