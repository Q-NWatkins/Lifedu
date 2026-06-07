/**
 * Multi-subject question bank for the Boss Battle card battler.
 * Difficulty tiers map to combat cards:
 *   easy   → Shield Block
 *   medium → Basic Strike
 *   hard   → Mega Fireball
 */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const MULTI_SUBJECT_QUESTIONS = {
  easy: [
    // Math
    { id: 'ms-m-e-1', subject: 'Math', prompt: 'What is 4 + 7?', options: ['10', '11', '12', '13'], correctIndex: 1, difficulty: 'easy' },
    { id: 'ms-m-e-2', subject: 'Math', prompt: 'How many sides does a triangle have?', options: ['2', '3', '4', '5'], correctIndex: 1, difficulty: 'easy' },
    { id: 'ms-m-e-3', subject: 'Math', prompt: 'How many inches are in 1 foot?', options: ['10', '12', '6', '8'], correctIndex: 1, difficulty: 'easy' },
    { id: 'ms-m-e-4', subject: 'Math', prompt: 'What is 9 - 3?', options: ['5', '6', '7', '8'], correctIndex: 1, difficulty: 'easy' },
    // Science
    { id: 'ms-s-e-1', subject: 'Science', prompt: 'What do plants need to make food?', options: ['Moonlight', 'Sunlight', 'Darkness', 'Wind'], correctIndex: 1, difficulty: 'easy' },
    { id: 'ms-s-e-2', subject: 'Science', prompt: 'Which of these is a mammal?', options: ['Goldfish', 'Frog', 'Dog', 'Snake'], correctIndex: 2, difficulty: 'easy' },
    { id: 'ms-s-e-3', subject: 'Science', prompt: 'What do we call frozen water?', options: ['Steam', 'Vapor', 'Ice', 'Mist'], correctIndex: 2, difficulty: 'easy' },
    // Reading
    { id: 'ms-r-e-1', subject: 'Reading', prompt: 'Which letter makes the "sss" sound?', options: ['B', 'D', 'S', 'T'], correctIndex: 2, difficulty: 'easy' },
    { id: 'ms-r-e-2', subject: 'Reading', prompt: 'What is the opposite of "hot"?', options: ['Warm', 'Cool', 'Cold', 'Mild'], correctIndex: 2, difficulty: 'easy' },
    { id: 'ms-r-e-3', subject: 'Reading', prompt: 'Which of these is a vowel?', options: ['B', 'C', 'E', 'F'], correctIndex: 2, difficulty: 'easy' },
    // History
    { id: 'ms-h-e-1', subject: 'History', prompt: 'Which country did the United States break free from in 1776?', options: ['France', 'Spain', 'England', 'Germany'], correctIndex: 2, difficulty: 'easy' },
    { id: 'ms-h-e-2', subject: 'History', prompt: 'What do we call the leader of the United States?', options: ['King', 'President', 'Prime Minister', 'Emperor'], correctIndex: 1, difficulty: 'easy' },
  ],

  medium: [
    // Math
    { id: 'ms-m-m-1', subject: 'Math', prompt: 'What is 7 × 6?', options: ['36', '42', '48', '54'], correctIndex: 1, difficulty: 'medium' },
    { id: 'ms-m-m-2', subject: 'Math', prompt: 'Which fraction is largest?', options: ['1/4', '1/3', '1/2', '1/5'], correctIndex: 2, difficulty: 'medium' },
    { id: 'ms-m-m-3', subject: 'Math', prompt: 'What is 25% of 80?', options: ['20', '25', '30', '40'], correctIndex: 0, difficulty: 'medium' },
    { id: 'ms-m-m-4', subject: 'Math', prompt: 'A rectangle has sides of 5 and 3. What is its area?', options: ['8', '15', '16', '20'], correctIndex: 1, difficulty: 'medium' },
    // Science
    { id: 'ms-s-m-1', subject: 'Science', prompt: 'Which planet is known as the Red Planet?', options: ['Jupiter', 'Venus', 'Mars', 'Saturn'], correctIndex: 2, difficulty: 'medium' },
    { id: 'ms-s-m-2', subject: 'Science', prompt: 'What gas do we breathe in to stay alive?', options: ['Carbon Dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'], correctIndex: 2, difficulty: 'medium' },
    { id: 'ms-s-m-3', subject: 'Science', prompt: 'What is the boiling point of water (Celsius)?', options: ['50°C', '75°C', '90°C', '100°C'], correctIndex: 3, difficulty: 'medium' },
    { id: 'ms-s-m-4', subject: 'Science', prompt: 'Which part of a plant soaks up water from the soil?', options: ['Leaves', 'Stem', 'Roots', 'Flowers'], correctIndex: 2, difficulty: 'medium' },
    // Reading
    { id: 'ms-r-m-1', subject: 'Reading', prompt: '"She ran as fast as the wind." This is an example of a…', options: ['Metaphor', 'Simile', 'Alliteration', 'Rhyme'], correctIndex: 1, difficulty: 'medium' },
    { id: 'ms-r-m-2', subject: 'Reading', prompt: 'What is a synonym for "happy"?', options: ['Sad', 'Angry', 'Joyful', 'Tired'], correctIndex: 2, difficulty: 'medium' },
    { id: 'ms-r-m-3', subject: 'Reading', prompt: 'What does an author write to explain events in order? ', options: ['Poetry', 'Sequence', 'Opinion', 'Dialogue'], correctIndex: 1, difficulty: 'medium' },
    // History
    { id: 'ms-h-m-1', subject: 'History', prompt: 'Who was the first President of the United States?', options: ['Thomas Jefferson', 'Abraham Lincoln', 'George Washington', 'John Adams'], correctIndex: 2, difficulty: 'medium' },
    { id: 'ms-h-m-2', subject: 'History', prompt: 'Which ancient wonder was located in Egypt?', options: ['The Colosseum', 'The Great Pyramid', 'The Parthenon', 'Machu Picchu'], correctIndex: 1, difficulty: 'medium' },
    { id: 'ms-h-m-3', subject: 'History', prompt: 'What was the name of the ship the Pilgrims sailed on?', options: ['Santa Maria', 'Mayflower', 'Titanic', 'Endeavour'], correctIndex: 1, difficulty: 'medium' },
  ],

  hard: [
    // Math
    { id: 'ms-m-h-1', subject: 'Math', prompt: 'What is 12 × 13?', options: ['144', '152', '156', '169'], correctIndex: 2, difficulty: 'hard' },
    { id: 'ms-m-h-2', subject: 'Math', prompt: 'A triangle has angles of 60° and 80°. What is the third angle?', options: ['30°', '40°', '50°', '60°'], correctIndex: 1, difficulty: 'hard' },
    { id: 'ms-m-h-3', subject: 'Math', prompt: 'What is the square root of 144?', options: ['10', '12', '14', '16'], correctIndex: 1, difficulty: 'hard' },
    { id: 'ms-m-h-4', subject: 'Math', prompt: 'If you have 3 dozen eggs, how many eggs is that?', options: ['24', '30', '36', '48'], correctIndex: 2, difficulty: 'hard' },
    // Science
    { id: 'ms-s-h-1', subject: 'Science', prompt: 'What is the closest star to Earth besides the Sun?', options: ['Betelgeuse', 'Sirius', 'Proxima Centauri', 'Polaris'], correctIndex: 2, difficulty: 'hard' },
    { id: 'ms-s-h-2', subject: 'Science', prompt: 'What part of a cell contains DNA?', options: ['Mitochondria', 'Nucleus', 'Ribosome', 'Cell Wall'], correctIndex: 1, difficulty: 'hard' },
    { id: 'ms-s-h-3', subject: 'Science', prompt: 'What force keeps planets in orbit around the Sun?', options: ['Magnetism', 'Friction', 'Gravity', 'Electricity'], correctIndex: 2, difficulty: 'hard' },
    { id: 'ms-s-h-4', subject: 'Science', prompt: 'What process do plants use to make food from sunlight?', options: ['Respiration', 'Photosynthesis', 'Digestion', 'Evaporation'], correctIndex: 1, difficulty: 'hard' },
    // Reading
    { id: 'ms-r-h-1', subject: 'Reading', prompt: 'What does "benevolent" mean?', options: ['Cruel', 'Kind and generous', 'Clever', 'Frightened'], correctIndex: 1, difficulty: 'hard' },
    { id: 'ms-r-h-2', subject: 'Reading', prompt: 'In a story, the "climax" is…', options: ['The beginning', 'The most exciting turning point', 'The setting description', 'The final ending'], correctIndex: 1, difficulty: 'hard' },
    { id: 'ms-r-h-3', subject: 'Reading', prompt: 'What literary device is used in "Peter Piper picked a peck of pickled peppers"?', options: ['Simile', 'Metaphor', 'Alliteration', 'Hyperbole'], correctIndex: 2, difficulty: 'hard' },
    // History
    { id: 'ms-h-h-1', subject: 'History', prompt: 'Which ancient civilization built the Great Wall?', options: ['Romans', 'Egyptians', 'Chinese', 'Greeks'], correctIndex: 2, difficulty: 'hard' },
    { id: 'ms-h-h-2', subject: 'History', prompt: 'Who invented the telephone?', options: ['Thomas Edison', 'Nikola Tesla', 'Alexander Graham Bell', 'Benjamin Franklin'], correctIndex: 2, difficulty: 'hard' },
    { id: 'ms-h-h-3', subject: 'History', prompt: 'What year did World War II end?', options: ['1941', '1943', '1945', '1947'], correctIndex: 2, difficulty: 'hard' },
  ],
};

export function getQuestionsForDifficulty(difficulty) {
  return shuffle(MULTI_SUBJECT_QUESTIONS[difficulty] ?? MULTI_SUBJECT_QUESTIONS.easy);
}
