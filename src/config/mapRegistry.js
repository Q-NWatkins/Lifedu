/**
 * Progressive Map Registry.
 *
 * A key-value map of board configurations keyed by `${subject}_${grade}`
 * (e.g. `math_1` … `history_5`). Board geometry scales with grade so the
 * campaign ramps from short, gentle Grade-1 tracks to massive Grade-5 endurance
 * gauntlets:
 *
 *   Grade 1 → ~9 nodes, slow animations, a single low-tier mini-boss, no traps.
 *   Grade 3 → ~18 nodes, branching choices, frequent hazard/trap tiles.
 *   Grade 5 → 30+ nodes, multiple mini-boss blockades, rare chest rewards.
 *
 * Each entry is shaped to be drop-in compatible with the board pipeline
 * (constellationMap → useGameLoop → GameBoard → BossBattle).
 */
import { CURRICULUMS } from './courseMaps.js';

export const SUBJECT_ORDER = ['math', 'science', 'reading', 'history'];
export const MAX_GRADE = 5;

/** Geometry scaling table, indexed by grade. */
const GRADE_GEOMETRY = {
  1: { pathLength: 9, stepDelayMs: 460, miniBossCount: 1, hazardCount: 0, chestCount: 3 },
  2: { pathLength: 13, stepDelayMs: 400, miniBossCount: 1, hazardCount: 1, chestCount: 3 },
  3: { pathLength: 18, stepDelayMs: 350, miniBossCount: 2, hazardCount: 3, chestCount: 2 },
  4: { pathLength: 24, stepDelayMs: 300, miniBossCount: 2, hazardCount: 4, chestCount: 2 },
  5: { pathLength: 32, stepDelayMs: 260, miniBossCount: 3, hazardCount: 5, chestCount: 1 },
};

const GRADE_SUBTITLE = {
  1: 'Gentle beginnings',
  2: 'Picking up speed',
  3: 'Branching challenges',
  4: 'Endurance trials',
  5: 'Master gauntlet',
};

/** Each subject cycles through existing board biomes as grades climb. */
const SUBJECT_THEMES = {
  math: ['forest', 'ocean', 'volcano', 'desert', 'castle'],
  science: ['space', 'laboratory', 'forest', 'ocean', 'space'],
  reading: ['library', 'library', 'forest', 'castle', 'library'],
  history: ['desert', 'castle', 'library', 'desert', 'castle'],
};

const SUBJECT_BOSSES = {
  math: ['Count Calculo', 'Sir Sumsalot', 'Captain Product', 'Baron Fraction', 'The Decimal Dragon'],
  science: ['Sprout Sprite', 'Professor Phase', 'The Gravity Guardian', 'Eco Colossus', 'The Cell Sovereign'],
  reading: ['Sight-Word Sprite', 'Synonym Serpent', 'Prefix Phantom', 'The Simile Sphinx', 'The Metaphor Monarch'],
  history: ['Helper Herald', 'Timeline Titan', 'Explorer Wraith', 'Colonial Colossus', 'The Constitution Keeper'],
};

/** Evenly spaced integer tile positions strictly inside (1 .. pathLength-1). */
function spreadPositions(pathLength, count) {
  const out = new Set();
  for (let i = 1; i <= count; i++) {
    const pos = Math.round((i * pathLength) / (count + 1));
    const clamped = Math.min(pathLength - 1, Math.max(2, pos));
    out.add(clamped);
  }
  return [...out];
}

/** Build a single grade map config. */
export function buildGradeMap(subject, grade) {
  const geo = GRADE_GEOMETRY[grade];
  if (!geo) throw new Error(`[mapRegistry] invalid grade ${grade}`);

  const label = CURRICULUMS[subject]?.label ?? subject;
  const themeId = SUBJECT_THEMES[subject][grade - 1];
  const bossName = SUBJECT_BOSSES[subject][grade - 1];

  return {
    id: `${subject}_${grade}`,
    curriculumId: subject,
    subject,
    grade,
    title: `${label} · Grade ${grade}`,
    subtitle: GRADE_SUBTITLE[grade],
    themeId,
    questionBankId: subject,
    pathLength: geo.pathLength,
    stepDelayMs: geo.stepDelayMs,
    miniBossCount: geo.miniBossCount,
    hazardCount: geo.hazardCount,
    chestCount: geo.chestCount,
    // `chestCount` drives count-based chest injection in the layout engine, so
    // grade rarity is exact (Grade 1 generous → Grade 5 rare).
    milestones: spreadPositions(geo.pathLength, 3),
    boss: {
      name: bossName,
      description: `The Grade ${grade} guardian of the ${label} realm. Defeat it to unlock Grade ${
        grade + 1 <= MAX_GRADE ? grade + 1 : grade
      }!`,
    },
    rewards: {
      completionBadge: `badge-${subject}-grade-${grade}`,
    },
    prerequisites: grade > 1 ? [`${subject}_${grade - 1}`] : [],
  };
}

/** The full registry: { 'math_1': {...}, … 'history_5': {...} }. */
export const MAP_REGISTRY = SUBJECT_ORDER.reduce((acc, subject) => {
  for (let grade = 1; grade <= MAX_GRADE; grade++) {
    acc[`${subject}_${grade}`] = buildGradeMap(subject, grade);
  }
  return acc;
}, {});

export function getGradeMap(subject, grade) {
  return MAP_REGISTRY[`${subject}_${grade}`] ?? null;
}

export function getMapById(mapId) {
  return MAP_REGISTRY[mapId] ?? null;
}
