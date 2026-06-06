import { neuBtn } from '../../styles/neubrutalism.js';

export default function DefeatScreen({ bossName, heartsLost = 3, onRetry }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-xl border-4 border-black bg-sky-300 text-5xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        💪
      </div>
      <h2 className="text-2xl font-black text-black">Keep going, hero!</h2>
      <p className="mt-3 max-w-md text-sm font-semibold leading-relaxed text-black/80">
        {bossName} won this round — but you lost all{' '}
        <strong className="text-black">{heartsLost} hearts</strong>. Every great adventurer
        regroups and tries again!
      </p>
      <p className="mt-4 text-xs font-bold text-black/60">
        You&apos;ve been moved 3 tiles back on the map. Study up and roll back to the boss!
      </p>
      <button
        type="button"
        onClick={onRetry}
        className={`${neuBtn} mt-8 bg-white px-8 py-3 text-black hover:bg-lime-50`}
      >
        Back to the Board
      </button>
    </div>
  );
}
