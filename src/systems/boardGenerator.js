/**
 * Procedural board geometry — a spacious, winding "Candyland" track.
 *
 * The grid (cols/rows/cellW/cellH) is GONE. Instead every tile is distributed by
 * arc-length along a single, expansive continuous curve — a rounded-rectangle
 * "racetrack" loop that hugs the OUTER edge of a 100×100 relative canvas. This:
 *   - keeps the whole CENTER of the board open (negative space) so the thematic
 *     background art is never obscured by dense paths, and
 *   - guarantees EVEN spacing: because the loop has a fixed length and tiles are
 *     placed at equal arc-length intervals, no two tiles can collide. The caller
 *     sizes tiles from the returned `spacing`, so the cushion holds for any count.
 *
 * `generateSnakingLayout(totalTiles, opts)` returns:
 *   { positions: [{ index, x, y }], spacing, shortcuts: [{ from, to }] }
 */

import { getStaticMap, hasStaticTrack } from '../data/staticMaps.js';

const MARGIN = 14; // inset from the canvas edge (0–100 space)
const CORNER = 18; // corner radius of the racetrack
const GAP_FRACTION = 0.1; // open gap between the last (boss) and first (start) tile

/** Ordered perimeter segments of the rounded-rectangle loop + total length. */
function buildTrack() {
  const left = MARGIN;
  const right = 100 - MARGIN;
  const top = MARGIN;
  const bottom = 100 - MARGIN;
  const r = CORNER;
  const w = right - left - 2 * r; // horizontal straight length
  const h = bottom - top - 2 * r; // vertical straight length
  const arc = (Math.PI / 2) * r; // quarter-circle length

  // Clockwise from the top edge; each segment maps a local 0..len to an {x,y}.
  const segments = [
    { len: w, at: (d) => ({ x: left + r + d, y: top }) },
    { len: arc, at: (d) => onArc(right - r, top + r, r, -Math.PI / 2, d / r) },
    { len: h, at: (d) => ({ x: right, y: top + r + d }) },
    { len: arc, at: (d) => onArc(right - r, bottom - r, r, 0, d / r) },
    { len: w, at: (d) => ({ x: right - r - d, y: bottom }) },
    { len: arc, at: (d) => onArc(left + r, bottom - r, r, Math.PI / 2, d / r) },
    { len: h, at: (d) => ({ x: left, y: bottom - r - d }) },
    { len: arc, at: (d) => onArc(left + r, top + r, r, Math.PI, d / r) },
  ];
  const total = segments.reduce((s, seg) => s + seg.len, 0);
  return { segments, total };
}

function onArc(cx, cy, r, startAngle, theta) {
  const a = startAngle + theta;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/** Point at absolute arc-length `d` along the track. */
function pointAt(track, d) {
  let remaining = d % track.total;
  for (const seg of track.segments) {
    if (remaining <= seg.len) return seg.at(remaining);
    remaining -= seg.len;
  }
  const last = track.segments[track.segments.length - 1];
  return last.at(last.len);
}

/**
 * @param {number} totalTiles
 * @param {{ shortcutEvery?: number }} [opts]
 */
export function generateSnakingLayout(totalTiles, opts = {}) {
  const count = Math.max(2, totalTiles);
  const shortcutEvery = opts.shortcutEvery ?? 7;

  const track = buildTrack();
  // Spread tiles over most of the loop, leaving a clear gap so the path reads as
  // a track with a beginning (start) and an end (boss) rather than a closed ring.
  const usable = track.total * (1 - GAP_FRACTION);
  const step = usable / (count - 1);

  const positions = [];
  for (let i = 0; i < count; i += 1) {
    const { x, y } = pointAt(track, i * step);
    positions.push({ index: i, x, y });
  }

  // ── Periodic shortcuts (jump ahead, guarded by a Sphinx) ────────────────────
  const shortcuts = [];
  const SKIP = 3;
  for (let from = 4; from <= count - 5; from += shortcutEvery) {
    const to = Math.min(count - 2, from + SKIP);
    if (to > from + 1) shortcuts.push({ from, to });
  }

  return { positions, spacing: step, shortcuts };
}

/** Smallest neighbor-to-neighbor distance in a position list (for tile sizing). */
function minNeighborSpacing(positions) {
  let min = Infinity;
  for (let i = 1; i < positions.length; i += 1) {
    const dx = positions[i].x - positions[i - 1].x;
    const dy = positions[i].y - positions[i - 1].y;
    min = Math.min(min, Math.hypot(dx, dy));
  }
  return Number.isFinite(min) ? min : 10;
}

/**
 * Layout SWITCH — the single entry point for board geometry.
 *
 *  - If a STATIC map exists for this realm/grade/stage, the procedural generator
 *    is bypassed entirely and the hand-tuned registry coordinates are returned
 *    (mapped to the { index, x, y } shape MapComponent expects), along with the
 *    background image to render and `isStatic: true`.
 *  - Otherwise it falls back to the procedural `generateSnakingLayout`.
 *
 * The return shape is identical in both cases, so callers (getStageConfig →
 * MapComponent / useGameLoop) need no special-casing and avatar movement /
 * tile-track state are unchanged.
 *
 * @returns {{ positions: {index,x,y}[], spacing, shortcuts, background, isStatic }}
 */
export function resolveLayout(realm, grade, stage, totalTiles, opts = {}) {
  // ── Asset bypass ────────────────────────────────────────────────────────────
  // When a registry entry has TRACED coordinates, skip ALL procedural geometry
  // (no rows, columns, or serpentine loops) and use the hand-placed coordinates
  // directly. Registered-but-untraced entries (empty coordinates) fall through to
  // the procedural layout so the game stays playable until the path is traced.
  const staticMap = getStaticMap(realm, grade, stage);
  if (staticMap && hasStaticTrack(realm, grade, stage)) {
    const positions = staticMap.coordinates.map((c, index) => ({ index, x: c.x, y: c.y }));
    return {
      positions,
      spacing: minNeighborSpacing(positions),
      shortcuts: [], // static maps have no procedural Sphinx shortcuts (yet)
      background: staticMap.image,
      aspect: staticMap.aspect ?? '1 / 1',
      isStatic: true,
    };
  }
  // Fallback: procedural geometry. If the stage HAS a registered image but isn't
  // traced yet, still surface that image + its aspect ratio so the art is visible
  // in-game (with the Dev clicker) for tracing — `isStatic` stays false so the
  // procedural tiles/road render on top until real coordinates land.
  const layout = generateSnakingLayout(totalTiles, opts);
  return {
    ...layout,
    background: staticMap?.image ?? null,
    aspect: staticMap?.aspect ?? '1 / 1',
    isStatic: false,
  };
}

/** Tile count for a TRACED static map, or null (so procedural length is used). */
export function staticTileCount(realm, grade, stage) {
  const staticMap = getStaticMap(realm, grade, stage);
  return staticMap && staticMap.coordinates.length > 0 ? staticMap.coordinates.length : null;
}

/**
 * Grade → layout profile. Higher grades add more tiles (handled by totalTilesFor)
 * and more frequent Sphinx shortcuts cutting across the loop.
 */
export function layoutProfileFor(grade = 1) {
  if (grade <= 2) return { shortcutEvery: 9 };
  if (grade === 3) return { shortcutEvery: 8 };
  return { shortcutEvery: 6 };
}