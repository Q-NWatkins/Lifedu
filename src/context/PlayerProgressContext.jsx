import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CURRICULUMS } from '../config/index.js';

const STORAGE_KEY = 'wit-player-progress';

const DEFAULT_SKILLS = Object.fromEntries(
  Object.keys(CURRICULUMS).map((id) => [id, 10]),
);

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const PlayerProgressContext = createContext(null);

export function PlayerProgressProvider({ children }) {
  const saved = loadProgress();

  const [skills, setSkills] = useState(saved?.skills ?? DEFAULT_SKILLS);
  const [badges, setBadges] = useState(saved?.badges ?? []);
  const [completedCourses, setCompletedCourses] = useState(saved?.completedCourses ?? []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ skills, badges, completedCourses }),
      );
    } catch {
      // ignore storage errors in demo
    }
  }, [skills, badges, completedCourses]);

  const completeCourse = useCallback(
    ({ courseId, curriculumId, badgeId, badgeLabel, skillGain = 15 }) => {
      setSkills((prev) => ({
        ...prev,
        [curriculumId]: Math.min(100, (prev[curriculumId] ?? 10) + skillGain),
      }));

      setBadges((prev) => {
        if (prev.some((badge) => badge.id === badgeId)) return prev;
        return [
          ...prev,
          { id: badgeId, label: badgeLabel, courseId, earnedAt: Date.now() },
        ];
      });

      setCompletedCourses((prev) => {
        if (prev.includes(courseId)) return prev;
        return [...prev, courseId];
      });
    },
    [],
  );

  const value = useMemo(
    () => ({ skills, badges, completedCourses, completeCourse }),
    [skills, badges, completedCourses, completeCourse],
  );

  return (
    <PlayerProgressContext.Provider value={value}>{children}</PlayerProgressContext.Provider>
  );
}

export function usePlayerProgress() {
  const ctx = useContext(PlayerProgressContext);
  if (!ctx) {
    throw new Error('usePlayerProgress must be used within PlayerProgressProvider');
  }
  return ctx;
}
