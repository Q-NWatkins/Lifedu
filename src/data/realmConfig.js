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
  const { positions, rows, cols, shortcuts } = generateSnakingLayout(totalTiles, GRID_WIDTH);
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

  return { realm, grade, stage, totalTiles, topics: cfg.topics, tileTrack, edges, rows, cols, bossIndex, shortcuts };
}

/** Colors that actually appear on a realm's track (drives the draw deck). */
export function getStageColors(realm) {
  const cfg = REALM_CONFIG[realm];
  return cfg ? Object.keys(cfg.topics) : ['red', 'yellow', 'blue'];
}