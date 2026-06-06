import { useCallback, useMemo, useState } from 'react';
import { getBossQuestions } from '../../data/questions/index.js';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { neuBtn, neuCard } from '../../styles/neubrutalism.js';
import DefeatScreen from './DefeatScreen.jsx';
import VictoryScreen from './VictoryScreen.jsx';

const PHASE = { INTRO: 'intro', BATTLE: 'battle', VICTORY: 'victory', DEFEAT: 'defeat' };
const BOSS_MAX_HP = 100;
const BOSS_DAMAGE = 20;
const STARTING_HEARTS = 3;

function HeartDisplay({ hearts }) {
  return (
    <div className="flex gap-1" aria-label={`${hearts} hearts remaining`}>
      {Array.from({ length: STARTING_HEARTS }, (_, i) => (
        <span key={i} className={`text-2xl ${i < hearts ? '' : 'opacity-25 grayscale'}`}>
          ❤️
        </span>
      ))}
    </div>
  );
}

export default function BossBattle({
  course,
  palette,
  onVictoryComplete,
  onDefeatComplete,
  onMegaRoll,
}) {
  const { completeCourse } = usePlayerProgress();

  const questions = useMemo(
    () => getBossQuestions(course.questionBankId, 5),
    [course.questionBankId],
  );

  const [phase, setPhase] = useState(PHASE.INTRO);
  const [bossHp, setBossHp] = useState(BOSS_MAX_HP);
  const [hearts, setHearts] = useState(STARTING_HEARTS);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [turnCount, setTurnCount] = useState(0);

  const currentQuestion = questions[questionIndex % questions.length];
  const boss = course.boss;
  const badgeLabel =
    course.rewards?.completionBadge?.replace('badge-', '').replace(/-/g, ' ') ?? 'Course Champion';

  const continueBattle = useCallback(() => {
    setQuestionIndex((i) => i + 1);
    setTurnCount((t) => t + 1);
    setSelectedIndex(null);
    setIsLocked(false);
  }, []);

  const handleAnswer = useCallback(
    (optionIndex) => {
      if (isLocked || !currentQuestion || phase !== PHASE.BATTLE) return;

      setIsLocked(true);
      setSelectedIndex(optionIndex);

      const isCorrect = optionIndex === currentQuestion.correctIndex;

      setTimeout(() => {
        if (isCorrect) {
          setBossHp((hp) => {
            const next = Math.max(0, hp - BOSS_DAMAGE);
            if (next <= 0) {
              setPhase(PHASE.VICTORY);
            } else {
              continueBattle();
            }
            return next;
          });
        } else {
          setHearts((h) => {
            const next = h - 1;
            if (next <= 0) {
              setPhase(PHASE.DEFEAT);
            } else {
              continueBattle();
            }
            return next;
          });
        }
      }, 700);
    },
    [continueBattle, currentQuestion, isLocked, phase],
  );

  const handleVictoryContinue = useCallback(() => {
    completeCourse({
      courseId: course.id,
      curriculumId: course.curriculumId,
      badgeId: course.rewards?.completionBadge ?? `badge-${course.id}`,
      badgeLabel: badgeLabel.replace(/\b\w/g, (c) => c.toUpperCase()),
      skillGain: 15,
    });
    onMegaRoll?.();
    onVictoryComplete?.();
  }, [badgeLabel, completeCourse, course, onMegaRoll, onVictoryComplete]);

  const bossHpPercent = (bossHp / BOSS_MAX_HP) * 100;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-red-200 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Boss battle against ${boss.name}`}
    >
      <div className={`relative w-full max-w-lg ${neuCard} bg-white p-6 sm:p-8`}>
        {phase === PHASE.INTRO && (
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-red-600">
              Boss Battle
            </p>
            <div className="mx-auto mt-4 flex h-28 w-28 items-center justify-center rounded-xl border-4 border-black bg-red-500 text-5xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
              👹
            </div>
            <h2 className="mt-4 text-2xl font-black text-black">{boss.name}</h2>
            <p className="mt-2 text-sm font-semibold text-black/70">{boss.description}</p>
            <p className="mt-4 text-sm font-semibold text-black/70">
              Answer questions to deal <strong className="text-black">20 damage</strong> each hit.
              You have <strong className="text-black">3 hearts</strong>. Defeat the boss to earn a{' '}
              <strong className="text-black">Mega Roll</strong> bonus!
            </p>
            <button
              type="button"
              onClick={() => setPhase(PHASE.BATTLE)}
              className={`${neuBtn} mt-8 bg-red-500 px-8 py-3 text-white hover:bg-red-400`}
            >
              Start Battle!
            </button>
          </div>
        )}

        {phase === PHASE.BATTLE && currentQuestion && (
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Boss card */}
              <div className={`${neuCard} bg-red-100 p-4`}>
                <p className="text-xs font-black uppercase text-red-700">Boss</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-4xl">👹</span>
                  <div>
                    <p className="font-black text-black">{boss.name}</p>
                    <p className="text-xs font-bold text-black/60">HP {bossHp}/{BOSS_MAX_HP}</p>
                  </div>
                </div>
                <div className="mt-3 h-5 overflow-hidden rounded-lg border-4 border-black bg-stone-200">
                  <div
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${bossHpPercent}%` }}
                  />
                </div>
              </div>

              {/* Player card */}
              <div className={`${neuCard} bg-sky-100 p-4`}>
                <p className="text-xs font-black uppercase text-sky-700">You</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-4xl">♟️</span>
                  <div>
                    <p className="font-black text-black">Hero</p>
                    <HeartDisplay hearts={hearts} />
                  </div>
                </div>
                <p className="mt-3 text-xs font-bold text-black/60">Turn {turnCount + 1}</p>
              </div>
            </div>

            <h3 className="mt-6 text-lg font-black leading-snug text-black">
              {currentQuestion.prompt}
            </h3>

            <div className="mt-4 grid gap-3">
              {currentQuestion.options.map((option, index) => {
                let style = 'bg-white text-black hover:bg-lime-100';

                if (isLocked && index === currentQuestion.correctIndex) {
                  style = 'bg-green-400 text-black';
                } else if (
                  isLocked &&
                  index === selectedIndex &&
                  index !== currentQuestion.correctIndex
                ) {
                  style = 'bg-red-400 text-black';
                }

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={isLocked}
                    onClick={() => handleAnswer(index)}
                    className={`neu-btn px-4 py-3 text-left text-sm ${style} disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {phase === PHASE.VICTORY && (
          <VictoryScreen
            bossName={boss.name}
            badgeLabel={badgeLabel.replace(/\b\w/g, (c) => c.toUpperCase())}
            onContinue={handleVictoryContinue}
            megaRollBonus={3}
          />
        )}

        {phase === PHASE.DEFEAT && (
          <DefeatScreen bossName={boss.name} heartsLost={STARTING_HEARTS} onRetry={onDefeatComplete} />
        )}
      </div>
    </div>
  );
}
