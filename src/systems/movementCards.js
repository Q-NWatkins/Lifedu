/**
 * Candyland-style movement deck. Cards are tied to COLORS, not step counts.
 * Playing a card scans ahead on the track for the matching colored tile(s):
 *   count 1 → the next tile of that color, count 2 → the second one, etc.
 */

export const COLOR_CARD_POOL = [
  { id: 'single-red', name: 'Single Red', emoji: '🔴', type: 'color', count: 1, color: 'red', tile: 'bg-red-400' },
  { id: 'double-red', name: 'Double Red', emoji: '🔴🔴', type: 'color', count: 2, color: 'red', tile: 'bg-red-400' },
  { id: 'single-yellow', name: 'Single Yellow', emoji: '🟡', type: 'color', count: 1, color: 'yellow', tile: 'bg-yellow-300' },
  { id: 'double-yellow', name: 'Double Yellow', emoji: '🟡🟡', type: 'color', count: 2, color: 'yellow', tile: 'bg-yellow-300' },
  { id: 'single-blue', name: 'Single Blue', emoji: '🔵', type: 'color', count: 1, color: 'blue', tile: 'bg-sky-400' },
  { id: 'double-blue', name: 'Double Blue', emoji: '🔵🔵', type: 'color', count: 2, color: 'blue', tile: 'bg-sky-400' },
  { id: 'single-green', name: 'Single Green', emoji: '🟢', type: 'color', count: 1, color: 'green', tile: 'bg-green-400' },
  { id: 'double-green', name: 'Double Green', emoji: '🟢🟢', type: 'color', count: 2, color: 'green', tile: 'bg-green-400' },
];

/** Pool restricted to the colors that actually appear on the active track. */
function poolForColors(colors) {
  if (!colors || colors.length === 0) return COLOR_CARD_POOL;
  const allowed = new Set(colors);
  const filtered = COLOR_CARD_POOL.filter((c) => allowed.has(c.color));
  return filtered.length > 0 ? filtered : COLOR_CARD_POOL;
}

export function drawColorCard(colors) {
  const pool = poolForColors(colors);
  return { ...pool[Math.floor(Math.random() * pool.length)] };
}

export function drawColorHand(size = 3, colors) {
  return Array.from({ length: size }, () => drawColorCard(colors));
}

/** Remove the played card and top the hand back up to `size`. */
export function replenishColorHand(hand, playedIndex, colors, size = 3) {
  const next = hand.filter((_, i) => i !== playedIndex);
  while (next.length < size) {
    next.push(drawColorCard(colors));
  }
  return next;
}