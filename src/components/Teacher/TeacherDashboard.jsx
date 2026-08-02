import { useMemo, useState } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { SUBJECT_CATEGORIES } from '../../data/questions/categorize.js';
import { CURRICULUMS } from '../../config/courseMaps.js';
import { neuBtn } from '../../styles/neubrutalism.js';
import TiltedTitle from '../common/TiltedTitle.jsx';
import AccommodationsModal from './AccommodationsModal.jsx';

const TABS = [
  { id: 'roster', label: 'Classroom Roster', icon: '📋' },
  { id: 'analytics', label: 'Skill & Literacy Analytics', icon: '📊' },
  { id: 'assignments', label: 'Assignments & Focus Mode', icon: '🎯' },
];

const SUBJECT_ORDER = ['math', 'science', 'reading', 'history'];

/** Mock roster (initial state until wired to Supabase `student_progress`). */
const MOCK_STUDENTS = [
  { id: 's1', name: 'Ava Thompson', realm: 'Math Citadel', grade: 1, accuracy: 92, },
  { id: 's2', name: 'Liam Chen', realm: 'Science Cosmos', grade: 1, accuracy: 74 },
  { id: 's3', name: 'Maya Patel', realm: 'Reading Realm', grade: 2, accuracy: 58 },
  { id: 's4', name: 'Noah Williams', realm: 'History Timeline', grade: 1, accuracy: 41 },
  { id: 's5', name: 'Sofia Garcia', realm: 'Math Citadel', grade: 2, accuracy: 88 },
  { id: 's6', name: 'Ethan Kim', realm: 'Science Cosmos', grade: 1, accuracy: 47 },
];

function statusFor(accuracy) {
  if (accuracy < 50) return { label: 'Needs Intervention', cls: 'bg-red-400 text-white' };
  if (accuracy < 70) return { label: 'Watch', cls: 'bg-yellow-300 text-black' };
  return { label: 'Active', cls: 'bg-green-400 text-black' };
}

function scoreBand(pct) {
  if (pct >= 80) return { dot: '🟢', cls: 'bg-green-400 text-black' };
  if (pct >= 50) return { dot: '🟡', cls: 'bg-yellow-300 text-black' };
  return { dot: '🔴', cls: 'bg-red-400 text-white' };
}

/** Deterministic mock score so the analytics grid is stable between renders. */
function mockScore(subject, category) {
  const seed = `${subject}:${category}`.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return 30 + (seed % 66); // 30–95
}

function newJoinCode() {
  return `QUEST-${Math.floor(Math.random() * 90) + 10}`; // e.g. QUEST-42
}

