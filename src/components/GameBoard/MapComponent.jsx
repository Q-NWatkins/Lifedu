import { useState } from 'react';
import AvatarPawn from './AvatarPawn.jsx';
import BoardTile from './BoardTile.jsx';
import RealmBackdrop from './RealmBackdrop.jsx';
import Gatekeeper from './Gatekeeper.jsx';
import { getRealmEnv } from '../../data/realmConfig.js';
import { prettyTopic } from './BoardTile.jsx';

/**
 * Coordinate-mapped board renderer.
 *
 *  - STATIC asset maps: the container locks to the artwork's native aspect ratio
 *    so the image is shown 100% (never cropped/squeezed); tiles are absolutely
 *    positioned at their { x, y } percentages over the art.
 *  - PROCEDURAL realms: a painted backdrop + a smooth Bezier "Candyland" trail are
 *    drawn, with tiles placed along it.
 *
 * Tiles are absolute, centered on their coordinate via translate(-50%, -50%).
 * Strictly flat 2.5D (depth via comic drop-shadows only — no rotate/skew/3D).
 *
 * A toggleable DEV CLICKER overlay logs click positions as { x%, y% } so the
 * static path coordinates can be tuned pixel-perfect against the artwork.
 */

const STATIC_NODE_W = 6; // % of board width for asset-map tiles (substantial nodes)

