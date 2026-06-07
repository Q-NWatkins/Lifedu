import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'wit-active-theme';

/**
 * Centralized platform theme dictionary with a strict SEMANTIC DESIGN TOKEN
 * system. Every biome theme explicitly dictates its matching architectural
 * surface pairs so typography contrast can never drift:
 *
 *   bg_app       → main page background canvas color
 *   bg_card      → component container surface color
 *   text_main    → primary typography color used directly on the app canvas
 *   text_card    → typography color used inside component cards
 *   border_color → neubrutalist border stroke color
 *
 * Dark themes scale their card surface dark (`bg_card`) so the matching
 * `text_card` (white) stays intensely visible. Components bind to these tokens
 * instead of hardcoding Tailwind shades.
 *
 * `animated` flags the moving-background themes gated behind the Weighted Loot
 * System; `unlockRarity` records the drop tier that grants them. `contrastMuted`
 * is a de-emphasized partner to `text_main` for secondary on-canvas text.
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
    bg_app: 'bg-amber-50',
    bg_card: 'bg-white',
    text_main: 'text-slate-950',
    text_card: 'text-slate-900',
    border_color: 'border-black',
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
    bg_app: 'bg-indigo-950',
    bg_card: 'bg-slate-900',
    text_main: 'text-indigo-100',
    text_card: 'text-white',
    border_color: 'border-black',
    contrastMuted: 'text-indigo-200/70',
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
    bg_app: 'bg-sky-100',
    bg_card: 'bg-white',
    text_main: 'text-sky-950',
    text_card: 'text-slate-900',
    border_color: 'border-black',
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
    bg_app: 'bg-lime-100',
    bg_card: 'bg-white',
    text_main: 'text-emerald-950',
    text_card: 'text-emerald-900',
    border_color: 'border-black',
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
    bg_app: 'bg-cyan-950',
    bg_card: 'bg-slate-900',
    text_main: 'text-cyan-100',
    text_card: 'text-white',
    border_color: 'border-black',
    contrastMuted: 'text-cyan-200/70',
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
    bg_app: 'bg-pink-100',
    bg_card: 'bg-white',
    text_main: 'text-purple-950',
    text_card: 'text-purple-900',
    border_color: 'border-black',
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
