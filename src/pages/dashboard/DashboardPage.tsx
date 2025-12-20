import { useAuth, usePermissions } from '@/hooks';
import { PermissionGate, RoleGate } from '@/components';
import { Permission, UserRole } from '@/types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { role, permissions } = usePermissions();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard
      </h1>

      {/* Welcome card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          You are logged in as{' '}
          <span className="font-medium capitalize">{role}</span>
        </p>
      </div>

      {/* Stats grid - different stats shown based on role */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <PermissionGate permissions={Permission.READ_TASK}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              My Tasks
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              12
            </p>
          </div>
        </PermissionGate>

        <PermissionGate permissions={Permission.VIEW_REPORTS}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Team Tasks
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              47
            </p>
          </div>
        </PermissionGate>

        <RoleGate roles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Users
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              156
            </p>
          </div>
        </RoleGate>

        <RoleGate roles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Active Projects
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              8
            </p>
          </div>
        </RoleGate>
      </div>

      {/* Permissions info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Your Permissions
        </h3>
        <div className="flex flex-wrap gap-2">
          {permissions.map((permission) => (
            <span
              key={permission}
              className="px-3 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full"
            >
              {permission.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
