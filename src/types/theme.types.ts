// Theme mode
export type ThemeMode = 'light' | 'dark' | 'system';

// Theme state interface
export interface IThemeState {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
}
