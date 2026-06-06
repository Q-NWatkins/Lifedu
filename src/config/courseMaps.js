/**
 * Course Map Configuration — the "recipe book" for the progression engine.
 *
 * Each course becomes a board-game path:
 *   START → tile → tile → … → BOSS
 *
 * The frontend board component reads this file dynamically.
 * It never hard-codes path lengths or themes — it looks them up here.
 */

/** Core subject areas shown on the main game hub. */
export const CURRICULUMS = {
  math: {
    id: 'math',
    label: 'Math',
    icon: 'dice-math',
    color: '#e63946',
    description: 'Numbers, patterns, and problem-solving adventures.',
  },
  science: {
    id: 'science',
    label: 'Science',
    icon: 'flask',
    color: '#2a9d8f',
    description: 'Explore how the world and universe work.',
  },
  reading: {
    id: 'reading',
    label: 'Reading',
    icon: 'book',
    color: '#457b9d',
    description: 'Stories, sounds, and comprehension quests.',
  },
  history: {
    id: 'history',
    label: 'History',
    icon: 'scroll',
    color: '#e9c46a',
    description: 'Travel through time and meet the past.',
  },
};

/**
 * Tile types that can appear on a path.
 * Most tiles are "lesson" tiles; special tiles add board-game flair.
 */
export const TILE_TYPES = {
  START: 'start',
  LESSON: 'lesson',
  QUIZ: 'quiz',
  CHEST: 'chest',
  BONUS: 'bonus',
  REST: 'rest',
  BOSS: 'boss',
};

/**
 * Default chest tile positions for a path (e.g. tile 5 and 12).
 * Courses may override with their own `chestTiles` array.
 */
export function getChestTilesForPath(pathLength) {
  return [5, 12, 20, 26].filter((tile) => tile < pathLength);
}

/**
 * All playable courses.
 * `pathLength` = number of LESSON/QUIZ tiles BEFORE the boss (boss is extra).
 * `milestones` = tile indices (1-based) that trigger a quiz instead of a lesson.
 */
