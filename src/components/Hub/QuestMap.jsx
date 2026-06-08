import { useEffect, useState } from 'react';
import { REALMS, getRealmById } from '../../config/realms.js';
import { MAX_GRADE, getGradeMap } from '../../config/mapRegistry.js';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { neuBtn, neuCard } from '../../styles/neubrutalism.js';
import { CourseBoard } from '../GameBoard/index.js';
import DailyTriviaWheel from './DailyTriviaWheel.jsx';
import TiltedTitle from '../common/TiltedTitle.jsx';

const GRADES = Array.from({ length: MAX_GRADE }, (_, i) => i + 1);

export default function QuestMap({ initialRealmId = null }) {
  const { unlockedGrades, completedCourses } = usePlayerProgress();
  const { themeConfig } = useTheme();
  const [activeRealmId, setActiveRealmId] = useState(null);
  const [activeGrade, setActiveGrade] = useState(1);
  const [replayGrade, setReplayGrade] = useState(null);

  const activeRealm = REALMS.find((r) => r.id === activeRealmId) ?? null;
  const subject = activeRealm?.curriculumId;
  const unlockedCeiling = subject ? unlockedGrades[subject] ?? 1 : 1;
  const activeMapId = subject ? `${subject}_${activeGrade}` : null;
  const isReplaying = replayGrade === activeGrade && activeMapId != null;
  const activeMapComplete = activeMapId ? completedCourses.includes(activeMapId) : false;

  const enterRealm = (realm) => {
    setActiveRealmId(realm.id);
    // Drop the player on their highest unlocked grade for that subject.
    setActiveGrade(unlockedGrades[realm.curriculumId] ?? 1);
    setReplayGrade(null);
  };

  useEffect(() => {
    if (!initialRealmId) return;
    const realm = getRealmById(initialRealmId);
    if (realm) enterRealm(realm);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only auto-enter when hub navigates to a realm
  }, [initialRealmId]);

  const selectGrade = (grade) => {
    setActiveGrade(grade);
    setReplayGrade(null);
  };

  const handleBackToRealms = () => {
    setActiveRealmId(null);
    setReplayGrade(null);
  };

  if (activeRealm && activeMapId) {
    const gradeMap = getGradeMap(subject, activeGrade);

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleBackToRealms}
            className={`${neuBtn} bg-white px-4 py-2 text-sm text-black hover:bg-lime-50`}
          >
            ← Realms
          </button>

          {/* Progressive Grade 1-5 track */}
          <div className={`${neuCard} flex flex-wrap items-center gap-2 ${activeRealm.palette.card} p-2`}>
            <span className="px-1 text-[10px] font-black uppercase tracking-wide text-black/70">
              {activeRealm.name}
            </span>
            {GRADES.map((grade) => {
              const unlocked = grade <= unlockedCeiling;
              const complete = completedCourses.includes(`${subject}_${grade}`);
              const isActive = activeGrade === grade;

              return (
                <button
                  key={grade}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => selectGrade(grade)}
                  title={unlocked ? `Grade ${grade}` : `Defeat the Grade ${grade - 1} boss to unlock`}
                  className={`
                    rounded-lg border-4 border-black px-3 py-1 text-xs font-black transition-all
                    ${
                      isActive
                        ? 'bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                        : unlocked
                          ? 'bg-black/10 text-black hover:bg-black/20'
                          : 'cursor-not-allowed bg-stone-300 text-stone-500'
                    }
                  `}
                >
                  {complete ? '✓ ' : ''}G{grade}
                  {!unlocked && ' 🔒'}
                </button>
              );
            })}
          </div>

          {/* Replay a conquered grade for fresh, shuffled questions + bonuses */}
          {activeMapComplete &&
            (isReplaying ? (
              <button
                type="button"
                onClick={() => setReplayGrade(null)}
                className={`${neuBtn} bg-white px-4 py-2 text-sm text-black hover:bg-stone-100`}
              >
                ✕ Exit Replay
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setReplayGrade(activeGrade)}
                className={`${neuBtn} bg-cyan-300 px-4 py-2 text-sm text-black hover:bg-cyan-200`}
              >
                🔁 Replay Quest
              </button>
            ))}
        </div>

        {/* Grade summary banner */}
        {gradeMap && (
          <p className={`text-sm font-bold ${themeConfig.contrastMuted}`}>
            <span className={`font-black ${themeConfig.text_main}`}>
              Grade {activeGrade} · {gradeMap.subtitle}
            </span>{' '}
            — {gradeMap.pathLength} nodes · {gradeMap.miniBossCount} mini-boss
            {gradeMap.miniBossCount > 1 ? 'es' : ''}
            {gradeMap.hazardCount > 0 ? ` · ${gradeMap.hazardCount} traps` : ''}
          </p>
        )}

        <div className="overflow-hidden rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CourseBoard
            key={`${activeMapId}${isReplaying ? '-replay' : ''}`}
            courseId={activeMapId}
            embedded
            replay={isReplaying}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <DailyTriviaWheel />
      </div>

      <header className="mb-6 text-center">
        <TiltedTitle as="h1" className="text-2xl font-black uppercase text-cyan-50 sm:text-3xl">
          Choose Your Realm
        </TiltedTitle>
        <p className={`mt-2 text-sm font-bold ${themeConfig.contrastMuted}`}>
          Each realm is a 5-grade campaign — beat a grade boss to unlock the next!
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {REALMS.map((realm) => {
          const ceiling = unlockedGrades[realm.curriculumId] ?? 1;

          return (
            <button
              key={realm.id}
              type="button"
              onClick={() => enterRealm(realm)}
              className={`
                neu-card group text-left transition-transform hover:-translate-y-1
                ${realm.palette.card} ${realm.palette.cardHover} p-5
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-4xl" aria-hidden="true">
                  {realm.emoji}
                </span>
                <span
                  className={`rounded-full border-2 border-black px-2 py-0.5 text-[10px] font-black ${realm.palette.accent} text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                >
                  Grade {ceiling}/{MAX_GRADE}
                </span>
              </div>
              <h2 className="mt-3 inline-block rotate-0 skew-x-0 skew-y-0 text-xl font-black uppercase text-black">
                {realm.name}
              </h2>
              <p className="mt-1 text-sm font-semibold text-black/70">{realm.tagline}</p>
              <p className="mt-3 text-xs font-black uppercase tracking-wide text-black/50 group-hover:text-black/70">
                Enter realm →
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
