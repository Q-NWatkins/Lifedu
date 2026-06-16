import { TILE_CLASS, getGuardian } from '../../data/realmConfig.js';
import { MonsterNodeSprite } from '../../assets/gameSprites.jsx';

/** 'vowel-sounds' → 'Vowel', 'addition-basics' → 'Addition'. */
export function prettyTopic(topic) {
  if (!topic) return '';
  const first = topic.split('-')[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}

/**
 * 2.5D "Pop-Up Book" tile.
 *
 * DEFAULT (flat): the tile fills its grid cell with NO box-shadow and only a
 * hairline border, so consecutive tiles sit flush and the board reads as one
 * continuous, painted 2D ribbon. The sub-topic prompt is printed on the face.
 *
 * ACTIVE (pawn on/over it): the tile physically "pops up" — it raises and grows
 * (`translateY(-8px) scale(1.05)`), gains a heavy neubrutalism shadow, and lifts
 * its z-index above neighbors, with a smooth 0.3s transition so it rises to meet
 * the pawn and drops back down on leave.
 *
 * Fork tiles are Sphinx GATES with the realm's Guardian standing on top; landing
 * triggers the SphinxGateModal (handled by the loop/GameBoard).
 */
export default function BoardTile({ tile, isCurrent, realm }) {
  const colorClass = TILE_CLASS[tile.color] ?? 'bg-stone-300';
  const isFork = tile.type === 'fork';
  const guardian = isFork ? getGuardian(realm) : null;

  let face;
  if (tile.type === 'boss') {
    face = <MonsterNodeSprite className="h-7 w-7" variant="boss" title="Boss" />;
  } else if (isFork) {
    face = <span className="text-[7px] font-black uppercase leading-none">Gate</span>;
  } else if (tile.type === 'start') {
    face = <span className="text-[9px] font-black uppercase leading-none">Start</span>;
  } else {
    face = (
      <span className="px-0.5 text-center text-[8px] font-black uppercase leading-[1.05] text-black">
        {prettyTopic(tile.topic)}
      </span>
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* The Guardian rides on top of the gate block. */}
      {guardian && (
        <span
          className="pointer-events-none absolute -top-5 z-40 text-2xl drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]"
          title={`${guardian.name} guards this gate`}
          aria-hidden="true"
        >
          {guardian.emoji}
        </span>
      )}

      <div
        className={`
          flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-2xl
          border-2 border-black/70 ${colorClass}
          transition-all duration-300 ease-out
          ${
            isCurrent
              ? 'z-30 -translate-y-2 scale-105 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              : 'z-10 shadow-none'
          }
          ${isFork ? 'ring-2 ring-amber-300' : ''}
        `}
        title={tile.topic ? prettyTopic(tile.topic) : tile.type}
      >
        {face}
      </div>
    </div>
  );
}