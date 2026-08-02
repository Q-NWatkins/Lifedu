import { useEffect, useMemo, useState } from 'react';
import { fetchStudentAttempts, REALM_LABELS } from '../../utils/classroomStore.js';
import { CURRICULUMS } from '../../config/courseMaps.js';
import { neuBtn } from '../../styles/neubrutalism.js';

const SUBJECTS = ['math', 'science', 'reading', 'history'];

function bandCls(pct) {
  if (pct == null) return 'bg-stone-400 text-white';
  if (pct >= 80) return 'bg-green-400 text-black';
  if (pct >= 50) return 'bg-yellow-300 text-black';
  return 'bg-red-400 text-white';
}

function humanize(str) {
  return String(str ?? '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

/**
 * Individual "Student Progress Report Card" — pulls this student's raw
 * question_attempts from Supabase and renders overall stats, a per-subject
 * accuracy grid, and their most recent answered questions.
 */
export default function StudentStatsModal({ student, onClose }) {
  const [rows, setRows] = useState(null); // null = loading

  useEffect(() => {
    let alive = true;
    setRows(null);
    (async () => {
      const data = await fetchStudentAttempts(student.id, 200);
      if (alive) setRows(data);
    })();
    return () => {
      alive = false;
    };
  }, [student.id]);

  const report = useMemo(() => {
    const list = rows ?? [];
    const total = list.length;
    const correct = list.reduce((n, r) => n + (r.is_correct ? 1 : 0), 0);
    const accuracy = total ? Math.round((correct / total) * 100) : 0;

    const bySubject = SUBJECTS.map((sub) => {
      const subRows = list.filter((r) => r.realm === sub);
      const c = subRows.reduce((n, r) => n + (r.is_correct ? 1 : 0), 0);
      const pct = subRows.length ? Math.round((c / subRows.length) * 100) : null;
      return { sub, label: CURRICULUMS[sub]?.label ?? sub, total: subRows.length, pct };
    });

    return { total, correct, accuracy, bySubject, recent: list.slice(0, 10) };
  }, [rows]);

  return (
    <div
      className="fixed inset-0 z-[190] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Progress report for ${student.name}`}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border-4 border-cyan-400/70 bg-indigo-950 p-6 text-cyan-50 shadow-[inset_0_0_24px_rgba(34,211,238,0.35),0_8px_0_rgba(0,0,0,0.4)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">📊 Student Progress Report</h2>
            <p className="text-sm font-black text-white">{student.name}</p>
            <p className="mt-0.5 text-xs font-semibold opacity-70">
              Joined {formatDate(student.joinedAt)} · Class{' '}
              <span className="rounded-full border-2 border-black bg-yellow-300 px-2 py-0.5 text-[10px] font-black tracking-wider text-black">
                {student.classCode}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-0.5 text-lg font-black text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {rows === null ? (
          <p className="mt-6 text-sm font-bold opacity-70">Loading attempts…</p>
        ) : report.total === 0 ? (
          <p className="mt-6 rounded-xl border-2 border-white/20 bg-white/5 p-4 text-sm font-semibold opacity-80">
            No questions answered yet. Once {student.name} starts playing, their metrics will appear
            here.
          </p>
        ) : (
          <>
            {/* Overall summary */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl border-2 border-black bg-white px-2 py-3 text-center text-black">
                <p className="text-2xl font-black">{report.total}</p>
                <p className="text-[10px] font-bold uppercase text-black/60">Answered</p>
              </div>
              <div className="rounded-xl border-2 border-black bg-white px-2 py-3 text-center text-black">
                <p className="text-2xl font-black">{report.correct}</p>
                <p className="text-[10px] font-bold uppercase text-black/60">Correct</p>
              </div>
              <div className={`rounded-xl border-2 border-black px-2 py-3 text-center ${bandCls(report.accuracy)}`}>
                <p className="text-2xl font-black">{report.accuracy}%</p>
                <p className="text-[10px] font-bold uppercase opacity-70">Accuracy</p>
              </div>
            </div>

            {/* Subject breakdown */}
            <h3 className="mt-5 text-sm font-black">Subject Breakdown</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {report.bySubject.map((s) => (
                <div
                  key={s.sub}
                  className="flex items-center justify-between rounded-xl border-2 border-black bg-white px-3 py-2 text-black"
                >
                  <span className="text-xs font-black">{s.label}</span>
                  <span className={`rounded-full border-2 border-black px-2 py-0.5 text-[11px] font-black ${bandCls(s.pct)}`}>
                    {s.pct == null ? 'No Data' : `${s.pct}%`}
                  </span>
                </div>
              ))}
            </div>

            {/* Attempt history */}
            <h3 className="mt-5 text-sm font-black">Recent Attempts (last {report.recent.length})</h3>
            <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto pr-1">
              {report.recent.map((r, i) => (
                <li
                  key={r.id ?? i}
                  className="flex items-center justify-between gap-2 rounded-lg border-2 border-black bg-white px-3 py-2 text-black"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black">{humanize(r.topic) || 'Question'}</p>
                    <p className="truncate text-[10px] font-semibold text-black/60">
                      {REALM_LABELS[r.realm] ?? humanize(r.realm)}
                      {r.grade ? ` · G${r.grade}` : ''}
                      {r.stage ? ` · Stage ${r.stage}` : ''}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border-2 border-black px-2 py-0.5 text-[10px] font-black ${
                      r.is_correct ? 'bg-green-400 text-black' : 'bg-red-400 text-white'
                    }`}
                  >
                    {r.is_correct ? '🟢 CORRECT' : '🔴 INCORRECT'}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-6 flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className={`${neuBtn} flex-1 bg-cyan-400 px-4 py-2.5 text-sm text-cyan-950 hover:bg-cyan-300`}
          >
            🖨️ Print / Export Summary
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`${neuBtn} bg-white px-4 py-2.5 text-sm text-black hover:bg-stone-100`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}