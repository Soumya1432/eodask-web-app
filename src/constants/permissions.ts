import { Permission, UserRole, type RolePermissions } from '@/types';

// Role-based permissions mapping
export const ROLE_PERMISSIONS: RolePermissions = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),

  [UserRole.ADMIN]: [
    Permission.CREATE_USER,
    Permission.READ_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.CREATE_TASK,
    Permission.READ_TASK,
    Permission.UPDATE_TASK,
    Permission.DELETE_TASK,
    Permission.ASSIGN_TASK,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.MANAGE_SETTINGS,
    Permission.VIEW_SETTINGS,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ADMIN_DASHBOARD,
  ],

  [UserRole.MANAGER]: [
    Permission.READ_USER,
    Permission.CREATE_TASK,
    Permission.READ_TASK,
    Permission.UPDATE_TASK,
    Permission.DELETE_TASK,
    Permission.ASSIGN_TASK,
    Permission.VIEW_REPORTS,
    Permission.VIEW_SETTINGS,
    Permission.VIEW_DASHBOARD,
  ],

  [UserRole.USER]: [
    Permission.READ_TASK,
    Permission.UPDATE_TASK,
    Permission.VIEW_DASHBOARD,
  ],

  [UserRole.GUEST]: [Permission.VIEW_DASHBOARD],
};

// Role hierarchy (higher index = higher privilege)
export const ROLE_HIERARCHY: UserRole[] = [
  UserRole.GUEST,
  UserRole.USER,
  UserRole.MANAGER,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
];

// Get role level
export const getRoleLevel = (role: UserRole): number => {
  return ROLE_HIERARCHY.indexOf(role);
};

// Check if role has higher or equal privilege
export const hasHigherOrEqualRole = (
  userRole: UserRole,
  requiredRole: UserRole
): boolean => {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
};
