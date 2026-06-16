/**
 * Central Realm Matrix — the data layout for the "Game of Life + Monopoly +
 * Candyland" board loop. Each Subject Realm declares its GRANULAR sub-topics
 * (one per tile color). The board itself is generated procedurally: its length
 * scales with grade & stage, and the snaking geometry comes from boardGenerator.
 *
 * Pillar 1 (Isolated Realms): color → sub-topic is scoped to the realm.
 */
import { generateSnakingLayout } from '../systems/boardGenerator.js';

/** Dynamic length: longer boards for higher grades/stages. */
export function totalTilesFor(grade = 1, stage = 1) {
  return 10 + grade * 3 + stage * 2;
}

const GRID_WIDTH = 5; // tiles per serpentine row

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
    // Starry cosmos: layered star dots over a deep-space gradient.
    background:
      'radial-gradient(1.5px 1.5px at 18% 22%, #ffffffcc 50%, transparent 51%),' +
      'radial-gradient(1.5px 1.5px at 68% 58%, #c7d2fecc 50%, transparent 51%),' +
      'radial-gradient(1px 1px at 42% 80%, #ffffff99 50%, transparent 51%),' +
      'linear-gradient(160deg, #0b1026 0%, #1e1b4b 60%, #312e81 100%)',
    backgroundSize: '70px 70px, 110px 110px, 50px 50px, 100% 100%',
    text: 'text-indigo-50',
  },
  reading: {
    // Lush magical forest: leafy radial glows over a deep green canopy.
    background:
      'radial-gradient(circle at 82% 12%, #86efac55 0%, transparent 38%),' +
      'radial-gradient(circle at 12% 88%, #4ade8044 0%, transparent 40%),' +
      'linear-gradient(180deg, #14532d 0%, #166534 70%, #15803d 100%)',
    text: 'text-emerald-50',
  },
  history: {
    // Aged parchment map: warm tan with a faint cartographer's grid + vignette.
    background:
      'repeating-linear-gradient(0deg, #00000010 0 1px, transparent 1px 28px),' +
      'repeating-linear-gradient(90deg, #00000010 0 1px, transparent 1px 28px),' +
      'radial-gradient(circle at 50% 40%, #fdf3da 0%, #e8cf9f 70%, #d8b878 100%)',
    text: 'text-amber-950',
  },
  math: {
    // Blueprint: cyan grid lines over a blueprint-blue gradient.
    background:
      'repeating-linear-gradient(0deg, #38bdf833 0 1px, transparent 1px 26px),' +
      'repeating-linear-gradient(90deg, #38bdf833 0 1px, transparent 1px 26px),' +
      'linear-gradient(180deg, #082f49 0%, #0c4a6e 60%, #075985 100%)',
    text: 'text-sky-50',
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
 *   rows, cols, bossIndex, shortcuts } | null}
 */
export function getStageConfig(realm, grade = 1, stage = 1) {
  const cfg = REALM_CONFIG[realm];
  if (!cfg) return null;

  const totalTiles = totalTilesFor(grade, stage);
  const { positions, rows, cols, cellW, cellH, shortcuts } = generateSnakingLayout(
    totalTiles,
    GRID_WIDTH,
  );
  const forkTargets = new Map(shortcuts.map((s) => [s.from, s.to]));
  const colors = Object.keys(cfg.topics);
  const bossIndex = totalTiles - 1;

  let colorCounter = 0;
  const tileTrack = positions.map((p) => {
    const base = { index: p.index, x: p.x, y: p.y, row: p.row, col: p.col };

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
    rows,
    cols,
    cellW,
    cellH,
    bossIndex,
    shortcuts,
  };
}

/** Colors that actually appear on a realm's track (drives the draw deck). */
export function getStageColors(realm) {
  const cfg = REALM_CONFIG[realm];
  return cfg ? Object.keys(cfg.topics) : ['red', 'yellow', 'blue'];
}