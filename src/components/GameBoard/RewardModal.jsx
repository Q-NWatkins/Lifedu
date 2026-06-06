export default function RewardModal({ message, onClose, palette }) {
  if (!message) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reward-title"
    >
      <div
        className={`
          w-full max-w-sm rounded-2xl border-2 p-6 text-center shadow-2xl
          ${palette.board}
        `}
      >
        <div className="mb-3 text-4xl" aria-hidden="true">
          🎁
        </div>
        <h2 id="reward-title" className={`text-xl font-bold ${palette.title}`}>
          Reward Found!
        </h2>
        <p className={`mt-2 text-sm ${palette.subtitle}`}>{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 rounded-full bg-white px-6 py-2 text-sm font-bold text-stone-900 transition hover:bg-white/90"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}