/** Smooth Catmull-Rom → cubic-Bezier path string through {x,y} points. */
function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function MapComponent({ stage, realm, position, branchChoice = {} }) {
  const { tileTrack, edges, spacing, background, aspect, isStatic } = stage;
  const env = getRealmEnv(realm);
  const road = env.road ?? { border: '#000000', fill: '#f59e0b', dash: '#ffffff' };

  const [devMode, setDevMode] = useState(false);
  const [picks, setPicks] = useState([]);

  // Show the registered artwork whenever one exists (traced OR awaiting trace), so
  // untraced maps are visible in-game for tracing with the Dev clicker.
  const hasImage = !!background;

  // Tile size: a fixed, substantial percentage for static maps; spacing-derived
  // for procedural loops. NO grid-column math.
  const nodeW = isStatic ? STATIC_NODE_W : Math.min(6, spacing * 0.7);

  const roadD = smoothPath(tileTrack);
  const shortcutEdges = edges.filter((e) => e.kind === 'shortcut');
  const gateTiles = tileTrack.filter((t) => t.type === 'fork');
  const current = tileTrack[position];
  const currentLabel = current?.topic ? prettyTopic(current.topic) : null;

  // Anchor an element's CENTER to a path coordinate (2D translate only).
  const anchor = (x, y, extra = '') => ({
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -50%) ${extra}`.trim(),
  });

  function capturePick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = +(((e.clientX - rect.left) / rect.width) * 100).toFixed(1);
    const y = +(((e.clientY - rect.top) / rect.height) * 100).toFixed(1);
    const next = [...picks, { x, y }];
    setPicks(next);
    console.log('[MapPicker] node', next.length, { x, y });
    console.log('[MapPicker]\n' + JSON.stringify(next));
  }

  const picksJson = '[\n' + picks.map((p) => `  { x: ${p.x}, y: ${p.y} },`).join('\n') + '\n]';

  return (
    <div className="mx-auto w-full">
      <div
        className="relative w-full overflow-hidden rounded-[28px] border-4 border-black"
        style={{
          aspectRatio: aspect ?? '1 / 1',
          background: hasImage ? '#000' : env.background,
          backgroundSize: hasImage ? undefined : env.backgroundSize,
        }}
      >
        {/* Registered artwork — locked to its native aspect, shown 100% (uncropped). */}
        {hasImage && (
          <img
            src={background}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 z-0 h-full w-full object-fill"
          />
        )}

        {/* Procedural realms (no artwork) get a painted backdrop + drawn trail. */}
        {!hasImage && <RealmBackdrop realm={realm} />}

        {!hasImage && (
          <svg
            className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d={roadD}
              fill="none"
              stroke={road.border}
              strokeWidth="13"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ filter: 'drop-shadow(3px 4px 0 rgba(0,0,0,0.35))' }}
            />
            <path
              d={roadD}
              fill="none"
              stroke={road.fill}
              strokeWidth="9"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={roadD}
              fill="none"
              stroke={road.dash}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="0.5 7"
              vectorEffect="non-scaling-stroke"
              opacity="0.9"
            />
          </svg>
        )}

        {/* Elevated rainbow shortcut bridges. */}
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
            const my = (a.y + b.y) / 2;
            const d = `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
            return (
              <g
                key={`s-${edge.from}-${edge.to}-${i}`}
                opacity={dimmed ? 0.2 : 1}
                style={{ filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.45))' }}
              >
                <path d={d} fill="none" stroke="url(#rainbow-bridge)" strokeWidth="6" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.4" />
                <path d={d} fill="none" stroke="url(#rainbow-bridge)" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" className="animate-dash-flow" />
              </g>
            );
          })}
        </svg>

        {/* Tiles — absolute, centered on each { x, y } coordinate. */}
        {tileTrack.map((tile, i) => (
          <div
            key={tile.index}
            className="absolute z-10"
            style={{ ...anchor(tile.x, tile.y), width: `${nodeW}%` }}
          >
            <div className="aspect-square w-full">
              <BoardTile tile={tile} isCurrent={i === position} shape={env.tileShape} />
            </div>
          </div>
        ))}

        {/* Gatekeepers anchored to fork coordinates. */}
        {gateTiles.map((tile) => (
          <div
            key={`gate-${tile.index}`}
            className="pointer-events-none absolute z-30"
            style={anchor(tile.x, tile.y, 'translateY(-110%)')}
          >
            <Gatekeeper realm={realm} />
          </div>
        ))}

        {/* Floating label badge — only for the active tile. */}
        {current && currentLabel && (
          <div className="pointer-events-none absolute z-[998]" style={anchor(current.x, current.y, 'translateY(-260%)')}>
            <span className="whitespace-nowrap rounded-full border-2 border-black bg-white px-2 py-0.5 text-[9px] font-black uppercase leading-none text-black shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
              {currentLabel}
            </span>
          </div>
        )}

        {/* Pawn — separate top z-layer anchored to the active tile coordinate. */}
        {current && (
          <div className="pointer-events-none absolute z-[999]" style={{ ...anchor(current.x, current.y), width: `${nodeW}%` }}>
            <div className="relative aspect-square w-full">
              <AvatarPawn />
            </div>
          </div>
        )}

        {/* DEV CLICKER overlay — captures click % over the artwork. */}
        {devMode && (
          <div className="absolute inset-0 z-[1000] cursor-crosshair" onClick={capturePick}>
            {picks.map((p, i) => (
              <div
                key={i}
                className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-black bg-lime-300 text-[8px] font-black"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        )}

        {/* Dev-mode toggle. */}
        <button
          type="button"
          onClick={() => setDevMode((v) => !v)}
          className={`absolute right-1 top-1 z-[1001] rounded border-2 border-black px-1.5 py-0.5 text-[9px] font-black uppercase shadow-[2px_2px_0_rgba(0,0,0,0.8)] ${devMode ? 'bg-lime-400' : 'bg-white'}`}
        >
          {devMode ? `Pick ${picks.length}` : 'Dev'}
        </button>
      </div>

      {/* Coordinate aggregator — copy straight into staticMaps.js. */}
      {devMode && (
        <div className="mt-2 space-y-1">
          <div className="flex gap-2">
            <button type="button" onClick={() => setPicks((p) => p.slice(0, -1))} className="rounded border-2 border-black bg-yellow-300 px-2 py-0.5 text-[10px] font-black uppercase">Undo</button>
            <button type="button" onClick={() => setPicks([])} className="rounded border-2 border-black bg-red-300 px-2 py-0.5 text-[10px] font-black uppercase">Clear</button>
          </div>
          <textarea readOnly value={picksJson} onFocus={(e) => e.target.select()} className="h-40 w-full rounded border-2 border-black p-2 font-mono text-[11px]" />
        </div>
      )}
    </div>
  );
}