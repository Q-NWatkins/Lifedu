import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'wit-active-theme';

/**
 * Centralized platform theme dictionary.
 *
 * Each theme explicitly defines BOTH its layout container styling (`wrapper`,
 * which maps to a CSS background rule in index.css) AND an explicit
 * `contrastText` / `contrastMuted` pair — the readable typography color for
 * that background. Components pull ink from these context variables instead of
 * hardcoding Tailwind shades, so lettering stays vividly legible across every
 * theme swap (light themes get dark ink, dark/animated themes get bright ink).
 *
 * `animated` flags the moving CSS-background themes that are gated behind the
 * Weighted Loot System; `unlockRarity` records the drop tier that grants them.
 */
export const PLATFORM_THEMES = {
  default: {
    id: 'default',
    label: 'Default Retro',
    description: 'Playful neubrutalism — bold, bright, and fun!',
    wrapper: 'theme-default',
    isDark: false,
    animated: false,
    unlockRarity: null,
    contrastText: 'text-slate-900',
    contrastMuted: 'text-slate-900/60',
    accent: 'bg-lime-400 text-black',
    swatch: 'linear-gradient(135deg,#bef264,#a3e635)',
  },
  cosmic: {
    id: 'cosmic',
    label: 'Cosmic Lab',
    description: 'Deep space vibes with drifting star particles.',
    wrapper: 'theme-cosmic',
    isDark: true,
    animated: false,
    unlockRarity: null,
    contrastText: 'text-slate-50',
    contrastMuted: 'text-slate-300',
    accent: 'bg-violet-500 text-white',
    swatch: 'linear-gradient(135deg,#312e81,#1e1b4b)',
  },
  sky: {
    id: 'sky',
    label: 'Sky Kingdom',
    description: 'Soft pastels and floating cartoon clouds.',
    wrapper: 'theme-sky',
    isDark: false,
    animated: false,
    unlockRarity: null,
    contrastText: 'text-sky-950',
    contrastMuted: 'text-sky-950/60',
    accent: 'bg-sky-400 text-white',
    swatch: 'linear-gradient(135deg,#bae6fd,#e0f2fe)',
  },
  dino: {
    id: 'dino',
    label: 'Dino Safari',
    description: 'Prehistoric olive greens and warm amber tones.',
    wrapper: 'theme-dino',
    isDark: false,
    animated: false,
    unlockRarity: null,
    contrastText: 'text-emerald-950',
    contrastMuted: 'text-emerald-950/60',
    accent: 'bg-amber-500 text-emerald-950',
    swatch: 'linear-gradient(135deg,#a3e635,#fbbf24)',
  },
  deepsea: {
    id: 'deepsea',
    label: 'Deep Sea Trench',
    description: 'Abyssal navy depths with animated rising bubbles.',
    wrapper: 'theme-deepsea',
    isDark: true,
    animated: true,
    unlockRarity: 'Epic',
    contrastText: 'text-cyan-50',
    contrastMuted: 'text-cyan-200/80',
    accent: 'bg-cyan-400 text-cyan-950',
    swatch: 'linear-gradient(135deg,#0c4a6e,#042f2e)',
  },
  candy: {
    id: 'candy',
    label: 'Enchanted Candy Kingdom',
    description: 'Pastel kingdom with floating animated jellybeans.',
    wrapper: 'theme-candy',
    isDark: false,
    animated: true,
    unlockRarity: 'Legendary',
    contrastText: 'text-purple-900',
    contrastMuted: 'text-purple-900/60',
    accent: 'bg-pink-400 text-white',
    swatch: 'linear-gradient(135deg,#f9a8d4,#d8b4fe)',
  },
};

/** Theme IDs available to everyone from the start (static, non-animated). */
export const BASE_THEME_IDS = Object.values(PLATFORM_THEMES)
  .filter((t) => !t.animated)
  .map((t) => t.id);

const ThemeContext = createContext(null);

function loadTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && PLATFORM_THEMES[saved]) return saved;
  } catch {
    // ignore
  }
  return 'default';
}

export function ThemeProvider({ children }) {
  const [activeTheme, setActiveTheme] = useState(loadTheme);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, activeTheme);
    } catch {
      // ignore
    }
    document.body.dataset.theme = activeTheme;
  }, [activeTheme]);

  const value = useMemo(
    () => ({
      activeTheme,
      setActiveTheme,
      themeConfig: PLATFORM_THEMES[activeTheme] ?? PLATFORM_THEMES.default,
    }),
    [activeTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
