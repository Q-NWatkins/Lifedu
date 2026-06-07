import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { useGameLoop } from '../../hooks/useGameLoop.js';
import { neuBadge, neuCard } from '../../styles/neubrutalism.js';
import { BossBattle } from '../BossBattle/index.js';
import { ChestModal } from '../Loot/index.js';
import ForkChoiceModal from './ForkChoiceModal.jsx';
import MapComponent from './MapComponent.jsx';
import MovementDeck from './MovementDeck.jsx';
import { getBoardTheme } from './boardTheme.js';

/**
 * Constellation map board with movement cards and branching paths.
 */
export default function GameBoard({
  course,
  theme,
  bossName = 'Boss',
  courseTitle,
  initialEnergy = 10,
  embedded = false,
}) {
  const palette = getBoardTheme(theme);
  const { completedCourses } = usePlayerProgress();
  const isCourseComplete = course ? completedCourses.includes(course.id) : false;

  const {
    layout,
    pathBranch,
    pathIndex,
    activePath,
    energy,
    isMoving,
    pendingLoot,
    canMove,
    bossEncounterActive,
    forkChoicePending,
    moveAlongPath,
    chooseForkBranch,
    closeLootReveal,
    retreatFromBoss,
    dismissBossEncounter,
    grantMegaRoll,
  } = useGameLoop(course, { initialEnergy, skipBossEncounter: isCourseComplete });

  return (
    <section
      className={`relative w-full overflow-hidden ${embedded ? 'px-2 py-4' : 'min-h-screen px-4 py-8'}`}
      aria-label={courseTitle ? `${courseTitle} constellation map` : 'Course map'}
    >
      {pendingLoot && (
        <ChestModal loot={pendingLoot} onClose={closeLootReveal} />
      )}

      {bossEncounterActive && course && (
        <BossBattle
          course={course}
          palette={palette}
          onVictoryComplete={dismissBossEncounter}
          onDefeatComplete={retreatFromBoss}
          onMegaRoll={grantMegaRoll}
        />
      )}

      <div
        className={`
          mx-auto max-w-4xl transition-all duration-700 ease-in-out
          ${bossEncounterActive ? '-translate-x-full scale-95 opacity-0' : 'translate-x-0 scale-100 opacity-100'}
        `}
      >
        {courseTitle && (
          <header className="mb-4 text-center">
            <h1 className={`text-2xl font-black tracking-tight sm:text-3xl ${palette.title}`}>
              {courseTitle}
            </h1>
            <p className={`mt-1 text-sm font-bold ${palette.subtitle}`}>{palette.label}</p>
            {isCourseComplete && (
              <p className={`mt-3 inline-block ${neuBadge}`}>Course Complete!</p>
            )}
          </header>
        )}

        <div className={`${neuCard} relative ${palette.board} p-4 sm:p-6`}>
          {forkChoicePending && <ForkChoiceModal onChoose={chooseForkBranch} />}

          <div className={`rounded-xl border-4 border-black ${palette.track} p-3 sm:p-4`}>
            <MapComponent
              layout={layout}
              activePath={activePath}
              pathIndex={pathIndex}
              pathBranch={pathBranch}
              palette={palette}
            />
          </div>

          <MovementDeck
            energy={energy}
            canMove={canMove}
            isMoving={isMoving}
            onPlayCard={moveAlongPath}
            palette={palette}
          />

          <footer className={`mt-4 flex flex-wrap justify-center gap-3 text-[10px] font-bold ${palette.subtitle}`}>
            <span>● Lesson</span>
            <span>● Quiz</span>
            <span>📦 Chest</span>
            <span>✨ Mystery Chest (loop)</span>
            <span>👹 {bossName}</span>
          </footer>
        </div>
      </div>
    </section>
  );
}
