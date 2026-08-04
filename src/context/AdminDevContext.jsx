import { createContext, useCallback, useContext, useMemo, useState } from 'react';

/**
 * Admin developer state shared between the floating AdminToolbar and the live
 * game components (GameBoard / BossBattle). Kept tiny and separate from gameplay
 * state so it never affects normal players — the toolbar itself only renders for
 * admins, and these flags default to off.
 *
 *  - isGodMode: when true, combat/trivia never drains the player's health.
 *  - skipToBossNonce: a monotonically increasing "signal". The active board
 *    watches it and jumps straight to the boss whenever it changes.
 */
const AdminDevContext = createContext(null);

export function AdminDevProvider({ children }) {
  const [isGodMode, setIsGodMode] = useState(false);
  const [skipToBossNonce, setSkipToBossNonce] = useState(0);

  const setGodMode = useCallback((value) => setIsGodMode(Boolean(value)), []);
  const toggleGodMode = useCallback(() => setIsGodMode((v) => !v), []);
  const requestSkipToBoss = useCallback(() => setSkipToBossNonce((n) => n + 1), []);

  const value = useMemo(
    () => ({ isGodMode, setGodMode, toggleGodMode, skipToBossNonce, requestSkipToBoss }),
    [isGodMode, setGodMode, toggleGodMode, skipToBossNonce, requestSkipToBoss],
  );

  return <AdminDevContext.Provider value={value}>{children}</AdminDevContext.Provider>;
}

export function useAdminDev() {
  const ctx = useContext(AdminDevContext);
  if (!ctx) throw new Error('useAdminDev must be used within AdminDevProvider');
  return ctx;
}