import { useMemo, useState } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { SUBJECT_CATEGORIES } from '../../data/questions/categorize.js';
import { CURRICULUMS } from '../../config/courseMaps.js';
import { neuBtn } from '../../styles/neubrutalism.js';
import TiltedTitle from '../common/TiltedTitle.jsx';
import AccommodationsModal from './AccommodationsModal.jsx';
import AssignmentBuilderModal from './AssignmentBuilderModal.jsx';
import WeeklyReportModal from './WeeklyReportModal.jsx';
import StudentStatsModal from './StudentStatsModal.jsx';
import {
  useClassroomStore,
  getClassesForTeacher,
  getStudentsForCodes,
  getAssignmentsForCode,
  getClassSkillAnalytics,
  addClass,
  deleteClass,
  deleteAssignment,
  newJoinCode,
  setAssignmentFocus,
  getAccuracy,
  resolveTeacherId,
  removeStudentFromClass,
  useTeacherClassroom,
  REALM_LABELS,
} from '../../utils/classroomStore.js';

const TABS = [
  { id: 'roster', label: 'Classroom Roster', icon: '📋' },
  { id: 'analytics', label: 'Skill & Literacy Analytics', icon: '📊' },
  { id: 'assignments', label: 'Assignments & Focus Mode', icon: '🎯' },
];

const SUBJECT_ORDER = ['math', 'science', 'reading', 'history'];

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

const NO_DATA_BADGE = 'bg-stone-400 text-white';

