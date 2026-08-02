import { useState } from 'react';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { neuBtn } from '../../styles/neubrutalism.js';

/**
 * Student "Join Classroom" modal. Takes a teacher's class code, normalizes it
 * (trim + uppercase), saves it to the student's progress, and confirms so their
 * teacher can associate their quest progress.
 */
export default function JoinClassModal({ onClose }) {
  const { classCode, joinClass } = usePlayerProgress();
  const [code, setCode] = useState('');
  const [joined, setJoined] = useState(null); // normalized code once joined

  const handleJoin = (e) => {
    e.preventDefault();
    const normalized = joinClass(code);
    if (normalized) setJoined(normalized);
  };

  return (
    <div
      className="fixed inset-0 z-[170] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Join your teacher's classroom"
    >
      <div className="w-full max-w-sm rounded-2xl border-4 border-black bg-white p-6 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {joined ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-black bg-green-400 text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              ✅
            </div>
            <h2 className="mt-3 text-xl font-black text-black">Joined Class!</h2>
            <p className="mt-1 text-sm font-semibold text-black/70">
              Your teacher can now view your quest progress.
            </p>
            <p className="mt-3 inline-block rounded-full border-2 border-black bg-yellow-300 px-3 py-1 text-xs font-black tracking-wider text-black">
              {joined}
            </p>
            <button
              type="button"
              onClick={onClose}
              className={`${neuBtn} mt-5 w-full bg-green-400 px-4 py-2.5 text-sm text-black hover:bg-green-300`}
            >
              Done
            </button>
          </>
        ) : (
          <form onSubmit={handleJoin}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-black bg-cyan-300 text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              🏫
            </div>
            <h2 className="mt-3 text-xl font-black text-black">Join Your Teacher&apos;s Classroom</h2>
            <p className="mt-1 text-sm font-semibold text-black/70">
              Enter the class code your teacher gave you.
            </p>
            {classCode && (
              <p className="mt-2 text-xs font-bold text-black/50">
                Currently joined: <span className="font-black text-black">{classCode}</span>
              </p>
            )}

            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. QUEST-61"
              autoFocus
              className="mt-4 w-full rounded-xl border-4 border-black bg-white px-3 py-2.5 text-center text-lg font-black uppercase tracking-widest text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] outline-none focus:bg-lime-50"
            />

            <div className="mt-5 grid gap-2">
              <button
                type="submit"
                disabled={!code.trim()}
                className={`${neuBtn} bg-cyan-400 px-4 py-2.5 text-sm text-cyan-950 hover:bg-cyan-300 disabled:opacity-50`}
              >
                Join Class
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
        )}
      </div>
    </div>
  );
}