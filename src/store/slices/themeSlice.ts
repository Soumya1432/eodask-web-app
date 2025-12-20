import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IThemeState, ThemeMode } from '@/types';
import { STORAGE_KEYS } from '@/constants';

// Get system preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return 'light';
};

// Get initial theme from storage or system
const getInitialTheme = (): IThemeState => {
  try {
    const storedMode = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
    const mode: ThemeMode = storedMode || 'system';
    const resolvedMode = mode === 'system' ? getSystemTheme() : mode;

    return { mode, resolvedMode };
  } catch {
    return { mode: 'system', resolvedMode: getSystemTheme() };
  }
};

const initialState: IThemeState = getInitialTheme();

// Apply theme to document
const applyTheme = (resolvedMode: 'light' | 'dark') => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (resolvedMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
};

// Apply initial theme
applyTheme(initialState.resolvedMode);

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      state.resolvedMode =
        action.payload === 'system' ? getSystemTheme() : action.payload;

      localStorage.setItem(STORAGE_KEYS.THEME, action.payload);
      applyTheme(state.resolvedMode);
    },

    toggleTheme: (state) => {
      const newMode: ThemeMode =
        state.resolvedMode === 'light' ? 'dark' : 'light';
      state.mode = newMode;
      state.resolvedMode = newMode;

      localStorage.setItem(STORAGE_KEYS.THEME, newMode);
      applyTheme(newMode);
    },

    syncWithSystem: (state) => {
      if (state.mode === 'system') {
        state.resolvedMode = getSystemTheme();
        applyTheme(state.resolvedMode);
      }
    },
  },
});

export const { setThemeMode, toggleTheme, syncWithSystem } = themeSlice.actions;

export default themeSlice.reducer;
