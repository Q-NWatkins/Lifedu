/**
 * Subject "World Exploration" backdrop — decorative 2D vector art pinned BEHIND
 * the board path (lowest z layer). Each realm gets a faint, large-scale motif so
 * the track reads as winding through a themed world (Space, Forest Kingdom,
 * Parchment Map, Blueprint), without competing with the tiles for attention.
 */
function ScienceWorld() {
  // Cosmic playground: glowing planets, a ringed world, a comet & twinkles.
  return (
    <>
      {Array.from({ length: 26 }, (_, i) => (
        <circle
          key={i}
          cx={(i * 37 + 9) % 100}
          cy={(i * 53 + 5) % 100}
          r={(i % 3) * 0.4 + 0.5}
          fill="#ffffff"
          opacity="0.7"
        />
      ))}
      {/* big ringed planet */}
      <circle cx="80" cy="18" r="11" fill="#c084fc" opacity="0.55" />
      <circle cx="80" cy="18" r="11" fill="none" stroke="#f0abfc" strokeWidth="0.6" opacity="0.7" />
      <ellipse cx="80" cy="18" rx="18" ry="4.5" fill="none" stroke="#67e8f9" strokeWidth="1.4" opacity="0.6" />
      {/* little moon + glowing planetoid */}
      <circle cx="14" cy="70" r="7" fill="#22d3ee" opacity="0.45" />
      <circle cx="11" cy="67" r="1.6" fill="#a5f3fc" opacity="0.7" />
      {/* comet streak */}
      <path d="M22 14 L40 30" stroke="#f5d0fe" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <circle cx="40.5" cy="30.5" r="2" fill="#fde68a" opacity="0.8" />
    </>
  );
}

function ReadingWorld() {
  // Enchanted jungle: layered canopy, leafy bushes, a curling vine & toadstool.
  return (
    <>
      {/* far + near canopy */}
      <path d="M0 84 Q 25 68 50 82 T 100 80 L100 100 L0 100 Z" fill="#15803d" opacity="0.5" />
      <path d="M0 92 Q 30 80 60 90 T 100 90 L100 100 L0 100 Z" fill="#166534" opacity="0.55" />
      {/* round-topped jungle trees */}
      {[12, 30, 88].map((cx, i) => (
        <g key={cx} opacity="0.55">
          <rect x={cx - 1.2} y={66 - i * 2} width="2.4" height="14" rx="1" fill="#7c4a1e" />
          <circle cx={cx} cy={62 - i * 2} r="8" fill="#22c55e" />
          <circle cx={cx - 5} cy={66 - i * 2} r="5" fill="#4ade80" />
          <circle cx={cx + 5} cy={66 - i * 2} r="5" fill="#16a34a" />
        </g>
      ))}
      {/* curling vine + leaves up the side */}
      <path d="M4 8 Q 14 24 6 40 Q -2 56 8 72" stroke="#65a30d" strokeWidth="1.6" fill="none" opacity="0.55" />
      {[16, 36, 56].map((y, i) => (
        <ellipse key={y} cx={i % 2 ? 11 : 3} cy={y} rx="3.2" ry="1.6" fill="#bef264" opacity="0.6" transform={`rotate(${i % 2 ? 35 : -35} ${i % 2 ? 11 : 3} ${y})`} />
      ))}
      {/* toadstool */}
      <g opacity="0.6">
        <rect x="69" y="22" width="2.4" height="6" rx="1" fill="#fef3c7" />
        <path d="M64 22 Q 70 14 76 22 Z" fill="#ef4444" />
        <circle cx="67.5" cy="20" r="0.8" fill="#fff" />
        <circle cx="72.5" cy="19.5" r="0.7" fill="#fff" />
      </g>
    </>
  );
}

