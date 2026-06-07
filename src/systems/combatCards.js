/**
 * Combat Action Cards used in the boss battle hand.
 *
 * Every player starts with the three BASE cards. SPECIAL cards are permanent
 * unlocks earned by defeating Side-Boss nodes hidden on optional branches; once
 * unlocked they are appended to the player's hand in every future battle.
 */

export const BASE_COMBAT_CARDS = [
  {
    id: 'shield',
    name: 'Shield Block',
    emoji: '🛡️',
    effect: 'Block Next Attack',
    detail: 'Absorbs one boss strike',
    damage: 0,
    difficulty: 'easy',
    difficultyLabel: 'Easy',
    headerFrom: '#3b82f6',
    headerTo: '#1d4ed8',
    borderCls: 'border-blue-700',
    labelCls: 'bg-blue-100 text-blue-800',
    glowRgb: '59,130,246',
  },
  {
    id: 'strike',
    name: 'Basic Strike',
    emoji: '⚔️',
    effect: '25 Damage',
    detail: 'A sharp, fast slash',
    damage: 25,
    difficulty: 'medium',
    difficultyLabel: 'Medium',
    headerFrom: '#ef4444',
    headerTo: '#b91c1c',
    borderCls: 'border-red-700',
    labelCls: 'bg-red-100 text-red-800',
    glowRgb: '239,68,68',
  },
  {
    id: 'fireball',
    name: 'Mega Fireball',
    emoji: '🔥',
    effect: '50 Damage',
    detail: 'A devastating inferno',
    damage: 50,
    difficulty: 'hard',
    difficultyLabel: 'Hard',
    headerFrom: '#991b1b',
    headerTo: '#450a0a',
    borderCls: 'border-red-950',
    labelCls: 'bg-red-200 text-red-950',
    glowRgb: '153,27,27',
  },
];

export const SPECIAL_COMBAT_CARDS = {
  'double-strike': {
    id: 'double-strike',
    name: 'Double Damage Strike',
    emoji: '⚡',
    effect: '2× Strike (50 Dmg)',
    detail: 'Earned from a Side-Boss',
    damage: 50,
    difficulty: 'medium',
    difficultyLabel: 'Medium',
    special: true,
    headerFrom: '#a855f7',
    headerTo: '#6b21a8',
    borderCls: 'border-purple-700',
    labelCls: 'bg-purple-100 text-purple-800',
    glowRgb: '168,85,247',
  },
};

/** The special card a Side-Boss awards on defeat. */
export const SIDE_BOSS_REWARD_CARD_ID = 'double-strike';

export function getSpecialCard(cardId) {
  return SPECIAL_COMBAT_CARDS[cardId] ?? null;
}

/**
 * Resolve the player's full hand: the three base cards plus any permanently
 * unlocked special cards (deduped, order-stable).
 */
export function getPlayerHand(unlockedCardIds = []) {
  const specials = unlockedCardIds
    .map((id) => SPECIAL_COMBAT_CARDS[id])
    .filter(Boolean);
  return [...BASE_COMBAT_CARDS, ...specials];
}
