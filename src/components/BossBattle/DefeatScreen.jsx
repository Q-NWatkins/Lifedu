export default function DefeatScreen({ bossName, score, total, onRetry }) {
  const percent = Math.round((score / total) * 100);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 text-5xl">💪</div>
      <h2 className="text-2xl font-bold text-white">Not quite yet!</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
        {bossName} is tough — but so are you! You scored{' '}
        <strong className="text-white">
          {score}/{total} ({percent}%)
        </strong>
        . You need <strong className="text-white">80%</strong> to win. Review what you learned,
        then roll back onto the path and try again!
      </p>
      <p className="mt-4 text-xs text-white/60">
        You&apos;ve been moved 3 tiles back. Every champion fails before they succeed!
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-8 rounded-full bg-white px-8 py-3 font-bold text-stone-900 shadow-lg transition hover:scale-105"
      >
        Back to the Board
      </button>
    </div>
  );
}
