/**
 * Places tiles on a snake/winding grid (like classic board games).
 * Even rows go left→right; odd rows go right→left.
 */
export function getColumnsForPathLength(pathLength) {
  if (pathLength <= 8) return 4;
  if (pathLength <= 18) return 5;
  if (pathLength <= 30) return 6;
  return 7;
}

export function getSnakeGridPosition(tileIndex, columns) {
  const row = Math.floor(tileIndex / columns);
  const colInRow = tileIndex % columns;
  const column = row % 2 === 0 ? colInRow + 1 : columns - colInRow;

  return { row: row + 1, column };
}

export function getGridDimensions(tileCount, columns) {
  const rows = Math.ceil(tileCount / columns);
  return { rows, columns };
}
