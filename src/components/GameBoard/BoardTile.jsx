import { TILE_CLASS, getGuardian } from '../../data/realmConfig.js';
import { MonsterNodeSprite } from '../../assets/gameSprites.jsx';

/** 'vowel-sounds' → 'Vowel', 'addition-basics' → 'Addition'. */
export function prettyTopic(topic) {
  if (!topic) return '';
  const first = topic.split('-')[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}

/**
 * A "Game of Life" style 3D block tile. Neubrutalism: thick black border + a
 * hard bottom box-shadow that reads as physical depth, with the tile's sub-topic
 * prompt printed on its face.
 *
 * Fork tiles are Sphinx GATES: the realm's Guardian (🧙‍♂️/🤖/🐉/🦉) physically
 * stands on top of the block. Reaching the tile triggers the SphinxGateModal,
 * where that same Guardian poses the gated question. The active player's pawn is
 * rendered by MapComponent so it also sits on top of the block.
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
    <div className="relative flex flex-col items-center">
      {/* The Guardian stands physically on top of the gate block. */}
      {guardian && (
        <span
          className="pointer-events-none absolute -top-6 z-30 text-2xl drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]"
          title={`${guardian.name} guards this gate`}
          aria-hidden="true"
        >
          {guardian.emoji}
        </span>
      )}

      <div
        className={`
          flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-lg border-4 border-black
          ${colorClass}
          shadow-[0_5px_0_rgba(0,0,0,0.45)] transition-transform duration-150
          ${isFork ? 'ring-2 ring-amber-300' : ''}
          ${isCurrent ? 'z-20 -translate-y-1 scale-110 ring-4 ring-black' : 'z-10'}
        `}
        title={tile.topic ? prettyTopic(tile.topic) : tile.type}
      >
        {face}
      </div>
    </div>
  );
}