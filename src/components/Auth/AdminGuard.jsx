import { useUser } from '@clerk/clerk-react';
import { isSuperAdmin } from '../../utils/roles.js';
import { neuBtn } from '../../styles/neubrutalism.js';

function AccessDenied({ authed, onLeave }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-black bg-red-500 text-4xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
        ⛔
      </div>
      <h2 className="text-2xl font-black">Restricted Area</h2>
      <p className="max-w-xs text-sm font-semibold opacity-70">
        {authed
          ? 'This console is for administrators only. Your account does not have admin access.'
          : 'You must sign in with an administrator account to view this console.'}
      </p>
      {onLeave && (
        <button
          type="button"
          onClick={onLeave}
          className={`${neuBtn} bg-white px-6 py-2.5 text-black hover:bg-stone-100`}
        >
          ← Back to safety
        </button>
      )}
    </div>
  );
}

/**
 * Strict super-admin route guard.
 *
 * Renders `children` ONLY when the live Clerk user is a super admin
 * (`publicMetadata.role === 'super_admin'` or the VITE_SUPER_ADMIN_EMAILS
 * allow-list — the same check that gates the developer AdminToolbar). Teachers
 * and students are wiped to the fallback / AccessDenied screen.
 */
export default function AdminGuard({ children, fallback, onLeave }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !isSuperAdmin(user)) {
    if (fallback !== undefined) return fallback;
    return <AccessDenied authed={Boolean(user)} onLeave={onLeave} />;
  }

  return children;
}
