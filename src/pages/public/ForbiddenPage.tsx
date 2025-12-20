import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components';
import { ROUTES } from '@/constants';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">
          403
        </h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-4">
          Access Forbidden
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">
          You don't have permission to access this page.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Link to={ROUTES.HOME}>
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
