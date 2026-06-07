import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { getRandomQuestion } from '../../data/questions/multiSubject.js';
import { rollLoot } from '../../systems/lootSystem.js';
import { ItemSprite } from '../../assets/gameSprites.jsx';
import {
  WHEEL_SEGMENTS,
  SEGMENT_ANGLE,
  buildWheelGradient,
  rollSegmentIndex,
} from '../../systems/wheelRewards.js';
import { btn3d, neuBtn } from '../../styles/neubrutalism.js';
import Confetti from '../common/Confetti.jsx';

const DAY_MS = 24 * 60 * 60 * 1000;
const QUESTION_SECONDS = 12;
const SPIN_MS = 3400;

const PHASE = { GATE: 'gate', QUESTION: 'question', SPINNING: 'spinning', REWARD: 'reward' };

function formatCountdown(ms) {
  const totalMin = Math.max(0, Math.ceil(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function DailyTriviaWheel() {
  const { lastSpinAt, recordDailySpin, addGems, addStepCards, addToInventory } = usePlayerProgress();

  const gradient = useMemo(() => buildWheelGradient(), []);
  const timers = useRef([]);
  const tick = useRef(null);

  const [now, setNow] = useState(Date.now());
  const [phase, setPhase] = useState(PHASE.GATE);
  const [question, setQuestion] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_SECONDS);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [reward, setReward] = useState(null);

  const canSpin = !lastSpinAt || now - lastSpinAt >= DAY_MS;
  const cooldownMs = lastSpinAt ? DAY_MS - (now - lastSpinAt) : 0;

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (tick.current) clearInterval(tick.current);
    tick.current = null;
  }, []);

  // Keep the cooldown label fresh while gated.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => clearAll, [clearAll]);

  const askQuestion = useCallback(() => {
    setQuestion(getRandomQuestion());
    setSecondsLeft(QUESTION_SECONDS);
    setLocked(false);
    setFeedback(null);
  }, []);

  const startSpin = useCallback(() => {
    if (!canSpin) return;
    setPhase(PHASE.QUESTION);
    askQuestion();
  }, [canSpin, askQuestion]);

  const applyReward = useCallback(
    (segment) => {
      if (segment.kind === 'gems') {
        addGems(segment.amount);
        setReward({ ...segment, detail: `${segment.amount} gems added!` });
      } else if (segment.kind === 'steps') {
        addStepCards(segment.amount);
        setReward({ ...segment, detail: `${segment.amount} bonus movement cards!` });
      } else {
        const item = rollLoot();
        addToInventory(item);
        setReward({ ...segment, item, detail: `${item.name} sent to your backpack!` });
      }
    },
    [addGems, addStepCards, addToInventory],
  );

  const spinToReward = useCallback(() => {
    const index = rollSegmentIndex();
    const segment = WHEEL_SEGMENTS[index];
    // Land the chosen slice under the top pointer (+ a few full turns).
    const target = 360 * 5 - (index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2);
    setRotation(target);
    setPhase(PHASE.SPINNING);

    timers.current.push(
      setTimeout(() => {
        applyReward(segment);
        recordDailySpin();
        setNow(Date.now());
        setPhase(PHASE.REWARD);
      }, SPIN_MS),
    );
  }, [applyReward, recordDailySpin]);

  const handleAnswer = useCallback(
    (i) => {
      if (locked || !question) return;
      setLocked(true);
      const correct = i === question.correctIndex;
      setFeedback(correct ? 'correct' : 'wrong');

      timers.current.push(
        setTimeout(() => {
          if (correct) spinToReward();
          else askQuestion(); // supportive retry, doesn't burn the daily spin
        }, 800),
      );
    },
    [locked, question, spinToReward, askQuestion],
  );

  // High-speed countdown during the question phase.
  useEffect(() => {
    if (phase !== PHASE.QUESTION || locked) return undefined;
    tick.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(tick.current);
          tick.current = null;
          setLocked(true);
          setFeedback('timeout');
          timers.current.push(setTimeout(() => askQuestion(), 800));
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (tick.current) clearInterval(tick.current);
      tick.current = null;
    };
  }, [phase, locked, question, askQuestion]);

  const closeReward = useCallback(() => {
    setReward(null);
    setPhase(PHASE.GATE);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border-4 border-black bg-gradient-to-br from-fuchsia-300 via-violet-300 to-sky-300 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-black">🎡 Daily Trivia Wheel</h2>
        <span className="rounded-full border-2 border-black bg-white px-2 py-0.5 text-[10px] font-black text-black">
          1 free spin / day
        </span>
      </div>

      <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center">
        {/* ── The wheel ─────────────────────────────────────────────────────── */}
        <div className="relative h-44 w-44 shrink-0">
          {/* Pointer */}
          <div className="absolute -top-1 left-1/2 z-20 h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[18px] border-x-transparent border-t-black" />
          <div
            className="absolute inset-0 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            style={{
              background: gradient,
              transform: `rotate(${rotation}deg)`,
              transition: phase === PHASE.SPINNING ? `transform ${SPIN_MS}ms cubic-bezier(0.17,0.67,0.21,1)` : 'none',
            }}
          >
            {WHEEL_SEGMENTS.map((seg, i) => (
              <span
                key={seg.id}
                className="absolute left-1/2 top-1/2 text-lg"
                style={{
                  transform: `rotate(${i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2}deg) translateY(-66px) translateX(-50%)`,
                  transformOrigin: '0 0',
                }}
              >
                {seg.emoji}
              </span>
            ))}
          </div>
          {/* Hub cap */}
          <div className="absolute left-1/2 top-1/2 z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-black bg-white" />
        </div>

        {/* ── Right side: state-dependent UI ────────────────────────────────── */}
        <div className="w-full max-w-xs text-center sm:text-left">
          {phase === PHASE.GATE && (
            <>
              {canSpin ? (
                <>
                  <p className="text-sm font-bold text-black/80">
                    Answer one speedy question to earn a spin for gems, loot, or step cards!
                  </p>
                  <button
                    type="button"
                    onClick={startSpin}
                    className={`${btn3d} mt-3 px-6 py-2.5`}
                  >
                    Spin to Win!
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-black/80">
                    You&apos;ve used today&apos;s spin. ⭐ Come back soon!
                  </p>
                  <p className="mt-2 inline-block rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black text-black">
                    Next spin in {formatCountdown(cooldownMs)}
                  </p>
                </>
              )}
            </>
          )}

          {phase === PHASE.QUESTION && question && (
            <div className="rounded-xl border-4 border-black bg-white p-3 text-left">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wide text-black/60">
                <span>{question.subject}</span>
                <span className={secondsLeft <= 4 ? 'text-red-600' : ''}>⏱ {secondsLeft}s</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full bg-red-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${(secondsLeft / QUESTION_SECONDS) * 100}%` }}
                />
              </div>

              <p className="mt-2 text-sm font-black text-black">{question.prompt}</p>

              {feedback && (
                <p
                  className={`mt-2 rounded-lg border-2 border-black px-2 py-0.5 text-center text-xs font-black ${
                    feedback === 'correct' ? 'bg-green-400 text-black' : 'bg-red-400 text-white'
                  }`}
                >
                  {feedback === 'correct' ? '✅ Spinning!' : feedback === 'timeout' ? '⏱ Too slow — new question!' : '❌ Try this one!'}
                </p>
              )}

              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {question.options.map((option, i) => (
                  <button
                    key={option}
                    type="button"
                    disabled={locked}
                    onClick={() => handleAnswer(i)}
                    className="neu-btn bg-lime-100 px-2 py-1.5 text-xs text-black hover:bg-lime-200 disabled:opacity-60"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === PHASE.SPINNING && (
            <p className="animate-pulse text-base font-black text-black">🎉 Round and round it goes…</p>
          )}

          {phase === PHASE.REWARD && reward && (
            <div className="relative rounded-xl border-4 border-black bg-white p-3">
              <Confetti />
              <p className="text-[10px] font-black uppercase tracking-widest text-fuchsia-700">
                You won!
              </p>
              <p className="mt-1 flex justify-center text-2xl">
                {reward.item ? (
                  <ItemSprite category={reward.item.category} className="h-10 w-10" />
                ) : (
                  reward.emoji
                )}
              </p>
              <p className="text-base font-black text-black">{reward.label}</p>
              <p className="text-xs font-bold text-black/60">{reward.detail}</p>
              <button
                type="button"
                onClick={closeReward}
                className={`${neuBtn} mt-3 bg-green-400 px-5 py-2 text-sm text-black hover:bg-green-300`}
              >
                Collect!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
