import { apiClient, type ApiResponse } from './client';
import type { IAuthResponse, ILoginCredentials, IRegisterCredentials, IUser } from '@/types';

// Helper to split name into firstName and lastName
const splitName = (name: string): { firstName: string; lastName: string } => {
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
};

export const authApi = {
  login: async (credentials: ILoginCredentials): Promise<ApiResponse<IAuthResponse>> => {
    const response = await apiClient.post<ApiResponse<IAuthResponse>>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });
    return response.data;
  },

  register: async (credentials: IRegisterCredentials & { invitationToken?: string }): Promise<ApiResponse<IAuthResponse & { organization?: { id: string; name: string; slug: string }; invitationAccepted?: boolean }>> => {
    const { firstName, lastName } = splitName(credentials.name);
    const response = await apiClient.post<ApiResponse<IAuthResponse & { organization?: { id: string; name: string; slug: string }; invitationAccepted?: boolean }>>('/auth/register', {
      email: credentials.email,
      password: credentials.password,
      firstName,
      lastName,
      invitationToken: credentials.invitationToken,
    });
    return response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  logoutAll: async (): Promise<void> => {
    await apiClient.post('/auth/logout-all');
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh-token',
      { refreshToken }
    );
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<IUser>> => {
    const response = await apiClient.get<ApiResponse<IUser>>('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: { name?: string; avatar?: string }): Promise<ApiResponse<IUser>> => {
    const response = await apiClient.patch<ApiResponse<IUser>>('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await apiClient.post('/auth/change-password', data);
  },
};
