/**
 * Procedural board geometry — "The Game of Life" snaking road.
 *
 * `generateSnakingLayout` lays N tiles on a serpentine grid (left→right, drop,
 * right→left, drop, …) as normalized 0–100 coordinates so the board scales to
 * any tile count without nodes overlapping on small screens. It also emits
 * periodic "shortcut" jump-ahead edges that the loop guards with the Sphinx.
 */

const X_START = 10;
const X_END = 90;
const Y_START = 8;
const Y_END = 92;

/**
 * @param {number} totalTiles
 * @param {number} gridWidth  tiles per row (columns)
 * @returns {{ positions: Array<{index,row,col,x,y}>, rows: number, cols: number,
 *   shortcuts: Array<{from:number,to:number}> }}
 */
export function generateSnakingLayout(totalTiles, gridWidth = 5) {
  const cols = Math.max(2, gridWidth);
  const rows = Math.max(1, Math.ceil(totalTiles / cols));
  const colGap = cols > 1 ? (X_END - X_START) / (cols - 1) : 0;
  const rowGap = rows > 1 ? (Y_END - Y_START) / (rows - 1) : 0;

  const positions = [];
  for (let i = 0; i < totalTiles; i += 1) {
    const row = Math.floor(i / cols);
    const inRow = i % cols;
    // Serpentine: even rows run left→right, odd rows right→left.
    const col = row % 2 === 0 ? inRow : cols - 1 - inRow;
    positions.push({
      index: i,
      row,
      col,
      x: X_START + col * colGap,
      y: rows > 1 ? Y_START + row * rowGap : 50,
    });
  }

  // Periodic shortcuts: from tile `from`, jump ahead `SKIP+1` tiles. Spaced so
  // forks never sit on the START or BOSS tile and never overlap each other.
  const shortcuts = [];
  const SKIP = 3; // tiles leaped over
  const EVERY = cols + 2; // gap between successive forks (~7 on a 5-wide grid)
  for (let from = 4; from <= totalTiles - 5; from += EVERY) {
    const to = Math.min(totalTiles - 2, from + SKIP);
    if (to > from + 1) shortcuts.push({ from, to });
  }

  return { positions, rows, cols, shortcuts };
}