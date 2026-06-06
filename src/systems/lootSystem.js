/**
 * Weighted RPG loot table — cosmetic items for chest tiles & rewards.
 */

export const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

export const RARITY_WEIGHTS = [
  { rarity: 'Common', weight: 60 },
  { rarity: 'Uncommon', weight: 25 },
  { rarity: 'Rare', weight: 10 },
  { rarity: 'Epic', weight: 4.5 },
  { rarity: 'Legendary', weight: 0.5 },
];

export const CATEGORY_EMOJI = {
  hat: '🎩',
  clothing: '👕',
  pet: '🐉',
  badge: '🏅',
};

export const LOOT_ITEMS = [
  // Common
  { id: 'hat-worn-cap', name: 'Worn Cap', category: 'hat', rarity: 'Common' },
  { id: 'cloth-plain-tee', name: 'Plain Tee', category: 'clothing', rarity: 'Common' },
  { id: 'pet-dust-bunny', name: 'Dust Bunny', category: 'pet', rarity: 'Common' },
  { id: 'badge-starter', name: 'Starter Star', category: 'badge', rarity: 'Common' },
  { id: 'hat-sun-visor', name: 'Sun Visor', category: 'hat', rarity: 'Common' },
  // Uncommon
  { id: 'hat-cool-cap', name: 'Cool Cap', category: 'hat', rarity: 'Uncommon' },
  { id: 'cloth-hoodie', name: 'Quest Hoodie', category: 'clothing', rarity: 'Uncommon' },
  { id: 'pet-pup', name: 'Loyal Pup', category: 'pet', rarity: 'Uncommon' },
  { id: 'badge-pathfinder', name: 'Pathfinder Pin', category: 'badge', rarity: 'Uncommon' },
  // Rare
  { id: 'hat-wizard', name: 'Wizard Hat', category: 'hat', rarity: 'Rare' },
  { id: 'cloth-armor-vest', name: 'Scholar Vest', category: 'clothing', rarity: 'Rare' },
  { id: 'pet-owl', name: 'Wise Owl', category: 'pet', rarity: 'Rare' },
  { id: 'badge-champion', name: 'Champion Crest', category: 'badge', rarity: 'Rare' },
  // Epic
  { id: 'hat-neon-crown', name: 'Neon Crown', category: 'hat', rarity: 'Epic' },
  { id: 'cloth-star-cloak', name: 'Starlight Cloak', category: 'clothing', rarity: 'Epic' },
  { id: 'pet-dragon', name: 'Mini Dragon', category: 'pet', rarity: 'Epic' },
  { id: 'badge-epic-scholar', name: 'Epic Scholar', category: 'badge', rarity: 'Epic' },
  // Legendary
  { id: 'hat-golden-laurel', name: 'Golden Laurel', category: 'hat', rarity: 'Legendary' },
  { id: 'cloth-phoenix-robes', name: 'Phoenix Robes', category: 'clothing', rarity: 'Legendary' },
  { id: 'pet-phoenix', name: 'Baby Phoenix', category: 'pet', rarity: 'Legendary' },
  { id: 'badge-legend-hero', name: 'Legend Hero Medal', category: 'badge', rarity: 'Legendary' },
];

export const RARITY_STYLES = {
  Common: {
    card: 'bg-stone-200 border-stone-600',
    label: 'text-stone-700',
  },
  Uncommon: {
    card: 'bg-green-200 border-green-600',
    label: 'text-green-800',
  },
  Rare: {
    card: 'bg-blue-200 border-blue-600',
    label: 'text-blue-800',
  },
  Epic: {
    card: 'animate-pulse border-purple-500 bg-purple-100 shadow-[0_0_15px_#a855f7]',
    label: 'text-purple-800',
  },
  Legendary: {
    card: 'border-amber-500 bg-amber-100 shadow-[0_0_30px_#f59e0b]',
    label: 'text-amber-800',
  },
};

function rollRarity() {
  const roll = Math.random() * 100;
  let cumulative = 0;

  for (const { rarity, weight } of RARITY_WEIGHTS) {
    cumulative += weight;
    if (roll < cumulative) return rarity;
  }

  return 'Common';
}

/**
 * Roll a random cosmetic item using weighted rarity probabilities.
 */
export function rollLoot() {
  const rarity = rollRarity();
  const pool = LOOT_ITEMS.filter((item) => item.rarity === rarity);
  const fallback = LOOT_ITEMS.filter((item) => item.rarity === 'Common');

  const source = pool.length > 0 ? pool : fallback;
  return { ...source[Math.floor(Math.random() * source.length)] };
}

export function getItemEmoji(item) {
  return CATEGORY_EMOJI[item?.category] ?? '🎁';
}
