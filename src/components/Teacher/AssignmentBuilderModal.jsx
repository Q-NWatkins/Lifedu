import { useState } from 'react';
import { addAssignment, SUBJECT_ORDER, REALM_LABELS } from '../../utils/classroomStore.js';
import { MAX_GRADE } from '../../config/mapRegistry.js';
import { neuBtn } from '../../styles/neubrutalism.js';

const GRADES = Array.from({ length: MAX_GRADE }, (_, i) => i + 1);
const STAGES = [1, 2, 3, 4, 5];

/**
 * Assignment Builder — publishes a targeted assignment (realm/grade/stage +
 * accuracy goal) to the selected class. Toggling Focus Mode on an assignment
 * later restricts that class's students to exactly this realm + stage.
 */
export default function AssignmentBuilderModal({ classCode, onClose, onPublished }) {
  const [title, setTitle] = useState('');
  const [realm, setRealm] = useState('math');
  const [grade, setGrade] = useState(1);
  const [stage, setStage] = useState(1);
  const [accuracyGoal, setAccuracyGoal] = useState(80);

  const publish = (e) => {
    e.preventDefault();
    const asg = addAssignment({
      classCode,
      title: title.trim() || `${REALM_LABELS[realm]} Sprint`,
      realm,
      grade: Number(grade),
      stage: Number(stage),
      accuracyGoal: Number(accuracyGoal),
    });
    onPublished?.(asg);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[180] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Create assignment"
    >
      <form
        onSubmit={publish}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border-4 border-cyan-400/70 bg-indigo-950 p-6 text-cyan-50 shadow-[inset_0_0_24px_rgba(34,211,238,0.35),0_8px_0_rgba(0,0,0,0.4)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black">➕ Create Assignment</h2>
            <p className="text-xs font-semibold opacity-70">Class {classCode}</p>
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

        <label className="mt-4 block">
          <span className="text-[11px] font-bold uppercase tracking-wide opacity-70">Assignment Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Grade 1 Math Sprint"
            className="mt-1 w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-sm font-bold text-black"
          />
        </label>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide opacity-70">Target Realm</span>
            <select
              value={realm}
              onChange={(e) => setRealm(e.target.value)}
              className="mt-1 w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-sm font-bold capitalize text-black"
            >
              {SUBJECT_ORDER.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide opacity-70">Grade Level</span>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="mt-1 w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-sm font-bold text-black"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>G{g}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide opacity-70">Target Stage</span>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="mt-1 w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-sm font-bold text-black"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>Stage {s}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide opacity-70">Accuracy Goal</span>
            <div className="mt-1 flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3 py-2 text-black">
              <input
                type="number"
                min="10"
                max="100"
                value={accuracyGoal}
                onChange={(e) => setAccuracyGoal(e.target.value)}
                className="w-full text-sm font-black outline-none"
              />
              <span className="text-sm font-black">%</span>
            </div>
          </label>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <button
            type="submit"
            className={`${neuBtn} flex-1 bg-green-400 px-4 py-2.5 text-sm text-black hover:bg-green-300`}
          >
            Publish Assignment
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`${neuBtn} bg-white px-4 py-2.5 text-sm text-black hover:bg-stone-100`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}