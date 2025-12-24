import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  IAuthState,
  IUser,
  ILoginCredentials,
  IRegisterCredentials,
  IAuthResponse,
} from '../types';
import { STORAGE_KEYS } from '@/shared/constants';

// Helper to get initial state from storage
const getInitialState = (): IAuthState => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    const user = userStr ? JSON.parse(userStr) : null;

    return {
      user,
      token,
      refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      isAuthenticated: !!token && !!user,
      isLoading: false,
      error: null,
      acceptedOrganization: null,
    };
  } catch {
    return {
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      acceptedOrganization: null,
    };
  }
};

const initialState: IAuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login actions
    loginRequest: (state, _action: PayloadAction<ILoginCredentials>) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<IAuthResponse>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.error = null;

      localStorage.setItem(STORAGE_KEYS.TOKEN, action.payload.token);
      localStorage.setItem(
        STORAGE_KEYS.REFRESH_TOKEN,
        action.payload.refreshToken
      );
      localStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(action.payload.user)
      );
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Register actions
    registerRequest: (state, _action: PayloadAction<IRegisterCredentials>) => {
      state.isLoading = true;
      state.error = null;
      state.acceptedOrganization = null;
    },
    registerSuccess: (state, action: PayloadAction<IAuthResponse & { organization?: { id: string; name: string; slug: string }; invitationAccepted?: boolean }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.error = null;
      state.acceptedOrganization = action.payload.organization || null;

      localStorage.setItem(STORAGE_KEYS.TOKEN, action.payload.token);
      localStorage.setItem(
        STORAGE_KEYS.REFRESH_TOKEN,
        action.payload.refreshToken
      );
      localStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(action.payload.user)
      );
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Logout
    logoutRequest: (state) => {
      state.isLoading = true;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    },

    // Token refresh
    refreshTokenRequest: (state) => {
      state.isLoading = true;
    },
    refreshTokenSuccess: (
      state,
      action: PayloadAction<{ token: string; refreshToken: string }>
    ) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;

      localStorage.setItem(STORAGE_KEYS.TOKEN, action.payload.token);
      localStorage.setItem(
        STORAGE_KEYS.REFRESH_TOKEN,
        action.payload.refreshToken
      );
    },
    refreshTokenFailure: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    },

    // Update user
    updateUser: (state, action: PayloadAction<Partial<IUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  logoutRequest,
  logoutSuccess,
  refreshTokenRequest,
  refreshTokenSuccess,
  refreshTokenFailure,
  updateUser,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
