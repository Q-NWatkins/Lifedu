/**
 * Local question database, strictly segmented by Subject and Grade Level (1–5).
 *
 * @typedef {Object} Question
 * @property {string} id
 * @property {'math'|'science'|'reading'|'history'} subject
 * @property {1|2|3|4|5} grade
 * @property {string} questionText
 * @property {string[]} options              exactly 4 choices
 * @property {string} correctAnswer          must be one of `options`
 * @property {number} points
 *
 * Content maps to elementary curriculum bands, e.g. Grade 1 Math = addition/
 * subtraction within 20, Grade 5 Math = fractions/decimals/percent; Grade 1
 * Reading = sight words/rhyming, Grade 5 Reading = metaphors/inference.
 *
 * Points scale with grade (base = grade × 10) with a slightly easier and a
 * slightly harder item per band so an optional `difficulty` refinement has a
 * real, data-backed effect without ever relaxing the subject/grade match.
 */

export const SUBJECTS = ['math', 'science', 'reading', 'history'];
export const GRADES = [1, 2, 3, 4, 5];

/** @type {Question[]} */
export const QUESTION_BANK = [
  // ─────────────────────────────── MATH ────────────────────────────────────
  // Grade 1 — addition & subtraction within 20
  { id: 'math-g1-1', subject: 'math', grade: 1, questionText: 'What is 2 + 3?', options: ['4', '5', '6', '7'], correctAnswer: '5', points: 5 },
  { id: 'math-g1-2', subject: 'math', grade: 1, questionText: 'What is 9 - 4?', options: ['3', '4', '5', '6'], correctAnswer: '5', points: 10 },
  { id: 'math-g1-3', subject: 'math', grade: 1, questionText: 'What is 6 + 7?', options: ['12', '13', '14', '15'], correctAnswer: '13', points: 10 },
  { id: 'math-g1-4', subject: 'math', grade: 1, questionText: 'What is 15 - 8?', options: ['6', '7', '8', '9'], correctAnswer: '7', points: 15 },
  // Grade 2 — two-digit add/subtract, skip counting
  { id: 'math-g2-1', subject: 'math', grade: 2, questionText: 'What is 24 + 13?', options: ['35', '36', '37', '38'], correctAnswer: '37', points: 15 },
  { id: 'math-g2-2', subject: 'math', grade: 2, questionText: 'What is 56 - 21?', options: ['33', '34', '35', '36'], correctAnswer: '35', points: 20 },
  { id: 'math-g2-3', subject: 'math', grade: 2, questionText: 'Count by 5s: 5, 10, 15, __?', options: ['16', '18', '20', '25'], correctAnswer: '20', points: 20 },
  { id: 'math-g2-4', subject: 'math', grade: 2, questionText: 'What is 7 + 8 + 5?', options: ['18', '19', '20', '21'], correctAnswer: '20', points: 25 },
  // Grade 3 — multiplication/division facts, intro fractions
  { id: 'math-g3-1', subject: 'math', grade: 3, questionText: 'What is 4 × 3?', options: ['7', '9', '12', '15'], correctAnswer: '12', points: 25 },
  { id: 'math-g3-2', subject: 'math', grade: 3, questionText: 'What is 7 × 6?', options: ['36', '40', '42', '48'], correctAnswer: '42', points: 30 },
  { id: 'math-g3-3', subject: 'math', grade: 3, questionText: 'What is 24 ÷ 6?', options: ['3', '4', '5', '6'], correctAnswer: '4', points: 30 },
  { id: 'math-g3-4', subject: 'math', grade: 3, questionText: 'Which fraction means one half?', options: ['1/3', '1/2', '1/4', '2/3'], correctAnswer: '1/2', points: 35 },
  // Grade 4 — multi-digit multiplication, factors, equivalent fractions
  { id: 'math-g4-1', subject: 'math', grade: 4, questionText: 'What is 12 × 11?', options: ['120', '121', '132', '144'], correctAnswer: '132', points: 35 },
  { id: 'math-g4-2', subject: 'math', grade: 4, questionText: 'Which number is a factor of 18?', options: ['4', '5', '6', '7'], correctAnswer: '6', points: 40 },
  { id: 'math-g4-3', subject: 'math', grade: 4, questionText: 'Which fraction is equal to 1/2?', options: ['2/4', '1/3', '3/5', '2/3'], correctAnswer: '2/4', points: 40 },
  { id: 'math-g4-4', subject: 'math', grade: 4, questionText: 'What is 144 ÷ 12?', options: ['10', '11', '12', '14'], correctAnswer: '12', points: 45 },
  // Grade 5 — fractions, decimals, percent, order of operations
  { id: 'math-g5-1', subject: 'math', grade: 5, questionText: 'What is 1/2 + 1/4?', options: ['2/6', '2/4', '3/4', '1/6'], correctAnswer: '3/4', points: 45 },
  { id: 'math-g5-2', subject: 'math', grade: 5, questionText: 'What is 0.5 + 0.25?', options: ['0.30', '0.7', '0.75', '1.0'], correctAnswer: '0.75', points: 50 },
  { id: 'math-g5-3', subject: 'math', grade: 5, questionText: 'What is 25% of 80?', options: ['15', '20', '25', '40'], correctAnswer: '20', points: 50 },
  { id: 'math-g5-4', subject: 'math', grade: 5, questionText: 'Solve: 3 + 4 × 2', options: ['10', '11', '14', '24'], correctAnswer: '11', points: 55 },

  // ────────────────────────────── SCIENCE ──────────────────────────────────
  // Grade 1 — senses, living/non-living, weather
  { id: 'sci-g1-1', subject: 'science', grade: 1, questionText: 'Which body part do you use to smell?', options: ['Eyes', 'Nose', 'Ears', 'Hands'], correctAnswer: 'Nose', points: 5 },
  { id: 'sci-g1-2', subject: 'science', grade: 1, questionText: 'Which one is a living thing?', options: ['Rock', 'Tree', 'Cup', 'Chair'], correctAnswer: 'Tree', points: 10 },
  { id: 'sci-g1-3', subject: 'science', grade: 1, questionText: 'What do we call frozen water?', options: ['Steam', 'Ice', 'Cloud', 'Rain'], correctAnswer: 'Ice', points: 10 },
  { id: 'sci-g1-4', subject: 'science', grade: 1, questionText: 'Which season is usually the coldest?', options: ['Summer', 'Spring', 'Winter', 'Fall'], correctAnswer: 'Winter', points: 15 },
  // Grade 2 — habitats, plant parts, states of matter
  { id: 'sci-g2-1', subject: 'science', grade: 2, questionText: 'Where does a fish live?', options: ['Desert', 'Water', 'Tree', 'Cave'], correctAnswer: 'Water', points: 15 },
  { id: 'sci-g2-2', subject: 'science', grade: 2, questionText: 'Which part of a plant takes in water from the soil?', options: ['Leaves', 'Flower', 'Roots', 'Petals'], correctAnswer: 'Roots', points: 20 },
  { id: 'sci-g2-3', subject: 'science', grade: 2, questionText: 'Which of these is a gas?', options: ['Ice', 'Water', 'Steam', 'Juice'], correctAnswer: 'Steam', points: 20 },
  { id: 'sci-g2-4', subject: 'science', grade: 2, questionText: 'What do bees collect from flowers?', options: ['Nectar', 'Sand', 'Water', 'Seeds'], correctAnswer: 'Nectar', points: 25 },
  // Grade 3 — life cycles, food chains, simple machines
  { id: 'sci-g3-1', subject: 'science', grade: 3, questionText: 'What does a caterpillar become?', options: ['Bird', 'Butterfly', 'Frog', 'Bee'], correctAnswer: 'Butterfly', points: 25 },
  { id: 'sci-g3-2', subject: 'science', grade: 3, questionText: 'In a food chain, what do plants use to make food?', options: ['Sunlight', 'Rocks', 'Plastic', 'Metal'], correctAnswer: 'Sunlight', points: 30 },
  { id: 'sci-g3-3', subject: 'science', grade: 3, questionText: 'Which of these is a simple machine?', options: ['Lever', 'Computer', 'Phone', 'Engine'], correctAnswer: 'Lever', points: 30 },
  { id: 'sci-g3-4', subject: 'science', grade: 3, questionText: 'What do we call animals that eat only plants?', options: ['Carnivores', 'Herbivores', 'Omnivores', 'Predators'], correctAnswer: 'Herbivores', points: 35 },
  // Grade 4 — ecosystems, energy, earth layers
  { id: 'sci-g4-1', subject: 'science', grade: 4, questionText: 'What is the center layer of the Earth called?', options: ['Crust', 'Mantle', 'Core', 'Soil'], correctAnswer: 'Core', points: 35 },
  { id: 'sci-g4-2', subject: 'science', grade: 4, questionText: 'Which is a form of energy that comes from the Sun?', options: ['Solar', 'Coal', 'Battery', 'Gasoline'], correctAnswer: 'Solar', points: 40 },
  { id: 'sci-g4-3', subject: 'science', grade: 4, questionText: 'What do we call all the living things in an area together with their environment?', options: ['Ecosystem', 'Galaxy', 'Mountain', 'Country'], correctAnswer: 'Ecosystem', points: 40 },
  { id: 'sci-g4-4', subject: 'science', grade: 4, questionText: 'Which gas do plants take in to make their food?', options: ['Oxygen', 'Carbon dioxide', 'Helium', 'Nitrogen'], correctAnswer: 'Carbon dioxide', points: 45 },
  // Grade 5 — cells, solar system, physical/chemical change
  { id: 'sci-g5-1', subject: 'science', grade: 5, questionText: 'What is the basic building block of all living things?', options: ['Atom', 'Cell', 'Brick', 'Organ'], correctAnswer: 'Cell', points: 45 },
  { id: 'sci-g5-2', subject: 'science', grade: 5, questionText: 'Which planet is closest to the Sun?', options: ['Earth', 'Venus', 'Mercury', 'Mars'], correctAnswer: 'Mercury', points: 50 },
  { id: 'sci-g5-3', subject: 'science', grade: 5, questionText: 'Melting ice into water is an example of a ___ change.', options: ['chemical', 'physical', 'energy', 'color'], correctAnswer: 'physical', points: 50 },
  { id: 'sci-g5-4', subject: 'science', grade: 5, questionText: 'Which part of a cell controls its activities?', options: ['Nucleus', 'Membrane', 'Cytoplasm', 'Wall'], correctAnswer: 'Nucleus', points: 55 },

  // ────────────────────────────── READING ──────────────────────────────────
  // Grade 1 — sight words, rhyming, beginning sounds
  { id: 'read-g1-1', subject: 'reading', grade: 1, questionText: "Which word rhymes with 'cat'?", options: ['dog', 'hat', 'sun', 'cup'], correctAnswer: 'hat', points: 5 },
  { id: 'read-g1-2', subject: 'reading', grade: 1, questionText: 'Which of these is a common sight word?', options: ['the', 'xyz', 'brt', 'zzx'], correctAnswer: 'the', points: 10 },
  { id: 'read-g1-3', subject: 'reading', grade: 1, questionText: "What sound does 'b' make at the start of 'ball'?", options: ['/b/', '/d/', '/s/', '/m/'], correctAnswer: '/b/', points: 10 },
  { id: 'read-g1-4', subject: 'reading', grade: 1, questionText: "Which word means more than one cat?", options: ['cat', 'cats', 'catty', 'cating'], correctAnswer: 'cats', points: 15 },
  // Grade 2 — synonyms/antonyms, punctuation, parts of speech
  { id: 'read-g2-1', subject: 'reading', grade: 2, questionText: "Which word is a synonym for 'big'?", options: ['small', 'large', 'tiny', 'thin'], correctAnswer: 'large', points: 15 },
  { id: 'read-g2-2', subject: 'reading', grade: 2, questionText: "What is the opposite of 'happy'?", options: ['glad', 'sad', 'joyful', 'merry'], correctAnswer: 'sad', points: 20 },
  { id: 'read-g2-3', subject: 'reading', grade: 2, questionText: 'Which mark ends a question?', options: ['.', '!', '?', ','], correctAnswer: '?', points: 20 },
  { id: 'read-g2-4', subject: 'reading', grade: 2, questionText: 'Which word is a noun?', options: ['run', 'quickly', 'dog', 'happy'], correctAnswer: 'dog', points: 25 },
  // Grade 3 — main idea, prefixes/suffixes, verbs
  { id: 'read-g3-1', subject: 'reading', grade: 3, questionText: 'The "main idea" of a story is...', options: ['a small detail', 'what it is mostly about', 'the title only', 'the last word'], correctAnswer: 'what it is mostly about', points: 25 },
  { id: 'read-g3-2', subject: 'reading', grade: 3, questionText: "What does the prefix 're-' mean in 'redo'?", options: ['again', 'not', 'before', 'after'], correctAnswer: 'again', points: 30 },
  { id: 'read-g3-3', subject: 'reading', grade: 3, questionText: 'Which word is a verb?', options: ['table', 'jump', 'blue', 'soft'], correctAnswer: 'jump', points: 30 },
  { id: 'read-g3-4', subject: 'reading', grade: 3, questionText: "What does the suffix '-ful' mean in 'helpful'?", options: ['without', 'full of', 'before', 'two'], correctAnswer: 'full of', points: 35 },
  // Grade 4 — simile, theme, genre, personification
  { id: 'read-g4-1', subject: 'reading', grade: 4, questionText: 'A simile compares two things using which words?', options: ['like or as', 'and or but', 'is or was', 'the or a'], correctAnswer: 'like or as', points: 35 },
  { id: 'read-g4-2', subject: 'reading', grade: 4, questionText: 'The "theme" of a story is...', options: ['the message or lesson', 'the cover', 'the page count', 'the author name'], correctAnswer: 'the message or lesson', points: 40 },
  { id: 'read-g4-3', subject: 'reading', grade: 4, questionText: 'Which of these is a genre of writing?', options: ['Fiction', 'Pencil', 'Chapter', 'Comma'], correctAnswer: 'Fiction', points: 40 },
  { id: 'read-g4-4', subject: 'reading', grade: 4, questionText: "'The stars danced in the sky.' This is an example of...", options: ['simile', 'personification', 'rhyme', 'fact'], correctAnswer: 'personification', points: 45 },
  // Grade 5 — metaphor, inference, author's purpose
  { id: 'read-g5-1', subject: 'reading', grade: 5, questionText: 'A metaphor compares two things by saying one ___ the other.', options: ['is', 'likes', 'near', 'beside'], correctAnswer: 'is', points: 45 },
  { id: 'read-g5-2', subject: 'reading', grade: 5, questionText: "'Time is a thief.' This sentence is a...", options: ['simile', 'metaphor', 'question', 'list'], correctAnswer: 'metaphor', points: 50 },
  { id: 'read-g5-3', subject: 'reading', grade: 5, questionText: "Figuring out something the author hints at but doesn't state directly is called...", options: ['inference', 'spelling', 'rhyming', 'copying'], correctAnswer: 'inference', points: 50 },
  { id: 'read-g5-4', subject: 'reading', grade: 5, questionText: 'An author who writes mainly to convince you is writing to...', options: ['entertain', 'persuade', 'confuse', 'rhyme'], correctAnswer: 'persuade', points: 55 },

  // ────────────────────────────── HISTORY ──────────────────────────────────
  // Grade 1 — community helpers, symbols, past/present
  { id: 'hist-g1-1', subject: 'history', grade: 1, questionText: 'Who helps put out fires?', options: ['Teacher', 'Firefighter', 'Chef', 'Pilot'], correctAnswer: 'Firefighter', points: 5 },
  { id: 'hist-g1-2', subject: 'history', grade: 1, questionText: 'What is on the United States flag?', options: ['Stars and stripes', 'Circles', 'Triangles', 'Hearts'], correctAnswer: 'Stars and stripes', points: 10 },
  { id: 'hist-g1-3', subject: 'history', grade: 1, questionText: 'Something that already happened is in the...', options: ['future', 'past', 'today', 'tomorrow'], correctAnswer: 'past', points: 10 },
  { id: 'hist-g1-4', subject: 'history', grade: 1, questionText: 'Who is the national leader of the United States?', options: ['King', 'President', 'Mayor', 'Wizard'], correctAnswer: 'President', points: 15 },
  // Grade 2 — holidays, maps, timelines
  { id: 'hist-g2-1', subject: 'history', grade: 2, questionText: 'On which holiday do Americans celebrate independence?', options: ['Halloween', 'Fourth of July', "Valentine's Day", 'April Fools'], correctAnswer: 'Fourth of July', points: 15 },
  { id: 'hist-g2-2', subject: 'history', grade: 2, questionText: 'What tool shows directions like North and South?', options: ['Clock', 'Compass', 'Ruler', 'Spoon'], correctAnswer: 'Compass', points: 20 },
  { id: 'hist-g2-3', subject: 'history', grade: 2, questionText: 'How many continents are there on Earth?', options: ['5', '6', '7', '8'], correctAnswer: '7', points: 20 },
  { id: 'hist-g2-4', subject: 'history', grade: 2, questionText: 'A line that shows events in the order they happened is a...', options: ['timeline', 'poem', 'map', 'recipe'], correctAnswer: 'timeline', points: 25 },
  // Grade 3 — Native Americans, explorers, government branches
  { id: 'hist-g3-1', subject: 'history', grade: 3, questionText: 'Who lived in America long before European explorers arrived?', options: ['Astronauts', 'Native Americans', 'Pirates', 'Robots'], correctAnswer: 'Native Americans', points: 25 },
  { id: 'hist-g3-2', subject: 'history', grade: 3, questionText: 'Who sailed across the ocean to the Americas in 1492?', options: ['Christopher Columbus', 'Neil Armstrong', 'Abraham Lincoln', 'George Washington'], correctAnswer: 'Christopher Columbus', points: 30 },
  { id: 'hist-g3-3', subject: 'history', grade: 3, questionText: 'How many branches does the U.S. government have?', options: ['2', '3', '4', '5'], correctAnswer: '3', points: 30 },
  { id: 'hist-g3-4', subject: 'history', grade: 3, questionText: 'What ship did the Pilgrims sail on to America?', options: ['Titanic', 'Mayflower', 'Santa Maria', 'Endeavour'], correctAnswer: 'Mayflower', points: 35 },
  // Grade 4 — colonies, founders, Constitution
  { id: 'hist-g4-1', subject: 'history', grade: 4, questionText: 'What do we call the first 13 areas that became the United States?', options: ['Colonies', 'Planets', 'Oceans', 'Castles'], correctAnswer: 'Colonies', points: 35 },
  { id: 'hist-g4-2', subject: 'history', grade: 4, questionText: 'Who was the first President of the United States?', options: ['Abraham Lincoln', 'George Washington', 'Thomas Jefferson', 'John Adams'], correctAnswer: 'George Washington', points: 40 },
  { id: 'hist-g4-3', subject: 'history', grade: 4, questionText: "Which document begins with the words 'We the People'?", options: ['The Constitution', 'A grocery list', 'A treasure map', 'A poem'], correctAnswer: 'The Constitution', points: 40 },
  { id: 'hist-g4-4', subject: 'history', grade: 4, questionText: 'In what year was the Declaration of Independence signed?', options: ['1492', '1776', '1865', '1920'], correctAnswer: '1776', points: 45 },
  // Grade 5 — Revolution, founders, Civil War
  { id: 'hist-g5-1', subject: 'history', grade: 5, questionText: 'The American Revolution was a war for...', options: ['independence', 'gold', 'land on the moon', 'nothing'], correctAnswer: 'independence', points: 45 },
  { id: 'hist-g5-2', subject: 'history', grade: 5, questionText: 'Who was the main writer of the Declaration of Independence?', options: ['Thomas Jefferson', 'Christopher Columbus', 'Albert Einstein', 'Henry Ford'], correctAnswer: 'Thomas Jefferson', points: 50 },
  { id: 'hist-g5-3', subject: 'history', grade: 5, questionText: 'The U.S. Civil War was fought over slavery and keeping the...', options: ['union of states', 'video games', 'space program', 'moon landing'], correctAnswer: 'union of states', points: 50 },
  { id: 'hist-g5-4', subject: 'history', grade: 5, questionText: 'Who was President of the United States during the Civil War?', options: ['George Washington', 'Abraham Lincoln', 'John Adams', 'Barack Obama'], correctAnswer: 'Abraham Lincoln', points: 55 },
];

