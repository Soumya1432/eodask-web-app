import { Permission, UserRole } from '@/modules/auth/types';

// Route paths
export const ROUTES = {
  // Public routes
  HOME: '/',
  ABOUT_US: '/about-us',
  FEATURES: '/features',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Onboarding routes
  ONBOARDING_CREATE_ORG: '/onboarding/create-organization',

  // Organization switcher
  ORGANIZATIONS: '/organizations',

  // Organization-scoped routes (use :slug parameter)
  ORG_DASHBOARD: '/org/:slug/dashboard',
  ORG_PROJECTS: '/org/:slug/projects',
  ORG_PROJECT_DETAIL: '/org/:slug/projects/:projectId',
  ORG_PROJECT_BOARD: '/org/:slug/projects/:projectId/board',
  ORG_TASKS: '/org/:slug/tasks',
  ORG_MEMBERS: '/org/:slug/members',
  ORG_SETTINGS: '/org/:slug/settings',
  ORG_INVITATIONS: '/org/:slug/invitations',
  ORG_CHAT: '/org/:slug/chat',
  ORG_REPORTS: '/org/:slug/reports',

  // Invitation acceptance route
  INVITE_ACCEPT: '/invite/:token',

  // Legacy routes (kept for backwards compatibility during migration)
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  TASKS: '/tasks',
  TASK_DETAIL: '/tasks/:id',
  TASK_CREATE: '/tasks/create',

  // Admin routes (system-wide admin, not org admin)
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_REPORTS: '/admin/reports',

  // Error routes
  NOT_FOUND: '/404',
  FORBIDDEN: '/403',
  SERVER_ERROR: '/500',
} as const;

// Helper to generate org-scoped route paths
export const getOrgRoute = (route: string, slug: string): string => {
  return route.replace(':slug', slug);
};

// Helper to generate project route paths
export const getProjectRoute = (route: string, slug: string, projectId: string): string => {
  return route.replace(':slug', slug).replace(':projectId', projectId);
};

// Route access configuration
export interface IRouteAccess {
  path: string;
  roles?: UserRole[];
  permissions?: Permission[];
  isPublic?: boolean;
}

export const ROUTE_ACCESS: IRouteAccess[] = [
  // Public routes
  { path: ROUTES.HOME, isPublic: true },
  { path: ROUTES.LOGIN, isPublic: true },
  { path: ROUTES.REGISTER, isPublic: true },
  { path: ROUTES.FORGOT_PASSWORD, isPublic: true },
  { path: ROUTES.RESET_PASSWORD, isPublic: true },

  // Protected routes - any authenticated user
  { path: ROUTES.DASHBOARD, permissions: [Permission.VIEW_DASHBOARD] },
  { path: ROUTES.PROFILE },

  // Task routes
  { path: ROUTES.TASKS, permissions: [Permission.READ_TASK] },
  { path: ROUTES.TASK_DETAIL, permissions: [Permission.READ_TASK] },
  { path: ROUTES.TASK_CREATE, permissions: [Permission.CREATE_TASK] },

  // Admin routes
  {
    path: ROUTES.ADMIN,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    permissions: [Permission.VIEW_ADMIN_DASHBOARD],
  },
  {
    path: ROUTES.ADMIN_USERS,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    permissions: [Permission.READ_USER],
  },
  {
    path: ROUTES.ADMIN_SETTINGS,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    permissions: [Permission.MANAGE_SETTINGS],
  },
  {
    path: ROUTES.ADMIN_REPORTS,
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER],
    permissions: [Permission.VIEW_REPORTS],
  },
];
