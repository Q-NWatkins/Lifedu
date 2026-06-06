import { neuBtn, neuCard } from '../../styles/neubrutalism.js';

export default function RewardModal({ message, onClose, palette }) {
  if (!message) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reward-title"
    >
      <div className={`w-full max-w-sm ${neuCard} ${palette.board} p-6 text-center`}>
        <div
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-xl border-4 border-black bg-yellow-300 text-4xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          aria-hidden="true"
        >
          🎁
        </div>
        <h2 id="reward-title" className={`text-xl font-black ${palette.title}`}>
          Reward Found!
        </h2>
        <p className={`mt-2 text-sm font-semibold ${palette.subtitle}`}>{message}</p>
        <button
          type="button"
          onClick={onClose}
          className={`neu-btn mt-5 bg-green-400 px-6 py-2.5 text-sm text-black hover:bg-green-300`}
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}
