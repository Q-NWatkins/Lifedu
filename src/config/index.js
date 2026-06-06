/**
 * Single entry point for all progression-engine configuration.
 * Import from here in React components:
 *
 *   import { COURSE_MAPS, buildBoardTiles } from '@/config';
 */

export { CURRICULUMS, COURSE_MAPS, TILE_TYPES, getChestTilesForPath } from './courseMaps.js';
export { QUESTION_BANKS } from './questionBanks.js';
export { THEMES } from './themes.js';
export {
  buildBoardTiles,
  getCourseById,
  getCourseDetails,
  getCoursesByCurriculum,
  getXpPerTile,
  isCourseUnlocked,
} from './progressionEngine.js';
