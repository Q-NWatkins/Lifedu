/**
 * Central Realm Matrix — the data layout for the "Game of Life + Monopoly +
 * Candyland" board loop. Each Subject Realm declares its GRANULAR sub-topics
 * (one per tile color). The board itself is generated procedurally: its length
 * scales with grade & stage, and the snaking geometry comes from boardGenerator.
 *
 * Pillar 1 (Isolated Realms): color → sub-topic is scoped to the realm.
 */
import { resolveLayout, staticTileCount, layoutProfileFor } from '../systems/boardGenerator.js';

/** Dynamic length: longer boards for higher grades/stages. */
export function totalTilesFor(grade = 1, stage = 1) {
  return 10 + grade * 3 + stage * 2;
}

export const TILE_HEX = {
  red: '#ef4444',
  yellow: '#facc15',
  blue: '#38bdf8',
  green: '#4ade80',
  start: '#ffffff',
  boss: '#d946ef',
  fork: '#fb923c',
  merge: '#cbd5e1',
};

export const TILE_CLASS = {
  red: 'bg-red-400',
  yellow: 'bg-yellow-300',
  blue: 'bg-sky-400',
  green: 'bg-green-400',
  start: 'bg-white',
  boss: 'bg-fuchsia-500 text-white',
  fork: 'bg-orange-400',
  merge: 'bg-slate-300',
};

export const REALM_CONFIG = {
  science: {
    label: 'Science Cosmos',
    topics: { red: 'biology-basics', yellow: 'space-basics', blue: 'physics-basics' },
  },
  math: {
    label: 'Math Citadel',
    topics: { red: 'addition-basics', yellow: 'subtraction-basics', blue: 'geometry-shapes' },
  },
  reading: {
    label: 'Reading Realm',
    topics: { red: 'nouns-verbs', yellow: 'vowel-sounds', blue: 'sight-words' },
  },
  history: {
    label: 'History Timeline',
    topics: {
      red: 'domestic-heritage',
      yellow: 'ancient-cultures',
      blue: 'geography-maps',
      green: 'sphinx-riddles',
    },
  },
};

/**
 * Themed environment per realm — rich CSS terrain/pattern backgrounds (no image
 * assets). Applied to the board surface so each Subject Realm feels distinct.
 */
export const REALM_ENV = {
  science: {
    // Cosmic retro space playground: glowing neon nebula swirls + scattered stars.
    background:
      'radial-gradient(2px 2px at 18% 22%, #ffffffdd 50%, transparent 51%),' +
      'radial-gradient(1.5px 1.5px at 68% 58%, #a5f3fcdd 50%, transparent 51%),' +
      'radial-gradient(1.5px 1.5px at 42% 80%, #f5d0fecc 50%, transparent 51%),' +
      'radial-gradient(circle at 78% 28%, #d946ef55 0%, transparent 42%),' +
      'radial-gradient(circle at 22% 72%, #22d3ee55 0%, transparent 44%),' +
      'linear-gradient(160deg, #1a0b3b 0%, #2e1065 55%, #4c1d95 100%)',
    backgroundSize: '70px 70px, 110px 110px, 90px 90px, 100% 100%, 100% 100%, 100% 100%',
    text: 'text-fuchsia-50',
    // Neon nebula-dust track.
    road: { border: '#0b0420', fill: '#a855f7', dash: '#22d3ee' },
    tileShape: 'disc', // glowing planetoid bubbles
  },
  reading: {
    // Vibrant enchanted jungle: sunlit canopy with leafy glows.
    background:
      'radial-gradient(circle at 80% 10%, #fde68a66 0%, transparent 30%),' +
      'radial-gradient(circle at 84% 16%, #bef26466 0%, transparent 40%),' +
      'radial-gradient(circle at 10% 86%, #4ade8055 0%, transparent 42%),' +
      'radial-gradient(circle at 50% 50%, #65a30d33 0%, transparent 60%),' +
      'linear-gradient(180deg, #14532d 0%, #15803d 60%, #4d7c0f 100%)',
    text: 'text-lime-50',
    // Thick leafy woodland vine trail.
    road: { border: '#1a2e05', fill: '#65a30d', dash: '#bef264' },
    tileShape: 'block', // mossy wooden signposts
  },
  history: {
    // Treasure Island / Dino-Age adventure map: sun-bleached parchment + sand.
    background:
      'radial-gradient(circle at 22% 18%, #fef3c7 0%, transparent 35%),' +
      'radial-gradient(circle at 82% 84%, #fcd34d55 0%, transparent 40%),' +
      'radial-gradient(circle at 50% 45%, #fde8b8 0%, #e8cf9f 62%, #cda86a 100%)',
    text: 'text-amber-950',
    // Dotted "X marks the spot" sandy island trail.
    road: { border: '#5b3d1a', fill: '#d4a056', dash: '#fef3c7' },
    tileShape: 'block', // weathered treasure-map placards
  },
  math: {
    // Candy Land toy wonderland: pastel frosted sky with sprinkle dots.
    background:
      'radial-gradient(3px 3px at 20% 30%, #f472b6aa 50%, transparent 51%),' +
      'radial-gradient(3px 3px at 72% 64%, #818cf8aa 50%, transparent 51%),' +
      'radial-gradient(2.5px 2.5px at 50% 18%, #34d399aa 50%, transparent 51%),' +
      'radial-gradient(circle at 80% 20%, #fbcfe8 0%, transparent 45%),' +
      'linear-gradient(180deg, #fdf2f8 0%, #fbcfe8 55%, #ddd6fe 100%)',
    backgroundSize: '64px 64px, 88px 88px, 52px 52px, 100% 100%, 100% 100%',
    text: 'text-fuchsia-950',
    // Frosted pastel candy ribbon.
    road: { border: '#9d174d', fill: '#f9a8d4', dash: '#ffffff' },
    tileShape: 'disc', // smooth candy discs
  },
};

