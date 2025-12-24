import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Button } from '@/components';
import { ROUTES } from '@/constants';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="text-center py-16">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
        Welcome to <span className="text-primary-600">eodask</span>
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
        Focus on what matters most. A productivity app with role-based access
        control, dark mode, and modern React architecture.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {isAuthenticated ? (
          <Link to={ROUTES.DASHBOARD}>
            <Button size="lg">Go to Dashboard</Button>
          </Link>
        ) : (
          <>
            <Link to={ROUTES.REGISTER}>
              <Button size="lg">Get Started</Button>
            </Link>
            <Link to={ROUTES.LOGIN}>
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </>
        )}
      </div>

      {/* Features */}
      <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="text-3xl mb-4">🔐</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Role-Based Access
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Fine-grained permissions with Super Admin, Admin, Manager, User, and
            Guest roles.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="text-3xl mb-4">🌙</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Dark Mode
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Beautiful light and dark themes with system preference detection.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="text-3xl mb-4">⚡</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Modern Stack
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Built with React 19, Redux Toolkit, Redux Saga, and Tailwind CSS.
          </p>
        </div>
      </div>

      {/* Demo credentials */}
      <div className="mt-16 p-6 bg-gray-100 dark:bg-gray-800 rounded-xl max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Demo Credentials
        </h3>
        <div className="text-left text-sm space-y-2">
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Admin:</strong> admin@example.com / admin123
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Manager:</strong> manager@example.com / manager123
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            <strong>User:</strong> user@example.com / user123
          </p>
        </div>
      </div>
    </div>
  );
};
