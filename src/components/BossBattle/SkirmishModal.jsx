import { useCallback, useEffect, useState } from 'react';
import { getQuestionsForDifficulty } from '../../data/questions/multiSubject.js';
import { getStageQuestionPools } from '../../data/questions/index.js';
import { useGameAudio } from '../../context/AudioContext.jsx';
import { neuBtn, neuCard } from '../../styles/neubrutalism.js';

const PHASE = { INTRO: 'intro', BATTLE: 'battle', VICTORY: 'victory' };

/**
 * Lightweight skirmish used for two kinds of obstacle nodes:
 *
 *  - Mini-Boss (mandatory): a quick gate the player MUST clear to unlock the
 *    rest of the path. No skip option.
 *  - Side-Boss (optional): found on the long branch; clearing it awards a
 *    permanent special Combat Action Card. Can be skipped.
 *
 * Questions must all be answered correctly to win; a wrong answer is supportive
 * (re-ask, no penalty) since these are pacing gates, not life-or-death battles.
 */
export default function SkirmishModal({
  kind = 'mini',
  node,
  questionCount = 2,
  difficulty,
  questionBankId,
  rewardLabel,
  onWin,
  onSkip,
}) {
  const isSide = kind === 'side';
  const tier = difficulty ?? (isSide ? 'hard' : 'easy');

  const { switchTrack } = useGameAudio();

  // Side/mini-boss skirmish → sideBoss theme; restore the gameboard map theme
  // when the overlay closes.
  useEffect(() => {
    switchTrack('sideBoss');
    return () => switchTrack('gameboard');
  }, [switchTrack]);

  // Prefer the active stage's bank for this tier; fall back to multi-subject.
  const [questions] = useState(() => {
    const bankTier = getStageQuestionPools(questionBankId)[tier];
    const pool = bankTier ?? getQuestionsForDifficulty(tier);
    return pool.slice(0, questionCount);
  });
  const [phase, setPhase] = useState(PHASE.INTRO);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const accent = isSide
    ? { bg: 'bg-purple-200', chip: 'text-purple-700', btn: 'bg-purple-500 text-white hover:bg-purple-400', emoji: '🗡️' }
    : { bg: 'bg-orange-200', chip: 'text-orange-700', btn: 'bg-orange-500 text-white hover:bg-orange-400', emoji: '👺' };

  const question = questions[qIndex];

  const handleAnswer = useCallback(
    (i) => {
      if (locked || !question) return;
      setLocked(true);
      setSelected(i);
      const correct = i === question.correctIndex;
      setFeedback(correct ? 'correct' : 'wrong');

      setTimeout(() => {
        if (correct) {
          if (qIndex + 1 >= questions.length) {
            setPhase(PHASE.VICTORY);
          } else {
            setQIndex((n) => n + 1);
            setSelected(null);
            setLocked(false);
            setFeedback(null);
          }
        } else {
          // Supportive retry — same question, no penalty.
          setSelected(null);
          setLocked(false);
          setFeedback(null);
        }
      }, 800);
    },
    [locked, question, qIndex, questions.length],
  );

  return (
    <div
      className="fixed inset-0 z-[190] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${isSide ? 'Side' : 'Mini'} boss encounter`}
    >
      <div className={`relative w-full max-w-md ${neuCard} ${accent.bg} p-6`}>
        {/* ── Intro ─────────────────────────────────────────────────────────── */}
        {phase === PHASE.INTRO && (
          <div className="text-center">
            <p className={`text-xs font-black uppercase tracking-[0.3em] ${accent.chip}`}>
              {isSide ? 'Side-Boss · Optional' : 'Mini-Boss · Blocks the Path'}
            </p>
            <div className="mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-black bg-white text-5xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              {accent.emoji}
            </div>
            <h2 className="mt-4 text-2xl font-black text-black">
              {isSide ? 'A Side-Boss appears!' : 'A Mini-Boss blocks the way!'}
            </h2>
            <p className="mt-2 text-sm font-semibold text-black/70">
              {isSide
                ? `Win a ${questionCount}-question duel to claim a special card: `
                : `Answer ${questionCount} questions correctly to unlock the rest of the path.`}
              {isSide && <strong className="text-black">{rewardLabel}</strong>}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => setPhase(PHASE.BATTLE)}
                className={`${neuBtn} px-6 py-3 ${accent.btn}`}
              >
                {isSide ? 'Challenge!' : 'Fight!'}
              </button>
              {isSide && onSkip && (
                <button
                  type="button"
                  onClick={onSkip}
                  className={`${neuBtn} bg-white px-6 py-3 text-black hover:bg-stone-100`}
                >
                  Skip for now
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Battle ────────────────────────────────────────────────────────── */}
        {phase === PHASE.BATTLE && question && (
          <div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-black uppercase tracking-widest ${accent.chip}`}>
                {accent.emoji} {isSide ? 'Side-Boss' : 'Mini-Boss'}
              </span>
              <span className="rounded-full border-2 border-black bg-white px-2 py-0.5 text-[10px] font-black">
                Q {qIndex + 1}/{questions.length}
              </span>
            </div>

            {feedback && (
              <p
                className={`mt-3 rounded-lg border-2 border-black px-3 py-1 text-center text-sm font-black ${
                  feedback === 'correct' ? 'bg-green-400 text-black' : 'bg-red-400 text-white'
                }`}
              >
                {feedback === 'correct' ? '✅ Correct!' : '❌ Try again!'}
              </p>
            )}

            <h3 className="mt-4 text-lg font-black leading-snug text-black">{question.prompt}</h3>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-black/50">
              {question.subject} · {question.difficulty}
            </p>

            <div className="mt-4 grid gap-2">
              {question.options.map((option, i) => {
                let style = 'bg-white text-black hover:bg-yellow-50';
                if (locked && i === question.correctIndex) style = 'bg-green-400 text-black';
                else if (locked && i === selected) style = 'bg-red-400 text-white';

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={locked}
                    onClick={() => handleAnswer(i)}
                    className={`neu-btn px-4 py-3 text-left text-sm ${style} disabled:cursor-default`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Victory ───────────────────────────────────────────────────────── */}
        {phase === PHASE.VICTORY && (
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-black bg-yellow-300 text-4xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              {isSide ? '⚡' : '🎉'}
            </div>
            <h2 className="mt-4 text-2xl font-black text-black">
              {isSide ? 'Side-Boss Defeated!' : 'Path Unlocked!'}
            </h2>
            {isSide ? (
              <p className="mt-2 text-sm font-semibold text-black/70">
                You earned a permanent card: <strong className="text-black">{rewardLabel}</strong>. It
                joins your hand in every boss battle!
              </p>
            ) : (
              <p className="mt-2 text-sm font-semibold text-black/70">
                The way forward is clear — keep rolling toward the boss!
              </p>
            )}

            <button
              type="button"
              onClick={onWin}
              className={`${neuBtn} mt-6 px-8 py-3 ${accent.btn}`}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
