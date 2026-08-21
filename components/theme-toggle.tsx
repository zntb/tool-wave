'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`
        relative flex items-center w-14 h-7 rounded-full
        bg-slate-200 dark:bg-slate-700
        border border-slate-300 dark:border-slate-600
        transition-colors duration-300 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2
        hover:bg-slate-300 dark:hover:bg-slate-600
        cursor-pointer
      `}
    >
      {/* Sliding indicator */}
      <span
        className={`
          absolute top-0.5 left-0.5 w-6 h-6 rounded-full
          bg-white dark:bg-slate-900
          shadow-md
          transition-transform duration-300 ease-in-out
          ${isDark ? 'translate-x-7' : 'translate-x-0'}
        `}
      />

      {/* Sun icon */}
      <Sun
        className={`
          absolute left-1.5 w-3.5 h-3.5
          transition-all duration-300 ease-in-out
          ${isDark ? 'text-slate-400 scale-75 opacity-50' : 'text-amber-500 scale-100 opacity-100'}
        `}
      />

      {/* Moon icon */}
      <Moon
        className={`
          absolute right-1.5 w-3.5 h-3.5
          transition-all duration-300 ease-in-out
          ${isDark ? 'text-indigo-300 scale-100 opacity-100' : 'text-slate-400 scale-75 opacity-50'}
        `}
      />
    </button>
  );
}