export const COURSE_MAPS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // MATH
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'single-digit-multiplication',
    curriculumId: 'math',
    title: 'Single-Digit Multiplication',
    subtitle: 'Master the times tables!',
    pathLength: 10,
    themeId: 'forest',
    questionBankId: 'math-single-digit-multiplication',
    milestones: [3, 6, 9],
    boss: {
      name: 'The Multiplication Monster',
      description: 'A leafy beast who guards the forest with tricky times-table riddles.',
      avatarKey: 'boss-multiplication-monster',
    },
    rewards: {
      completionBadge: 'badge-forest-conqueror',
      pawnOutfit: 'pawn-green-scout',
      backgroundUnlock: 'bg-forest-clearing',
    },
    prerequisites: [],
  },
  {
    id: 'double-digit-multiplication',
    curriculumId: 'math',
    title: 'Double-Digit Multiplication',
    subtitle: 'Level up your multiplication skills.',
    pathLength: 20,
    themeId: 'ocean',
    questionBankId: 'math-double-digit-multiplication',
    milestones: [5, 10, 15, 18],
    boss: {
      name: 'Captain Product',
      description: 'A pirate captain who multiplies treasure chests by the dozen.',
      avatarKey: 'boss-captain-product',
    },
    rewards: {
      completionBadge: 'badge-ocean-navigator',
      pawnOutfit: 'pawn-blue-sailor',
      backgroundUnlock: 'bg-ocean-reef',
    },
    prerequisites: ['single-digit-multiplication'],
  },
  {
    id: 'triple-digit-multiplication',
    curriculumId: 'math',
    title: 'Triple-Digit Multiplication',
    subtitle: 'The ultimate multiplication challenge.',
    pathLength: 30,
    themeId: 'volcano',
    questionBankId: 'math-triple-digit-multiplication',
    milestones: [5, 10, 15, 20, 25, 28],
    boss: {
      name: 'The Math Titan',
      description: 'A molten giant forged from the hardest multiplication problems.',
      avatarKey: 'boss-math-titan',
    },
    rewards: {
      completionBadge: 'badge-volcano-victor',
      pawnOutfit: 'pawn-red-warrior',
      backgroundUnlock: 'bg-volcano-summit',
    },
    prerequisites: ['double-digit-multiplication'],
  },
  {
    id: 'fractions-basics',
    curriculumId: 'math',
    title: 'Fractions Basics',
    subtitle: 'Slice pies and share fairly.',
    pathLength: 15,
    themeId: 'castle',
    questionBankId: 'math-fractions-basics',
    milestones: [4, 8, 12, 14],
    boss: {
      name: 'The Fraction Knight',
      description: 'A noble knight who only shares treasure in equal parts.',
      avatarKey: 'boss-fraction-knight',
    },
    rewards: {
      completionBadge: 'badge-fraction-master',
      pawnOutfit: 'pawn-purple-knight',
      backgroundUnlock: 'bg-castle-banquet',
    },
    prerequisites: ['single-digit-multiplication'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCIENCE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'solar-system',
    curriculumId: 'science',
    title: 'Solar System Explorer',
    subtitle: 'Visit every planet in our cosmic neighborhood.',
    pathLength: 12,
    themeId: 'space',
    questionBankId: 'science-solar-system',
    milestones: [3, 6, 9, 11],
    boss: {
      name: 'The Gravity Guardian',
      description: 'A cosmic entity that tests your knowledge of orbits and planets.',
      avatarKey: 'boss-gravity-guardian',
    },
    rewards: {
      completionBadge: 'badge-space-explorer',
      pawnOutfit: 'pawn-silver-astronaut',
      backgroundUnlock: 'bg-space-nebula',
    },
    prerequisites: [],
  },
  {
    id: 'states-of-matter',
    curriculumId: 'science',
    title: 'States of Matter',
    subtitle: 'Solid, liquid, gas — and beyond!',
    pathLength: 14,
    themeId: 'laboratory',
    questionBankId: 'science-states-of-matter',
    milestones: [4, 8, 12, 13],
    boss: {
      name: 'Professor Phase',
      description: 'A mad scientist who shifts between solid, liquid, and gas.',
      avatarKey: 'boss-professor-phase',
    },
    rewards: {
      completionBadge: 'badge-lab-genius',
      pawnOutfit: 'pawn-white-labcoat',
      backgroundUnlock: 'bg-lab-bubbles',
    },
    prerequisites: [],
  },
  {
    id: 'ecosystems',
    curriculumId: 'science',
    title: 'Ecosystem Adventures',
    subtitle: 'Follow the food chain from sun to apex predator.',
    pathLength: 18,
    themeId: 'forest',
    questionBankId: 'science-ecosystems',
    milestones: [5, 10, 15, 17],
    boss: {
      name: 'Mother Nature',
      description: 'The spirit of the forest who knows every creature and connection.',
      avatarKey: 'boss-mother-nature',
    },
    rewards: {
      completionBadge: 'badge-eco-champion',
      pawnOutfit: 'pawn-green-ranger',
      backgroundUnlock: 'bg-forest-canopy',
    },
    prerequisites: ['solar-system'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // READING
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'phonics-basics',
    curriculumId: 'reading',
    title: 'Phonics Basics',
    subtitle: 'Connect letters to sounds.',
    pathLength: 10,
    themeId: 'library',
    questionBankId: 'reading-phonics-basics',
    milestones: [3, 6, 9],
    boss: {
      name: 'The Alphabet Dragon',
      description: 'A friendly dragon who breathes letters instead of fire.',
      avatarKey: 'boss-alphabet-dragon',
    },
    rewards: {
      completionBadge: 'badge-phonics-star',
      pawnOutfit: 'pawn-gold-scholar',
      backgroundUnlock: 'bg-library-children',
    },
    prerequisites: [],
  },
  {
    id: 'reading-comprehension',
    curriculumId: 'reading',
    title: 'Reading Comprehension',
    subtitle: 'Read stories and prove you understand them.',
    pathLength: 16,
    themeId: 'library',
    questionBankId: 'reading-comprehension-short',
    milestones: [4, 8, 12, 15],
    boss: {
      name: 'The Story Sage',
      description: 'An ancient librarian who guards the greatest tales ever told.',
      avatarKey: 'boss-story-sage',
    },
    rewards: {
      completionBadge: 'badge-bookworm',
      pawnOutfit: 'pawn-teal-reader',
      backgroundUnlock: 'bg-library-stacks',
    },
    prerequisites: ['phonics-basics'],
  },
  {
    id: 'vocabulary-context',
    curriculumId: 'reading',
    title: 'Vocabulary in Context',
    subtitle: 'Decode unfamiliar words like a detective.',
    pathLength: 20,
    themeId: 'castle',
    questionBankId: 'reading-vocabulary-context',
    milestones: [5, 10, 15, 18],
    boss: {
      name: 'The Word Wizard',
      description: 'A sorcerer who speaks only in riddles and rare words.',
      avatarKey: 'boss-word-wizard',
    },
    rewards: {
      completionBadge: 'badge-vocab-virtuoso',
      pawnOutfit: 'pawn-indigo-wizard',
      backgroundUnlock: 'bg-castle-study',
    },
    prerequisites: ['reading-comprehension'],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HISTORY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'ancient-egypt',
    curriculumId: 'history',
    title: 'Ancient Egypt',
    subtitle: 'Pyramids, pharaohs, and the Nile.',
    pathLength: 14,
    themeId: 'desert',
    questionBankId: 'history-ancient-egypt',
    milestones: [4, 8, 12, 13],
    boss: {
      name: 'The Sphinx',
      description: 'A timeless guardian who only lets the wise pass.',
      avatarKey: 'boss-sphinx',
    },
    rewards: {
      completionBadge: 'badge-pharaoh',
      pawnOutfit: 'pawn-sand-explorer',
      backgroundUnlock: 'bg-desert-pyramids',
    },
    prerequisites: [],
  },
  {
    id: 'american-revolution',
    curriculumId: 'history',
    title: 'American Revolution',
    subtitle: 'Fight for freedom and founding ideas.',
    pathLength: 22,
    themeId: 'castle',
    questionBankId: 'history-american-revolution',
    milestones: [5, 10, 15, 20, 21],
    boss: {
      name: 'General Liberty',
      description: 'A revolutionary leader who tests your knowledge of independence.',
      avatarKey: 'boss-general-liberty',
    },
    rewards: {
      completionBadge: 'badge-patriot',
      pawnOutfit: 'pawn-burgundy-patriot',
      backgroundUnlock: 'bg-castle-hall',
    },
    prerequisites: ['ancient-egypt'],
  },
  {
    id: 'world-war-ii-basics',
    curriculumId: 'history',
    title: 'World War II Basics',
    subtitle: 'A pivotal chapter in world history.',
    pathLength: 28,
    themeId: 'desert',
    questionBankId: 'history-world-war-ii-basics',
    milestones: [5, 10, 15, 20, 25, 27],
    boss: {
      name: 'The Historian',
      description: 'Keeper of archives who demands precision and empathy.',
      avatarKey: 'boss-historian',
    },
    rewards: {
      completionBadge: 'badge-history-hero',
      pawnOutfit: 'pawn-olive-commander',
      backgroundUnlock: 'bg-desert-memorial',
    },
    prerequisites: ['american-revolution'],
  },
];