function HistoryWorld() {
  // Treasure island: palm trees, cartoon mountains, an X, a compass & dashed route.
  return (
    <>
      {/* compass rose */}
      <g transform="translate(82 18)" opacity="0.5" stroke="#7c5a2e" fill="none" strokeWidth="0.7">
        <circle r="9" />
        <polygon points="0,-8 2.2,0 0,8 -2.2,0" fill="#b45309" stroke="none" />
        <line x1="-11" y1="0" x2="11" y2="0" />
        <line x1="0" y1="-11" x2="0" y2="11" />
      </g>
      {/* cartoon mountains */}
      <polygon points="4,82 18,52 32,82" fill="#a3825a" opacity="0.5" />
      <polygon points="14,72 18,52 22,62" fill="#fef3c7" opacity="0.55" />
      <polygon points="24,84 40,60 56,84" fill="#8a6a45" opacity="0.45" />
      {/* palm tree */}
      <g opacity="0.6">
        <path d="M70 78 Q 72 60 71 50" stroke="#7c5a2e" strokeWidth="2" fill="none" strokeLinecap="round" />
        {[-1, -0.4, 0.3, 1].map((k, i) => (
          <path key={i} d={`M71 50 Q ${71 + k * 12} ${48 - Math.abs(k) * 2} ${71 + k * 16} ${54 - i}`} stroke="#16a34a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        ))}
        <circle cx="71" cy="49" r="1.6" fill="#a16207" />
      </g>
      {/* dashed treasure route + X marks the spot */}
      <path d="M12 34 Q 44 22 68 40" stroke="#7c5a2e" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.6" />
      <g transform="translate(68 40)" stroke="#b91c1c" strokeWidth="1.6" opacity="0.75" strokeLinecap="round">
        <line x1="-3" y1="-3" x2="3" y2="3" />
        <line x1="-3" y1="3" x2="3" y2="-3" />
      </g>
    </>
  );
}

function MathWorld() {
  // Candy wonderland: lollipops, peppermint swirls, gumdrops & a sprinkle cloud.
  return (
    <>
      {/* peppermint swirl */}
      <g transform="translate(80 20)" opacity="0.6">
        <circle r="9" fill="#fff" />
        <path d="M0 -9 A 9 9 0 0 1 6.4 6.4 Z" fill="#f472b6" />
        <path d="M0 9 A 9 9 0 0 1 -6.4 -6.4 Z" fill="#f472b6" />
        <circle r="9" fill="none" stroke="#9d174d" strokeWidth="0.6" />
      </g>
      {/* lollipops */}
      {[[14, 30, '#a78bfa'], [30, 22, '#34d399']].map(([cx, cy, c], i) => (
        <g key={i} opacity="0.6">
          <line x1={cx} y1={cy} x2={cx} y2={cy + 16} stroke="#fff" strokeWidth="1.4" />
          <circle cx={cx} cy={cy} r="5.5" fill={c} />
          <circle cx={cx} cy={cy} r="5.5" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="2 2" />
        </g>
      ))}
      {/* gumdrops along the bottom */}
      {[10, 26, 44, 62, 80].map((cx, i) => (
        <path key={cx} d={`M${cx - 4} 90 Q ${cx} 80 ${cx + 4} 90 Z`} fill={['#f9a8d4', '#a5b4fc', '#6ee7b7', '#fcd34d', '#f9a8d4'][i]} opacity="0.6" />
      ))}
      {/* sprinkle cloud */}
      {[[58, 60], [63, 64], [68, 58], [54, 66]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="3" height="1.2" rx="0.6" fill={['#f472b6', '#818cf8', '#34d399', '#fbbf24'][i]} opacity="0.7" transform={`rotate(${i * 40} ${x} ${y})`} />
      ))}
    </>
  );
}

const WORLDS = {
  science: ScienceWorld,
  reading: ReadingWorld,
  history: HistoryWorld,
  math: MathWorld,
};

export default function RealmBackdrop({ realm }) {
  const World = WORLDS[realm] ?? MathWorld;
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <World />
    </svg>
  );
}