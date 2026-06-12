import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CURRICULUMS } from '../config/index.js';
import { BASE_THEME_IDS } from './ThemeContext.jsx';
import { useAuth } from './AuthContext.jsx';

// Storage is namespaced PER USER so accounts sharing a device never inherit each
// other's gems / courses / unlocks. Key shape: `wit-progress:<userId>`.
const STORAGE_NS = 'wit-progress';
const keyFor = (userId) => `${STORAGE_NS}:${userId}`;

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

/**
 * A pristine, zeroed progress snapshot — exactly what a brand-new account or a
 * logged-out session sees (0 gems, no unlocks, baseline skills/energy).
 */
function defaultProgress() {
  return {
    skills: { ...DEFAULT_SKILLS },
    badges: [],
    completedCourses: [],
    inventory: [],
    equipped: { ...DEFAULT_EQUIPPED },
    userUnlockedThemes: [...DEFAULT_UNLOCKED_THEMES],
    gems: 0,
    unlockedCombatCards: [],
    consumableCharges: { shield: 0, heavyAttack: 0, doubleDamage: 0 },
    stepCards: 0,
    lastSpinAt: null,
    unlockedTitles: [],
    activeTitle: null,
    unlockedGrades: { ...DEFAULT_UNLOCKED_GRADES },
  };
}

/**
 * Load + normalize a single user's saved blob. With no user (logged out) or no
 * saved data, returns clean defaults so nothing carries over between accounts.
 */
function loadProgress(userId) {
  const base = defaultProgress();
  if (!userId) return base;

  let saved = null;
  try {
    const raw = localStorage.getItem(keyFor(userId));
    saved = raw ? JSON.parse(raw) : null;
  } catch {
    saved = null;
  }
  if (!saved) return base;

  const themes = new Set(DEFAULT_UNLOCKED_THEMES);
  (saved.userUnlockedThemes ?? []).forEach((id) => themes.add(id));

  return {
    skills: saved.skills ?? base.skills,
    badges: saved.badges ?? base.badges,
    completedCourses: saved.completedCourses ?? base.completedCourses,
    inventory: saved.inventory ?? base.inventory,
    equipped: saved.equipped ?? base.equipped,
    userUnlockedThemes: [...themes],
    gems: saved.gems ?? base.gems,
    unlockedCombatCards: saved.unlockedCombatCards ?? base.unlockedCombatCards,
    consumableCharges: { ...base.consumableCharges, ...(saved.consumableCharges ?? {}) },
    stepCards: saved.stepCards ?? base.stepCards,
    lastSpinAt: saved.lastSpinAt ?? base.lastSpinAt,
    unlockedTitles: saved.unlockedTitles ?? base.unlockedTitles,
    activeTitle: saved.activeTitle ?? base.activeTitle,
    unlockedGrades: { ...base.unlockedGrades, ...(saved.unlockedGrades ?? {}) },
  };
}

const PlayerProgressContext = createContext(null);

