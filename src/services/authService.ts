import type {
  ILoginCredentials,
  IRegisterCredentials,
  IAuthResponse,
  IUser,
  Permission,
  UserRole,
} from '@/types';
import { ROLE_PERMISSIONS, STORAGE_KEYS } from '@/constants';
import { authApi } from '@/lib/api';
import type { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return axiosError.response?.data?.message ||
           axiosError.response?.data?.error ||
           axiosError.message ||
           'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An error occurred';
};

// Helper to map API user (firstName/lastName) to frontend user (name)
interface ApiUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  avatar?: string;
  isActive?: boolean;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

const mapApiUserToUser = (apiUser: ApiUser): IUser => {
  const name = apiUser.name || `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim();
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: name || apiUser.email.split('@')[0], // Fallback to email prefix
    role: (apiUser.role as UserRole) || 'user',
    permissions: [],
    avatar: apiUser.avatar,
    isActive: apiUser.isActive ?? true,
    createdAt: apiUser.createdAt || new Date().toISOString(),
    updatedAt: apiUser.updatedAt || new Date().toISOString(),
  };
};

export const authService = {
  async login(credentials: ILoginCredentials): Promise<IAuthResponse> {
    try {
      const response = await authApi.login(credentials);
      const { user: apiUser, accessToken, refreshToken } = response.data as unknown as {
        user: ApiUser;
        accessToken: string;
        refreshToken: string;
      };

      // Map API user to frontend user format
      const user = mapApiUserToUser(apiUser);

      // Attach permissions based on role
      const userWithPermissions: IUser = {
        ...user,
        permissions: ROLE_PERMISSIONS[user.role as UserRole] || [],
      };

      // Store tokens
      localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithPermissions));

      return {
        user: userWithPermissions,
        token: accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async register(credentials: IRegisterCredentials): Promise<IAuthResponse & { organization?: { id: string; name: string; slug: string }; invitationAccepted?: boolean }> {
    try {
      console.log('=== WEB AUTH SERVICE REGISTER ===');
      console.log('Credentials:', JSON.stringify(credentials, null, 2));
      console.log('invitationToken being sent:', credentials.invitationToken);

      const response = await authApi.register(credentials);

      console.log('=== WEB AUTH SERVICE RESPONSE ===');
      console.log('Full response.data:', JSON.stringify(response.data, null, 2));

      const { user: apiUser, accessToken, refreshToken, organization, invitationAccepted } = response.data as unknown as {
        user: ApiUser;
        accessToken: string;
        refreshToken: string;
        organization?: { id: string; name: string; slug: string };
        invitationAccepted?: boolean;
      };

      console.log('Parsed organization:', organization);
      console.log('Parsed invitationAccepted:', invitationAccepted);

      // Map API user to frontend user format
      const user = mapApiUserToUser(apiUser);

      // Attach permissions based on role
      const userWithPermissions: IUser = {
        ...user,
        permissions: ROLE_PERMISSIONS[user.role as UserRole] || [],
      };

      // Store tokens
      localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithPermissions));

      return {
        user: userWithPermissions,
        token: accessToken,
        refreshToken,
        organization,
        invitationAccepted,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } finally {
      // Always clear local storage
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  async refreshToken(): Promise<{ token: string; refreshToken: string }> {
    const currentRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!currentRefreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authApi.refreshToken(currentRefreshToken);
      const { accessToken, refreshToken } = response.data;

      // Update stored tokens
      localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

      return {
        token: accessToken,
        refreshToken,
      };
    } catch (error) {
      // Clear tokens on refresh failure
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      throw new Error(getErrorMessage(error));
    }
  },

  async getProfile(): Promise<IUser> {
    try {
      const response = await authApi.getProfile();
      const apiUser = response.data as unknown as ApiUser;

      // Map API user to frontend user format
      const user = mapApiUserToUser(apiUser);

      // Attach permissions based on role
      const userWithPermissions: IUser = {
        ...user,
        permissions: ROLE_PERMISSIONS[user.role as UserRole] || [],
      };

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithPermissions));
      return userWithPermissions;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateProfile(data: { name?: string; avatar?: string }): Promise<IUser> {
    try {
      const response = await authApi.updateProfile(data);
      const apiUser = response.data as unknown as ApiUser;

      // Map API user to frontend user format
      const user = mapApiUserToUser(apiUser);

      // Attach permissions based on role
      const userWithPermissions: IUser = {
        ...user,
        permissions: ROLE_PERMISSIONS[user.role as UserRole] || [],
      };

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithPermissions));
      return userWithPermissions;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await authApi.changePassword({ currentPassword, newPassword });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getCurrentUser(): IUser | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // Permission checking utilities
  hasPermission(user: IUser | null, permission: Permission): boolean {
    if (!user) return false;
    return user.permissions.includes(permission);
  },

  hasAnyPermission(user: IUser | null, permissions: Permission[]): boolean {
    if (!user) return false;
    return permissions.some((p) => user.permissions.includes(p));
  },

  hasAllPermissions(user: IUser | null, permissions: Permission[]): boolean {
    if (!user) return false;
    return permissions.every((p) => user.permissions.includes(p));
  },

  hasRole(user: IUser | null, role: UserRole): boolean {
    if (!user) return false;
    return user.role === role;
  },

  hasAnyRole(user: IUser | null, roles: UserRole[]): boolean {
    if (!user) return false;
    return roles.includes(user.role);
  },
};