export function getRealmEnv(realm) {
  return REALM_ENV[realm] ?? REALM_ENV.math;
}

/**
 * The Guardian that stands on each realm's Sphinx fork tiles and poses the
 * gated challenge question.
 */
export const GUARDIANS = {
  science: { emoji: '🤖', name: 'The Nebula Mech' },
  math: { emoji: '🦉', name: 'The Number Owl' },
  reading: { emoji: '🧙‍♂️', name: 'The Word Wizard' },
  history: { emoji: '🐉', name: 'The Timeless Dragon' },
};

export function getGuardian(realm) {
  return GUARDIANS[realm] ?? { emoji: '🦁', name: 'The Sphinx' };
}

/**
 * Assemble a full stage board:
 *   - length from `totalTilesFor(grade, stage)`
 *   - serpentine coordinates + periodic shortcuts from boardGenerator
 *   - tile 0 = START, last tile = BOSS, shortcut sources = SPHINX FORKS, and
 *     every other tile is a colored sub-topic prompt (colors cycle sequentially).
 *
 * Each tile carries `next` (a number, or `{ shortcut, detour }` at a fork) plus
 * x/y for rendering. `edges` is typed (main | detour | shortcut) for the road.
 *
 * @returns {{ realm, grade, stage, totalTiles, topics, tileTrack, edges,
 *   spacing, bossIndex, shortcuts } | null}
 */
export function getStageConfig(realm, grade = 1, stage = 1) {
  const cfg = REALM_CONFIG[realm];
  if (!cfg) return null;

  // Static asset-backed maps fix the tile count to their hand-tuned coordinate
  // list; otherwise the length scales procedurally with grade/stage.
  const totalTiles = staticTileCount(realm, grade, stage) ?? totalTilesFor(grade, stage);
  const profile = layoutProfileFor(grade); // grade-adaptive maze complexity
  const { positions, spacing, shortcuts, background, aspect, isStatic } = resolveLayout(
    realm,
    grade,
    stage,
    totalTiles,
    profile,
  );
  const forkTargets = new Map(shortcuts.map((s) => [s.from, s.to]));
  const colors = Object.keys(cfg.topics);
  const bossIndex = totalTiles - 1;

  let colorCounter = 0;
  const tileTrack = positions.map((p) => {
    const base = { index: p.index, x: p.x, y: p.y };

    if (p.index === 0) return { ...base, type: 'start', color: 'start', topic: null, next: 1 };
    if (p.index === bossIndex) {
      return { ...base, type: 'boss', color: 'boss', topic: null, next: null };
    }
    if (forkTargets.has(p.index)) {
      return {
        ...base,
        type: 'fork',
        color: 'fork',
        topic: cfg.topics.green ?? null, // sphinx sub-topic when the realm has one
        next: { shortcut: forkTargets.get(p.index), detour: p.index + 1 },
      };
    }
    const color = colors[colorCounter % colors.length];
    colorCounter += 1;
    return { ...base, type: 'colored', color, topic: cfg.topics[color], next: p.index + 1 };
  });

  const edges = [];
  tileTrack.forEach((t) => {
    if (t.type === 'boss') return;
    if (t.type === 'fork') {
      edges.push({ from: t.index, to: t.next.detour, kind: 'detour' });
      edges.push({ from: t.index, to: t.next.shortcut, kind: 'shortcut' });
    } else {
      edges.push({ from: t.index, to: t.index + 1, kind: 'main' });
    }
  });

  return {
    realm,
    grade,
    stage,
    totalTiles,
    topics: cfg.topics,
    tileTrack,
    edges,
    spacing,
    bossIndex,
    shortcuts,
    background, // static asset URL when asset-backed, else null
    aspect, // CSS aspect-ratio string locking the board to the art proportions
    isStatic,
  };
}

/** Colors that actually appear on a realm's track (drives the draw deck). */
export function getStageColors(realm) {
  const cfg = REALM_CONFIG[realm];
  return cfg ? Object.keys(cfg.topics) : ['red', 'yellow', 'blue'];
}