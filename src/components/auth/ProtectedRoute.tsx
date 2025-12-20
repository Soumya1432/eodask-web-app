import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, usePermissions } from '@/hooks';
import type { Permission, UserRole } from '@/types';
import { ROUTES } from '@/constants';
import { LoadingSpinner } from '@/components';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permissions?: Permission[];
  roles?: UserRole[];
  requireAll?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permissions,
  roles,
  requireAll = false,
  redirectTo = ROUTES.LOGIN,
  fallback,
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { hasAnyPermission, hasAllPermissions, hasAnyRole } = usePermissions();

  // Show loading state
  if (isLoading) {
    return fallback ?? <LoadingSpinner fullScreen />;
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check permissions
  if (permissions && permissions.length > 0) {
    const hasPermissions = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasPermissions) {
      return <Navigate to={ROUTES.FORBIDDEN} replace />;
    }
  }

  // Check roles
  if (roles && roles.length > 0) {
    if (!hasAnyRole(roles)) {
      return <Navigate to={ROUTES.FORBIDDEN} replace />;
    }
  }

  return <>{children}</>;
};
