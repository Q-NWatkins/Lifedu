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

/**
 * Each grade is broken into a progressive number of stages:
 *   Grade 1 → 5, Grade 2 → 10, Grade 3 → 15, Grade 4 → 20, Grade 5 → 25.
 */
export const STAGES_PER_GRADE = { 1: 5, 2: 10, 3: 15, 4: 20, 5: 25 };
export function getStageCount(grade) {
  return STAGES_PER_GRADE[grade] ?? 5;
}

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

/**
 * Build a single STAGE map within a grade. Geometry ramps gently across the
 * grade's stages (early stages short & calm, the final stage is the grade boss
 * gauntlet). Crucially, each stage carries a stage-specific `questionBankId`
 * (e.g. `reading-g1-stage-3`) so the game loop & boss battle pull exactly that
 * curriculum stage's questions.
 */
function stageGeometry(grade, stage, stageCount) {
  const g = GRADE_GEOMETRY[grade] ?? GRADE_GEOMETRY[1];
  const t = stageCount > 1 ? (stage - 1) / (stageCount - 1) : 0; // 0 → 1 across the grade
  const isFinal = stage === stageCount;
  return {
    pathLength: Math.max(6, Math.round(6 + t * (g.pathLength - 6))),
    stepDelayMs: g.stepDelayMs,
    miniBossCount: isFinal ? Math.max(1, g.miniBossCount) : t > 0.5 ? 1 : 0,
    hazardCount: Math.round(t * g.hazardCount),
    chestCount: Math.max(1, g.chestCount - (t > 0.5 ? 1 : 0)),
  };
}

export function buildStageMap(subject, grade, stage) {
  const stageCount = getStageCount(grade);
  const geo = stageGeometry(grade, stage, stageCount);
  const label = CURRICULUMS[subject]?.label ?? subject;
  const themeId = SUBJECT_THEMES[subject][grade - 1];
  const bossName = SUBJECT_BOSSES[subject][grade - 1];
  const isFinalStage = stage === stageCount;

  return {
    id: `${subject}_g${grade}_s${stage}`,
    curriculumId: subject,
    subject,
    grade,
    stage,
    stageCount,
    isFinalStage,
    title: `${label} · G${grade} · Stage ${stage}`,
    subtitle: `Stage ${stage} of ${stageCount}`,
    themeId,
    // Stage-specific bank key — this is what flows into the boss battle.
    questionBankId: `${subject}-g${grade}-stage-${stage}`,
    pathLength: geo.pathLength,
    stepDelayMs: geo.stepDelayMs,
    miniBossCount: geo.miniBossCount,
    hazardCount: geo.hazardCount,
    chestCount: geo.chestCount,
    milestones: spreadPositions(geo.pathLength, 2),
    boss: {
      name: isFinalStage ? bossName : `${bossName} (Stage ${stage})`,
      description: isFinalStage
        ? `The Grade ${grade} guardian of the ${label} realm. Defeat it to unlock Grade ${
            Math.min(MAX_GRADE, grade + 1)
          }!`
        : `Clear Stage ${stage} to advance to Stage ${stage + 1}.`,
    },
    rewards: {
      completionBadge: `badge-${subject}-g${grade}-s${stage}`,
    },
    prerequisites: stage > 1 ? [`${subject}_g${grade}_s${stage - 1}`] : [],
  };
}

export function getStageMap(subject, grade, stage) {
  if (!SUBJECT_THEMES[subject] || grade < 1 || grade > MAX_GRADE) return null;
  if (stage < 1 || stage > getStageCount(grade)) return null;
  return buildStageMap(subject, grade, stage);
}

/** The full registry of GRADE maps: { 'math_1': {...}, … 'history_5': {...} }. */
export const MAP_REGISTRY = SUBJECT_ORDER.reduce((acc, subject) => {
  for (let grade = 1; grade <= MAX_GRADE; grade++) {
    acc[`${subject}_${grade}`] = buildGradeMap(subject, grade);
  }
  return acc;
}, {});

export function getGradeMap(subject, grade) {
  return MAP_REGISTRY[`${subject}_${grade}`] ?? null;
}

const STAGE_ID_RE = /^([a-z]+)_g(\d+)_s(\d+)$/;

/** Resolve a map by id — grade maps from the registry, stage maps on demand. */
export function getMapById(mapId) {
  if (MAP_REGISTRY[mapId]) return MAP_REGISTRY[mapId];
  const match = STAGE_ID_RE.exec(mapId ?? '');
  if (match) return getStageMap(match[1], Number(match[2]), Number(match[3]));
  return null;
}
