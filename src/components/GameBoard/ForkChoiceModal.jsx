import { neuBtn, neuCard } from '../../styles/neubrutalism.js';

export default function ForkChoiceModal({ onChoose }) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className={`${neuCard} max-w-sm bg-white p-6 text-center`}>
        <p className="text-3xl">⑂</p>
        <h3 className="mt-2 text-lg font-black text-black">Path Fork!</h3>
        <p className="mt-2 text-sm font-semibold text-black/70">
          Pick your route — quick and safe, or loop for the Mystery Chest!
        </p>
        <div className="mt-5 grid gap-3">
          <button
            type="button"
            onClick={() => onChoose('short')}
            className={`${neuBtn} bg-green-300 px-4 py-3 text-sm text-black hover:bg-green-200`}
          >
            🏃 Short Path — Get there faster!
          </button>
          <button
            type="button"
            onClick={() => onChoose('long')}
            className={`${neuBtn} bg-purple-300 px-4 py-3 text-sm text-black hover:bg-purple-200`}
          >
            ✨ Treasure Loop — Mystery Chest awaits!
          </button>
        </div>
      </div>
    </div>
  );
}
