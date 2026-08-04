/**
 * Back-compat shim. The categorizer is now multi-subject and lives one level up
 * at `../categorize.js`. Existing imports of this path keep working.
 */
export {
  MATH_CATEGORIES,
  SUBJECT_CATEGORIES,
  ALL_CATEGORIES,
  TILE_COLOR_CATEGORY,
  categorizeMathQuestion,
  categorizeQuestion,
  topicToCategory,
  resolveTileCategory,
  FALLBACK_BY_CATEGORY,
} from '../categorize.js';