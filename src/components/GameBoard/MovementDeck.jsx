import { neuCard } from '../../styles/neubrutalism.js';

/**
 * Central Draw Pile (Monopoly style). One deck in the middle of the board; tap
 * it to flip a single color card, which reveals and immediately fires movement.
 */
export default function MovementDeck({ drawnCard, isRevealing, energy, canDraw, onDraw }) {
  return (
    <div className={`${neuCard} mt-4 flex items-center justify-center gap-5 bg-white/95 p-4`}>
      {/* The deck */}
      <button
        type="button"
        disabled={!canDraw}
        onClick={onDraw}
        aria-label="Draw a color card"
        className={`
          relative flex h-24 w-20 flex-col items-center justify-center rounded-xl border-4 border-black
          bg-gradient-to-b from-indigo-500 to-indigo-700 text-white shadow-[0_6px_0_rgba(0,0,0,0.4)]
          transition-all
          ${canDraw ? 'hover:-translate-y-1 active:translate-y-[3px]' : 'cursor-not-allowed opacity-50'}
        `}
      >
        <span className="absolute inset-1 rounded-lg border-2 border-white/40" />
        <span className="text-3xl">🎴</span>
        <span className="mt-1 text-[10px] font-black uppercase tracking-wide">Draw</span>
      </button>

      {/* The drawn card / instructions */}
      <div className="flex min-h-[6rem] w-36 flex-col items-center justify-center">
        {drawnCard ? (
          <div
            key={`${drawnCard.id}-${isRevealing}`}
            className={`flex w-full flex-col items-center gap-1 rounded-xl border-4 border-black ${drawnCard.tile} p-3 text-center text-black shadow-[0_4px_0_rgba(0,0,0,0.3)] ${
              isRevealing ? 'animate-card-pop' : ''
            }`}
          >
            <span className="text-2xl leading-none">{drawnCard.emoji}</span>
            <span className="text-xs font-black leading-tight">{drawnCard.name}</span>
            <span className="text-[9px] font-semibold text-black/60">
              {isRevealing
                ? 'Revealing…'
                : `Dash to the ${drawnCard.count === 2 ? '2nd' : 'next'} ${drawnCard.color} tile`}
            </span>
          </div>
        ) : (
          <p className="text-center text-xs font-bold text-black/50">
            Tap the deck to flip a color card and move!
          </p>
        )}
      </div>

      <span className="rounded-full border-4 border-black bg-yellow-300 px-3 py-0.5 text-xs font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        ⚡ {energy}
      </span>
    </div>
  );
}