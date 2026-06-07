/**
 * Skill milestone definitions for the "Level Up Badge Stand".
 *
 * Each subject's Skill Hexagon node unlocks a unique avatar title as it crosses
 * the 25 / 50 / 75 / 100 point thresholds.
 */
export const MILESTONE_THRESHOLDS = [25, 50, 75, 100];

export const SUBJECT_MILESTONES = {
  math: {
    emoji: '🔢',
    color: '#ef4444',
    titles: { 25: 'Number Novice', 50: 'Numbers Ninja', 75: 'Math Master', 100: 'Number Legend' },
  },
  science: {
    emoji: '🔬',
    color: '#14b8a6',
    titles: { 25: 'Lab Rookie', 50: 'Science Sleuth', 75: 'Cosmic Scholar', 100: 'Science Legend' },
  },
  reading: {
    emoji: '📚',
    color: '#3b82f6',
    titles: { 25: 'Word Explorer', 50: 'Story Sage', 75: 'Reading Ranger', 100: 'Word Legend' },
  },
  history: {
    emoji: '🏰',
    color: '#d97706',
    titles: { 25: 'Time Traveler', 50: 'History Buff', 75: 'Chrono Keeper', 100: 'History Legend' },
  },
};

/** Stable id for a (subject, threshold) milestone. */
export function milestoneId(subject, threshold) {
  return `${subject}-${threshold}`;
}

export function getMilestoneTitle(subject, threshold) {
  return SUBJECT_MILESTONES[subject]?.titles?.[threshold] ?? null;
}

/** Resolve a milestone id (e.g. "math-50") back to its display title. */
export function getTitleById(milestoneId) {
  if (!milestoneId) return null;
  const [subject, threshold] = milestoneId.split('-');
  return getMilestoneTitle(subject, Number(threshold));
}

/**
 * Flatten every milestone into a list annotated with whether the player's
 * current skill value has reached it.
 */
export function listMilestones(skills = {}) {
  const out = [];
  for (const [subject, def] of Object.entries(SUBJECT_MILESTONES)) {
    for (const threshold of MILESTONE_THRESHOLDS) {
      out.push({
        id: milestoneId(subject, threshold),
        subject,
        threshold,
        title: def.titles[threshold],
        emoji: def.emoji,
        color: def.color,
        reached: (skills[subject] ?? 0) >= threshold,
      });
    }
  }
  return out;
}
