import { useOrganization } from '@clerk/clerk-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

/**
 * Admin-only console. Renders only inside <AdminGuard>. It lists the REAL
 * members of the admin's active Clerk organization (the school cohort) — sourced
 * live from Clerk, never from any local mock directory.
 */
export default function AdminPanel() {
  const { session } = useAuth();
  const { themeConfig } = useTheme();
  const { organization, memberships, isLoaded } = useOrganization({
    memberships: { infinite: true },
  });

  const cardCls = `rounded-2xl border-4 ${themeConfig.border_color} ${themeConfig.bg_card} ${themeConfig.text_card} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`;

  const members = memberships?.data ?? [];

  const displayName = (m) => {
    const u = m.publicUserData;
    if (!u) return 'Pending invite';
    return (
      [u.firstName, u.lastName].filter(Boolean).join(' ') ||
      u.identifier ||
      u.userId
    );
  };
  const isAdminRole = (role) => role === 'org:admin' || role === 'admin';

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className={`text-2xl font-black sm:text-3xl ${themeConfig.text_main}`}>
          🛡️ Admin Console
        </h1>
        <p className={`mt-1 text-sm font-bold ${themeConfig.contrastMuted}`}>
          Signed in as {session.username} · role: {session.role}
        </p>
      </header>

      <div className={`${cardCls} p-5`}>
        <h2 className="text-lg font-black">
          {organization ? organization.name : 'Your Organization'} — Members ({members.length})
        </h2>
        <p className="mt-1 text-xs font-semibold opacity-70">
          Live roster from your active Clerk organization (school cohort).
        </p>

        {!organization ? (
          <p className="mt-4 rounded-xl border-4 border-black bg-white px-4 py-3 text-sm font-bold text-black">
            No active organization. Select a school/organization in Clerk to view its members.
          </p>
        ) : !isLoaded ? (
          <p className="mt-4 text-sm font-bold opacity-70">Loading members…</p>
        ) : members.length === 0 ? (
          <p className="mt-4 text-sm font-bold opacity-70">No members found.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {members.map((m) => {
              const admin = isAdminRole(m.role);
              return (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-2 rounded-xl border-4 border-black bg-white px-4 py-2.5 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <span className="flex items-center gap-2 text-sm font-black">
                    <span>{admin ? '🛡️' : '🧒'}</span>
                    {displayName(m)}
                  </span>
                  <span
                    className={`rounded-full border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase ${
                      admin ? 'bg-red-400 text-white' : 'bg-lime-300 text-black'
                    }`}
                  >
                    {m.role?.replace('org:', '') ?? 'member'}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}