/* ── Query engine ─────────────────────────────────────────────────────────── */

const VALID_SUBJECTS = new Set(SUBJECTS);

/**
 * Map an optional difficulty onto the points spread WITHIN an already
 * subject+grade-locked pool. This never widens the pool across categories.
 */
function matchesDifficulty(question, difficulty, pool) {
  const tier = String(difficulty).toLowerCase();
  if (tier !== 'easy' && tier !== 'medium' && tier !== 'hard') return true;

  const allPoints = pool.map((q) => q.points);
  const min = Math.min(...allPoints);
  const max = Math.max(...allPoints);

  if (tier === 'easy') return question.points === min;
  if (tier === 'hard') return question.points === max;
  return question.points !== min && question.points !== max; // medium
}

/**
 * Fetch ONE random question for an exact subject + grade.
 *
 * Category-leakage fix: the pool is built by a strict `.filter()` that must
 * match BOTH the exact `subject` string AND the exact `grade` integer before
 * any randomization. A math realm therefore can never receive a history item.
 * If the strict pool is empty we log an explicit error and throw — we never
 * silently fall back to another subject or grade.
 *
 * @param {'math'|'science'|'reading'|'history'} subject
 * @param {1|2|3|4|5} grade
 * @param {'easy'|'medium'|'hard'} [difficulty] optional in-pool refinement
 * @returns {Question}
 */
