import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { listUserSummaries } from '../../systems/mockAuthService.js';

/**
 * Admin-only console. Renders only inside <AdminGuard>. It surfaces the user
 * directory as { username, role } summaries — password hashes are never exposed
 * by the service, so they can't be read here either.
 */
export default function AdminPanel() {
  const { session } = useAuth();
  const { themeConfig } = useTheme();
  const users = useMemo(() => listUserSummaries(), []);

  const cardCls = `rounded-2xl border-4 ${themeConfig.border_color} ${themeConfig.bg_card} ${themeConfig.text_card} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`;

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
        <h2 className="text-lg font-black">Registered Accounts ({users.length})</h2>
        <p className="mt-1 text-xs font-semibold opacity-70">
          Password hashes are never sent to this view.
        </p>

        <ul className="mt-4 space-y-2">
          {users.map((u) => (
            <li
              key={u.username}
              className="flex items-center justify-between gap-2 rounded-xl border-4 border-black bg-white px-4 py-2.5 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <span className="flex items-center gap-2 text-sm font-black">
                <span>{u.role === 'admin' ? '🛡️' : '🧒'}</span>
                {u.username}
              </span>
              <span
                className={`rounded-full border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase ${
                  u.role === 'admin' ? 'bg-red-400 text-white' : 'bg-lime-300 text-black'
                }`}
              >
                {u.role}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
