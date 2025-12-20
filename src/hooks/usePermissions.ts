import { useMemo } from 'react';
import { useAppSelector } from '@/hooks';
import type { Permission, UserRole } from '@/types';
import { ROLE_PERMISSIONS, hasHigherOrEqualRole } from '@/constants';

export const usePermissions = () => {
  const { user } = useAppSelector((state) => state.auth);

  const permissions = useMemo(() => {
    if (!user) return [];
    return user.permissions || ROLE_PERMISSIONS[user.role] || [];
  }, [user]);

  const hasPermission = useMemo(() => {
    return (permission: Permission): boolean => {
      return permissions.includes(permission);
    };
  }, [permissions]);

  const hasAnyPermission = useMemo(() => {
    return (requiredPermissions: Permission[]): boolean => {
      return requiredPermissions.some((p) => permissions.includes(p));
    };
  }, [permissions]);

  const hasAllPermissions = useMemo(() => {
    return (requiredPermissions: Permission[]): boolean => {
      return requiredPermissions.every((p) => permissions.includes(p));
    };
  }, [permissions]);

  const hasRole = useMemo(() => {
    return (role: UserRole): boolean => {
      return user?.role === role;
    };
  }, [user]);

  const hasAnyRole = useMemo(() => {
    return (roles: UserRole[]): boolean => {
      return user ? roles.includes(user.role) : false;
    };
  }, [user]);

  const hasMinimumRole = useMemo(() => {
    return (minimumRole: UserRole): boolean => {
      return user ? hasHigherOrEqualRole(user.role, minimumRole) : false;
    };
  }, [user]);

  const can = useMemo(() => {
    return (
      options:
        | Permission
        | Permission[]
        | { permissions?: Permission[]; roles?: UserRole[] }
    ): boolean => {
      if (!user) return false;

      // Single permission
      if (typeof options === 'string') {
        return hasPermission(options);
      }

      // Array of permissions (any)
      if (Array.isArray(options)) {
        return hasAnyPermission(options);
      }

      // Object with permissions and/or roles
      const { permissions: reqPermissions, roles } = options;
      const hasRequiredPermissions = reqPermissions
        ? hasAnyPermission(reqPermissions)
        : true;
      const hasRequiredRoles = roles ? hasAnyRole(roles) : true;

      return hasRequiredPermissions && hasRequiredRoles;
    };
  }, [user, hasPermission, hasAnyPermission, hasAnyRole]);

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    hasMinimumRole,
    can,
    role: user?.role,
  };
};
