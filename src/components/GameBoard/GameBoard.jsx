import { usePlayerProgress } from '../../context/PlayerProgressContext.jsx';
import { useGameLoop } from '../../hooks/useGameLoop.js';
import { BossBattle } from '../BossBattle/index.js';
import BoardTile from './BoardTile.jsx';
import DiceControls from './DiceControls.jsx';
import RewardModal from './RewardModal.jsx';
import { getBoardTheme } from './boardTheme.js';
import {
  getColumnsForPathLength,
  getGridDimensions,
  getSnakeGridPosition,
} from './snakeLayout.js';

function LegendSwatch({ className, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block h-3 w-3 rounded border-2 ${className}`} />
      {label}
    </span>
  );
}

/**
 * Adaptive board canvas with core game loop and boss encounter gate.
 */
export default function GameBoard({
  course,
  pathLength,
  theme,
  bossName = 'Boss',
  milestones = [],
  courseTitle,
  initialEnergy = 10,
}) {
  const palette = getBoardTheme(theme);
  const milestoneSet = new Set(milestones);
  const { completedCourses } = usePlayerProgress();
  const isCourseComplete = course ? completedCourses.includes(course.id) : false;

  const {
    currentTile,
    diceRollEnergy,
    isMoving,
    lastRoll,
    reward,
    canRoll,
    bossTile,
    bossEncounterActive,
    rollDice,
    closeReward,
    retreatFromBoss,
    dismissBossEncounter,
  } = useGameLoop(pathLength, { initialEnergy, skipBossEncounter: isCourseComplete });

  const pathTiles = Array.from({ length: pathLength }, (_, i) => {
    const number = i + 1;
    return {
      number,
      variant: milestoneSet.has(number) ? 'quiz' : 'lesson',
      isActive: number === currentTile,
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
      className={`relative min-h-screen w-full overflow-hidden px-4 py-8 ${palette.page}`}
      aria-label={courseTitle ? `${courseTitle} game board` : 'Course game board'}
    >
      <RewardModal message={reward?.message} onClose={closeReward} palette={palette} />

      {bossEncounterActive && course && (
        <BossBattle
          course={course}
          palette={palette}
          onVictoryComplete={dismissBossEncounter}
          onDefeatComplete={retreatFromBoss}
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
            <h1 className={`text-3xl font-bold tracking-tight ${palette.title}`}>
              {courseTitle}
            </h1>
            <p className={`mt-1 text-sm ${palette.subtitle}`}>{palette.label}</p>
            {isCourseComplete && (
              <p className="mt-2 inline-block rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-bold text-yellow-200">
                Course Complete!
              </p>
            )}
          </header>
        )}

        <div className={`rounded-3xl border-2 p-6 backdrop-blur-sm ${palette.board}`}>
          <div className={`relative rounded-2xl bg-gradient-to-br p-4 sm:p-6 ${palette.track}`}>
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
            <LegendSwatch className={palette.quiz} label="Quiz tile" />
            <LegendSwatch className={palette.boss} label="Boss tile" />
            <span className="flex items-center gap-1.5">
              <span className={`inline-block h-4 w-4 rounded-full border-2 ${palette.pawn}`} />
              Your pawn
            </span>
          </footer>
        </div>
      </div>
    </section>
  );
}
