'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

export interface ThemeToggleProps {
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({ showLabel = false, className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] ${className}`} />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light Mode (Cream)' : 'Switch to Dark Mode (Black)'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`inline-flex items-center justify-center gap-2 p-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-150 cursor-pointer active:scale-95 ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#d9541e] transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-[#111111] transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
      {showLabel && (
        <span className="text-xs font-medium">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
