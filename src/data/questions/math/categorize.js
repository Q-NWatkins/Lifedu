/**
 * Grade 1 Math auto-categorization + tile-color ↔ category legend.
 *
 * Categories (the "legend"):
 *   addition_basics     — '+' equations or joining / getting-more word problems.
 *   subtraction_basics  — '-' equations or take-away / remaining word problems.
 *   geometry_shapes     — shapes, sides, corners, roundness, or time/clock.
 *   number_sense        — counting, comparing, place value, or sequences.
 *
 * Board tile colors bind strictly to a category (math realm):
 *   red → addition_basics · yellow → subtraction_basics · blue → geometry_shapes
 * (green → number_sense where a realm uses a 4th color / sphinx tile).
 */

export const MATH_CATEGORIES = Object.freeze([
  'addition_basics',
  'subtraction_basics',
  'geometry_shapes',
  'number_sense',
]);

const CATEGORY_SET = new Set(MATH_CATEGORIES);

/** Board tile color → question category (math realm legend). */
export const TILE_COLOR_CATEGORY = Object.freeze({
  red: 'addition_basics',
  yellow: 'subtraction_basics',
  blue: 'geometry_shapes',
  green: 'number_sense',
});

/**
 * Deterministically classify a Grade 1 math question by its prompt text.
 * Order matters: geometry/time first (so a "9 sides" shape question never reads
 * as addition), then subtraction (take-away wins over any stray numbers), then
 * addition, then number sense as the catch-all.
 */
export function categorizeMathQuestion(prompt = '') {
  const text = String(prompt).toLowerCase();

  // 1) Geometry & shapes — plus time/clock questions.
  if (
    /\b(shape|shapes|side|sides|corner|corners|round|triangle|square|rectangle|circle|oval|angle|angles)\b/.test(
      text,
    ) ||
    /\b(time|clock|hour|minute|minutes|o'clock)\b/.test(text)
  ) {
    return 'geometry_shapes';
  }

  // 2) Subtraction — minus equations OR take-away / remaining language.
  if (
    /\d\s*[-−]\s*\d/.test(text) ||
    /\b(minus|subtract|take away|takes away|took away|gives away|give away|gave away|fewer|left|remain|remaining|fly away|flew away)\b/.test(
      text,
    )
  ) {
    return 'subtraction_basics';
  }

  // 3) Addition — plus equations OR joining / getting-more language.
  if (
    /\d\s*\+\s*\d/.test(text) ||
    /\b(plus|add|adds|added|sum|total|altogether|in all|combined|more|gets|got|join|joins)\b/.test(
      text,
    )
  ) {
    return 'addition_basics';
  }

  // 4) Number sense — counting, comparing, place value, sequences (catch-all).
  return 'number_sense';
}

/** Normalize a tile topic ('addition-basics') to a category ('addition_basics'). */
export function topicToCategory(topic) {
  if (!topic) return null;
  const key = String(topic).replace(/-/g, '_');
  return CATEGORY_SET.has(key) ? key : null;
}

/**
 * Resolve the category a tile must serve.
 *
 * The realm-scoped `topic` is authoritative (e.g. math's red tile carries
 * 'addition-basics' → 'addition_basics'). The color legend is consulted only as
 * a backstop AND only for math banks, so a red tile in a non-math realm can
 * never be mis-read as `addition_basics`. Returns null for non-math tiles, so
 * callers keep their generic behavior.
 */
export function resolveTileCategory({ topic, color, bankId } = {}) {
  const fromTopic = topicToCategory(topic);
  if (fromTopic) return fromTopic;

  if (color && String(bankId ?? '').startsWith('math')) {
    const fromColor = TILE_COLOR_CATEGORY[color];
    if (CATEGORY_SET.has(fromColor)) return fromColor;
  }
  return null;
}

/**
 * Guaranteed same-category fallback questions. Used only if BOTH the active
 * stage bank AND the global Grade-1 pool somehow have zero of a category — so a
 * blue tile can never, under any circumstance, serve a subtraction question.
 */
export const FALLBACK_BY_CATEGORY = Object.freeze({
  addition_basics: {
    id: 'fb-math-add',
    prompt: 'What is 3 + 4?',
    options: ['5', '6', '7', '8'],
    correctIndex: 2,
    difficulty: 'easy',
    category: 'addition_basics',
  },
  subtraction_basics: {
    id: 'fb-math-sub',
    prompt: 'What is 8 - 3?',
    options: ['3', '4', '5', '6'],
    correctIndex: 2,
    difficulty: 'easy',
    category: 'subtraction_basics',
  },
  geometry_shapes: {
    id: 'fb-math-geo',
    prompt: 'How many sides does a square have?',
    options: ['2', '3', '4', '5'],
    correctIndex: 2,
    difficulty: 'easy',
    category: 'geometry_shapes',
  },
  number_sense: {
    id: 'fb-math-num',
    prompt: 'What number comes after 6?',
    options: ['5', '6', '7', '8'],
    correctIndex: 2,
    difficulty: 'easy',
    category: 'number_sense',
  },
});