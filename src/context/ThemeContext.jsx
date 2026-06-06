import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'wit-active-theme';

export const PLATFORM_THEMES = {
  default: {
    id: 'default',
    label: 'Default Retro',
    description: 'Playful neubrutalism — bold, bright, and fun!',
    wrapper: 'theme-default',
  },
  cosmic: {
    id: 'cosmic',
    label: 'Cosmic Lab',
    description: 'Deep space vibes with drifting star particles.',
    wrapper: 'theme-cosmic',
  },
  sky: {
    id: 'sky',
    label: 'Sky Kingdom',
    description: 'Soft pastels and floating cartoon clouds.',
    wrapper: 'theme-sky',
  },
};

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
