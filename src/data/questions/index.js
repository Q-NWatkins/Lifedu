import { FALLBACK_QUESTIONS } from './fallback.js';
import { getRandomQuestion } from './multiSubject.js';
import singleDigitMultiplication from './math/single-digit-multiplication.js';
import tripleDigitMultiplication from './math/triple-digit-multiplication.js';
import solarSystem from './science/solar-system.js';
import phonicsBasics from './reading/phonics-basics.js';
import grade1Reading from './reading/grade1-reading.js';
import grade1Science from './science/grade1-science.js';
import grade1History from './history/grade1-history.js';
import grade1Math from './math/grade1-math.js';

// ── Grade 1 — progressive stages per subject (Grade 1 = 5 stages each) ──────
import readingG1S1 from './reading/g1-s1.js';
import readingG1S2 from './reading/g1-s2.js';
import readingG1S3 from './reading/g1-s3.js';
import readingG1S4 from './reading/g1-s4.js';
import readingG1S5 from './reading/g1-s5.js';

import mathG1S1 from './math/g1-s1.js';
import mathG1S2 from './math/g1-s2.js';
import mathG1S3 from './math/g1-s3.js';
import mathG1S4 from './math/g1-s4.js';
import mathG1S5 from './math/g1-s5.js';

import scienceG1S1 from './science/g1-s1.js';
import scienceG1S2 from './science/g1-s2.js';
import scienceG1S3 from './science/g1-s3.js';
import scienceG1S4 from './science/g1-s4.js';
import scienceG1S5 from './science/g1-s5.js';

import historyG1S1 from './history/g1-s1.js';
import historyG1S2 from './history/g1-s2.js';
import historyG1S3 from './history/g1-s3.js';
import historyG1S4 from './history/g1-s4.js';
import historyG1S5 from './history/g1-s5.js';

/**
 * Stage banks are listed in sequential order per (subject, grade). Splitting a
 * grade's pool into distinct stages means a stage-specific lookup only ever
 * draws from its own 7 questions, which keeps each subject on-topic and rotates
 * content so a player is far less likely to see a repeat across stages.
 *
 * Grade scaling: Grade 1 = 5 stages, Grade 2 = 10, Grade 3 = 15. Add the next
 * grade's array here and `registerStages` will mint its keys automatically.
 */
const STAGE_BANKS = {
  'reading-g1': [readingG1S1, readingG1S2, readingG1S3, readingG1S4, readingG1S5],
  'math-g1': [mathG1S1, mathG1S2, mathG1S3, mathG1S4, mathG1S5],
  'science-g1': [scienceG1S1, scienceG1S2, scienceG1S3, scienceG1S4, scienceG1S5],
  'history-g1': [historyG1S1, historyG1S2, historyG1S3, historyG1S4, historyG1S5],
};

/** Expand a stage list into `${subject}-g{grade}-stage-N` → questions entries. */
function registerStages(prefix, stages) {
  return Object.fromEntries(
    stages.map((stage, index) => [`${prefix}-stage-${index + 1}`, stage]),
  );
}

const QUESTION_BANKS = {
  // Legacy / course-level banks (kept intact for backward compatibility).
  'math-single-digit-multiplication': singleDigitMultiplication,
  'math-triple-digit-multiplication': tripleDigitMultiplication,
  'science-solar-system': solarSystem,
  'reading-phonics-basics': phonicsBasics,
  'reading-grade1-reading': grade1Reading,
  'science-grade1-science': grade1Science,
  'history-grade1-history': grade1History,
  'math-grade1-math': grade1Math,

  // Granular stage-based banks, e.g. 'reading-g1-stage-1', 'math-g1-stage-1',
  // 'science-g1-stage-1', 'history-g1-stage-1' … through stage-5 each.
  ...Object.entries(STAGE_BANKS).reduce(
    (acc, [prefix, stages]) => ({ ...acc, ...registerStages(prefix, stages) }),
    {},
  ),
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
 * Pull rapid-fire boss questions from a course or stage question bank.
 * Prefers harder questions; returns `count` items (default 5). Works seamlessly
 * with both legacy course keys and granular stage keys like 'reading-g1-stage-3'.
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

/** Raw bank lookup for a key (course or stage). Returns null if unregistered. */
export function getQuestionBank(questionBankId) {
  return QUESTION_BANKS[questionBankId] ?? null;
}

/**
 * Build difficulty-tier pools (easy/medium/hard) from a single stage/course
 * bank for the boss-battle card system. Each tier is shuffled and tagged with a
 * subject label; a tier with no matching questions returns `null` so callers can
 * fall back to the generic multi-subject pool.
 */
export function getStageQuestionPools(questionBankId, subjectLabel = '') {
  const bank = QUESTION_BANKS[questionBankId];
  if (!bank) return { easy: null, medium: null, hard: null };

  const tier = (level) => {
    const list = shuffle(bank.filter((q) => q.difficulty === level));
    if (list.length === 0) return null;
    return list.map((q) => ({ ...q, subject: q.subject ?? subjectLabel }));
  };

  return { easy: tier('easy'), medium: tier('medium'), hard: tier('hard') };
}

/**
 * Pull ONE question for a board tile, matching the tile's sub-topic color when
 * possible. Banks may tag questions with `subTopic`; until they do, this draws a
 * random question from the active stage bank (and falls back to the generic
 * multi-subject pool if the bank is missing). This is the Core Question Trigger.
 */
export function getTileQuestion(questionBankId, subTopic) {
  const bank = QUESTION_BANKS[questionBankId];
  if (bank && bank.length > 0) {
    const tagged = subTopic ? bank.filter((q) => q.subTopic === subTopic) : [];
    const pool = tagged.length > 0 ? tagged : bank;
    return pool[Math.floor(Math.random() * pool.length)];
  }
  return getRandomQuestion();
}

export const BOSS_PASS_THRESHOLD = 0.8;
export const BOSS_QUESTION_COUNT = 5;