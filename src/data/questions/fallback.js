/** Generic boss questions when a bank has no loaded content yet. */
export const FALLBACK_QUESTIONS = [
  {
    id: 'fb-1',
    prompt: 'Ready for a challenge? Pick the best answer!',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctIndex: 1,
    difficulty: 'hard',
  },
  {
    id: 'fb-2',
    prompt: 'Which answer shows strong focus?',
    options: ['Giving up', 'Trying again', 'Skipping', 'Guessing only'],
    correctIndex: 1,
    difficulty: 'hard',
  },
  {
    id: 'fb-3',
    prompt: 'What helps you learn best?',
    options: ['Practice', 'Ignoring mistakes', 'Never reviewing', 'Rushing'],
    correctIndex: 0,
    difficulty: 'medium',
  },
  {
    id: 'fb-4',
    prompt: 'When stuck on a problem, you should…',
    options: ['Break it into steps', 'Quit immediately', 'Copy without thinking', 'Hide'],
    correctIndex: 0,
    difficulty: 'hard',
  },
  {
    id: 'fb-5',
    prompt: 'A growth mindset means…',
    options: ['Brains can grow with effort', 'Talent never changes', 'Mistakes mean failure', 'Only easy counts'],
    correctIndex: 0,
    difficulty: 'hard',
  },
  {
    id: 'fb-6',
    prompt: 'Before a boss battle, you should…',
    options: ['Review key ideas', 'Forget everything', 'Panic', 'Skip reading'],
    correctIndex: 0,
    difficulty: 'medium',
  },
];
