import { useEffect, useRef } from 'react';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useGameAudio } from '../../context/AudioContext.jsx';
import { useGameLoop } from '../../hooks/useGameLoop.js';
import { neuBadge, neuCard } from '../../styles/neubrutalism.js';
import { BossBattle, SkirmishModal } from '../BossBattle/index.js';
import { ChestModal } from '../Loot/index.js';
import ForkChoiceModal from './ForkChoiceModal.jsx';
import MapComponent from './MapComponent.jsx';
import MovementDeck from './MovementDeck.jsx';
import { getBoardTheme } from './boardTheme.js';

const REPLAY_GEM_BONUS = 25;
const REPLAY_ENERGY_BONUS = 2;

/**
 * Constellation map board with movement cards, branching paths, and interactive
 * obstacle nodes. `replay` forces the boss to re-trigger on a completed course
 * and grants the mastery bonus on victory.
 */
export default function GameBoard({
  course,
  theme,
  bossName = 'Boss',
  courseTitle,
  initialEnergy = 10,
  embedded = false,
  replay = false,
}) {
  const palette = getBoardTheme(theme);
  const { themeConfig } = useTheme();
  const { playTrack } = useGameAudio();
  useEffect(() => {
    if (playTrack) {
      playTrack('gameboard');
    }
  }, [course?.id, playTrack]); // Plays whenever they switch realms
  const { completedCourses, addGems, addConsumable, stepCards, consumeStepCards } =
    usePlayerProgress();
  const isCourseComplete = course ? completedCourses.includes(course.id) : false;

  // Spend any Daily-Wheel step cards as bonus starting energy for this run.
  // Captured once at mount so the value stays stable for the game loop.
  const startEnergyRef = useRef(initialEnergy + stepCards);
  const bonusStepsRef = useRef(stepCards);
  useEffect(() => {
    if (bonusStepsRef.current > 0) consumeStepCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- consume exactly once on mount
  }, []);

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
    miniBossEncounter,
    sideBossEncounter,
    pendingHazard,
    clearedNodes,
    moveAlongPath,
    chooseForkBranch,
    closeLootReveal,
    closeHazard,
    retreatFromBoss,
    dismissBossEncounter,
    grantMegaRoll,
    addEnergy,
    resolveMiniBoss,
    resolveSideBoss,
  } = useGameLoop(course, {
    initialEnergy: startEnergyRef.current,
    // On a replay we deliberately re-fight the boss even though it's complete.
    skipBossEncounter: isCourseComplete && !replay,
  });

  const handleReplayReward = () => {
    addGems(REPLAY_GEM_BONUS);
    addEnergy(REPLAY_ENERGY_BONUS);
  };

  // Side-boss now drops a one-time Double Damage charge (not a permanent trait).
  const handleSideBossWin = () => {
    addConsumable('doubleDamage', 1);
    resolveSideBoss(sideBossEncounter?.id);
  };

  return (
    <section
      className={`relative w-full overflow-hidden ${embedded ? 'px-2 py-4' : 'min-h-screen px-4 py-8'}`}
      aria-label={courseTitle ? `${courseTitle} constellation map` : 'Course map'}
    >
      {pendingLoot && (
        <ChestModal loot={pendingLoot} onClose={closeLootReveal} />
      )}

      {pendingHazard && (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Hazard tile"
        >
          <div className="w-full max-w-xs rounded-2xl border-4 border-black bg-rose-200 p-6 text-center text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-black bg-rose-400 text-3xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              ⚠️
            </div>
            <h3 className="mt-3 text-xl font-black">Trap Tile!</h3>
            <p className="mt-1 text-sm font-semibold opacity-80">
              You stumbled into a hazard and lost <strong>1 energy</strong>.
            </p>
            <button
              type="button"
              onClick={closeHazard}
              className="neu-btn mt-5 bg-white px-6 py-2.5 text-sm text-black hover:bg-stone-100"
            >
              Shake it off!
            </button>
          </div>
        </div>
      )}

      {miniBossEncounter && (
        <SkirmishModal
          kind="mini"
          node={miniBossEncounter}
          questionCount={2}
          questionBankId={course.questionBankId}
          onWin={() => resolveMiniBoss(miniBossEncounter.id)}
        />
      )}

      {sideBossEncounter && (
        <SkirmishModal
          kind="side"
          node={sideBossEncounter}
          questionCount={2}
          questionBankId={course.questionBankId}
          rewardLabel="Double Damage Charge"
          onWin={handleSideBossWin}
          onSkip={() => resolveSideBoss(sideBossEncounter.id)}
        />
      )}

      {bossEncounterActive && course && (
        <BossBattle
          course={course}
          palette={palette}
          onVictoryComplete={dismissBossEncounter}
          onDefeatComplete={retreatFromBoss}
          onMegaRoll={grantMegaRoll}
          isReplay={replay}
          onReplayReward={handleReplayReward}
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
            <h1 className={`text-2xl font-black tracking-tight sm:text-3xl ${themeConfig.text_main}`}>
              {courseTitle}
            </h1>
            <p className={`mt-1 text-sm font-bold ${themeConfig.contrastMuted}`}>{palette.label}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {replay ? (
                <span className={`inline-block ${neuBadge}`}>Replay Quest — fresh questions!</span>
              ) : (
                isCourseComplete && (
                  <span className={`inline-block ${neuBadge}`}>Course Complete!</span>
                )
              )}
              {bonusStepsRef.current > 0 && (
                <span className={`inline-block ${neuBadge}`}>
                  🎴 +{bonusStepsRef.current} bonus energy from step cards!
                </span>
              )}
            </div>
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
              clearedNodes={clearedNodes}
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
            <span>👺 Mini-Boss</span>
            <span>🗡️ Side-Boss</span>
            <span>⚠️ Trap</span>
            <span>👹 {bossName}</span>
          </footer>
        </div>
      </div>
    </section>
  );
}
