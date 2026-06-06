import { useCallback, useMemo, useState } from 'react';
import { BOSS_PASS_THRESHOLD, BOSS_QUESTION_COUNT, getBossQuestions } from '../../data/questions/index.js';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import DefeatScreen from './DefeatScreen.jsx';
import VictoryScreen from './VictoryScreen.jsx';

const PHASE = {
  INTRO: 'intro',
  QUIZ: 'quiz',
  VICTORY: 'victory',
  DEFEAT: 'defeat',
};

export default function BossBattle({
  course,
  palette,
  onVictoryComplete,
  onDefeatComplete,
}) {
  const { completeCourse } = usePlayerProgress();

  const questions = useMemo(
    () => getBossQuestions(course.questionBankId, BOSS_QUESTION_COUNT),
    [course.questionBankId],
  );

  const [phase, setPhase] = useState(PHASE.INTRO);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isLocked, setIsLocked] = useState(false);

  const currentQuestion = questions[questionIndex];
  const boss = course.boss;
  const badgeLabel = course.rewards?.completionBadge?.replace('badge-', '').replace(/-/g, ' ') ?? 'Course Champion';

  const handleAnswer = useCallback(
    (optionIndex) => {
      if (isLocked || !currentQuestion) return;

      setIsLocked(true);
      setSelectedIndex(optionIndex);

      const isCorrect = optionIndex === currentQuestion.correctIndex;
      const isLast = questionIndex >= questions.length - 1;

      setTimeout(() => {
        setScore((prev) => {
          const nextScore = isCorrect ? prev + 1 : prev;

          if (isLast) {
            const passed = nextScore / questions.length >= BOSS_PASS_THRESHOLD;
            setPhase(passed ? PHASE.VICTORY : PHASE.DEFEAT);
          }

          return nextScore;
        });

        if (!isLast) {
          setQuestionIndex((i) => i + 1);
          setSelectedIndex(null);
          setIsLocked(false);
        }
      }, 600);
    },
    [currentQuestion, isLocked, questionIndex, questions.length],
  );

  const handleVictoryContinue = useCallback(() => {
    completeCourse({
      courseId: course.id,
      curriculumId: course.curriculumId,
      badgeId: course.rewards?.completionBadge ?? `badge-${course.id}`,
      badgeLabel: badgeLabel.replace(/\b\w/g, (c) => c.toUpperCase()),
      skillGain: 15,
    });
    onVictoryComplete?.();
  }, [badgeLabel, completeCourse, course, onVictoryComplete]);

  return (
    <div
      className={`
        fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto
        bg-gradient-to-br from-black/90 via-stone-950 to-black/95 p-4
      `}
      role="dialog"
      aria-modal="true"
      aria-label={`Boss battle against ${boss.name}`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-64 w-64 animate-pulse rounded-full bg-red-600/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-64 w-64 animate-pulse rounded-full bg-orange-500/15 blur-3xl" />
      </div>

      <div
        className={`
          relative w-full max-w-lg rounded-3xl border-2 p-6 shadow-2xl sm:p-8
          ${palette.board}
        `}
      >
        {phase === PHASE.INTRO && (
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-300/90">
              Boss Encounter
            </p>
            <div className="mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-b from-red-500 to-red-900 text-4xl shadow-xl ring-4 ring-red-400/30">
              👹
            </div>
            <h2 className={`mt-4 text-2xl font-bold ${palette.title}`}>{boss.name}</h2>
            <p className={`mt-2 text-sm ${palette.subtitle}`}>{boss.description}</p>
            <p className="mt-4 text-sm text-white/70">
              Answer <strong className="text-white">{BOSS_QUESTION_COUNT}</strong> rapid-fire
              questions. Score <strong className="text-white">80%+</strong> to win!
            </p>
            <button
              type="button"
              onClick={() => setPhase(PHASE.QUIZ)}
              className="mt-8 rounded-full bg-red-500 px-8 py-3 font-bold text-white shadow-lg transition hover:scale-105 hover:bg-red-400"
            >
              Face the Boss!
            </button>
          </div>
        )}

        {phase === PHASE.QUIZ && currentQuestion && (
          <div>
            <div className="mb-4 flex items-center justify-between text-xs text-white/70">
              <span>
                Question {questionIndex + 1} / {questions.length}
              </span>
              <span>
                Score: {score}/{questionIndex + (isLocked ? 1 : 0)}
              </span>
            </div>

            <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-red-500 transition-all duration-300"
                style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            <h3 className={`mt-6 text-lg font-bold leading-snug ${palette.title}`}>
              {currentQuestion.prompt}
            </h3>

            <div className="mt-6 grid gap-3">
              {currentQuestion.options.map((option, index) => {
                let style =
                  'border-white/20 bg-white/10 text-white hover:bg-white/20';

                if (isLocked && index === currentQuestion.correctIndex) {
                  style = 'border-green-400 bg-green-500/30 text-green-100';
                } else if (isLocked && index === selectedIndex && index !== currentQuestion.correctIndex) {
                  style = 'border-red-400 bg-red-500/30 text-red-100';
                }

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={isLocked}
                    onClick={() => handleAnswer(index)}
                    className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition ${style}`}
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
          />
        )}

        {phase === PHASE.DEFEAT && (
          <DefeatScreen
            bossName={boss.name}
            score={score}
            total={questions.length}
            onRetry={onDefeatComplete}
          />
        )}
      </div>
    </div>
  );
}
