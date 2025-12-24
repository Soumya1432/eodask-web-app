import { useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks';
import { Button } from '@/shared/components/ui';
import { FormInput } from '@/shared/components/form';
import { ROUTES, getOrgRoute } from '@/shared/constants';
import { registerSchema, type RegisterFormData } from '../validations';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { register: authRegister, isLoading, error, isAuthenticated, acceptedOrganization, clearAuthError } = useAuth();

  // Get invitation token and email from URL params
  const invitationToken = searchParams.get('invitationToken');
  const invitedEmail = searchParams.get('email');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: invitedEmail || '',
      password: '',
      confirmPassword: '',
    },
  });

  const redirectTo = useMemo(() => {
    // If we have an accepted org from invitation, go to that org's dashboard
    if (acceptedOrganization?.slug) {
      return getOrgRoute(ROUTES.ORG_DASHBOARD, acceptedOrganization.slug);
    }
    const returnTo = searchParams.get('returnTo');
    if (returnTo) return returnTo;
    return location.state?.from?.pathname || ROUTES.ONBOARDING_CREATE_ORG;
  }, [searchParams, location.state, acceptedOrganization]);

  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasRedirectedRef.current) {
      // If we have an invitation token, wait for acceptedOrganization to be set
      // This prevents redirecting to create-organization before the org data arrives
      if (invitationToken && !acceptedOrganization) {
        // Still waiting for organization data from invitation registration
        return;
      }

      hasRedirectedRef.current = true;
      if (invitationToken && acceptedOrganization) {
        toast.success('Account created and joined organization!');
      } else {
        toast.success('Account created successfully!');
      }
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo, invitationToken, acceptedOrganization]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);

  const onSubmit = (data: RegisterFormData) => {
    authRegister({
      name: data.name,
      email: data.email,
      password: data.password,
      invitationToken: invitationToken || undefined,
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
        {invitationToken ? 'Accept Invitation' : 'Create Account'}
      </h2>

      {invitationToken && invitedEmail && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-400 text-sm">
          Create your account to join the organization. Your email has been pre-filled from the invitation.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          id="name"
          type="text"
          label="Full Name"
          placeholder="Enter your full name"
          error={errors.name?.message}
          {...register('name')}
        />

        <FormInput
          id="email"
          type="email"
          label="Email"
          placeholder="Enter your email"
          error={errors.email?.message}
          disabled={!!invitedEmail}
          className={invitedEmail ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : ''}
          {...register('email')}
        />

        <FormInput
          id="password"
          type="password"
          label="Password"
          placeholder="Create a password"
          error={errors.password?.message}
          {...register('password')}
        />

        <FormInput
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" fullWidth isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link
          to={searchParams.get('returnTo') ? `${ROUTES.LOGIN}?returnTo=${searchParams.get('returnTo')}` : ROUTES.LOGIN}
          className="text-primary-600 hover:text-primary-500 font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};