export default function TeacherDashboard() {
  const { themeConfig } = useTheme();
  const [tab, setTab] = useState('roster');
  const [classes, setClasses] = useState([]);
  const [focusMode, setFocusMode] = useState(false);
  const [iepStudent, setIepStudent] = useState(null);

  const cardCls = `rounded-2xl border-4 border-cyan-400/70 bg-indigo-950 text-cyan-50 shadow-[inset_0_0_24px_rgba(34,211,238,0.35),0_8px_0_rgba(0,0,0,0.4)]`;

  const createClass = () => {
    setClasses((prev) => [
      ...prev,
      { id: `c${prev.length + 1}`, name: `Class ${prev.length + 1}`, code: newJoinCode(), students: 0 },
    ]);
  };

  const analytics = useMemo(
    () =>
      SUBJECT_ORDER.map((subject) => ({
        subject,
        label: CURRICULUMS[subject]?.label ?? subject,
        categories: (SUBJECT_CATEGORIES[subject] ?? []).map((category) => {
          const pct = mockScore(subject, category);
          return { category, pct, band: scoreBand(pct) };
        }),
      })),
    [],
  );

  return (
    <div className="space-y-6">
      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <header className="text-center">
        <TiltedTitle
          as="h1"
          className="text-2xl font-black uppercase text-white drop-shadow-[0_2px_0_rgba(0,0,0,1)] sm:text-3xl"
        >
          Teacher Classroom Command Center
        </TiltedTitle>
        <p className={`mt-2 text-sm font-bold ${themeConfig.contrastMuted}`}>
          Rosters, analytics, and assignments for your classes.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`${neuBtn} px-4 py-2 text-xs sm:text-sm ${
              tab === t.id ? 'bg-cyan-400 text-cyan-950' : 'bg-white text-black hover:bg-cyan-50'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Classroom Roster ───────────────────────────────────────────────── */}
      {tab === 'roster' && (
        <div className="space-y-4">
          <div className={`${cardCls} p-5`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-black">My Classes ({classes.length})</h2>
              <button
                type="button"
                onClick={createClass}
                className={`${neuBtn} bg-green-400 px-4 py-2 text-sm text-black hover:bg-green-300`}
              >
                + Create New Class
              </button>
            </div>

            {classes.length === 0 ? (
              <p className="mt-3 text-sm font-semibold opacity-70">
                No classes yet — create one to generate a student Join Code.
              </p>
            ) : (
              <ul className="mt-4 flex flex-wrap gap-2">
                {classes.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center gap-2 rounded-xl border-4 border-black bg-white px-3 py-2 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <span className="text-sm font-black">{c.name}</span>
                    <span className="rounded-full border-2 border-black bg-yellow-300 px-2 py-0.5 text-xs font-black tracking-wider">
                      {c.code}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={`${cardCls} overflow-hidden p-5`}>
            <h2 className="text-lg font-black">Students ({MOCK_STUDENTS.length})</h2>
            <p className="mt-1 text-xs font-semibold opacity-70">Sample roster — live data lands next.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-cyan-300/80">
                    <th className="border-b border-white/15 py-2 pr-3">Student Name</th>
                    <th className="border-b border-white/15 py-2 pr-3">Current Realm</th>
                    <th className="border-b border-white/15 py-2 pr-3">Grade</th>
                    <th className="border-b border-white/15 py-2 pr-3">Accuracy</th>
                    <th className="border-b border-white/15 py-2 pr-3">Status</th>
                    <th className="border-b border-white/15 py-2">IEP</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_STUDENTS.map((s) => {
                    const status = statusFor(s.accuracy);
                    return (
                      <tr key={s.id} className="align-middle">
                        <td className="border-b border-white/10 py-2 pr-3 font-bold">{s.name}</td>
                        <td className="border-b border-white/10 py-2 pr-3 opacity-90">{s.realm}</td>
                        <td className="border-b border-white/10 py-2 pr-3 opacity-90">G{s.grade}</td>
                        <td className="border-b border-white/10 py-2 pr-3 font-black">{s.accuracy}%</td>
                        <td className="border-b border-white/10 py-2 pr-3">
                          <span className={`rounded-full border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase ${status.cls}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="border-b border-white/10 py-2">
                          <button
                            type="button"
                            onClick={() => setIepStudent(s)}
                            title="IEP / Accommodations"
                            className="rounded-lg border-2 border-black bg-white px-2 py-1 text-xs font-black text-black hover:bg-cyan-100"
                          >
                            ⚙️ IEP
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Skill & Literacy Analytics ─────────────────────────────────────── */}
      {tab === 'analytics' && (
        <div className="space-y-4">
          <div className={`${cardCls} p-5`}>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-black">
              <span>Legend:</span>
              <span className="rounded-full border-2 border-black bg-green-400 px-2 py-0.5 text-black">🟢 &gt;80%</span>
              <span className="rounded-full border-2 border-black bg-yellow-300 px-2 py-0.5 text-black">🟡 50–79%</span>
              <span className="rounded-full border-2 border-black bg-red-400 px-2 py-0.5 text-white">🔴 &lt;50% flagged</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {analytics.map((row) => (
              <div key={row.subject} className={`${cardCls} p-5`}>
                <h3 className="text-base font-black capitalize">{row.label}</h3>
                <ul className="mt-3 space-y-2">
                  {row.categories.map((c) => (
                    <li key={c.category} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold capitalize opacity-90">
                        {c.category.replace(/_/g, ' ')}
                      </span>
                      <span className={`rounded-full border-2 border-black px-2 py-0.5 text-[11px] font-black ${c.band.cls}`}>
                        {c.band.dot} {c.pct}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Assignments & Focus Mode ───────────────────────────────────────── */}
      {tab === 'assignments' && (
        <div className={`${cardCls} p-5`}>
          <h2 className="text-lg font-black">🎯 Assignments & Focus Mode</h2>
          <p className="mt-1 text-sm font-semibold opacity-80">
            Assign specific realms, stages, or categories and lock the class into a focused practice
            session. Full builder coming soon.
          </p>

          <div className="mt-4 flex items-center justify-between rounded-xl border-4 border-black bg-white px-4 py-3 text-black">
            <div>
              <p className="text-sm font-black">Focus Mode</p>
              <p className="text-xs font-semibold text-black/60">
                Restrict students to the current assignment only.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFocusMode((v) => !v)}
              className={`${neuBtn} px-4 py-2 text-xs ${focusMode ? 'bg-green-400 text-black' : 'bg-stone-200 text-black'}`}
            >
              {focusMode ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border-4 border-dashed border-cyan-400/60 p-4 text-center text-sm font-bold opacity-70">
              + New Assignment (coming soon)
            </div>
            <div className="rounded-xl border-4 border-dashed border-cyan-400/60 p-4 text-center text-sm font-bold opacity-70">
              📈 Weekly Progress Report (coming soon)
            </div>
          </div>
        </div>
      )}

      {iepStudent && (
        <AccommodationsModal student={iepStudent} onClose={() => setIepStudent(null)} />
      )}
    </div>
  );
}