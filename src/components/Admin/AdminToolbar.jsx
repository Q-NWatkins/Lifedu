import { useMemo, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { PLATFORM_THEMES, useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useAdminDev } from '../../context/AdminDevContext.jsx';
import { CURRICULUMS } from '../../config/courseMaps.js';
import { SUBJECT_ORDER, MAX_GRADE } from '../../config/mapRegistry.js';
import { SPECIAL_COMBAT_CARDS } from '../../systems/combatCards.js';
import { isSuperAdmin } from '../../utils/roles.js';

/**
 * Floating developer toolbar — SUPER ADMIN ONLY.
 *
 * Visibility is gated strictly through `isSuperAdmin(user)` (Clerk
 * `publicMetadata.role === 'super_admin'` OR an email in the build-time
 * `VITE_SUPER_ADMIN_EMAILS` allow-list). Teachers and students never see it.
 * It's a debug/QA aid; every mutation still routes through the normal
 * PlayerProgress actions, so it can't do anything a legitimate game event
 * couldn't.
 */

const TABS = [
  { id: 'combat', label: 'Combat/Stages', icon: '⚔️' },
  { id: 'economy', label: 'Economy', icon: '💰' },
  { id: 'diagnostics', label: 'Diagnostics', icon: '🩺' },
];

const isReal = (v) => Boolean(v) && !String(v).toLowerCase().includes('placeholder');

function ToolButton({ onClick, children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-700 hover:bg-slate-600',
    green: 'bg-emerald-600 hover:bg-emerald-500',
    amber: 'bg-amber-600 hover:bg-amber-500',
    red: 'bg-rose-700 hover:bg-rose-600',
    violet: 'bg-violet-700 hover:bg-violet-600',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border border-white/10 px-2.5 py-1.5 text-left text-xs font-bold text-white transition-colors ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-white/10 py-1">
      <span className="text-cyan-300/70">{label}</span>
      <span className="max-w-[60%] break-words text-right font-mono text-cyan-50">{value}</span>
    </div>
  );
}

export default function AdminToolbar() {
  const { user, isLoaded } = useUser();
  const progress = usePlayerProgress();
  const { activeTheme } = useTheme();
  const { session } = useAuth();
  const { isGodMode, toggleGodMode, requestSkipToBoss } = useAdminDev();

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('combat');
  const [toast, setToast] = useState(null);

  // Strict super-admin gate — the single source of truth for toolbar visibility.
  const canView = useMemo(() => isSuperAdmin(user), [user]);

  if (!isLoaded || !canView) return null;

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 1600);
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const unlockAllGrades = () => {
    SUBJECT_ORDER.forEach((s) => progress.unlockGrade(s, MAX_GRADE));
    flash('All grades unlocked');
  };
  const unlockAllStages = () => {
    progress.unlockAllStages();
    flash('All stages unlocked across all realms!');
  };
  const bumpEachGrade = () => {
    SUBJECT_ORDER.forEach((s) => progress.unlockGrade(s, (progress.unlockedGrades[s] ?? 1) + 1));
    flash('+1 grade per subject');
  };
  const unlockAllCards = () => {
    Object.keys(SPECIAL_COMBAT_CARDS).forEach((id) => progress.unlockCombatCard(id));
    flash('Special combat cards unlocked');
  };
  const stockConsumables = () => {
    ['shield', 'heavyAttack', 'doubleDamage'].forEach((t) => progress.addConsumable(t, 3));
    flash('+3 of each consumable');
  };
  const unlockAllThemes = () => {
    Object.keys(PLATFORM_THEMES).forEach((id) => progress.unlockTheme(id));
    flash('All themes unlocked');
  };
  const skipToBoss = () => {
    requestSkipToBoss();
    flash('Skipping to boss…');
  };
  const sendTestEmail = async () => {
    flash('Sending test email…');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'admin-toolbar' }),
      });
      flash(res.ok ? '✅ Test email sent!' : `✉️ Failed (${res.status})`);
    } catch {
      flash('✉️ Request failed');
    }
  };

  const envFlags = {
    Clerk: isReal(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY),
    Supabase:
      isReal(import.meta.env.VITE_SUPABASE_URL) && isReal(import.meta.env.VITE_SUPABASE_ANON_KEY),
    PostHog: isReal(import.meta.env.VITE_POSTHOG_KEY),
    Sentry: isReal(import.meta.env.VITE_SENTRY_DSN),
  };

  const logDiagnostics = () => {
    // eslint-disable-next-line no-console
    console.log('[AdminToolbar] diagnostics', {
      session,
      activeTheme,
      env: envFlags,
      gems: progress.gems,
      unlockedGrades: progress.unlockedGrades,
    });
    flash('Logged to console');
  };
  const throwTestError = () => {
    flash('Throwing test error…');
    setTimeout(() => {
      throw new Error('AdminToolbar: manual test error (Sentry check)');
    }, 50);
  };

  // ── Collapsed launcher ───────────────────────────────────────────────────────
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-[120] flex items-center gap-2 rounded-full border-2 border-cyan-400/60 bg-slate-900/95 px-3 py-2 text-xs font-black uppercase tracking-wide text-cyan-50 shadow-[0_4px_0_rgba(0,0,0,0.4),0_0_18px_rgba(34,211,238,0.35)] backdrop-blur transition-transform hover:-translate-y-0.5"
        aria-label="Open admin tools"
      >
        👑 Admin Tools
      </button>
    );
  }

  // ── Expanded panel ───────────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-4 left-4 z-[120] w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border-2 border-cyan-400/60 bg-slate-900/97 text-cyan-50 shadow-[0_8px_0_rgba(0,0,0,0.45),inset_0_0_24px_rgba(34,211,238,0.25)] backdrop-blur">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-black/30 px-3 py-2">
        <span className="text-sm font-black uppercase tracking-wide">👑 Admin Tools</span>
        <div className="flex items-center gap-1">
          {toast && (
            <span className="rounded bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold text-white">
              {toast}
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded px-2 py-0.5 text-sm font-black text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Collapse admin tools"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-black/20">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 px-2 py-2 text-[11px] font-black uppercase tracking-tight transition-colors ${
              tab === t.id
                ? 'bg-cyan-400/20 text-cyan-100 shadow-[inset_0_-2px_0_#22d3ee]'
                : 'text-white/60 hover:bg-white/5'
            }`}
          >
            <span className="mr-1">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="max-h-[50vh] overflow-y-auto p-3 text-xs">
        {tab === 'combat' && (
          <div className="grid gap-2">
            {/* God Mode toggle */}
            <button
              type="button"
              onClick={toggleGodMode}
              aria-pressed={isGodMode}
              className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs font-black transition-colors ${
                isGodMode
                  ? 'border-emerald-300 bg-emerald-600 text-white'
                  : 'border-white/10 bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              <span>⭐ God Mode {isGodMode ? '(health locked)' : ''}</span>
              <span
                className={`relative h-5 w-9 rounded-full border border-black/40 transition-colors ${
                  isGodMode ? 'bg-emerald-300' : 'bg-slate-500'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-all ${
                    isGodMode ? 'left-[18px]' : 'left-0.5'
                  }`}
                />
              </span>
            </button>
            <ToolButton onClick={skipToBoss} tone="red">
              ⏩ Skip to Boss (active stage)
            </ToolButton>
            <ToolButton onClick={unlockAllGrades} tone="violet">
              🗺️ Unlock ALL grades (G{MAX_GRADE})
            </ToolButton>
            <ToolButton onClick={unlockAllStages} tone="violet">
              🎬 Unlock ALL stages (every realm)
            </ToolButton>
            <ToolButton onClick={bumpEachGrade} tone="violet">
              ➕ +1 grade per subject
            </ToolButton>
            <ToolButton onClick={unlockAllCards} tone="red">
              🃏 Unlock special combat cards
            </ToolButton>
            <ToolButton onClick={stockConsumables} tone="red">
              🧪 +3 of each consumable
            </ToolButton>
            <div className="mt-1 rounded-lg bg-black/30 p-2 text-[11px] text-cyan-300/70">
              Unlocked grades:{' '}
              {SUBJECT_ORDER.map((s) => `${CURRICULUMS[s]?.label ?? s} ${progress.unlockedGrades[s] ?? 1}`).join(' · ')}
            </div>
          </div>
        )}

        {tab === 'economy' && (
          <div className="grid gap-2">
            <div className="rounded-lg bg-black/30 p-2 text-center text-sm font-black text-amber-300">
              💎 {progress.gems} gems · 🎴 {progress.stepCards} step cards
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ToolButton onClick={() => { progress.addGems(100); flash('+100 gems'); }} tone="amber">
                +100 gems
              </ToolButton>
              <ToolButton onClick={() => { progress.addGems(500); flash('+500 gems'); }} tone="amber">
                +500 gems
              </ToolButton>
              <ToolButton onClick={() => { progress.spendGems(100); flash('-100 gems'); }} tone="slate">
                −100 gems
              </ToolButton>
              <ToolButton onClick={() => { progress.addStepCards(5); flash('+5 step cards'); }} tone="green">
                +5 step cards
              </ToolButton>
            </div>
            <ToolButton onClick={unlockAllThemes} tone="violet">
              🎨 Unlock all themes
            </ToolButton>
          </div>
        )}

        {tab === 'diagnostics' && (
          <div className="grid gap-2">
            <div className="rounded-lg bg-black/30 p-2 font-mono text-[11px]">
              <Row label="user" value={session?.username ?? '—'} />
              <Row label="userId" value={session?.userId ?? '—'} />
              <Row label="role" value={session?.role ?? '—'} />
              <Row label="schoolId" value={session?.schoolId ?? '—'} />
              <Row label="org" value={session?.org?.name ?? '—'} />
              <Row label="theme" value={activeTheme} />
              <Row
                label="cloud env"
                value={Object.entries(envFlags)
                  .map(([k, v]) => `${k}:${v ? '✓' : '✗'}`)
                  .join(' ')}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ToolButton onClick={logDiagnostics} tone="slate">
                🖨️ Log to console
              </ToolButton>
              <ToolButton onClick={() => window.location.reload()} tone="slate">
                🔄 Reload app
              </ToolButton>
            </div>
            <ToolButton onClick={sendTestEmail} tone="green">
              ✉️ Send Test Email (Resend)
            </ToolButton>
            <ToolButton onClick={throwTestError} tone="red">
              💥 Throw test error (Sentry)
            </ToolButton>
          </div>
        )}
      </div>
    </div>
  );
}
