import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/hooks/useAppSelector';
import type { IOrganizationDetails, OrganizationRole } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface OrganizationContextValue {
  organization: IOrganizationDetails | null;
  userRole: OrganizationRole | null;
  isLoading: boolean;
  error: string | null;
  hasMinRole: (minRole: OrganizationRole) => boolean;
  switchOrganization: (slug: string) => void;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

interface OrganizationProviderProps {
  children: React.ReactNode;
}

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Get acceptedOrganization from auth state - this is set when user registers with invitation
  const acceptedOrganization = useAppSelector((state) => state.auth.acceptedOrganization);

  const {
    currentOrganization,
    isLoading,
    error,
    needsOrganization,
    fetchOrganizationBySlug,
    fetchOrganizations,
    checkNeedsOrganization,
    hasMinRole,
  } = useOrganizations();

  // Track if initial fetch has been done to prevent infinite loops
  const hasFetchedRef = useRef(false);
  const fetchedSlugRef = useRef<string | null>(null);

  // Check if user needs to create an organization on mount
  // Skip if we have an acceptedOrganization from invitation registration
  useEffect(() => {
    if (isAuthenticated && !hasFetchedRef.current && !acceptedOrganization) {
      hasFetchedRef.current = true;
      checkNeedsOrganization();
      fetchOrganizations();
    }
  }, [isAuthenticated, checkNeedsOrganization, fetchOrganizations, acceptedOrganization]);

  // Redirect to onboarding if user needs organization
  // But don't redirect if:
  // - User is already on an org route (they might have just joined via invitation)
  // - User has acceptedOrganization from invitation registration (RegisterPage will handle redirect)
  // - User is on auth routes like /register or /login
  useEffect(() => {
    if (
      isAuthenticated &&
      needsOrganization &&
      !isLoading &&
      !acceptedOrganization &&
      !location.pathname.startsWith('/onboarding') &&
      !location.pathname.startsWith('/invite') &&
      !location.pathname.startsWith('/org/') &&
      !location.pathname.startsWith('/register') &&
      !location.pathname.startsWith('/login')
    ) {
      navigate('/onboarding/create-organization', { replace: true });
    }
  }, [isAuthenticated, needsOrganization, isLoading, navigate, location.pathname, acceptedOrganization]);

  // Fetch organization when slug changes
  useEffect(() => {
    if (slug && isAuthenticated && !isLoading) {
      // Only fetch if we haven't fetched this slug yet
      if (fetchedSlugRef.current !== slug) {
        fetchedSlugRef.current = slug;
        fetchOrganizationBySlug(slug);
      }
    }
  }, [slug, isAuthenticated, isLoading, fetchOrganizationBySlug]);

  // Handle switch organization
  const switchOrganization = (newSlug: string) => {
    if (newSlug !== slug) {
      // Navigate to the new organization's dashboard
      navigate(`/org/${newSlug}/dashboard`);
    }
  };

  const value = useMemo(
    () => ({
      organization: currentOrganization,
      userRole: currentOrganization?.userRole || null,
      isLoading,
      error,
      hasMinRole,
      switchOrganization,
    }),
    [currentOrganization, isLoading, error, hasMinRole]
  );

  // Show loading while checking organization status
  if (isAuthenticated && isLoading && !currentOrganization && slug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganizationContext = (): OrganizationContextValue => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider');
  }
  return context;
};

// HOC to require organization context
export const withOrganization = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
  return function WithOrganizationComponent(props: P) {
    const { organization, isLoading } = useOrganizationContext();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (!organization) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Organization not found
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              The organization you're looking for doesn't exist or you don't have access.
            </p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

// Gate component for organization role checking
interface OrgRoleGateProps {
  children: React.ReactNode;
  roles?: OrganizationRole[];
  minRole?: OrganizationRole;
  fallback?: React.ReactNode;
}

export const OrgRoleGate: React.FC<OrgRoleGateProps> = ({
  children,
  roles,
  minRole,
  fallback = null,
}) => {
  const { userRole, hasMinRole } = useOrganizationContext();

  if (!userRole) {
    return <>{fallback}</>;
  }

  // Check specific roles
  if (roles && !roles.includes(userRole)) {
    return <>{fallback}</>;
  }

  // Check minimum role
  if (minRole && !hasMinRole(minRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
