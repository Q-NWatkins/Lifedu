import AvatarPawn from './AvatarPawn.jsx';
import BoardTile from './BoardTile.jsx';

const ROW_HEIGHT_REM = 4.6; // vertical room per serpentine row (avoids overlap)

/**
 * Renders the procedural snaking board. An SVG underlay draws the continuous
 * "road": solid dark segments for the main path and green dashed arcs for the
 * Sphinx short-cuts. Tiles are absolutely positioned from their 0–100 coords;
 * the active player's pawn rides on top of its 3D block.
 */
export default function MapComponent({ stage, position, branchChoice = {}, palette }) {
  const { tileTrack, edges, rows } = stage;
  const height = `${Math.max(2, rows) * ROW_HEIGHT_REM}rem`;

  return (
    <div
      className={`relative mx-auto w-full max-w-2xl rounded-xl border-4 border-black ${palette.track}`}
      style={{ height }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {edges.map((edge, i) => {
          const a = tileTrack[edge.from];
          const b = tileTrack[edge.to];
          if (!a || !b) return null;

          const decided = branchChoice[edge.from];
          const dimmed =
            decided &&
            ((decided === 'shortcut' && edge.kind === 'detour') ||
              (decided === 'detour' && edge.kind === 'shortcut'));

          if (edge.kind === 'shortcut') {
            const mx = (a.x + b.x) / 2;
            const my = Math.min(a.y, b.y) - 7; // arc the bridge upward
            return (
              <path
                key={`s-${edge.from}-${edge.to}-${i}`}
                d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
                fill="none"
                stroke="#22c55e"
                strokeWidth="1"
                strokeDasharray="4 3"
                opacity={dimmed ? 0.18 : 0.95}
              />
            );
          }
          return (
            <line
              key={`m-${edge.from}-${edge.to}-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#0f172a"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity={dimmed ? 0.2 : 0.9}
            />
          );
        })}
      </svg>

      <div className="absolute inset-0">
        {tileTrack.map((tile, i) => (
          <div
            key={tile.index}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${tile.x}%`, top: `${tile.y}%` }}
          >
            {i === position && <AvatarPawn />}
            <BoardTile tile={tile} isCurrent={i === position} />
          </div>
        ))}
      </div>
    </div>
  );
}