export default function VictoryScreen({ bossName, badgeLabel, onContinue }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400/30" />
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 text-5xl shadow-2xl ring-4 ring-yellow-200/50">
          🏆
        </div>
      </div>

      <h2 className="animate-bounce text-3xl font-bold text-yellow-100">Victory!</h2>
      <p className="mt-2 max-w-sm text-amber-100/90">
        You defeated <strong>{bossName}</strong> and conquered the course!
      </p>

      <div className="mt-6 rounded-2xl border-2 border-yellow-300/40 bg-black/30 px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-widest text-yellow-200/80">
          Badge Earned
        </p>
        <p className="mt-1 text-lg font-bold text-white">{badgeLabel}</p>
      </div>

      <p className="mt-4 text-sm text-amber-100/70">Your Skill Hexagon has grown!</p>

      <button
        type="button"
        onClick={onContinue}
        className="mt-8 rounded-full bg-yellow-300 px-8 py-3 font-bold text-stone-900 shadow-lg transition hover:scale-105 hover:bg-yellow-200"
      >
        Claim Rewards
      </button>
    </div>
  );
}
