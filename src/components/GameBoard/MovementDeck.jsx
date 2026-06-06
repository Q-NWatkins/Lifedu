import { useCallback, useState } from 'react';
import { drawHand, replenishHand, resolveCardSteps } from '../../systems/movementCards.js';
import { neuCard } from '../../styles/neubrutalism.js';

export default function MovementDeck({
  energy,
  canMove,
  isMoving,
  onPlayCard,
  palette,
}) {
  const [hand, setHand] = useState(() => drawHand(3));
  const [playedIndex, setPlayedIndex] = useState(null);

  const handlePlay = useCallback(
    async (card, index) => {
      if (!canMove || isMoving) return;

      setPlayedIndex(index);
      const steps = resolveCardSteps(card);
      const success = await onPlayCard(steps);

      if (success) {
        setHand((prev) => replenishHand(prev, index));
      }
      setPlayedIndex(null);
    },
    [canMove, isMoving, onPlayCard],
  );

  return (
    <div className={`${neuCard} mt-4 bg-white/95 p-4`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-black text-black">Movement Cards</h3>
        <span className="rounded-full border-4 border-black bg-yellow-300 px-3 py-0.5 text-xs font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          ⚡ Energy: {energy}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {hand.map((card, index) => (
          <button
            key={`${card.id}-${index}`}
            type="button"
            disabled={!canMove || isMoving}
            onClick={() => handlePlay(card, index)}
            className={`
              neu-btn flex flex-col items-center gap-1 rounded-xl p-3 text-center transition-transform
              ${card.color} text-black
              ${canMove && !isMoving ? 'hover:-translate-y-1' : 'cursor-not-allowed opacity-50'}
              ${playedIndex === index ? 'scale-95' : ''}
            `}
          >
            <span className="text-2xl">{card.emoji}</span>
            <span className="text-xs font-black leading-tight">{card.name}</span>
            <span className="text-[9px] font-semibold text-black/60">{card.description}</span>
          </button>
        ))}
      </div>

      {!canMove && !isMoving && (
        <p className={`mt-2 text-center text-xs font-bold ${palette.subtitle}`}>
          {energy <= 0 ? 'No energy left — finish the boss to earn Mega Rolls!' : 'Choose a path at the fork to continue!'}
        </p>
      )}
    </div>
  );
}
