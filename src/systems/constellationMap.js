import { getChestTilesForPath } from '../config/courseMaps.js';

/**
 * Builds a branching board map with a shared topology but a SUBJECT-SPECIFIC
 * geometry. Every subject keeps the same gameplay structure:
 *
 *   shared start → FORK → short path ──┐
 *                    └── long loop ───┴→ MERGE → BOSS
 *
 * (the long loop carries the Mystery Chest node). Only the on-screen placement
 * of the nodes changes per curriculum, giving each realm a distinct layout:
 *
 *   math    → Orbital Vortex       (spiral winding inward to a volcano core)
 *   science → Constellation Network (a scattered geometric web)
 *   reading → Canopy Climber       (an organic tree, branches split L/R upward)
 *   history → Tower Ascent         (a vertical zig-zag staircase to a peak)
 */

const NODE_SHAPES = ['circle', 'hexagon', 'diamond', 'square'];

const LAYOUT_BY_CURRICULUM = {
  math: 'orbital',
  science: 'constellation',
  reading: 'canopy',
  history: 'tower',
};

/** Per-layout viewport hints so the board never overlaps or collapses height. */
const LAYOUT_VIEW = {
  orbital: { aspectClass: 'aspect-square', maxWClass: 'max-w-lg' },
  constellation: { aspectClass: 'aspect-[5/4]', maxWClass: 'max-w-2xl' },
  canopy: { aspectClass: 'aspect-[3/4]', maxWClass: 'max-w-sm' },
  tower: { aspectClass: 'aspect-[3/4]', maxWClass: 'max-w-sm' },
};

function nodeTypeForStep(step, { milestones, chestTiles, isBoss, isFork, isMystery }) {
  if (isBoss) return 'boss';
  if (isFork) return 'fork';
  if (isMystery) return 'mysteryChest';
  if (chestTiles.has(step)) return 'chest';
  if (milestones.has(step)) return 'quiz';
  return 'lesson';
}

