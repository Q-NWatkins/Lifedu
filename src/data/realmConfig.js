/**
 * Central Realm Matrix — the data layout for the "Game of Life + Monopoly +
 * Candyland" board loop. Each Subject Realm declares a fixed-length WINDING
 * track (15–25 tiles) whose colored tiles map to GRANULAR sub-topics of that one
 * subject, plus exactly one SPHINX FORK with a short-cut branch and a long
 * detour branch that rejoin at a merge tile.
 *
 * Pillar 1 (Isolated Realms): color → sub-topic is scoped to the realm.
 * Pillar 2 (Fixed length, variable complexity): totalTiles stays 15–25.
 */

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
    totalTiles: 15,
    topics: { red: 'biology-basics', yellow: 'space-basics', blue: 'physics-basics' },
  },
  math: {
    label: 'Math Citadel',
    totalTiles: 15,
    topics: { red: 'addition-basics', yellow: 'subtraction-basics', blue: 'geometry-shapes' },
  },
  reading: {
    label: 'Reading Realm',
    totalTiles: 15,
    topics: { red: 'nouns-verbs', yellow: 'vowel-sounds', blue: 'sight-words' },
  },
  history: {
    label: 'History Timeline',
    totalTiles: 18,
    topics: {
      red: 'domestic-heritage',
      yellow: 'ancient-cultures',
      blue: 'geography-maps',
      green: 'sphinx-riddles',
    },
  },
};

const PRE_COUNT = 3; // colored tiles before the fork
const SHORTCUT_COUNT = 2; // tiles on the quick branch
const DETOUR_COUNT = 4; // tiles on the long branch

const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Build a winding, branching track:
 *   START → pre-fork colored tiles → SPHINX FORK
 *        ├─ short-cut (few tiles) ─┐
 *        └─ long detour (more) ────┴→ MERGE → post colored tiles → BOSS
 *
 * Returns nodes (with x/y for the snaking render), edges (typed for drawing),
 * and the key fork/merge/boss indices.
 */
function buildWindingTrack(topics, totalTiles) {
  const colors = Object.keys(topics);
  const postCount = totalTiles - 4 - PRE_COUNT - SHORTCUT_COUNT - DETOUR_COUNT;

  const forkIndex = PRE_COUNT + 1;
  const shortcutStart = forkIndex + 1;
  const detourStart = shortcutStart + SHORTCUT_COUNT;
  const mergeIndex = detourStart + DETOUR_COUNT;
  const bossIndex = totalTiles - 1;

  let colorCounter = 0;
  const nextColor = () => colors[colorCounter++ % colors.length];
  const coloredTile = (index) => {
    const color = nextColor();
    return { index, type: 'colored', color, topic: topics[color] };
  };

  const nodes = new Array(totalTiles);
  nodes[0] = { index: 0, type: 'start', color: 'start', topic: null };
  for (let i = 1; i < forkIndex; i += 1) nodes[i] = coloredTile(i);
  nodes[forkIndex] = {
    index: forkIndex,
    type: 'fork',
    color: 'fork',
    topic: topics.green ?? null, // sphinx sub-topic when the realm has one
  };
  for (let i = shortcutStart; i < detourStart; i += 1) nodes[i] = coloredTile(i);
  for (let i = detourStart; i < mergeIndex; i += 1) nodes[i] = coloredTile(i);
  nodes[mergeIndex] = { index: mergeIndex, type: 'merge', color: 'merge', topic: null };
  for (let i = mergeIndex + 1; i < bossIndex; i += 1) nodes[i] = coloredTile(i);
  nodes[bossIndex] = { index: bossIndex, type: 'boss', color: 'boss', topic: null };

  // ── next pointers ──────────────────────────────────────────────────────────
  for (let i = 0; i < forkIndex; i += 1) nodes[i].next = i + 1; // …→ fork
  nodes[forkIndex].next = { shortcut: shortcutStart, detour: detourStart };
  for (let i = shortcutStart; i < detourStart - 1; i += 1) nodes[i].next = i + 1;
  nodes[detourStart - 1].next = mergeIndex; // last shortcut tile → merge
  for (let i = detourStart; i < mergeIndex - 1; i += 1) nodes[i].next = i + 1;
  nodes[mergeIndex - 1].next = mergeIndex; // last detour tile → merge
  for (let i = mergeIndex; i < bossIndex; i += 1) nodes[i].next = i + 1;
  nodes[bossIndex].next = null;

  // ── layout: detour is the long winding "main road"; shortcut arcs above ─────
  const mainOrder = [
    ...Array.from({ length: forkIndex + 1 }, (_, i) => i), // start..fork
    ...Array.from({ length: DETOUR_COUNT }, (_, i) => detourStart + i),
    ...Array.from({ length: totalTiles - mergeIndex }, (_, i) => mergeIndex + i), // merge..boss
  ];
  const cols = 5;
  const rows = Math.max(1, Math.ceil(mainOrder.length / cols));
  mainOrder.forEach((idx, k) => {
    const row = Math.floor(k / cols);
    const inRow = k % cols;
    const col = row % 2 === 0 ? inRow : cols - 1 - inRow; // serpentine
    nodes[idx].x = 10 + col * (80 / (cols - 1));
    nodes[idx].y = rows > 1 ? 14 + row * (72 / (rows - 1)) : 50;
  });
  // Short-cut bridge arcs above, between the fork and the merge.
  const fork = nodes[forkIndex];
  const merge = nodes[mergeIndex];
  for (let j = 0; j < SHORTCUT_COUNT; j += 1) {
    const t = (j + 1) / (SHORTCUT_COUNT + 1);
    const node = nodes[shortcutStart + j];
    node.x = lerp(fork.x, merge.x, t);
    node.y = Math.min(fork.y, merge.y) - 13;
  }

  // ── edges (typed for the renderer) ─────────────────────────────────────────
  const edges = [];
  const addEdge = (from, to, kind) => edges.push({ from, to, kind });
  for (let i = 0; i < forkIndex; i += 1) addEdge(i, i + 1, 'main');
  addEdge(forkIndex, shortcutStart, 'shortcut');
  for (let i = shortcutStart; i < detourStart - 1; i += 1) addEdge(i, i + 1, 'shortcut');
  addEdge(detourStart - 1, mergeIndex, 'shortcut');
  addEdge(forkIndex, detourStart, 'detour');
  for (let i = detourStart; i < mergeIndex - 1; i += 1) addEdge(i, i + 1, 'detour');
  addEdge(mergeIndex - 1, mergeIndex, 'detour');
  for (let i = mergeIndex; i < bossIndex; i += 1) addEdge(i, i + 1, 'main');

  return { tileTrack: nodes, edges, forkIndex, mergeIndex, bossIndex };
}

/**
 * Safe stage lookup.
 * @returns {{ realm, grade, stage, totalTiles, topics, tileTrack, edges,
 *   forkIndex, mergeIndex, bossIndex } | null}
 */
export function getStageConfig(realm, grade = 1, stage = 1) {
  const cfg = REALM_CONFIG[realm];
  if (!cfg) return null;
  const built = buildWindingTrack(cfg.topics, cfg.totalTiles);
  return { realm, grade, stage, totalTiles: cfg.totalTiles, topics: cfg.topics, ...built };
}

/** Colors that actually appear on a realm's track (drives the draw deck). */
export function getStageColors(realm) {
  const cfg = REALM_CONFIG[realm];
  return cfg ? Object.keys(cfg.topics) : ['red', 'yellow', 'blue'];
}