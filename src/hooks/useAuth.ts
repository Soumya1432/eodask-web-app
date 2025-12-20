import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  clearError,
} from '@/store';
import type { ILoginCredentials, IRegisterCredentials } from '@/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  const login = useCallback(
    (credentials: ILoginCredentials) => {
      dispatch(loginRequest(credentials));
    },
    [dispatch]
  );

  const register = useCallback(
    (credentials: IRegisterCredentials) => {
      dispatch(registerRequest(credentials));
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(logoutRequest());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearAuthError,
  };
};
