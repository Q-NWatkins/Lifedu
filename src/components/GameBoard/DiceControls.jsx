export default function DiceControls({
  diceRollEnergy,
  lastRoll,
  currentTile,
  canRoll,
  isMoving,
  onRoll,
  palette,
}) {
  return (
    <div
      className={`
        mt-6 flex flex-col items-center gap-4 rounded-2xl border border-white/10
        bg-black/20 p-4 sm:flex-row sm:justify-between
      `}
    >
      <div className={`flex flex-wrap gap-4 text-sm ${palette.subtitle}`}>
        <span>
          <strong className={palette.title}>Tile:</strong> {currentTile}
        </span>
        <span>
          <strong className={palette.title}>Rolls left:</strong> {diceRollEnergy}
        </span>
        {lastRoll !== null && (
          <span>
            <strong className={palette.title}>Last roll:</strong>{' '}
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 font-bold text-white">
              {lastRoll}
            </span>
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onRoll}
        disabled={!canRoll}
        className={`
          rounded-full px-6 py-2.5 text-sm font-bold shadow-lg transition
          ${
            canRoll
              ? 'bg-white text-stone-900 hover:scale-105 hover:bg-white/90 active:scale-95'
              : 'cursor-not-allowed bg-white/20 text-white/50'
          }
        `}
      >
        {isMoving ? 'Moving…' : diceRollEnergy <= 0 ? 'No rolls left' : '🎲 Roll Dice'}
      </button>
    </div>
  );
}
