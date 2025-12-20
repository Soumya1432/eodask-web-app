import { useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks';
import { Button, FormInput } from '@/components';
import { ROUTES } from '@/constants';
import { registerSchema, type RegisterFormData } from '@/lib/validations';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { register: authRegister, isLoading, error, isAuthenticated, clearAuthError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Check for returnTo query param first, then location state, then default
  const redirectTo = useMemo(() => {
    const returnTo = searchParams.get('returnTo');
    if (returnTo) return returnTo;
    return location.state?.from?.pathname || ROUTES.ONBOARDING_CREATE_ORG;
  }, [searchParams, location.state]);

  // Track if we've already redirected to prevent infinite loops
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      toast.success('Account created successfully!');
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

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
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
        Create Account
      </h2>

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
