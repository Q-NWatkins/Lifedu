import AvatarPawn from './AvatarPawn.jsx';
import BoardTile from './BoardTile.jsx';

const ROW_HEIGHT_REM = 4.6; // vertical room per serpentine row (avoids overlap)

/**
 * Renders the procedural snaking board over the realm's themed environment.
 *
 * The SVG underlay draws the continuous "road": solid dark segments for the main
 * path, and a glowing animated RAINBOW BRIDGE for the Sphinx short-cuts so they
 * read as a desirable hidden trail. Tiles are absolutely positioned from their
 * 0–100 coords; the active pawn rides on top of its 3D block. The container is
 * transparent so the GameBoard's themed terrain shows through.
 */
export default function MapComponent({ stage, realm, position, branchChoice = {}, palette }) {
  const { tileTrack, edges, rows } = stage;
  const height = `${Math.max(2, rows) * ROW_HEIGHT_REM}rem`;

  return (
    <div
      className="relative mx-auto w-full max-w-2xl rounded-xl border-4 border-black bg-black/10"
      style={{ height }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
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
            const my = Math.min(a.y, b.y) - 8; // arc the bridge upward
            const d = `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
            return (
              <g key={`s-${edge.from}-${edge.to}-${i}`} opacity={dimmed ? 0.18 : 1}>
                {/* soft glow underlay */}
                <path d={d} fill="none" stroke="url(#rainbow-bridge)" strokeWidth="3.4" strokeLinecap="round" opacity="0.35" />
                {/* bright animated rainbow trail */}
                <path
                  d={d}
                  fill="none"
                  stroke="url(#rainbow-bridge)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeDasharray="3 2.5"
                  className="animate-dash-flow"
                />
              </g>
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
              opacity={dimmed ? 0.2 : 0.85}
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
            <BoardTile tile={tile} isCurrent={i === position} realm={realm} />
          </div>
        ))}
      </div>
    </div>
  );
}