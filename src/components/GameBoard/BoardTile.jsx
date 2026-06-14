import { TILE_CLASS } from '../../data/realmConfig.js';
import { MonsterNodeSprite } from '../../assets/gameSprites.jsx';

/** 'vowel-sounds' → 'Vowel', 'addition-basics' → 'Addition'. */
export function prettyTopic(topic) {
  if (!topic) return '';
  const first = topic.split('-')[0];
  return first.charAt(0).toUpperCase() + first.slice(1);
}

/**
 * A "Game of Life" style 3D block tile. Neubrutalism: thick black border + a
 * hard bottom box-shadow that reads as physical depth. The tile's sub-topic
 * prompt (e.g. "Fractions", "Vowels") is printed right on its face. The player
 * pawn is rendered by MapComponent so it sits physically on top of the block.
 */
export default function BoardTile({ tile, isCurrent }) {
  const colorClass = TILE_CLASS[tile.color] ?? 'bg-stone-300';

  let face;
  if (tile.type === 'boss') {
    face = <MonsterNodeSprite className="h-7 w-7" variant="boss" title="Boss" />;
  } else if (tile.type === 'fork') {
    face = (
      <>
        <span className="text-base leading-none">🦁</span>
        <span className="text-[7px] font-black uppercase leading-none">Sphinx</span>
      </>
    );
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
    <div
      className={`
        flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-lg border-4 border-black
        ${colorClass}
        shadow-[0_5px_0_rgba(0,0,0,0.45)] transition-transform duration-150
        ${isCurrent ? 'z-20 -translate-y-1 scale-110 ring-4 ring-black' : 'z-10'}
      `}
      title={tile.topic ? prettyTopic(tile.topic) : tile.type}
    >
      {face}
    </div>
  );
}