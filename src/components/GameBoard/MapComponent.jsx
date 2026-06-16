import AvatarPawn from './AvatarPawn.jsx';
import BoardTile from './BoardTile.jsx';

// Tiles are full cell WIDTH (so sequential neighbors sit flush in a row) but
// only a fraction of cell HEIGHT — leaving negative space between rows so the
// themed terrain shows through and the path reads as a winding board, not a grid.
const TILE_HEIGHT_FRACTION = 0.58;

/**
 * Renders the winding "Game of Life" board.
 *
 * Layers (low → high z):
 *   0  main road  — a continuous ribbon line under the tiles; its vertical
 *                   segments bridge the negative space at each row turn.
 *   10 tiles      — flush-in-row rounded blocks (active tile pops to z-30).
 *   20 shortcuts  — the elevated rainbow bridge, drop-shadowed to hover.
 *   999 pawn      — always on top, even over a raised active tile.
 */
export default function MapComponent({ stage, realm, position, branchChoice = {} }) {
  const { tileTrack, edges, rows, cols } = stage;
  const cellW = 100 / cols;
  const cellH = 100 / rows;
  const tileHeightPct = cellH * TILE_HEIGHT_FRACTION;

  const mainEdges = edges.filter((e) => e.kind === 'main');
  const shortcutEdges = edges.filter((e) => e.kind === 'shortcut');

  return (
    <div
      className="relative mx-auto w-full max-w-md"
      style={{ aspectRatio: `${cols} / ${rows}` }}
    >
      {/* Layer 0 — continuous road under the tiles (shows the winding turns). */}
      <svg
        className="absolute inset-0 z-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {mainEdges.map((edge, i) => {
          const a = tileTrack[edge.from];
          const b = tileTrack[edge.to];
          if (!a || !b) return null;
          return (
            <line
              key={`m-${edge.from}-${edge.to}-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#000000"
              strokeOpacity="0.28"
              strokeWidth="5"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Layer 20 — elevated rainbow shortcut bridges (hovering over the board). */}
      <svg
        className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="rainbow-bridge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="25%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="75%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {shortcutEdges.map((edge, i) => {
          const a = tileTrack[edge.from];
          const b = tileTrack[edge.to];
          if (!a || !b) return null;
          const dimmed = branchChoice[edge.from] === 'detour';
          const mx = (a.x + b.x) / 2;
          const my = Math.min(a.y, b.y) - cellH * 0.9;
          const d = `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
          return (
            <g
              key={`s-${edge.from}-${edge.to}-${i}`}
              opacity={dimmed ? 0.2 : 1}
              style={{ filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.45))' }}
            >
              <path d={d} fill="none" stroke="url(#rainbow-bridge)" strokeWidth="3.6" strokeLinecap="round" opacity="0.35" />
              <path
                d={d}
                fill="none"
                stroke="url(#rainbow-bridge)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray="3 2.5"
                className="animate-dash-flow"
              />
            </g>
          );
        })}
      </svg>

      {/* Layer 10 — the flush rounded tile ribbon (pawn z-999 lives on the active tile). */}
      <div className="absolute inset-0 z-10">
        {tileTrack.map((tile, i) => (
          <div
            key={tile.index}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${tile.x}%`,
              top: `${tile.y}%`,
              width: `${cellW}%`,
              height: `${tileHeightPct}%`,
            }}
          >
            {i === position && <AvatarPawn />}
            <BoardTile tile={tile} isCurrent={i === position} realm={realm} />
          </div>
        ))}
      </div>
    </div>
  );
}