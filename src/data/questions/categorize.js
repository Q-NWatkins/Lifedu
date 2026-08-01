/**
 * Multi-subject question categorization + tile-color ↔ category legend.
 *
 * Every realm's colored board tiles bind strictly to a category, matching the
 * realm's tile topics in realmConfig.js (topic 'addition-basics' ↔ category
 * 'addition_basics'):
 *
 *   math    red addition_basics · yellow subtraction_basics · blue geometry_shapes · (green number_sense)
 *   reading red nouns_verbs      · yellow vowel_sounds       · blue sight_words
 *   science red biology_basics   · yellow space_basics       · blue physics_basics
 *   history red domestic_heritage· yellow ancient_cultures   · blue geography_maps
 */

export const SUBJECT_CATEGORIES = Object.freeze({
  math: ['addition_basics', 'subtraction_basics', 'geometry_shapes', 'number_sense'],
  reading: ['nouns_verbs', 'vowel_sounds', 'sight_words'],
  science: ['biology_basics', 'space_basics', 'physics_basics'],
  history: ['domestic_heritage', 'ancient_cultures', 'geography_maps'],
});

/** The math-only list, kept for backward compatibility. */
export const MATH_CATEGORIES = SUBJECT_CATEGORIES.math;

export const ALL_CATEGORIES = Object.freeze([
  ...new Set(Object.values(SUBJECT_CATEGORIES).flat()),
]);
const CATEGORY_SET = new Set(ALL_CATEGORIES);

/** Board tile color → category, per realm (the on-board legend). */
export const TILE_COLOR_CATEGORY = Object.freeze({
  math: { red: 'addition_basics', yellow: 'subtraction_basics', blue: 'geometry_shapes', green: 'number_sense' },
  reading: { red: 'nouns_verbs', yellow: 'vowel_sounds', blue: 'sight_words' },
  science: { red: 'biology_basics', yellow: 'space_basics', blue: 'physics_basics' },
  history: { red: 'domestic_heritage', yellow: 'ancient_cultures', blue: 'geography_maps' },
});

/* ── Per-subject classifiers ──────────────────────────────────────────────── */

