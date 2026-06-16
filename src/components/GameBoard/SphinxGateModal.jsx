import { useState } from 'react';
import { neuCard } from '../../styles/neubrutalism.js';

/**
 * Sphinx Gate — a gatekeeper fork. Instead of freely choosing a path, the player
 * must answer a challenging question from the active stage's bank:
 *   - Correct → routed down the SHORT-CUT branch.
 *   - Wrong   → routed down the long DETOUR branch.
 */
export default function SphinxGateModal({ question, guardian, onResolve }) {
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);

  if (!question) return null;

  const keeper = guardian ?? { emoji: '🦁', name: 'The Sphinx' };

  const choose = (i) => {
    if (locked) return;
    setLocked(true);
    setSelected(i);
    const correct = i === question.correctIndex;
    setTimeout(() => onResolve(correct), 850);
  };

  const optionStyle = (i) => {
    if (!locked) return 'bg-white text-black hover:bg-amber-50';
    if (i === question.correctIndex) return 'bg-green-400 text-black';
    if (i === selected) return 'bg-red-400 text-white';
    return 'bg-white text-black opacity-50';
  };

  const verdict =
    locked && selected != null
      ? selected === question.correctIndex
        ? '✅ Correct — taking the SHORT-CUT!'
        : '❌ Wrong — down the long DETOUR…'
      : null;

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/75 p-4">
      <div className={`w-full max-w-sm ${neuCard} bg-white p-6`}>
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-black bg-amber-400 text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {keeper.emoji}
          </div>
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-amber-700">
            Gatekeeper Challenge
          </p>
          <h3 className="mt-1 text-lg font-black text-black">{keeper.name} blocks the path!</h3>
          <p className="mt-1 text-xs font-semibold text-black/60">
            Answer correctly to cross the 🌈 short-cut — miss it and take the long detour.
          </p>
        </div>

        {verdict && (
          <p
            className={`mt-3 rounded-lg border-2 border-black px-3 py-1 text-center text-xs font-black ${
              selected === question.correctIndex ? 'bg-green-400 text-black' : 'bg-red-500 text-white'
            }`}
          >
            {verdict}
          </p>
        )}

        <h4 className="mt-4 text-base font-black leading-snug text-black">{question.prompt}</h4>

        <div className="mt-3 grid gap-2">
          {question.options.map((option, i) => (
            <button
              key={option}
              type="button"
              disabled={locked}
              onClick={() => choose(i)}
              className={`neu-btn px-4 py-3 text-left text-sm font-bold ${optionStyle(i)} disabled:cursor-default`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}