/** Deterministic 0..1 pseudo-random from an integer seed (stable per node id). */
function seededUnit(seed) {
  const s = Math.sin(seed * 127.1 + 0.5) * 43758.5453;
  return s - Math.floor(s);
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Pick `count` evenly spaced items from `arr` (stable, no duplicates). */
function pickEvenly(arr, count) {
  if (count <= 0 || arr.length === 0) return [];
  if (count >= arr.length) return [...arr];
  const out = [];
  const used = new Set();
  for (let i = 0; i < count; i++) {
    const idx = Math.round(((i + 1) * arr.length) / (count + 1));
    const clamped = clamp(idx, 0, arr.length - 1);
    if (!used.has(clamped)) {
      used.add(clamped);
      out.push(arr[clamped]);
    }
  }
  return out;
}

/* ── Placement strategies ──────────────────────────────────────────────────
 * Each receives the resolved structure and writes node.x / node.y (in a 0..100
 * coordinate space matching MapComponent's viewBox). Topology is identical
 * across strategies; only coordinates differ.
 */

function placeOrbital(struct) {
  const { byId, prefixIds, shortIds, longIds, mergeId, bossId, mysteryArrayIndex } = struct;
  const cx = 50;
  const cy = 52;
  const P = prefixIds.length;
  const S = shortIds.length;
  const L = longIds.length;
  const spineMax = P + S + 1; // boss sits at fraction 1
  const turns = 2.15;
  const startAngle = -Math.PI / 2;

  const radial = (f) => 44 - f * 38; // 44 (outer rim) → 6 (core)
  const place = (id, f, rOffset = 0) => {
    const angle = startAngle + f * turns * Math.PI * 2;
    const r = Math.max(2, radial(f) + rOffset);
    byId[id].x = clamp(cx + Math.cos(angle) * r, 6, 94);
    byId[id].y = clamp(cy + Math.sin(angle) * r * 0.92, 6, 94);
  };

  prefixIds.forEach((id, i) => place(id, i / spineMax));
  shortIds.forEach((id, j) => place(id, (P + j + 1) / spineMax));

  const forkF = (P - 1) / spineMax;
  const mergeF = (P + S) / spineMax;
  longIds.forEach((id, k) => {
    const localT = (k + 1) / (L + 1);
    const f = forkF + localT * (mergeF - forkF);
    place(id, f, k === mysteryArrayIndex ? 12 : 7); // long loop bulges outward
  });

  place(mergeId, mergeF);
  place(bossId, 1); // central volcano core
}

function placeConstellation(struct) {
  const { byId, prefixIds, shortIds, longIds, mergeId, bossId, mysteryArrayIndex } = struct;
  const P = prefixIds.length;
  const S = shortIds.length;
  const L = longIds.length;
  const spineMax = P + S + 1;
  const xAt = (f) => 8 + f * 82;
  const jitter = (id, spread) => (seededUnit(id + 1) - 0.5) * spread;

  prefixIds.forEach((id, i) => {
    byId[id].x = clamp(xAt(i / spineMax), 6, 92);
    byId[id].y = clamp(48 + jitter(id, 26), 10, 90);
  });
  shortIds.forEach((id, j) => {
    byId[id].x = clamp(xAt((P + j + 1) / spineMax), 6, 92);
    byId[id].y = clamp(28 + jitter(id, 20), 8, 90); // upper web
  });

  const forkF = (P - 1) / spineMax;
  const mergeF = (P + S) / spineMax;
  longIds.forEach((id, k) => {
    const localT = (k + 1) / (L + 1);
    const f = forkF + localT * (mergeF - forkF);
    byId[id].x = clamp(xAt(f), 6, 92);
    byId[id].y =
      k === mysteryArrayIndex ? 86 : clamp(72 + jitter(id, 22), 12, 92); // lower web
  });

  byId[mergeId].x = clamp(xAt(mergeF), 6, 92);
  byId[mergeId].y = 48;
  byId[bossId].x = 92;
  byId[bossId].y = 16;
}

function placeCanopy(struct) {
  const { byId, prefixIds, shortIds, longIds, mergeId, bossId, mysteryArrayIndex } = struct;
  const P = prefixIds.length;
  const S = shortIds.length;
  const L = longIds.length;
  const spineMax = P + S + 1;
  const yAt = (f) => 92 - f * 86; // climb upward as progress increases

  const forkF = (P - 1) / spineMax;
  const mergeF = (P + S) / spineMax;

  // Central trunk with a gentle organic sway.
  prefixIds.forEach((id, i) => {
    byId[id].x = clamp(50 + Math.sin(i * 0.9) * 4, 10, 90);
    byId[id].y = yAt(i / spineMax);
  });

  // Left limb (short path) — bulges out, then curves back toward the trunk.
  shortIds.forEach((id, j) => {
    const t = (j + 1) / (S + 1);
    byId[id].x = clamp(50 - (10 + Math.sin(t * Math.PI) * 16), 8, 50);
    byId[id].y = yAt(forkF + t * (mergeF - forkF));
  });

  // Right limb (long loop) — wider bulge; the Mystery node reaches furthest out.
  longIds.forEach((id, k) => {
    const t = (k + 1) / (L + 1);
    const bulge = k === mysteryArrayIndex ? 30 : 18;
    byId[id].x = clamp(50 + (10 + Math.sin(t * Math.PI) * bulge), 50, 92);
    byId[id].y = yAt(forkF + t * (mergeF - forkF));
  });

  byId[mergeId].x = 50;
  byId[mergeId].y = yAt(mergeF);
  byId[bossId].x = 50;
  byId[bossId].y = 6; // canopy crown
}

function placeTower(struct) {
  const { byId, prefixIds, shortIds, longIds, mergeId, bossId, mysteryArrayIndex } = struct;
  const P = prefixIds.length;
  const S = shortIds.length;
  const L = longIds.length;
  const spineMax = P + S + 1;
  const yAt = (f) => 92 - f * 86; // ascend the tower

  const forkF = (P - 1) / spineMax;
  const mergeF = (P + S) / spineMax;

  // Base of the tower — alternating staircase columns.
  prefixIds.forEach((id, i) => {
    byId[id].x = i % 2 === 0 ? 40 : 60;
    byId[id].y = yAt(i / spineMax);
  });

  // Short branch hugs the left flight of stairs.
  shortIds.forEach((id, j) => {
    byId[id].x = j % 2 === 0 ? 22 : 40;
    byId[id].y = yAt(forkF + ((j + 1) / (S + 1)) * (mergeF - forkF));
  });

  // Long branch hugs the right flight; the Mystery step juts out furthest.
  longIds.forEach((id, k) => {
    byId[id].x = k === mysteryArrayIndex ? 88 : k % 2 === 0 ? 60 : 78;
    byId[id].y = yAt(forkF + ((k + 1) / (L + 1)) * (mergeF - forkF));
  });

  byId[mergeId].x = 50;
  byId[mergeId].y = yAt(mergeF);
  byId[bossId].x = 50;
  byId[bossId].y = 6; // castle peak
}

const PLACEMENTS = {
  orbital: placeOrbital,
  constellation: placeConstellation,
  canopy: placeCanopy,
  tower: placeTower,
};

/**
 * @returns {{
 *   nodes: Array,
 *   edges: Array,
 *   shortPath: number[],
 *   longPath: number[],
 *   forkNodeId: number,
 *   bossNodeId: number,
 *   mysteryNodeId: number|null,
 *   pathLength: number,
 *   bossStep: number,
 *   layoutId: string,
 *   view: { aspectClass: string, maxWClass: string },
 * }}
 */
export function buildConstellationLayout(course) {
  const pathLength = course.pathLength;
  const milestones = new Set(course.milestones ?? []);
  // Grade maps inject chests by count post-hoc (see below); legacy courses use
  // explicit/step-based chest tiles during node creation.
  const useChestCount = typeof course.chestCount === 'number';
  const chestTiles = new Set(
    useChestCount ? [] : course.chestTiles ?? getChestTilesForPath(pathLength),
  );

  const layoutId = course.layoutId ?? LAYOUT_BY_CURRICULUM[course.curriculumId] ?? 'constellation';

  const forkStep = Math.max(2, Math.floor(pathLength * 0.35));
  const shortRemainder = Math.max(2, Math.ceil((pathLength - forkStep) / 2));
  const loopSteps = Math.max(3, pathLength - forkStep - shortRemainder);

  const nodes = [];
  const byId = {};
  const edges = [];
  let id = 0;

  const addNode = (opts) => {
    const node = { id, shape: NODE_SHAPES[id % NODE_SHAPES.length], x: 50, y: 50, ...opts };
    nodes.push(node);
    byId[id] = node;
    return id++;
  };

  const addEdge = (from, to, branch = 'shared') => {
    edges.push({ from, to, branch });
  };

  // ── Shared prefix (steps 1 .. forkStep) ───────────────────────────────────
  const prefixIds = [];
  for (let step = 1; step <= forkStep; step++) {
    const isFork = step === forkStep;
    prefixIds.push(
      addNode({
        step,
        branch: 'shared',
        type: nodeTypeForStep(step, { milestones, chestTiles, isFork }),
        label: isFork ? 'Fork' : `${step}`,
      }),
    );
  }

  const forkNodeId = prefixIds[prefixIds.length - 1];

  // ── Short branch ──────────────────────────────────────────────────────────
  const shortIds = [];
  for (let i = 1; i <= shortRemainder; i++) {
    const step = forkStep + i;
    shortIds.push(
      addNode({
        step,
        branch: 'short',
        type: nodeTypeForStep(step, { milestones, chestTiles }),
        label: `${step}`,
      }),
    );
  }

  // ── Long loop (includes mystery chest mid-loop) ───────────────────────────
  const longIds = [];
  const mysteryStepIndex = Math.floor(loopSteps / 2); // matches legacy step numbering
  const mysteryArrayIndex = mysteryStepIndex - 1; // 0-based index within longIds
  let mysteryNodeId = null;

  for (let i = 1; i <= loopSteps; i++) {
    const step = forkStep + i;
    const isMystery = i === mysteryStepIndex;
    if (isMystery) mysteryNodeId = id;

    longIds.push(
      addNode({
        step: step + shortRemainder,
        branch: 'long',
        type: nodeTypeForStep(step + shortRemainder, { milestones, chestTiles, isMystery }),
        label: isMystery ? '?' : `${step + shortRemainder}`,
      }),
    );
  }

  // ── Merge node + Boss ─────────────────────────────────────────────────────
  const mergeId = addNode({
    step: pathLength,
    branch: 'shared',
    type: nodeTypeForStep(pathLength, { milestones, chestTiles }),
    label: `${pathLength}`,
  });

  const bossNodeId = addNode({
    step: pathLength + 1,
    branch: 'shared',
    type: 'boss',
    label: 'Boss',
  });

  // ── Interactive obstacle nodes (Mini-Boss, Side-Boss, Hazards) ────────────
  // Mini-Bosses sit on the SHARED prefix (everyone passes it), so they gate
  // progress no matter which fork branch the player later takes. Higher grades
  // request more of them — multiple mandatory blockades on long endurance maps.
  const miniBossNodeIds = [];
  const miniBossCount = Math.max(0, course.miniBossCount ?? 1);
  if (miniBossCount > 0 && prefixIds.length >= 3) {
    const interior = prefixIds.slice(1, prefixIds.length - 1); // exclude start & fork
    pickEvenly(interior, Math.min(miniBossCount, interior.length)).forEach((id) => {
      byId[id].type = 'miniBoss';
      byId[id].label = 'Mini-Boss';
      miniBossNodeIds.push(id);
    });
  }
  const miniBossNodeId = miniBossNodeIds[0] ?? null;

  // Side-Boss: hidden on the OPTIONAL long loop (skip the mystery node), so only
  // explorers who pick the long branch can find and challenge it for its prize.
  let sideBossNodeId = null;
  if (longIds.length >= 2) {
    let sideIdx = Math.min(longIds.length - 1, Math.max(0, Math.floor(longIds.length * 0.66)));
    if (sideIdx === mysteryArrayIndex) sideIdx = Math.max(0, sideIdx - 1);
    if (sideIdx !== mysteryArrayIndex) {
      sideBossNodeId = longIds[sideIdx];
      byId[sideBossNodeId].type = 'sideBoss';
      byId[sideBossNodeId].label = 'Side-Boss';
    }
  }

  // Hazard / trap tiles: scattered across the branch lesson nodes. Frequency
  // climbs with grade (none at Grade 1, several at Grade 3+).
  const hazardNodeIds = [];
  const hazardCount = Math.max(0, course.hazardCount ?? 0);
  if (hazardCount > 0) {
    const candidates = [...shortIds, ...longIds].filter((id) => byId[id].type === 'lesson');
    pickEvenly(candidates, Math.min(hazardCount, candidates.length)).forEach((id) => {
      byId[id].type = 'hazard';
      byId[id].label = 'Trap';
      hazardNodeIds.push(id);
    });
  }

  // Count-based chest injection (grade rarity). Chests fill remaining lesson
  // nodes across both branches AFTER bosses/hazards have claimed theirs.
  if (useChestCount) {
    const chestCount = Math.max(0, course.chestCount);
    const candidates = [...shortIds, ...longIds, ...prefixIds.slice(1, -1)].filter(
      (id) => byId[id].type === 'lesson',
    );
    pickEvenly(candidates, Math.min(chestCount, candidates.length)).forEach((id) => {
      byId[id].type = 'chest';
      byId[id].label = 'Treasure';
    });
  }

  // ── Apply the subject-specific geometry ───────────────────────────────────
  const placement = PLACEMENTS[layoutId] ?? placeConstellation;
  placement({
    byId,
    prefixIds,
    shortIds,
    longIds,
    mergeId,
    bossId: bossNodeId,
    mysteryArrayIndex,
  });

  // ── Edges ─────────────────────────────────────────────────────────────────
  for (let i = 0; i < prefixIds.length - 1; i++) {
    addEdge(prefixIds[i], prefixIds[i + 1], 'shared');
  }

  addEdge(forkNodeId, shortIds[0], 'short');
  for (let i = 0; i < shortIds.length - 1; i++) {
    addEdge(shortIds[i], shortIds[i + 1], 'short');
  }
  addEdge(shortIds[shortIds.length - 1], mergeId, 'short');

  addEdge(forkNodeId, longIds[0], 'long');
  for (let i = 0; i < longIds.length - 1; i++) {
    addEdge(longIds[i], longIds[i + 1], 'long');
  }
  addEdge(longIds[longIds.length - 1], mergeId, 'long');

  addEdge(mergeId, bossNodeId, 'shared');

  const shortPath = [...prefixIds, ...shortIds, mergeId, bossNodeId];
  const longPath = [...prefixIds, ...longIds, mergeId, bossNodeId];

  return {
    nodes,
    edges,
    shortPath,
    longPath,
    forkNodeId,
    bossNodeId,
    mysteryNodeId,
    miniBossNodeId,
    miniBossNodeIds,
    sideBossNodeId,
    hazardNodeIds,
    pathLength,
    bossStep: pathLength + 1,
    layoutId,
    view: LAYOUT_VIEW[layoutId] ?? LAYOUT_VIEW.constellation,
  };
}

export function getPathForBranch(layout, branch) {
  return branch === 'long' ? layout.longPath : layout.shortPath;
}

export function stepAtPathIndex(layout, path, pathIndex) {
  const nodeId = path[pathIndex];
  const node = layout.nodes.find((n) => n.id === nodeId);
  return node?.step ?? pathIndex + 1;
}

export function pathIndexForStep(layout, path, step) {
  return path.findIndex((nodeId) => {
    const node = layout.nodes.find((n) => n.id === nodeId);
    return node?.step === step;
  });
}