export function PlayerProgressProvider({ children }) {
  // The active account drives which namespaced store we read/write.
  const { session } = useAuth();
  const userId = session?.username ?? null;

  // Start from a clean slate; the hydrate effect loads the active user's data.
  const initial = defaultProgress();
  const [skills, setSkills] = useState(initial.skills);
  const [badges, setBadges] = useState(initial.badges);
  const [completedCourses, setCompletedCourses] = useState(initial.completedCourses);
  const [inventory, setInventory] = useState(initial.inventory);
  const [equipped, setEquipped] = useState(initial.equipped);
  const [userUnlockedThemes, setUserUnlockedThemes] = useState(initial.userUnlockedThemes);
  const [gems, setGems] = useState(initial.gems);
  const [unlockedCombatCards, setUnlockedCombatCards] = useState(initial.unlockedCombatCards);
  const [consumableCharges, setConsumableCharges] = useState(initial.consumableCharges);
  const [stepCards, setStepCards] = useState(initial.stepCards);
  const [lastSpinAt, setLastSpinAt] = useState(initial.lastSpinAt);
  const [unlockedTitles, setUnlockedTitles] = useState(initial.unlockedTitles);
  const [activeTitle, setActiveTitleState] = useState(initial.activeTitle);
  const [unlockedGrades, setUnlockedGrades] = useState(initial.unlockedGrades);

  const hydratedUserRef = useRef(undefined);
  const justHydratedRef = useRef(false);

  // Hydrate (or reset) the entire store whenever the signed-in account changes
  // — login, account switch, or logout. No user → pristine defaults.
  useEffect(() => {
    const data = loadProgress(userId);
    setSkills(data.skills);
    setBadges(data.badges);
    setCompletedCourses(data.completedCourses);
    setInventory(data.inventory);
    setEquipped(data.equipped);
    setUserUnlockedThemes(data.userUnlockedThemes);
    setGems(data.gems);
    setUnlockedCombatCards(data.unlockedCombatCards);
    setConsumableCharges(data.consumableCharges);
    setStepCards(data.stepCards);
    setLastSpinAt(data.lastSpinAt);
    setUnlockedTitles(data.unlockedTitles);
    setActiveTitleState(data.activeTitle);
    setUnlockedGrades(data.unlockedGrades);
    hydratedUserRef.current = userId;
    justHydratedRef.current = true; // skip the immediate persist (still stale state)
  }, [userId]);

  // Persist to the active user's namespaced key. Skipped when logged out, before
  // hydration, and on the hydration tick (so one account never overwrites another).
  useEffect(() => {
    if (!userId || hydratedUserRef.current !== userId) return;
    if (justHydratedRef.current) {
      justHydratedRef.current = false;
      return;
    }
    try {
      localStorage.setItem(
        keyFor(userId),
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
          consumableCharges,
        }),
      );
    } catch {
      // ignore storage errors in demo
    }
  }, [
    userId,
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
    consumableCharges,
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

  /** Spend gems if the balance covers it. Returns true on success. */
  const spendGems = useCallback(
    (amount) => {
      if (amount <= 0 || gems < amount) return false;
      setGems((prev) => Math.max(0, prev - amount));
      return true;
    },
    [gems],
  );

  /** Remove an inventory item (and unequip it if it was worn). */
  const removeFromInventory = useCallback((itemId) => {
    if (!itemId) return;
    setInventory((prev) => prev.filter((entry) => entry.id !== itemId));
    setEquipped((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const slot of Object.keys(next)) {
        if (next[slot]?.id === itemId) {
          next[slot] = null;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, []);

  /** Add one-time-use combat consumable charges. */
  const addConsumable = useCallback((type, amount = 1) => {
    if (!type || !amount) return;
    setConsumableCharges((prev) => ({
      ...prev,
      [type]: Math.max(0, (prev[type] ?? 0) + amount),
    }));
  }, []);

  /** Spend one charge of a consumable. Returns true if one was available. */
  const consumeConsumable = useCallback(
    (type) => {
      if ((consumableCharges[type] ?? 0) <= 0) return false;
      setConsumableCharges((prev) => ({
        ...prev,
        [type]: Math.max(0, (prev[type] ?? 0) - 1),
      }));
      return true;
    },
    [consumableCharges],
  );

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
      consumableCharges,
      stepCards,
      lastSpinAt,
      unlockedTitles,
      activeTitle,
      unlockedGrades,
      addToInventory,
      removeFromInventory,
      equipItem,
      sendToBackpack,
      unlockTheme,
      isThemeUnlocked,
      addGems,
      spendGems,
      unlockCombatCard,
      addConsumable,
      consumeConsumable,
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
      consumableCharges,
      stepCards,
      lastSpinAt,
      unlockedTitles,
      activeTitle,
      unlockedGrades,
      addToInventory,
      removeFromInventory,
      equipItem,
      sendToBackpack,
      unlockTheme,
      isThemeUnlocked,
      addGems,
      spendGems,
      unlockCombatCard,
      addConsumable,
      consumeConsumable,
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
