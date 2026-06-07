import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CURRICULUMS } from '../config/index.js';
import { BASE_THEME_IDS } from './ThemeContext.jsx';

const STORAGE_KEY = 'wit-player-progress';

const DEFAULT_SKILLS = Object.fromEntries(
  Object.keys(CURRICULUMS).map((id) => [id, 10]),
);

/** Static themes everyone starts with; animated ones are loot-gated. */
const DEFAULT_UNLOCKED_THEMES = BASE_THEME_IDS;

const DEFAULT_EQUIPPED = {
  hat: null,
  clothing: null,
  pet: null,
  badge: null,
};

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
  const [inventory, setInventory] = useState(saved?.inventory ?? []);
  const [equipped, setEquipped] = useState(saved?.equipped ?? DEFAULT_EQUIPPED);
  const [userUnlockedThemes, setUserUnlockedThemes] = useState(() => {
    const base = new Set(DEFAULT_UNLOCKED_THEMES);
    (saved?.userUnlockedThemes ?? []).forEach((id) => base.add(id));
    return [...base];
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          skills,
          badges,
          completedCourses,
          inventory,
          equipped,
          userUnlockedThemes,
        }),
      );
    } catch {
      // ignore storage errors in demo
    }
  }, [skills, badges, completedCourses, inventory, equipped, userUnlockedThemes]);

  const addToInventory = useCallback((item) => {
    if (!item?.id) return;
    setInventory((prev) => {
      if (prev.some((entry) => entry.id === item.id)) return prev;
      return [...prev, { ...item, acquiredAt: Date.now() }];
    });
  }, []);

  const equipItem = useCallback(
    (item) => {
      if (!item?.id || !item?.category) return;
      addToInventory(item);
      setEquipped((prev) => ({ ...prev, [item.category]: item }));
    },
    [addToInventory],
  );

  const sendToBackpack = useCallback(
    (item) => {
      addToInventory(item);
    },
    [addToInventory],
  );

  /**
   * Unlock a tiered background theme. Returns true only when it was newly
   * unlocked (so callers can celebrate the first-time drop).
   */
  const unlockTheme = useCallback((themeId) => {
    if (!themeId) return false;
    let newlyUnlocked = false;
    setUserUnlockedThemes((prev) => {
      if (prev.includes(themeId)) return prev;
      newlyUnlocked = true;
      return [...prev, themeId];
    });
    return newlyUnlocked;
  }, []);

  const isThemeUnlocked = useCallback(
    (themeId) => userUnlockedThemes.includes(themeId),
    [userUnlockedThemes],
  );

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
    () => ({
      skills,
      badges,
      completedCourses,
      inventory,
      equipped,
      userUnlockedThemes,
      addToInventory,
      equipItem,
      sendToBackpack,
      unlockTheme,
      isThemeUnlocked,
      completeCourse,
    }),
    [
      skills,
      badges,
      completedCourses,
      inventory,
      equipped,
      userUnlockedThemes,
      addToInventory,
      equipItem,
      sendToBackpack,
      unlockTheme,
      isThemeUnlocked,
      completeCourse,
    ],
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
