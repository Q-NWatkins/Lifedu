import { useEffect, useRef } from 'react';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useGameLoop } from '../../hooks/useGameLoop.js';
import { neuBadge, neuCard } from '../../styles/neubrutalism.js';
import { BossBattle, SkirmishModal } from '../BossBattle/index.js';
import { ChestModal } from '../Loot/index.js';
import {
  SIDE_BOSS_REWARD_CARD_ID,
  SPECIAL_COMBAT_CARDS,
} from '../../systems/combatCards.js';
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
  const { completedCourses, addGems, unlockCombatCard, stepCards, consumeStepCards } =
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
    clearedNodes,
    moveAlongPath,
    chooseForkBranch,
    closeLootReveal,
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

  const sideBossReward = SPECIAL_COMBAT_CARDS[SIDE_BOSS_REWARD_CARD_ID];

  const handleReplayReward = () => {
    addGems(REPLAY_GEM_BONUS);
    addEnergy(REPLAY_ENERGY_BONUS);
  };

  const handleSideBossWin = () => {
    unlockCombatCard(SIDE_BOSS_REWARD_CARD_ID);
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

      {miniBossEncounter && (
        <SkirmishModal
          kind="mini"
          node={miniBossEncounter}
          questionCount={2}
          onWin={() => resolveMiniBoss(miniBossEncounter.id)}
        />
      )}

      {sideBossEncounter && (
        <SkirmishModal
          kind="side"
          node={sideBossEncounter}
          questionCount={2}
          rewardLabel={sideBossReward?.name}
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
            <span>👹 {bossName}</span>
          </footer>
        </div>
      </div>
    </section>
  );
}
