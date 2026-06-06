import { useMemo } from 'react';
import { getChestTilesForPath } from '../../config/courseMaps.js';
import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { useGameLoop } from '../../hooks/useGameLoop.js';
import { neuBadge, neuCard } from '../../styles/neubrutalism.js';
import { BossBattle } from '../BossBattle/index.js';
import { LootRevealModal } from '../Loot/index.js';
import BoardTile from './BoardTile.jsx';
import DiceControls from './DiceControls.jsx';
import { getBoardTheme } from './boardTheme.js';
import {
  getColumnsForPathLength,
  getGridDimensions,
  getSnakeGridPosition,
} from './snakeLayout.js';

function LegendSwatch({ className, label }) {
  return (
    <span className="flex items-center gap-1.5 font-semibold">
      <span className={`neu-tile inline-block h-4 w-4 rounded-md ${className}`} />
      {label}
    </span>
  );
}

/**
 * Adaptive board canvas with loot chests, game loop, and turn-based boss battles.
 */
export default function GameBoard({
  course,
  pathLength,
  theme,
  bossName = 'Boss',
  milestones = [],
  chestTiles,
  courseTitle,
  initialEnergy = 10,
  embedded = false,
}) {
  const palette = getBoardTheme(theme);
  const milestoneSet = new Set(milestones);
  const chestTileSet = useMemo(
    () => new Set(chestTiles ?? getChestTilesForPath(pathLength)),
    [chestTiles, pathLength],
  );

  const { completedCourses } = usePlayerProgress();
  const isCourseComplete = course ? completedCourses.includes(course.id) : false;

  const {
    currentTile,
    diceRollEnergy,
    isMoving,
    lastRoll,
    pendingLoot,
    canRoll,
    bossTile,
    bossEncounterActive,
    rollDice,
    closeLootReveal,
    retreatFromBoss,
    dismissBossEncounter,
    grantMegaRoll,
  } = useGameLoop(pathLength, {
    initialEnergy,
    chestTiles: [...chestTileSet],
    skipBossEncounter: isCourseComplete,
  });

  const pathTiles = Array.from({ length: pathLength }, (_, i) => {
    const number = i + 1;
    const isChest = chestTileSet.has(number);

    return {
      number,
      variant: isChest ? 'chest' : milestoneSet.has(number) ? 'quiz' : 'lesson',
      isActive: number === currentTile,
      isOpenedChest: isChest && number < currentTile,
    };
  });

  const bossTileData = {
    number: bossTile,
    variant: 'boss',
    label: bossName,
    isActive: currentTile >= bossTile,
  };

  const allTiles = [...pathTiles, bossTileData];
  const columns = getColumnsForPathLength(pathLength);
  const { rows } = getGridDimensions(allTiles.length, columns);

  return (
    <section
      className={`relative w-full overflow-hidden ${embedded ? 'px-2 py-4' : 'min-h-screen px-4 py-8'} ${palette.page}`}
      aria-label={courseTitle ? `${courseTitle} game board` : 'Course game board'}
    >
      {pendingLoot && (
        <LootRevealModal loot={pendingLoot} onClose={closeLootReveal} />
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
          <header className="mb-6 text-center">
            <h1 className={`text-3xl font-black tracking-tight ${palette.title}`}>
              {courseTitle}
            </h1>
            <p className={`mt-1 text-sm font-bold ${palette.subtitle}`}>{palette.label}</p>
            {isCourseComplete && (
              <p className={`mt-3 inline-block ${neuBadge}`}>Course Complete!</p>
            )}
          </header>
        )}

        <div className={`${neuCard} ${palette.board} p-6`}>
          <div className={`rounded-xl border-4 border-black ${palette.track} p-4 sm:p-6`}>
            <div
              className="grid gap-3 sm:gap-4"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(0, auto))`,
              }}
            >
              {allTiles.map((tile, index) => {
                const { row, column } = getSnakeGridPosition(index, columns);

                return (
                  <div
                    key={tile.variant === 'boss' ? 'boss' : tile.number}
                    className="flex items-center justify-center"
                    style={{ gridRow: row, gridColumn: column }}
                  >
                    <BoardTile
                      number={tile.number}
                      variant={tile.variant}
                      isActive={tile.isActive}
                      isMoving={isMoving && tile.isActive}
                      isOpenedChest={tile.isOpenedChest}
                      palette={palette}
                      label={tile.label ?? bossName}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <DiceControls
            diceRollEnergy={diceRollEnergy}
            lastRoll={lastRoll}
            currentTile={currentTile}
            canRoll={canRoll}
            isMoving={isMoving}
            onRoll={rollDice}
            palette={palette}
          />

          <footer className={`mt-4 flex flex-wrap justify-center gap-4 text-xs ${palette.subtitle}`}>
            <LegendSwatch className={palette.tile} label="Lesson tile" />
            <LegendSwatch className="bg-amber-300 text-black" label="Chest tile" />
            <LegendSwatch className={palette.quiz} label="Quiz tile" />
            <LegendSwatch className={palette.boss} label="Boss tile" />
            <span className="flex items-center gap-1.5 font-semibold">
              <span
                className={`inline-block h-4 w-4 rounded-full border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${palette.pawn}`}
              />
              Your pawn
            </span>
          </footer>
        </div>
      </div>
    </section>
  );
}
