import { neuBtnRound, neuPanel } from '../../styles/neubrutalism.js';

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
    <div className={`mt-6 ${neuPanel} bg-white/90 p-4 sm:flex sm:items-center sm:justify-between`}>
      <div className={`flex flex-wrap gap-4 text-sm font-semibold ${palette.subtitle}`}>
        <span>
          <strong className="text-black">Tile:</strong> {currentTile}
        </span>
        <span>
          <strong className="text-black">Rolls left:</strong> {diceRollEnergy}
        </span>
        {lastRoll !== null && (
          <span className="flex items-center gap-1.5">
            <strong className="text-black">Last roll:</strong>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-4 border-black bg-yellow-300 text-sm font-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
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
          neu-btn-round mt-3 px-6 py-2.5 text-sm sm:mt-0
          ${canRoll ? palette.diceBtn : `${palette.diceBtnDisabled} cursor-not-allowed active:translate-y-0 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
        `}
      >
        {isMoving ? 'Moving…' : diceRollEnergy <= 0 ? 'No rolls left' : '🎲 Roll Dice'}
      </button>
    </div>
  );
}
