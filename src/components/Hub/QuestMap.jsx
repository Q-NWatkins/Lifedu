import { useEffect, useState } from 'react';
import { REALMS, getRealmById } from '../../config/realms.js';
import { MAX_GRADE, getStageCount, getStageMap } from '../../config/mapRegistry.js';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useGameAudio } from '../../context/AudioContext.jsx';
import { neuBtn, neuCard } from '../../styles/neubrutalism.js';
import { CourseBoard } from '../GameBoard/index.js';
import DailyTriviaWheel from './DailyTriviaWheel.jsx';
import TiltedTitle from '../common/TiltedTitle.jsx';

const GRADES = Array.from({ length: MAX_GRADE }, (_, i) => i + 1);

export default function QuestMap({ initialRealmId = null }) {
  const { unlockedGrades, completedCourses } = usePlayerProgress();
  const { themeConfig } = useTheme();
  const { switchTrack } = useGameAudio();
  const [activeRealmId, setActiveRealmId] = useState(null);
  const [activeGrade, setActiveGrade] = useState(1);
  const [activeStage, setActiveStage] = useState(1);
  const [replayKey, setReplayKey] = useState(null);

  const activeRealm = REALMS.find((r) => r.id === activeRealmId) ?? null;
  const subject = activeRealm?.curriculumId;
  const unlockedCeiling = subject ? unlockedGrades[subject] ?? 1 : 1;
  const stageCount = getStageCount(activeGrade);

  // Stage map keys: e.g. `reading_g1_s1` → questionBankId `reading-g1-stage-1`.
  const stageMapId = subject ? `${subject}_g${activeGrade}_s${activeStage}` : null;
  const stageMap = subject ? getStageMap(subject, activeGrade, activeStage) : null;
  const isReplaying = replayKey === stageMapId && stageMapId != null;
  const activeStageComplete = stageMapId ? completedCourses.includes(stageMapId) : false;

  const stageIdFor = (s) => `${subject}_g${activeGrade}_s${s}`;
  const isStageComplete = (s) => completedCourses.includes(stageIdFor(s));
  const isStageUnlocked = (s) =>
    activeGrade <= unlockedCeiling && (s === 1 || isStageComplete(s - 1));

  const enterRealm = (realm) => {
    setActiveRealmId(realm.id);
    setActiveGrade(unlockedGrades[realm.curriculumId] ?? 1);
    setActiveStage(1);
    setReplayKey(null);
  };

  useEffect(() => {
    if (!initialRealmId) return;
    const realm = getRealmById(initialRealmId);
    if (realm) enterRealm(realm);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only auto-enter when hub navigates to a realm
  }, [initialRealmId]);

  // Realm picker → hub theme; an open realm map → gameboard theme.
  const boardOpen = Boolean(activeRealm && stageMapId);
  useEffect(() => {
    switchTrack(boardOpen ? 'gameboard' : 'hub');
  }, [boardOpen, switchTrack]);

  const selectGrade = (grade) => {
    setActiveGrade(grade);
    setActiveStage(1);
    setReplayKey(null);
  };

  const selectStage = (stage) => {
    setActiveStage(stage);
    setReplayKey(null);
  };

  const handleBackToRealms = () => {
    setActiveRealmId(null);
    setReplayKey(null);
  };

  if (activeRealm && stageMapId) {
    const stages = Array.from({ length: stageCount }, (_, i) => i + 1);

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

          {/* Grade 1-5 track (campaign progression) */}
          <div className={`${neuCard} flex flex-wrap items-center gap-2 ${activeRealm.palette.card} p-2`}>
            <span className="px-1 text-[10px] font-black uppercase tracking-wide text-black/70">
              {activeRealm.name}
            </span>
            {GRADES.map((grade) => {
              const unlocked = grade <= unlockedCeiling;
              const isActive = activeGrade === grade;
              return (
                <button
                  key={grade}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => selectGrade(grade)}
                  title={unlocked ? `Grade ${grade}` : `Finish Grade ${grade - 1} to unlock`}
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
                  G{grade}
                  {!unlocked && ' 🔒'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Progressive Stage track for the active grade (Grade 1 = 5 stages) */}
        <div className={`${neuCard} flex flex-wrap items-center gap-2 ${activeRealm.palette.track} p-2`}>
          <span className="px-1 text-[10px] font-black uppercase tracking-wide text-black/70">
            Grade {activeGrade} Stages
          </span>
          {stages.map((stage) => {
            const unlocked = isStageUnlocked(stage);
            const complete = isStageComplete(stage);
            const isActive = activeStage === stage;
            return (
              <button
                key={stage}
                type="button"
                disabled={!unlocked}
                onClick={() => selectStage(stage)}
                title={unlocked ? `Stage ${stage}` : `Clear Stage ${stage - 1} to unlock`}
                className={`
                  flex h-9 w-9 items-center justify-center rounded-full border-4 border-black text-xs font-black transition-all
                  ${
                    isActive
                      ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : complete
                        ? 'bg-lime-300 text-black hover:bg-lime-200'
                        : unlocked
                          ? 'bg-white text-black hover:bg-lime-50'
                          : 'cursor-not-allowed bg-stone-300 text-stone-500'
                  }
                `}
              >
                {complete ? '✓' : unlocked ? stage : '🔒'}
              </button>
            );
          })}

          {/* Replay a cleared stage for fresh, shuffled questions + bonuses */}
          {activeStageComplete &&
            (isReplaying ? (
              <button
                type="button"
                onClick={() => setReplayKey(null)}
                className={`${neuBtn} ml-auto bg-white px-3 py-1.5 text-xs text-black hover:bg-stone-100`}
              >
                ✕ Exit Replay
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setReplayKey(stageMapId)}
                className={`${neuBtn} ml-auto bg-cyan-300 px-3 py-1.5 text-xs text-black hover:bg-cyan-200`}
              >
                🔁 Replay
              </button>
            ))}
        </div>

        {/* Stage summary banner */}
        {stageMap && (
          <p className={`text-sm font-bold ${themeConfig.contrastMuted}`}>
            <span className={`font-black ${themeConfig.text_main}`}>
              Stage {activeStage} of {stageCount}
            </span>{' '}
            — {stageMap.pathLength} nodes
            {stageMap.miniBossCount > 0
              ? ` · ${stageMap.miniBossCount} mini-boss${stageMap.miniBossCount > 1 ? 'es' : ''}`
              : ''}
            {stageMap.hazardCount > 0 ? ` · ${stageMap.hazardCount} traps` : ''}
            {stageMap.isFinalStage ? ' · 👑 Grade Boss' : ''}
          </p>
        )}

        <div className="overflow-hidden rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CourseBoard
            key={`${stageMapId}${isReplaying ? '-replay' : ''}`}
            courseId={stageMapId}
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
          Each realm is a 5-grade campaign — clear every stage to unlock the next grade!
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