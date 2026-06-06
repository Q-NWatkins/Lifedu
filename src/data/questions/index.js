import { FALLBACK_QUESTIONS } from './fallback.js';
import singleDigitMultiplication from './math/single-digit-multiplication.js';
import tripleDigitMultiplication from './math/triple-digit-multiplication.js';
import solarSystem from './science/solar-system.js';
import phonicsBasics from './reading/phonics-basics.js';

const QUESTION_BANKS = {
  'math-single-digit-multiplication': singleDigitMultiplication,
  'math-triple-digit-multiplication': tripleDigitMultiplication,
  'science-solar-system': solarSystem,
  'reading-phonics-basics': phonicsBasics,
};

const DIFFICULTY_RANK = { hard: 3, medium: 2, easy: 1 };

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Pull rapid-fire boss questions from a course question bank.
 * Prefers harder questions; returns `count` items (default 5).
 */
export function getBossQuestions(questionBankId, count = 5) {
  const pool = QUESTION_BANKS[questionBankId] ?? FALLBACK_QUESTIONS;

  const sorted = [...pool].sort(
    (a, b) => (DIFFICULTY_RANK[b.difficulty] ?? 0) - (DIFFICULTY_RANK[a.difficulty] ?? 0),
  );

  const hardPool = sorted.filter((q) => q.difficulty === 'hard');
  const source = hardPool.length >= count ? hardPool : sorted;

  return shuffle(source).slice(0, count);
}

export const BOSS_PASS_THRESHOLD = 0.8;
export const BOSS_QUESTION_COUNT = 5;
