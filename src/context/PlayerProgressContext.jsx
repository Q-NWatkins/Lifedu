import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CURRICULUMS } from '../config/index.js';
import { BASE_THEME_IDS } from './ThemeContext.jsx';

const STORAGE_KEY = 'wit-player-progress';

const DEFAULT_SKILLS = Object.fromEntries(
  Object.keys(CURRICULUMS).map((id) => [id, 10]),
);

/** Static themes everyone starts with; animated ones are loot-gated. */
const DEFAULT_UNLOCKED_THEMES = BASE_THEME_IDS;

/** Every subject campaign starts with only Grade 1 unlocked. */
const DEFAULT_UNLOCKED_GRADES = { math: 1, science: 1, reading: 1, history: 1 };
const MAX_GRADE = 5;

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
  const [gems, setGems] = useState(saved?.gems ?? 0);
  const [unlockedCombatCards, setUnlockedCombatCards] = useState(
    saved?.unlockedCombatCards ?? [],
  );
  const [stepCards, setStepCards] = useState(saved?.stepCards ?? 0);
  const [lastSpinAt, setLastSpinAt] = useState(saved?.lastSpinAt ?? null);
  const [unlockedTitles, setUnlockedTitles] = useState(saved?.unlockedTitles ?? []);
  const [activeTitle, setActiveTitleState] = useState(saved?.activeTitle ?? null);
  const [unlockedGrades, setUnlockedGrades] = useState(() => ({
    ...DEFAULT_UNLOCKED_GRADES,
    ...(saved?.unlockedGrades ?? {}),
  }));

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
          gems,
          unlockedCombatCards,
          stepCards,
          lastSpinAt,
          unlockedTitles,
          activeTitle,
          unlockedGrades,
        }),
      );
    } catch {
      // ignore storage errors in demo
    }
  }, [
    skills,
    badges,
    completedCourses,
    inventory,
    equipped,
    userUnlockedThemes,
    gems,
    unlockedCombatCards,
    stepCards,
    lastSpinAt,
    unlockedTitles,
    activeTitle,
    unlockedGrades,
  ]);

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

  /** Add (or spend, with a negative amount) gem currency. */
  const addGems = useCallback((amount) => {
    if (!amount) return;
    setGems((prev) => Math.max(0, prev + amount));
  }, []);

  /** Permanently unlock a special Combat Action Card. Returns true if new. */
  const unlockCombatCard = useCallback((cardId) => {
    if (!cardId) return false;
    let newlyUnlocked = false;
    setUnlockedCombatCards((prev) => {
      if (prev.includes(cardId)) return prev;
      newlyUnlocked = true;
      return [...prev, cardId];
    });
    return newlyUnlocked;
  }, []);

  /** Bonus movement cards (won from the Daily Trivia Wheel). */
  const addStepCards = useCallback((amount) => {
    if (!amount) return;
    setStepCards((prev) => Math.max(0, prev + amount));
  }, []);

  /** Spend the whole step-card stash as bonus starting energy for a quest. */
  const consumeStepCards = useCallback(() => {
    let spent = 0;
    setStepCards((prev) => {
      spent = prev;
      return 0;
    });
    return spent;
  }, []);

  /** Record a daily wheel spin (24h cooldown anchor). */
  const recordDailySpin = useCallback(() => {
    setLastSpinAt(Date.now());
  }, []);

  /** Unlock a milestone avatar title. Returns true if newly unlocked. */
  const unlockTitle = useCallback((titleId) => {
    if (!titleId) return false;
    let newlyUnlocked = false;
    setUnlockedTitles((prev) => {
      if (prev.includes(titleId)) return prev;
      newlyUnlocked = true;
      return [...prev, titleId];
    });
    return newlyUnlocked;
  }, []);

  const setActiveTitle = useCallback((titleId) => {
    setActiveTitleState(titleId);
  }, []);

  /**
   * Unlock a subject's campaign up to `grade` (clamped to MAX_GRADE). Used when
   * a grade boss is defeated to open the next grade map. Returns true if this
   * raised the unlocked ceiling.
   */
  const unlockGrade = useCallback((subject, grade) => {
    if (!subject || !grade) return false;
    const target = Math.min(MAX_GRADE, grade);
    let raised = false;
    setUnlockedGrades((prev) => {
      const current = prev[subject] ?? 1;
      if (target <= current) return prev;
      raised = true;
      return { ...prev, [subject]: target };
    });
    return raised;
  }, []);

  const isGradeUnlocked = useCallback(
    (subject, grade) => grade <= (unlockedGrades[subject] ?? 1),
    [unlockedGrades],
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
      gems,
      unlockedCombatCards,
      stepCards,
      lastSpinAt,
      unlockedTitles,
      activeTitle,
      unlockedGrades,
      addToInventory,
      equipItem,
      sendToBackpack,
      unlockTheme,
      isThemeUnlocked,
      addGems,
      unlockCombatCard,
      addStepCards,
      consumeStepCards,
      recordDailySpin,
      unlockTitle,
      setActiveTitle,
      unlockGrade,
      isGradeUnlocked,
      completeCourse,
    }),
    [
      skills,
      badges,
      completedCourses,
      inventory,
      equipped,
      userUnlockedThemes,
      gems,
      unlockedCombatCards,
      stepCards,
      lastSpinAt,
      unlockedTitles,
      activeTitle,
      unlockedGrades,
      addToInventory,
      equipItem,
      sendToBackpack,
      unlockTheme,
      isThemeUnlocked,
      addGems,
      unlockCombatCard,
      addStepCards,
      consumeStepCards,
      recordDailySpin,
      unlockTitle,
      setActiveTitle,
      unlockGrade,
      isGradeUnlocked,
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
