import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOrganizations } from '@/hooks/useOrganizations';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { getOrgInitials } from '@/types';
import { ROUTES, getOrgRoute } from '@/constants';

export const OrganizationSwitcherPage: React.FC = () => {
  const navigate = useNavigate();
  const { organizations, isLoading, error, fetchOrganizations, needsOrganization } = useOrganizations();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const fetchAttempted = useRef(false);

  // Fetch organizations on mount (only once)
  useEffect(() => {
    if (!fetchAttempted.current) {
      fetchAttempted.current = true;
      setStatus('loading');
      fetchOrganizations();
    }
  }, [fetchOrganizations]);

  // Update status based on isLoading and error
  useEffect(() => {
    if (status === 'loading' && !isLoading) {
      if (error) {
        setStatus('error');
      } else {
        setStatus('success');
      }
    }
  }, [isLoading, error, status]);

  // Show loading while fetching
  if (status === 'idle' || status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If there's an error but no organizations, show error with retry option
  if ((status === 'error' || error) && organizations.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Organizations
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'An error occurred'}</p>
          <div className="space-y-3">
            <Button
              onClick={() => {
                setStatus('loading');
                fetchOrganizations();
              }}
              className="w-full"
            >
              Try Again
            </Button>
            <Link to={ROUTES.ONBOARDING_CREATE_ORG}>
              <Button variant="secondary" className="w-full">
                Create New Organization
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If no organizations after loading completed, redirect to create one
  if (organizations.length === 0 || needsOrganization) {
    navigate(ROUTES.ONBOARDING_CREATE_ORG, { replace: true });
    return null;
  }

  const handleSelectOrg = (slug: string) => {
    navigate(getOrgRoute(ROUTES.ORG_DASHBOARD, slug));
  };

  const canCreateMore = organizations.length < 3;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Select Organization
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Choose an organization to continue
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid gap-4">
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => handleSelectOrg(org.slug)}
              className="w-full p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center space-x-4">
                {org.logo ? (
                  <img
                    src={org.logo}
                    alt={org.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                    {getOrgInitials(org.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                    {org.name}
                  </h3>
                  {org.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {org.description}
                    </p>
                  )}
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {org.userRole}
                    </span>
                    <span>{org._count?.projects || 0} projects</span>
                    <span>{org._count?.members || 0} members</span>
                  </div>
                </div>
                <div className="text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {canCreateMore && (
          <div className="mt-8 text-center">
            <Link to={ROUTES.ONBOARDING_CREATE_ORG}>
              <Button variant="secondary">
                <span className="mr-2">+</span>
                Create New Organization
              </Button>
            </Link>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              You can create up to 3 organizations ({3 - organizations.length} remaining)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationSwitcherPage;
