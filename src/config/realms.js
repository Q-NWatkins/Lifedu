/**
 * Adventure realm cards for the Quest Map hub.
 * Each realm maps to a curriculum and carries a Pop-Art palette.
 */
export const REALMS = [
  {
    id: 'math',
    name: 'Numbers Volcano',
    tagline: 'Multiply, divide & conquer!',
    emoji: '🌋',
    curriculumId: 'math',
    defaultTheme: 'volcano',
    palette: {
      card: 'bg-orange-400',
      cardHover: 'hover:bg-orange-300',
      accent: 'bg-red-500',
      text: 'text-black',
      border: 'border-black',
    },
  },
  {
    id: 'science',
    name: 'Cosmic Lab',
    tagline: 'Experiment among the stars!',
    emoji: '🔬',
    curriculumId: 'science',
    defaultTheme: 'space',
    palette: {
      card: 'bg-indigo-400',
      cardHover: 'hover:bg-indigo-300',
      accent: 'bg-violet-500',
      text: 'text-black',
      border: 'border-black',
    },
  },
  {
    id: 'reading',
    name: 'Wordwood Forest',
    tagline: 'Stories, sounds & secrets!',
    emoji: '📚',
    curriculumId: 'reading',
    defaultTheme: 'forest',
    palette: {
      card: 'bg-green-400',
      cardHover: 'hover:bg-green-300',
      accent: 'bg-emerald-500',
      text: 'text-black',
      border: 'border-black',
    },
  },
  {
    id: 'history',
    name: 'Echoes Castle',
    tagline: 'Travel through time!',
    emoji: '🏰',
    curriculumId: 'history',
    defaultTheme: 'castle',
    palette: {
      card: 'bg-violet-400',
      cardHover: 'hover:bg-violet-300',
      accent: 'bg-amber-400',
      text: 'text-black',
      border: 'border-black',
    },
  },
];

export function getRealmByCurriculum(curriculumId) {
  return REALMS.find((realm) => realm.curriculumId === curriculumId) ?? null;
}

export function getRealmById(realmId) {
  return REALMS.find((realm) => realm.id === realmId) ?? null;
}
