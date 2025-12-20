import type { ReactNode } from 'react';
import { usePermissions } from '@/hooks';
import type { UserRole } from '@/types';

interface RoleGateProps {
  children: ReactNode;
  roles: UserRole | UserRole[];
  minimumRole?: UserRole;
  fallback?: ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({
  children,
  roles,
  minimumRole,
  fallback = null,
}) => {
  const { hasRole, hasAnyRole, hasMinimumRole } = usePermissions();

  let hasAccess = false;

  if (minimumRole) {
    hasAccess = hasMinimumRole(minimumRole);
  } else {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    hasAccess =
      roleArray.length === 1 ? hasRole(roleArray[0]) : hasAnyRole(roleArray);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
