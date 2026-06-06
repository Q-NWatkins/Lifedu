import { getChestTilesForPath } from '../config/courseMaps.js';

/**
 * Builds a branching constellation map:
 *   shared start → FORK → short path ──┐
 *                    └── long loop ───┴→ BOSS
 * Long loop contains the Mystery Chest node.
 */

const NODE_SHAPES = ['circle', 'hexagon', 'diamond', 'square'];

function nodeTypeForStep(step, { milestones, chestTiles, isBoss, isFork, isMystery }) {
  if (isBoss) return 'boss';
  if (isFork) return 'fork';
  if (isMystery) return 'mysteryChest';
  if (chestTiles.has(step)) return 'chest';
  if (milestones.has(step)) return 'quiz';
  return 'lesson';
}

/**
 * @returns {{
 *   nodes: Array,
 *   edges: Array,
 *   shortPath: number[],
 *   longPath: number[],
 *   forkNodeId: number,
 *   bossNodeId: number,
 *   mysteryNodeId: number,
 * }}
 */
export function buildConstellationLayout(course) {
  const pathLength = course.pathLength;
  const milestones = new Set(course.milestones ?? []);
  const chestTiles = new Set(course.chestTiles ?? getChestTilesForPath(pathLength));

  const forkStep = Math.max(2, Math.floor(pathLength * 0.35));
  const shortRemainder = Math.max(2, Math.ceil((pathLength - forkStep) / 2));
  const loopSteps = Math.max(3, pathLength - forkStep - shortRemainder);

  const nodes = [];
  const edges = [];
  let id = 0;

  const addNode = (opts) => {
    const node = {
      id,
      shape: NODE_SHAPES[id % NODE_SHAPES.length],
      ...opts,
    };
    nodes.push(node);
    return id++;
  };

  const addEdge = (from, to, branch = 'shared') => {
    edges.push({ from, to, branch });
  };

  // ── Shared prefix (steps 1 .. forkStep) ───────────────────────────────────
  const prefixIds = [];
  for (let step = 1; step <= forkStep; step++) {
    const t = (step - 1) / Math.max(forkStep - 1, 1);
    const x = 12 + t * 28;
    const y = 82 - t * 22;
    const isFork = step === forkStep;
    prefixIds.push(
      addNode({
        step,
        x,
        y,
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
    const t = i / (shortRemainder + 1);
    shortIds.push(
      addNode({
        step,
        x: 42 + t * 22,
        y: 28 + t * 8,
        branch: 'short',
        type: nodeTypeForStep(step, { milestones, chestTiles }),
        label: `${step}`,
      }),
    );
  }

  // ── Long loop (includes mystery chest mid-loop) ─────────────────────────
  const longIds = [];
  const mysteryIndex = Math.floor(loopSteps / 2);
  let mysteryNodeId = null;

  for (let i = 1; i <= loopSteps; i++) {
    const step = forkStep + i;
    const angle = (i / loopSteps) * Math.PI * 1.35 + Math.PI * 0.1;
    const cx = 72;
    const cy = 52;
    const rx = 22;
    const ry = 28;
    const isMystery = i === mysteryIndex;

    if (isMystery) mysteryNodeId = id;

    longIds.push(
      addNode({
        step: step + shortRemainder,
        x: cx + Math.cos(angle) * rx,
        y: cy + Math.sin(angle) * ry,
        branch: 'long',
        type: nodeTypeForStep(step + shortRemainder, {
          milestones,
          chestTiles,
          isMystery,
        }),
        label: isMystery ? '?' : `${step + shortRemainder}`,
      }),
    );
  }

  // ── Merge node + Boss ───────────────────────────────────────────────────
  const mergeId = addNode({
    step: pathLength,
    x: 88,
    y: 22,
    branch: 'shared',
    type: nodeTypeForStep(pathLength, { milestones, chestTiles }),
    label: `${pathLength}`,
  });

  const bossNodeId = addNode({
    step: pathLength + 1,
    x: 92,
    y: 8,
    branch: 'shared',
    type: 'boss',
    label: 'Boss',
  });

  // ── Edges ───────────────────────────────────────────────────────────────
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
    pathLength,
    bossStep: pathLength + 1,
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
