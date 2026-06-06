/**
 * Progression Engine — helper functions that turn course config into board data.
 *
 * Think of this as the kitchen that reads the recipe book (courseMaps.js)
 * and prepares a plate the board component can render.
 */

import { COURSE_MAPS, CURRICULUMS, TILE_TYPES, getChestTilesForPath } from './courseMaps.js';
import { QUESTION_BANKS } from './questionBanks.js';
import { THEMES } from './themes.js';

/** Look up a single course by its unique id. */
export function getCourseById(courseId) {
  return COURSE_MAPS.find((course) => course.id === courseId) ?? null;
}

/** Get every course belonging to one curriculum (math, science, etc.). */
export function getCoursesByCurriculum(curriculumId) {
  return COURSE_MAPS.filter((course) => course.curriculumId === curriculumId);
}

/** Resolve linked records (theme + question bank) for a course. */
export function getCourseDetails(courseId) {
  const course = getCourseById(courseId);
  if (!course) return null;

  const chestTiles = course.chestTiles ?? getChestTilesForPath(course.pathLength);

  return {
    ...course,
    chestTiles,
    curriculum: CURRICULUMS[course.curriculumId],
    theme: THEMES[course.themeId],
    questionBank: QUESTION_BANKS[course.questionBankId],
  };
}

/**
 * Build the full tile array for a course board.
 *
 * Example output for pathLength 10:
 *   [START, LESSON×2, QUIZ, LESSON×2, QUIZ, LESSON×2, QUIZ, BOSS]
 *        indices 3, 6, 9 are quizzes (from milestones array)
 */
export function buildBoardTiles(courseId) {
  const course = getCourseById(courseId);
  if (!course) return [];

  const tiles = [];
  const milestoneSet = new Set(course.milestones);
  const chestSet = new Set(course.chestTiles ?? getChestTilesForPath(course.pathLength));

  tiles.push({
    index: 0,
    type: TILE_TYPES.START,
    label: 'Start',
  });

  for (let i = 1; i <= course.pathLength; i++) {
    const isChest = chestSet.has(i);
    const isQuiz = milestoneSet.has(i);
    const isLast = i === course.pathLength;

    let type = TILE_TYPES.LESSON;
    if (isChest) type = TILE_TYPES.CHEST;
    else if (isQuiz || (isLast && !isChest)) type = TILE_TYPES.QUIZ;

    tiles.push({
      index: i,
      type,
      isChestTile: isChest,
      label: isChest
        ? 'Treasure'
        : isQuiz
          ? `Quiz ${[...milestoneSet].filter((m) => m <= i).length}`
          : `Tile ${i}`,
      questionBankId: course.questionBankId,
    });
  }

  tiles.push({
    index: course.pathLength + 1,
    type: TILE_TYPES.BOSS,
    label: course.boss.name,
    boss: course.boss,
    questionBankId: course.questionBankId,
  });

  return tiles;
}

/** Check whether a player has unlocked a course based on completed prerequisites. */
export function isCourseUnlocked(courseId, completedCourseIds = []) {
  const course = getCourseById(courseId);
  if (!course) return false;
  if (course.prerequisites.length === 0) return true;

  return course.prerequisites.every((prereqId) => completedCourseIds.includes(prereqId));
}

/** Suggested XP per tile — scales with path length and difficulty. */
export function getXpPerTile(courseId) {
  const details = getCourseDetails(courseId);
  if (!details) return 10;

  const difficultyMultiplier = details.questionBank?.difficulty ?? 1;
  const lengthFactor = Math.max(1, Math.floor(details.pathLength / 10));

  return 10 * difficultyMultiplier * lengthFactor;
}
