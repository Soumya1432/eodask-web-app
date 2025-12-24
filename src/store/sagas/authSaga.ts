import { call, put, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
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
} from '../slices/authSlice';
import type {
  ILoginCredentials,
  IRegisterCredentials,
  IAuthResponse,
} from '@/types';
import { authService } from '@/services/authService';

// Login saga
function* handleLogin(action: PayloadAction<ILoginCredentials>) {
  try {
    const response: IAuthResponse = yield call(
      authService.login,
      action.payload
    );
    yield put(loginSuccess(response));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Login failed. Please try again.';
    yield put(loginFailure(message));
  }
}

// Register saga
function* handleRegister(action: PayloadAction<IRegisterCredentials>) {
  try {
    const response: IAuthResponse & {
      organization?: { id: string; name: string; slug: string };
      invitationAccepted?: boolean;
    } = yield call(
      authService.register,
      action.payload
    );
    yield put(registerSuccess(response));
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Registration failed. Please try again.';
    yield put(registerFailure(message));
  }
}

// Logout saga
function* handleLogout() {
  try {
    yield call(authService.logout);
  } catch {
    // Ignore logout errors, we still want to clear local state
  } finally {
    yield put(logoutSuccess());
  }
}

// Token refresh saga
function* handleRefreshToken() {
  try {
    const response: { token: string; refreshToken: string } = yield call(
      authService.refreshToken
    );
    yield put(refreshTokenSuccess(response));
  } catch {
    yield put(refreshTokenFailure());
  }
}

// Root auth saga
export function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(registerRequest.type, handleRegister);
  yield takeLatest(logoutRequest.type, handleLogout);
  yield takeLatest(refreshTokenRequest.type, handleRefreshToken);
}
