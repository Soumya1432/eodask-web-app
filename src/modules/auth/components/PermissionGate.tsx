import type { ReactNode } from 'react';
import { usePermissions } from '../hooks';
import type { Permission } from '../types';

interface PermissionGateProps {
  children: ReactNode;
  permissions: Permission | Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permissions,
  requireAll = false,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissions();

  const permissionArray = Array.isArray(permissions)
    ? permissions
    : [permissions];

  const hasAccess =
    permissionArray.length === 1
      ? hasPermission(permissionArray[0])
      : requireAll
        ? hasAllPermissions(permissionArray)
        : hasAnyPermission(permissionArray);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
