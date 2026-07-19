import { getGuardian } from '../../data/realmConfig.js';

/**
 * Thematic Gatekeeper that stands on a Fork/Shortcut (Sphinx) tile. Purely
 * decorative & non-interactive — it stays visually anchored to its gate tile
 * until the player's pawn arrives, which triggers the SphinxGateModal (handled
 * by the game loop). The character is chosen by Subject Realm.
 */
export default function Gatekeeper({ realm }) {
  const guardian = getGuardian(realm);

  return (
    <div
      className="pointer-events-none flex flex-col items-center"
      title={`${guardian.name} guards this gate`}
      aria-hidden="true"
    >
      <span className="text-2xl [filter:drop-shadow(4px_4px_0px_rgba(0,0,0,0.8))] sm:text-3xl">
        {guardian.emoji}
      </span>
      <span className="-mt-1 rounded-full border-2 border-black bg-amber-300 px-1.5 text-[7px] font-black uppercase leading-tight text-black shadow-[0_2px_0_rgba(0,0,0,0.5)]">
        Gate
      </span>
    </div>
  );
}