import { createContext, useCallback, useContext, useMemo } from 'react';
import { useAuth as useClerkAuth, useOrganization, useUser } from '@clerk/clerk-react';

/**
 * Auth context — now backed by Clerk (Native Third-Party Auth).
 *
 * Identity, session lifetime, and tokens are owned entirely by Clerk; this
 * context is a thin, app-shaped adapter over Clerk's hooks so the rest of the
 * codebase keeps consuming a stable surface (`session`, `isAuthenticated`,
 * `isAdmin`, `logout`, `getToken`).
 *
 * Admin is derived from the active Organization role (`org:admin`) with a
 * fallback to the user's `publicMetadata.role`. The role is read live from
 * Clerk on every render — it is never independently settable from the client,
 * so DevTools can't flip a user into admin.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { isLoaded, isSignedIn, orgRole, orgSlug, getToken, signOut } = useClerkAuth();
  const { user } = useUser();
  const { organization } = useOrganization();

  const isAdmin =
    orgRole === 'org:admin' || user?.publicMetadata?.role === 'admin';

  // Immutable session snapshot mirrored from Clerk's live state.
  const session = useMemo(() => {
    if (!isSignedIn || !user) return null;
    return Object.freeze({
      userId: user.id,
      username:
        user.username || user.primaryEmailAddress?.emailAddress || user.id,
      fullName: user.fullName ?? null,
      imageUrl: user.imageUrl ?? null,
      role: isAdmin ? 'admin' : 'user',
      // Multi-tenant school boundary. Prefer an explicit `school_id` in the org's
      // public metadata; fall back to the Clerk organization id itself.
      schoolId: organization
        ? organization.publicMetadata?.school_id ?? organization.id
        : null,
      org: organization
        ? Object.freeze({
            id: organization.id,
            slug: organization.slug ?? orgSlug ?? null,
            name: organization.name,
            role: orgRole ?? null,
            schoolId: organization.publicMetadata?.school_id ?? organization.id,
          })
        : null,
    });
  }, [isSignedIn, user, isAdmin, organization, orgRole, orgSlug]);

  const logout = useCallback(() => signOut(), [signOut]);

  /**
   * Live Clerk session token for the Supabase TPA client. Called per-request,
   * so it always returns a fresh, auto-refreshed token (or null when signed out).
   */
  const getSessionToken = useCallback(
    () => (isSignedIn ? getToken() : Promise.resolve(null)),
    [isSignedIn, getToken],
  );

  // Legacy no-op stubs: credential auth now flows through Clerk's <SignIn/>.
  // Kept so any residual caller of login/register compiles and fails gracefully.
  const login = useCallback(
    async () => ({ ok: false, error: 'Sign in with the Clerk sign-in screen.' }),
    [],
  );
  const register = login;

  const value = useMemo(
    () =>
      Object.freeze({
        isLoaded,
        isAuthenticated: Boolean(isSignedIn),
        isAdmin,
        session,
        organization: session?.org ?? null,
        getToken: getSessionToken,
        logout,
        login,
        register,
      }),
    [isLoaded, isSignedIn, isAdmin, session, getSessionToken, logout, login, register],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}