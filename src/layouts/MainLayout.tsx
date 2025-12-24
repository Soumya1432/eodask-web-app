import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth, usePermissions } from '@/hooks';
import { ThemeToggle, PermissionGate, RoleGate } from '@/components';
import { ROUTES } from '@/constants';
import { Permission, UserRole } from '@/types';

export const MainLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { role } = usePermissions();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}

            <div className='flex justify-center-safe items-center gap-2'>
              <img src='./eodask.png' alt='logo' width={30} height={30} />

              <Link
                to={ROUTES.HOME}
                className="text-xl font-bold text-primary-600 dark:text-primary-400"
              >

                eodask
              </Link>

            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to={ROUTES.HOME}
                className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Home
              </Link>
              {/* <Link 
              to={ROUTES.} */}

              {isAuthenticated && (
                <>
                  <PermissionGate permissions={Permission.VIEW_DASHBOARD}>
                    <Link
                      to={ROUTES.DASHBOARD}
                      className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      Dashboard
                    </Link>
                  </PermissionGate>

                  <PermissionGate permissions={Permission.READ_TASK}>
                    <Link
                      to={ROUTES.TASKS}
                      className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      Tasks
                    </Link>
                  </PermissionGate>

                  <RoleGate roles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
                    <Link
                      to={ROUTES.ADMIN}
                      className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      Admin
                    </Link>
                  </RoleGate>
                </>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <ThemeToggle />

              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-sm">
                    <p className="text-gray-900 dark:text-gray-100 font-medium">
                      {user?.name}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs capitalize">
                      {role}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to={ROUTES.LOGIN}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    Login
                  </Link>
                  <Link
                    to={ROUTES.REGISTER}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} onething. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
