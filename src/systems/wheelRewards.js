/**
 * Daily Trivia Wheel prize segments.
 *
 * Each segment is one slice of the wheel with a colorful fill and a reward:
 *   - gems  → currency
 *   - steps → bonus movement step cards
 *   - item  → a random cosmetic rolled from the loot table
 */
export const WHEEL_SEGMENTS = [
  { id: 'gems-10', label: '+10 Gems', kind: 'gems', amount: 10, emoji: '💎', color: '#fbbf24' },
  { id: 'steps-2', label: '+2 Steps', kind: 'steps', amount: 2, emoji: '🎴', color: '#4ade80' },
  { id: 'item-1', label: 'Mystery Item', kind: 'item', amount: 1, emoji: '🎁', color: '#c084fc' },
  { id: 'gems-25', label: '+25 Gems', kind: 'gems', amount: 25, emoji: '💎', color: '#f59e0b' },
  { id: 'steps-1', label: '+1 Step', kind: 'steps', amount: 1, emoji: '🎴', color: '#86efac' },
  { id: 'item-2', label: 'Surprise Loot', kind: 'item', amount: 1, emoji: '🎁', color: '#60a5fa' },
  { id: 'gems-5', label: '+5 Gems', kind: 'gems', amount: 5, emoji: '💎', color: '#fb923c' },
  { id: 'steps-3', label: '+3 Steps', kind: 'steps', amount: 3, emoji: '🎴', color: '#2dd4bf' },
];

export const SEGMENT_COUNT = WHEEL_SEGMENTS.length;
export const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;

/** Pick a random winning segment index. */
export function rollSegmentIndex() {
  return Math.floor(Math.random() * SEGMENT_COUNT);
}

/**
 * Build the conic-gradient background string for the wheel face, with each
 * slice filled by its segment color.
 */
export function buildWheelGradient() {
  const stops = WHEEL_SEGMENTS.map((seg, i) => {
    const from = i * SEGMENT_ANGLE;
    const to = (i + 1) * SEGMENT_ANGLE;
    return `${seg.color} ${from}deg ${to}deg`;
  });
  return `conic-gradient(${stops.join(', ')})`;
}
