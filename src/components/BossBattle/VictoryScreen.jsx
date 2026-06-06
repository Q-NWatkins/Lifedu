import { neuBadge, neuBtn, neuCard } from '../../styles/neubrutalism.js';

export default function VictoryScreen({ bossName, badgeLabel, onContinue, megaRollBonus = 3 }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-6">
        <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-black bg-yellow-300 text-5xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          🏆
        </div>
      </div>

      <h2 className="animate-bounce text-3xl font-black text-black">Victory!</h2>
      <p className="mt-2 max-w-sm font-semibold text-black/80">
        You defeated <strong className="text-black">{bossName}</strong> and conquered the course!
      </p>

      <div className={`mt-6 ${neuCard} bg-amber-100 px-6 py-4`}>
        <p className="text-xs font-black uppercase tracking-widest text-black/60">Badge Earned</p>
        <p className="mt-1 text-lg font-black text-black">{badgeLabel}</p>
      </div>

      <p className={`mt-4 ${neuBadge}`}>
        🎲 Mega Roll +{megaRollBonus} bonus rolls!
      </p>
      <p className="mt-2 text-xs font-bold text-black/60">Your Skill Hexagon has grown!</p>

      <button
        type="button"
        onClick={onContinue}
        className={`${neuBtn} mt-8 bg-green-400 px-8 py-3 text-black hover:bg-green-300`}
      >
        Claim Rewards
      </button>
    </div>
  );
}
