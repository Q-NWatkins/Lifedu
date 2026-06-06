/**
 * Visual themes for course board paths.
 * Each theme maps to background art, tile styling, and ambient mood.
 * The board component reads these keys from course definitions.
 */
export const THEMES = {
  forest: {
    id: 'forest',
    label: 'Enchanted Forest',
    backgroundKey: 'bg-forest',
    tileStyle: 'grass',
    accentColor: '#2d6a4f',
    description: 'Lush green paths with friendly woodland creatures.',
  },
  volcano: {
    id: 'volcano',
    label: 'Molten Volcano',
    backgroundKey: 'bg-volcano',
    tileStyle: 'lava-rock',
    accentColor: '#c1121f',
    description: 'Fiery terrain for advanced challenges.',
  },
  ocean: {
    id: 'ocean',
    label: 'Deep Ocean',
    backgroundKey: 'bg-ocean',
    tileStyle: 'coral',
    accentColor: '#0077b6',
    description: 'Underwater reefs and tidal currents.',
  },
  library: {
    id: 'library',
    label: 'Grand Library',
    backgroundKey: 'bg-library',
    tileStyle: 'parchment',
    accentColor: '#6b4c3b',
    description: 'Towering shelves and candlelit reading nooks.',
  },
  castle: {
    id: 'castle',
    label: 'Royal Castle',
    backgroundKey: 'bg-castle',
    tileStyle: 'stone',
    accentColor: '#5c4d7d',
    description: 'Stone halls and banners of past heroes.',
  },
  laboratory: {
    id: 'laboratory',
    label: 'Mad Scientist Lab',
    backgroundKey: 'bg-lab',
    tileStyle: 'metal-plate',
    accentColor: '#7b2cbf',
    description: 'Bubbling beakers and sparking experiments.',
  },
  desert: {
    id: 'desert',
    label: 'Ancient Desert',
    backgroundKey: 'bg-desert',
    tileStyle: 'sandstone',
    accentColor: '#e9c46a',
    description: 'Sun-baked ruins and hidden tombs.',
  },
  space: {
    id: 'space',
    label: 'Outer Space',
    backgroundKey: 'bg-space',
    tileStyle: 'starfield',
    accentColor: '#3a0ca3',
    description: 'Planets, asteroids, and cosmic mysteries.',
  },
};
