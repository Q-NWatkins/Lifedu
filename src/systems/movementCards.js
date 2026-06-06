/**
 * Movement card deck — replaces dice rolls.
 */

export const CARD_POOL = [
  {
    id: 'step-1',
    name: 'Step +1',
    emoji: '👣',
    description: 'Take one careful step.',
    type: 'fixed',
    value: 1,
    color: 'bg-lime-300',
  },
  {
    id: 'sprint-3',
    name: 'Sprint +3',
    emoji: '💨',
    description: 'Burst forward three nodes!',
    type: 'fixed',
    value: 3,
    color: 'bg-orange-300',
  },
  {
    id: 'lucky-roll',
    name: 'Lucky Roll',
    emoji: '🎲',
    description: 'Roll 1–6 and move!',
    type: 'random',
    min: 1,
    max: 6,
    color: 'bg-violet-300',
  },
  {
    id: 'hop-2',
    name: 'Hop +2',
    emoji: '🐸',
    description: 'Bounce ahead two nodes.',
    type: 'fixed',
    value: 2,
    color: 'bg-sky-300',
  },
  {
    id: 'mega-4',
    name: 'Leap +4',
    emoji: '🚀',
    description: 'A big leap forward!',
    type: 'fixed',
    value: 4,
    color: 'bg-pink-300',
  },
];

export function drawMovementCard() {
  return { ...CARD_POOL[Math.floor(Math.random() * CARD_POOL.length)] };
}

export function drawHand(size = 3) {
  return Array.from({ length: size }, () => drawMovementCard());
}

export function resolveCardSteps(card) {
  if (!card) return 0;
  if (card.type === 'fixed') return card.value;
  if (card.type === 'random') {
    return Math.floor(Math.random() * (card.max - card.min + 1)) + card.min;
  }
  return 1;
}

export function replenishHand(hand, playedIndex) {
  const next = hand.filter((_, i) => i !== playedIndex);
  while (next.length < 3) {
    next.push(drawMovementCard());
  }
  return next;
}
