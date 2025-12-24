// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  THEME: 'theme_mode',
  REMEMBER_ME: 'remember_me',
} as const;

// Session storage keys
export const SESSION_KEYS = {
  REDIRECT_URL: 'redirect_url',
} as const;
