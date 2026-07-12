import { useAuth } from '../../context/AuthContext.jsx';
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
 * Strict admin route guard.
 *
 * Renders `children` ONLY when the live session is a real object explicitly
 * carrying `role === 'admin'`. Any other state (null / missing / non-admin)
 * wipes the protected view and shows the fallback (custom, or the default
 * AccessDenied + login). Because it reads the frozen session straight from the
 * auth context on every render, flipping a flag in DevTools can't slip past it.
 */
export default function AdminGuard({ children, fallback, onLeave }) {
  const { session } = useAuth();

  const isAdmin = Boolean(session) && session.role === 'admin';

  if (!isAdmin) {
    if (fallback !== undefined) return fallback;
    return <AccessDenied authed={Boolean(session)} onLeave={onLeave} />;
  }

  return children;
}