export function categorizeMathQuestion(prompt = '') {
  const t = String(prompt).toLowerCase();
  if (
    /\b(shape|shapes|side|sides|corner|corners|round|triangle|square|rectangle|circle|oval|angle|angles)\b/.test(t) ||
    /\b(time|clock|hour|minute|minutes|o'clock)\b/.test(t)
  ) {
    return 'geometry_shapes';
  }
  if (
    /\d\s*[-−]\s*\d/.test(t) ||
    /\b(minus|subtract|take away|takes away|took away|gives away|give away|gave away|fewer|left|remain|remaining|fly away|flew away)\b/.test(t)
  ) {
    return 'subtraction_basics';
  }
  if (
    /\d\s*\+\s*\d/.test(t) ||
    /\b(plus|add|adds|added|sum|total|altogether|in all|combined|more|gets|got|join|joins)\b/.test(t)
  ) {
    return 'addition_basics';
  }
  return 'number_sense';
}

export function categorizeReadingQuestion(prompt = '') {
  const t = String(prompt).toLowerCase();
  // Phonics: rhyming, letters, sounds.
  if (
    /\b(rhyme|rhymes|letter|sound|sounds)\b/.test(t) ||
    /starts with|begins with|first letter|last letter|same sound/.test(t) ||
    /\/[a-z]\//.test(t)
  ) {
    return 'vowel_sounds';
  }
  // Word types & meanings (nouns / verbs / adjectives / vocabulary).
  if (
    /\b(noun|nouns|verb|verbs|naming word)\b/.test(t) ||
    /names? (an?|a) /.test(t) ||
    /\bis a (color|colour|fruit|person|place|animal)\b/.test(t) ||
    /\b(opposite|means the same|same as|describe|describes)\b/.test(t)
  ) {
    return 'nouns_verbs';
  }
  // Comprehension / sentences / story elements (default).
  return 'sight_words';
}

export function categorizeScienceQuestion(prompt = '') {
  const t = String(prompt).toLowerCase();
  // Astronomy first (sun/moon/stars/sky/planets/earth).
  if (/\b(sun|moon|star|stars|sky|planet|planets|space|solar|earth)\b/.test(t)) {
    return 'space_basics';
  }
  // Physical world: light, heat, matter/states, weather, seasons.
  if (
    /\b(light|heat|melt|melts|melted|ice|warm|cold|coldest|hot|season|seasons|winter|summer|spring|fall|rain|rains|raining|weather|umbrella|coat|coats|puddle|dried|froze|frozen|temperature)\b/.test(t)
  ) {
    return 'physics_basics';
  }
  // Life science: living things, plants, animals, body, senses (default).
  return 'biology_basics';
}

export function categorizeHistoryQuestion(prompt = '') {
  const t = String(prompt).toLowerCase();
  // Geography & maps.
  if (/\b(map|maps|direction|directions|location|locations|globe|continent)\b/.test(t)) {
    return 'geography_maps';
  }
  // Time / the past / historical records (the yellow "ancient cultures" bucket).
  if (
    /\b(past|ancestor|ancestors|history|timeline|calendar|date|century)\b/.test(t) ||
    /long ago|years ago|already happened|before you were born|before us|lived before|family stories|order (of|in which) events|earliest event/.test(t)
  ) {
    return 'ancient_cultures';
  }
  // Civics / community / national symbols / holidays (default).
  return 'domestic_heritage';
}

const CLASSIFIERS = {
  math: categorizeMathQuestion,
  reading: categorizeReadingQuestion,
  science: categorizeScienceQuestion,
  history: categorizeHistoryQuestion,
};

/** Classify a question for a given subject. */
export function categorizeQuestion(subject, prompt) {
  const fn = CLASSIFIERS[subject];
  return fn ? fn(prompt) : null;
}

/* ── Tile → category resolution ───────────────────────────────────────────── */

/** Normalize a tile topic ('biology-basics') to a category ('biology_basics'). */
export function topicToCategory(topic) {
  if (!topic) return null;
  const key = String(topic).replace(/-/g, '_');
  return CATEGORY_SET.has(key) ? key : null;
}

function subjectFromBankId(bankId) {
  const m = /^([a-z]+)-g\d/.exec(String(bankId ?? ''));
  return m ? m[1] : null;
}

/**
 * Resolve the category a tile must serve. The realm-scoped `topic` is
 * authoritative (works across all realms). The color legend is a backstop keyed
 * off the bank's subject, so a color can never be mis-read across realms.
 * Returns null when no category applies (caller keeps generic behavior).
 */
export function resolveTileCategory({ topic, color, bankId } = {}) {
  const fromTopic = topicToCategory(topic);
  if (fromTopic) return fromTopic;

  const subject = subjectFromBankId(bankId);
  if (subject && color && TILE_COLOR_CATEGORY[subject]) {
    const fromColor = TILE_COLOR_CATEGORY[subject][color];
    if (CATEGORY_SET.has(fromColor)) return fromColor;
  }
  return null;
}

/* ── Guaranteed same-category fallback questions (per category) ────────────── */

export const FALLBACK_BY_CATEGORY = Object.freeze({
  // Math
  addition_basics: { id: 'fb-math-add', prompt: 'What is 3 + 4?', options: ['5', '6', '7', '8'], correctIndex: 2, difficulty: 'easy', category: 'addition_basics' },
  subtraction_basics: { id: 'fb-math-sub', prompt: 'What is 8 - 3?', options: ['3', '4', '5', '6'], correctIndex: 2, difficulty: 'easy', category: 'subtraction_basics' },
  geometry_shapes: { id: 'fb-math-geo', prompt: 'How many sides does a square have?', options: ['2', '3', '4', '5'], correctIndex: 2, difficulty: 'easy', category: 'geometry_shapes' },
  number_sense: { id: 'fb-math-num', prompt: 'What number comes after 6?', options: ['5', '6', '7', '8'], correctIndex: 2, difficulty: 'easy', category: 'number_sense' },
  // Reading
  nouns_verbs: { id: 'fb-read-noun', prompt: 'Which word is a naming word (noun)?', options: ['run', 'book', 'fast', 'happy'], correctIndex: 1, difficulty: 'easy', category: 'nouns_verbs' },
  vowel_sounds: { id: 'fb-read-vowel', prompt: 'Which word rhymes with "cat"?', options: ['dog', 'hat', 'sun', 'pen'], correctIndex: 1, difficulty: 'easy', category: 'vowel_sounds' },
  sight_words: { id: 'fb-read-sight', prompt: 'Read: "The dog is big." What is big?', options: ['cat', 'dog', 'sun', 'ball'], correctIndex: 1, difficulty: 'easy', category: 'sight_words' },
  // Science
  biology_basics: { id: 'fb-sci-bio', prompt: 'Which of these is a living thing?', options: ['Rock', 'Tree', 'Chair', 'Cup'], correctIndex: 1, difficulty: 'easy', category: 'biology_basics' },
  space_basics: { id: 'fb-sci-space', prompt: 'What do we see in the sky at night?', options: ['Sun', 'Moon', 'Grass', 'Desk'], correctIndex: 1, difficulty: 'easy', category: 'space_basics' },
  physics_basics: { id: 'fb-sci-phys', prompt: 'What happens to ice when it gets warm?', options: ['It melts', 'It grows', 'It flies', 'It sleeps'], correctIndex: 0, difficulty: 'easy', category: 'physics_basics' },
  // History
  domestic_heritage: { id: 'fb-hist-dom', prompt: 'Who helps keep a community safe?', options: ['Police officer', 'Clown', 'Chef', 'Singer'], correctIndex: 0, difficulty: 'easy', category: 'domestic_heritage' },
  ancient_cultures: { id: 'fb-hist-anc', prompt: 'What do we call events that happened long ago?', options: ['History', 'Weather', 'Lunch', 'Recess'], correctIndex: 0, difficulty: 'easy', category: 'ancient_cultures' },
  geography_maps: { id: 'fb-hist-geo', prompt: 'What is a map used for?', options: ['Finding places', 'Cooking', 'Sleeping', 'Singing'], correctIndex: 0, difficulty: 'easy', category: 'geography_maps' },
});