export default function TeacherDashboard({ onExit }) {
  const { themeConfig } = useTheme();
  const { session } = useAuth();
  const teacherId = resolveTeacherId(session?.userId); // Clerk id, or a stable local fallback
  const storeVersion = useClassroomStore(); // subscribe → re-render when the shared store changes
  useTeacherClassroom(teacherId); // live Supabase roster sync (Realtime + poll fallback)

  const [tab, setTab] = useState('roster');
  const [iepStudent, setIepStudent] = useState(null);
  const [statsStudent, setStatsStudent] = useState(null); // student for the deep-dive report
  const [builderClassCode, setBuilderClassCode] = useState(null); // class code for the open builder
  const [reportClass, setReportClass] = useState(null); // { code, name } for the open report
  const [deleteTarget, setDeleteTarget] = useState(null); // class pending deletion confirmation
  const [createOpen, setCreateOpen] = useState(false); // "new class" name modal
  const [newClassName, setNewClassName] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null); // { student, className } pending unenroll
  const [removing, setRemoving] = useState(false);
  const [assignmentDeleteTarget, setAssignmentDeleteTarget] = useState(null); // assignment pending delete
  const [deletingAssignment, setDeletingAssignment] = useState(false);
  const [toast, setToast] = useState(''); // transient success message

  const cardCls = `rounded-2xl border-4 border-cyan-400/70 bg-indigo-950 text-cyan-50 shadow-[inset_0_0_24px_rgba(34,211,238,0.35),0_8px_0_rgba(0,0,0,0.4)]`;

  const classes = getClassesForTeacher(teacherId);
  const classCodes = classes.map((c) => c.code);
  const students = getStudentsForCodes(classCodes);

  const openCreate = () => {
    setNewClassName('');
    setCreateError('');
    setCreateOpen(true);
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    if (creating) return;
    const name = newClassName.trim() || `Class ${classes.length + 1}`;
    setCreating(true);
    setCreateError('');
    try {
      // addClass throws with the real Supabase message on failure (e.g. RLS).
      await addClass({ name, code: newJoinCode(), teacherId });
      setCreateOpen(false);
    } catch (err) {
      setCreateError(err?.message || 'Class creation failed. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = () => {
    if (deleteTarget) deleteClass(deleteTarget.id);
    setDeleteTarget(null);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const confirmDeleteAssignment = async () => {
    if (!assignmentDeleteTarget || deletingAssignment) return;
    setDeletingAssignment(true);
    try {
      await deleteAssignment(assignmentDeleteTarget.id);
      showToast('Assignment deleted.');
      setAssignmentDeleteTarget(null);
    } catch (err) {
      showToast(err?.message || 'Could not delete the assignment.');
    } finally {
      setDeletingAssignment(false);
    }
  };

  const confirmRemove = async () => {
    if (!removeTarget || removing) return;
    const { student } = removeTarget;
    setRemoving(true);
    try {
      await removeStudentFromClass(student.id, student.classCode);
      showToast(`${student.name} was removed from ${removeTarget.className}.`);
      setRemoveTarget(null);
    } catch (err) {
      showToast(err?.message || 'Could not remove student. Please try again.');
    } finally {
      setRemoving(false);
    }
  };

  // Live skill analytics: real accuracy per subject → sub-topic, aggregated
  // across this teacher's enrolled students. Topics with no attempts = "No Data Yet".
  const studentIdKey = students.map((s) => s.id).join(',');
  const skillData = useMemo(
    () => getClassSkillAnalytics(studentIdKey ? studentIdKey.split(',') : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recompute when roster or store changes
    [studentIdKey, storeVersion],
  );

  const analytics = useMemo(
    () =>
      SUBJECT_ORDER.map((subject) => ({
        subject,
        label: CURRICULUMS[subject]?.label ?? subject,
        categories: (SUBJECT_CATEGORIES[subject] ?? []).map((category) => {
          const stat = skillData[subject]?.[category];
          if (!stat || !stat.total) {
            return { category, pct: null, band: null };
          }
          const pct = Math.round((stat.correct / stat.total) * 100);
          return { category, pct, band: scoreBand(pct) };
        }),
      })),
    [skillData],
  );

  return (
    <div className="space-y-6">
      {/* ── Back to game ───────────────────────────────────────────────────── */}
      {onExit && (
        <div>
          <button
            type="button"
            onClick={onExit}
            className={`${neuBtn} bg-yellow-300 px-4 py-2 text-sm font-black text-black hover:bg-yellow-200`}
          >
            ← Back to Quest Map
          </button>
        </div>
      )}

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
                onClick={openCreate}
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
                {classes.map((c) => {
                  const count = students.filter((s) => s.classCode === c.code).length;
                  return (
                    <li
                      key={c.id}
                      className="flex items-center gap-2 rounded-xl border-4 border-black bg-white px-3 py-2 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <span className="text-sm font-black">{c.name}</span>
                      <span className="rounded-full border-2 border-black bg-yellow-300 px-2 py-0.5 text-xs font-black tracking-wider">
                        {c.code}
                      </span>
                      <span className="rounded-full border-2 border-black bg-cyan-200 px-2 py-0.5 text-[10px] font-black">
                        👥 {count}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(c)}
                        title={`Delete ${c.name}`}
                        className="rounded-lg border-2 border-black bg-red-400 px-2 py-1 text-[11px] font-black text-white hover:bg-red-500"
                      >
                        🗑️ Delete
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Per-class rosters */}
          {classes.length === 0 ? null : (
            classes.map((c) => {
              const classStudents = students.filter((s) => s.classCode === c.code);
              return (
                <div key={c.id} className={`${cardCls} overflow-hidden p-5`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-black">
                      {c.name} · {classStudents.length} student{classStudents.length === 1 ? '' : 's'}
                    </h2>
                    <span className="rounded-full border-2 border-black bg-yellow-300 px-2 py-0.5 text-xs font-black tracking-wider text-black">
                      {c.code}
                    </span>
                  </div>

                  {classStudents.length === 0 ? (
                    <p className="mt-3 rounded-xl border-2 border-dashed border-cyan-400/60 p-4 text-sm font-semibold opacity-80">
                      No students have joined yet. Share code{' '}
                      <span className="font-black text-yellow-300">{c.code}</span> with your class!
                    </p>
                  ) : (
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
                          {classStudents.map((s) => {
                            const accuracy = getAccuracy(s.id) || s.accuracy || 0;
                            const status = statusFor(accuracy);
                            return (
                              <tr key={`${s.id}-${s.classCode}`} className="align-middle">
                                <td className="border-b border-white/10 py-2 pr-3 font-bold">{s.name}</td>
                                <td className="border-b border-white/10 py-2 pr-3 opacity-90">
                                  {s.currentRealm ?? REALM_LABELS.math}
                                </td>
                                <td className="border-b border-white/10 py-2 pr-3 opacity-90">G{s.grade}</td>
                                <td className="border-b border-white/10 py-2 pr-3 font-black">{accuracy}%</td>
                                <td className="border-b border-white/10 py-2 pr-3">
                                  <span className={`rounded-full border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase ${status.cls}`}>
                                    {status.label}
                                  </span>
                                </td>
                                <td className="border-b border-white/10 py-2">
                                  <div className="flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => setStatsStudent(s)}
                                      title="Student Progress Report"
                                      className="rounded-lg border-2 border-black bg-white px-2 py-1 text-xs font-black text-black hover:bg-cyan-100"
                                    >
                                      📊 Stats
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setIepStudent(s)}
                                      title="IEP / Accommodations"
                                      className="rounded-lg border-2 border-black bg-white px-2 py-1 text-xs font-black text-black hover:bg-cyan-100"
                                    >
                                      ⚙️ IEP
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setRemoveTarget({ student: s, className: c.name })}
                                      title="Remove from class"
                                      className="rounded-lg border-2 border-black bg-red-400 px-2 py-1 text-xs font-black text-white hover:bg-red-500"
                                    >
                                      🗑️ Remove
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
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
                      {c.pct == null ? (
                        <span className={`rounded-full border-2 border-black px-2 py-0.5 text-[11px] font-black ${NO_DATA_BADGE}`}>
                          ⚪ No Data Yet
                        </span>
                      ) : (
                        <span className={`rounded-full border-2 border-black px-2 py-0.5 text-[11px] font-black ${c.band.cls}`}>
                          {c.band.dot} {c.pct}%
                        </span>
                      )}
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
        <div className="space-y-4">
          {classes.length === 0 ? (
            <div className={`${cardCls} p-5`}>
              <h2 className="text-lg font-black">🎯 Assignments & Focus Mode</h2>
              <p className="mt-2 text-sm font-semibold opacity-80">
                Create a class first (Roster tab) to publish assignments.
              </p>
            </div>
          ) : (
            classes.map((c) => {
              const assignments = getAssignmentsForCode(c.code);
              const classStudents = students.filter((s) => s.classCode === c.code);
              return (
                <div key={c.id} className={`${cardCls} p-5`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-black">
                      🎯 {c.name}{' '}
                      <span className="rounded-full border-2 border-black bg-yellow-300 px-2 py-0.5 text-xs tracking-wider text-black">
                        {c.code}
                      </span>
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setBuilderClassCode(c.code)}
                        className={`${neuBtn} bg-green-400 px-3 py-2 text-xs text-black hover:bg-green-300`}
                      >
                        ➕ Create Assignment
                      </button>
                      <button
                        type="button"
                        onClick={() => setReportClass({ code: c.code, name: c.name })}
                        className={`${neuBtn} bg-cyan-400 px-3 py-2 text-xs text-cyan-950 hover:bg-cyan-300`}
                      >
                        📊 View Weekly Report
                      </button>
                    </div>
                  </div>

                  {assignments.length === 0 ? (
                    <p className="mt-3 rounded-xl border-2 border-dashed border-cyan-400/60 p-4 text-sm font-semibold opacity-80">
                      No assignments yet — create one to target a realm & stage for this class.
                    </p>
                  ) : (
                    <ul className="mt-4 space-y-2">
                      {assignments.map((a) => (
                        <li
                          key={a.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-4 border-black bg-white px-4 py-3 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                          <div>
                            <p className="text-sm font-black">{a.title}</p>
                            <p className="text-xs font-semibold text-black/60">
                              {REALM_LABELS[a.realm] ?? a.realm} · G{a.grade} · Stage {a.stage} · Goal{' '}
                              {a.accuracyGoal}%
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black">
                              {a.focusMode ? '🔒 Focus ON' : 'Focus'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setAssignmentFocus(a.id, !a.focusMode)}
                              role="switch"
                              aria-checked={a.focusMode}
                              className={`relative h-7 w-12 shrink-0 rounded-full border-2 border-black transition-colors ${
                                a.focusMode ? 'bg-green-400' : 'bg-stone-300'
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full border-2 border-black bg-white transition-transform ${
                                  a.focusMode ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => setAssignmentDeleteTarget(a)}
                              title="Delete assignment"
                              className="rounded-lg border-2 border-black bg-red-400 px-2 py-1 text-xs font-black text-white hover:bg-red-500"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <p className="mt-3 text-xs font-semibold opacity-60">
                    Focus Mode locks this class&apos;s {classStudents.length} student
                    {classStudents.length === 1 ? '' : 's'} to only the assigned realm & stage on the
                    Quest Map.
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

      {iepStudent && (
        <AccommodationsModal student={iepStudent} onClose={() => setIepStudent(null)} />
      )}
      {statsStudent && (
        <StudentStatsModal student={statsStudent} onClose={() => setStatsStudent(null)} />
      )}
      {builderClassCode && (
        <AssignmentBuilderModal
          classCode={builderClassCode}
          onClose={() => setBuilderClassCode(null)}
        />
      )}
      {reportClass && (
        <WeeklyReportModal
          students={students.filter((s) => s.classCode === reportClass.code)}
          className={reportClass.name}
          onClose={() => setReportClass(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 rounded-xl border-4 border-black bg-green-400 px-4 py-2 text-sm font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          ✅ {toast}
        </div>
      )}

      {assignmentDeleteTarget && (
        <div
          className="fixed inset-0 z-[190] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm assignment deletion"
        >
          <div className="w-full max-w-md rounded-2xl border-4 border-black bg-white p-6 text-center text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-black bg-red-400 text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              🗑️
            </div>
            <h2 className="mt-3 text-xl font-black">Delete Assignment?</h2>
            <p className="mt-2 text-sm font-semibold text-black/70">
              Are you sure you want to delete{' '}
              <span className="font-black text-black">{assignmentDeleteTarget.title}</span>? Students
              will no longer see it.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAssignmentDeleteTarget(null)}
                className={`${neuBtn} bg-white px-4 py-2.5 text-sm text-black hover:bg-stone-100`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAssignment}
                disabled={deletingAssignment}
                className={`${neuBtn} bg-red-500 px-4 py-2.5 text-sm text-white hover:bg-red-600 disabled:opacity-50`}
              >
                {deletingAssignment ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {removeTarget && (
        <div
          className="fixed inset-0 z-[190] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm student removal"
        >
          <div className="w-full max-w-md rounded-2xl border-4 border-black bg-white p-6 text-center text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-black bg-red-400 text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              🗑️
            </div>
            <h2 className="mt-3 text-xl font-black">Remove Student?</h2>
            <p className="mt-2 text-sm font-semibold text-black/70">
              Are you sure you want to remove{' '}
              <span className="font-black text-black">{removeTarget.student.name}</span> from{' '}
              <span className="font-black text-black">{removeTarget.className}</span>? This will not
              delete the student&apos;s global account.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRemoveTarget(null)}
                className={`${neuBtn} bg-white px-4 py-2.5 text-sm text-black hover:bg-stone-100`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                disabled={removing}
                className={`${neuBtn} bg-red-500 px-4 py-2.5 text-sm text-white hover:bg-red-600 disabled:opacity-50`}
              >
                {removing ? 'Removing…' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div
          className="fixed inset-0 z-[190] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Create a new class"
        >
          <form
            onSubmit={submitCreate}
            className="w-full max-w-md rounded-2xl border-4 border-black bg-white p-6 text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-black bg-green-400 text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              🏫
            </div>
            <h2 className="mt-3 text-center text-xl font-black">Create New Class</h2>
            <p className="mt-1 text-center text-sm font-semibold text-black/70">
              Give your class a name — students will join with the code we generate.
            </p>

            <label className="mt-4 block">
              <span className="text-[11px] font-bold uppercase tracking-wide text-black/60">
                Classroom Name
              </span>
              <input
                type="text"
                value={newClassName}
                onChange={(e) => {
                  setNewClassName(e.target.value);
                  if (createError) setCreateError('');
                }}
                placeholder="e.g. Mrs. Smith's 1st Grade"
                autoFocus
                className="mt-1 w-full rounded-xl border-4 border-black bg-white px-3 py-2.5 text-sm font-bold text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] outline-none focus:bg-lime-50"
              />
            </label>

            {createError && (
              <p className="mt-3 rounded-xl border-2 border-black bg-red-100 px-3 py-2 text-xs font-black text-red-700">
                ⚠️ {createError}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className={`${neuBtn} bg-white px-4 py-2.5 text-sm text-black hover:bg-stone-100`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className={`${neuBtn} bg-green-400 px-4 py-2.5 text-sm text-black hover:bg-green-300 disabled:opacity-50`}
              >
                {creating ? 'Creating…' : 'Create Class'}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[190] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm class deletion"
        >
          <div className="w-full max-w-md rounded-2xl border-4 border-black bg-white p-6 text-center text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-black bg-red-400 text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              🗑️
            </div>
            <h2 className="mt-3 text-xl font-black">Delete Class?</h2>
            <p className="mt-2 text-sm font-semibold text-black/70">
              Are you sure you want to delete{' '}
              <span className="font-black text-black">{deleteTarget.name}</span> (
              <span className="font-black text-black">{deleteTarget.code}</span>)? This will remove the
              class from your dashboard, unlink enrolled students, and purge class roster records in
              compliance with data retention policies.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className={`${neuBtn} bg-white px-4 py-2.5 text-sm text-black hover:bg-stone-100`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className={`${neuBtn} bg-red-500 px-4 py-2.5 text-sm text-white hover:bg-red-600`}
              >
                Yes, Delete Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}