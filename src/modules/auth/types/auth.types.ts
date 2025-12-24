// User roles as const object
export const UserRole = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  GUEST: 'guest',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// Permissions as const object
export const Permission = {
  // User management
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',

  // Task management
  CREATE_TASK: 'create_task',
  READ_TASK: 'read_task',
  UPDATE_TASK: 'update_task',
  DELETE_TASK: 'delete_task',
  ASSIGN_TASK: 'assign_task',

  // Reports
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',

  // Settings
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_SETTINGS: 'view_settings',

  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ADMIN_DASHBOARD: 'view_admin_dashboard',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

// User interface
export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth state interface
export interface IAuthState {
  user: IUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Used for invitation-based registration
  acceptedOrganization: { id: string; name: string; slug: string } | null;
}

// Login credentials
export interface ILoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Register credentials
export interface IRegisterCredentials {
  email: string;
  password: string;
  name: string;
  invitationToken?: string;
}

// Auth response
export interface IAuthResponse {
  user: IUser;
  token: string;
  refreshToken: string;
}

// Role permissions mapping type
export type RolePermissions = Record<UserRole, Permission[]>;
