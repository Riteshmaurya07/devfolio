import { create } from 'zustand';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark', // default theme
  initTheme: () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('devfolio-theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') {
      get().setTheme(saved);
      return;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    get().setTheme(prefersDark ? 'dark' : 'light');
  },
  setTheme: (theme: Theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('devfolio-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
    set({ theme });
  },
  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));