export function getQuestion(subject, grade, difficulty) {
  const subjectKey = String(subject).toLowerCase();
  const gradeInt = Number(grade);

  if (!VALID_SUBJECTS.has(subjectKey)) {
    const msg = `[questionBank] getQuestion: invalid subject "${subject}". Must be one of ${SUBJECTS.join(', ')}.`;
    console.error(msg);
    throw new Error(msg);
  }

  // STRICT gate: exact subject AND exact grade — both must match.
  const pool = QUESTION_BANK.filter(
    (q) => q.subject === subjectKey && q.grade === gradeInt,
  );

  if (pool.length === 0) {
    const msg = `[questionBank] getQuestion: no questions found for subject="${subjectKey}" grade=${gradeInt}. Refusing to fetch across categories.`;
    console.error(msg);
    throw new Error(msg);
  }

  // Optional difficulty refinement, strictly inside the locked pool.
  let selectable = pool;
  if (difficulty != null) {
    const refined = pool.filter((q) => matchesDifficulty(q, difficulty, pool));
    if (refined.length > 0) selectable = refined;
  }

  return selectable[Math.floor(Math.random() * selectable.length)];
}

/**
 * Fetch up to `count` distinct random questions for an exact subject + grade
 * (same strict gate as {@link getQuestion}). Useful for building a quiz round.
 *
 * @param {'math'|'science'|'reading'|'history'} subject
 * @param {1|2|3|4|5} grade
 * @param {number} [count=5]
 * @returns {Question[]}
 */
export function getQuestions(subject, grade, count = 5) {
  const subjectKey = String(subject).toLowerCase();
  const gradeInt = Number(grade);

  const pool = QUESTION_BANK.filter(
    (q) => q.subject === subjectKey && q.grade === gradeInt,
  );

  if (pool.length === 0) {
    const msg = `[questionBank] getQuestions: no questions found for subject="${subjectKey}" grade=${gradeInt}. Refusing to fetch across categories.`;
    console.error(msg);
    throw new Error(msg);
  }

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
