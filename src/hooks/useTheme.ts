import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setThemeMode, toggleTheme, syncWithSystem } from '@/store';
import type { ThemeMode } from '@/types';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const { mode, resolvedMode } = useAppSelector((state) => state.theme);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      dispatch(syncWithSystem());
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [dispatch]);

  const setMode = useCallback(
    (newMode: ThemeMode) => {
      dispatch(setThemeMode(newMode));
    },
    [dispatch]
  );

  const toggle = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  return {
    mode,
    resolvedMode,
    isDark: resolvedMode === 'dark',
    isLight: resolvedMode === 'light',
    setMode,
    toggle,
  };
};
