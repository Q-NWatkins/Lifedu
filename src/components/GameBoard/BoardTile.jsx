import { TILE_CLASS } from '../../data/realmConfig.js';
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
export default function BoardTile({ tile, isCurrent, shape = 'block' }) {
  const colorClass = TILE_CLASS[tile.color] ?? 'bg-stone-300';
  const isFork = tile.type === 'fork';
  // Candy discs (round) for Math/Science; rounded "signpost" blocks otherwise.
  const shapeClass = shape === 'disc' ? 'rounded-full' : 'rounded-[26%]';

  // Clean Candyland stepping stones: colored tiles carry NO inner text — their
  // title floats as a badge in the MapComponent. Only the special nodes get a
  // tiny glyph so Start / Gate / Boss stay readable at a glance.
  let face = null;
  if (tile.type === 'boss') {
    face = <MonsterNodeSprite className="h-5 w-5" variant="boss" title="Boss" />;
  } else if (isFork) {
    face = <span className="text-[8px] font-black leading-none">★</span>;
  } else if (tile.type === 'start') {
    face = <span className="text-[6px] font-black uppercase leading-none">Go</span>;
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div
        className={`
          flex h-full w-full flex-col items-center justify-center gap-0.5 p-1
          border-2 border-black ${shapeClass} ${colorClass}
          transition-transform duration-300 ease-out
          ${
            isCurrent
              ? 'z-30 -translate-y-[5px] ring-4 ring-black [filter:drop-shadow(6px_8px_0px_rgba(0,0,0,0.9))]'
              : 'z-10 [filter:drop-shadow(4px_4px_0px_rgba(0,0,0,0.8))]'
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