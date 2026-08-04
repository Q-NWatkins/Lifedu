import { useMemo } from 'react';
import { getAttempts } from '../../utils/classroomStore.js';
import { CURRICULUMS } from '../../config/courseMaps.js';
import { neuBtn } from '../../styles/neubrutalism.js';

const SUBJECTS = ['math', 'science', 'reading', 'history'];

/**
 * Weekly Class Progress report, computed live from recorded question attempts
 * for the students in this class.
 */
export default function WeeklyReportModal({ students, className, onClose }) {
  const report = useMemo(() => {
    const attempts = getAttempts();
    let sumAccuracy = 0;
    let counted = 0;
    let weekTotal = 0;
    const needs = [];
    const subjectTotals = Object.fromEntries(SUBJECTS.map((s) => [s, { total: 0, correct: 0 }]));

    students.forEach((s) => {
      const a = attempts[s.id];
      const acc = a && a.total ? Math.round((a.correct / a.total) * 100) : 0;
      if (a && a.total) {
        sumAccuracy += acc;
        counted += 1;
      }
      if (acc < 50) needs.push({ name: s.name, acc });
      weekTotal += a?.week?.total ?? 0;
      if (a?.bySubject) {
        SUBJECTS.forEach((sub) => {
          if (a.bySubject[sub]) {
            subjectTotals[sub].total += a.bySubject[sub].total;
            subjectTotals[sub].correct += a.bySubject[sub].correct;
          }
        });
      }
    });

    const classAvg = counted ? Math.round(sumAccuracy / counted) : 0;

    const subjectAcc = SUBJECTS.map((sub) => ({
      sub,
      label: CURRICULUMS[sub]?.label ?? sub,
      pct: subjectTotals[sub].total
        ? Math.round((subjectTotals[sub].correct / subjectTotals[sub].total) * 100)
        : null,
    })).filter((x) => x.pct != null);

    const best = subjectAcc.reduce((b, x) => (b == null || x.pct > b.pct ? x : b), null);
    const worst = subjectAcc.reduce((w, x) => (w == null || x.pct < w.pct ? x : w), null);

    return { classAvg, weekTotal, needs, best, worst, hasData: counted > 0 };
  }, [students]);

  return (
    <div
      className="fixed inset-0 z-[180] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Weekly class progress"
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border-4 border-cyan-400/70 bg-indigo-950 p-6 text-cyan-50 shadow-[inset_0_0_24px_rgba(34,211,238,0.35),0_8px_0_rgba(0,0,0,0.4)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">📊 Weekly Class Progress</h2>
            <p className="text-xs font-semibold opacity-70">{className}</p>
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

        {!report.hasData ? (
          <p className="mt-4 rounded-xl border-2 border-white/20 bg-white/5 p-4 text-sm font-semibold opacity-80">
            No question attempts recorded yet. Once your students start playing, their accuracy and
            weekly totals will appear here.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border-2 border-black bg-white px-3 py-3 text-center text-black">
                <p className="text-3xl font-black">{report.classAvg}%</p>
                <p className="text-[11px] font-bold uppercase text-black/60">🎯 Class Avg Accuracy</p>
              </div>
              <div className="rounded-xl border-2 border-black bg-white px-3 py-3 text-center text-black">
                <p className="text-3xl font-black">{report.weekTotal}</p>
                <p className="text-[11px] font-bold uppercase text-black/60">❓ Answered This Week</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {report.best && (
                <div className="rounded-xl border-2 border-black bg-green-400 px-3 py-2 text-black">
                  <p className="text-[11px] font-black uppercase">🌟 Most Mastered</p>
                  <p className="text-sm font-black">{report.best.label} · {report.best.pct}%</p>
                </div>
              )}
              {report.worst && (
                <div className="rounded-xl border-2 border-black bg-yellow-300 px-3 py-2 text-black">
                  <p className="text-[11px] font-black uppercase">⚠️ Needs Focus</p>
                  <p className="text-sm font-black">{report.worst.label} · {report.worst.pct}%</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border-2 border-black bg-white px-3 py-3 text-black">
              <p className="text-[11px] font-black uppercase text-red-600">
                🔴 Students Needing Intervention ({report.needs.length})
              </p>
              {report.needs.length === 0 ? (
                <p className="mt-1 text-sm font-bold text-black/60">
                  🎉 No students below 50% — nice work!
                </p>
              ) : (
                <ul className="mt-1 space-y-1">
                  {report.needs.map((n) => (
                    <li key={n.name} className="flex items-center justify-between text-sm font-bold">
                      <span>{n.name}</span>
                      <span className="rounded-full border-2 border-black bg-red-400 px-2 py-0.5 text-[10px] font-black text-white">
                        {n.acc}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className={`${neuBtn} mt-5 w-full bg-white px-4 py-2.5 text-sm text-black hover:bg-stone-100`}
        >
          Close
        </button>
      </div>
    </div>
  );
}