import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ThemeToggle, LoadingSpinner } from '@/components';
import { ROUTES, getOrgRoute } from '@/constants';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Check if user just registered with an invitation - they should go to the org dashboard
  const acceptedOrganization = useAppSelector((state) => state.auth.acceptedOrganization);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    // If we have an accepted organization from invitation registration,
    // redirect directly to that organization's dashboard
    if (acceptedOrganization?.slug) {
      return <Navigate to={getOrgRoute(ROUTES.ORG_DASHBOARD, acceptedOrganization.slug)} replace />;
    }
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              eodask
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Focus on what matters most
            </p>
          </div>

          {/* Auth form container */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} eodask
        </p>
      </footer>
    </div>
  );
};
