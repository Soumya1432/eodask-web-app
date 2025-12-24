import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import { ROUTES, getOrgRoute } from '@/constants';
import { organizationsApi } from '@/lib/api';
import type { IOrganizationInvitation } from '@/types';

export const InviteAcceptPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();
  const [inviteDetails, setInviteDetails] = useState<IOrganizationInvitation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [acceptedSlug, setAcceptedSlug] = useState<string | null>(null);
  const [emailMismatch, setEmailMismatch] = useState(false);
  const [showAuthChoice, setShowAuthChoice] = useState(false);

  // Fetch invitation details
  const fetchInvitation = useCallback(async () => {
    if (!token) return;

    try {
      setIsFetching(true);
      setError(null);
      setEmailMismatch(false);
      const response = await organizationsApi.getInvitationByToken(token);
      setInviteDetails(response.data);

      // Check if logged-in user's email matches the invitation email
      if (user?.email && response.data?.email && user.email !== response.data.email) {
        setEmailMismatch(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch invitation';
      setError(message);
    } finally {
      setIsFetching(false);
    }
  }, [token, user?.email]);

  useEffect(() => {
    // If not authenticated, show auth choice (login or register)
    if (!authLoading && !isAuthenticated) {
      setShowAuthChoice(true);
      // Still fetch invitation details to display info
      if (token) {
        fetchInvitation();
      }
      return;
    }

    // Fetch invitation details when authenticated
    if (isAuthenticated && token) {
      setShowAuthChoice(false);
      fetchInvitation();
    }
  }, [authLoading, isAuthenticated, token, fetchInvitation]);

  const handleLoginRedirect = () => {
    navigate(`${ROUTES.LOGIN}?returnTo=/invite/${token}`, { replace: true });
  };

  const handleRegisterRedirect = () => {
    // Pass invitation token and email to register page
    const params = new URLSearchParams();
    params.set('invitationToken', token || '');
    if (inviteDetails?.email) {
      params.set('email', inviteDetails.email);
    }
    navigate(`${ROUTES.REGISTER}?${params.toString()}`, { replace: true });
  };

  const handleAccept = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);
      const result = await organizationsApi.acceptInvitation(token);
      if (result.data?.organization?.slug) {
        setAccepted(true);
        setAcceptedSlug(result.data.organization.slug);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to accept invitation';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      await organizationsApi.rejectInvitation(token);
      navigate(ROUTES.ORGANIZATIONS);
    } catch {
      navigate(ROUTES.ORGANIZATIONS);
    }
  };

  const handleLogoutAndSwitch = () => {
    logout();
    // After logout, redirect to login with return URL
    navigate(`${ROUTES.LOGIN}?returnTo=/invite/${token}`, { replace: true });
  };

  if (authLoading || isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show auth choice for unauthenticated users
  if (showAuthChoice && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Organization Invitation
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You've been invited to join an organization
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {inviteDetails && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Organization:</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {inviteDetails.organization?.name || 'Unknown'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Invited email:</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {inviteDetails.email}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-gray-400">Role:</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {inviteDetails.role}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Please sign in or create an account to accept this invitation
            </p>
            <Button
              className="w-full"
              onClick={handleRegisterRedirect}
            >
              Create Account
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleLoginRedirect}
            >
              I already have an account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (accepted && acceptedSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to the Team!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You've successfully joined the organization.
          </p>
          <Link to={getOrgRoute(ROUTES.ORG_DASHBOARD, acceptedSlug)}>
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Organization Invitation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You've been invited to join an organization
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Email mismatch warning */}
        {emailMismatch && inviteDetails && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-amber-800 dark:text-amber-200 text-sm font-medium mb-1">
                  Email Mismatch
                </p>
                <p className="text-amber-700 dark:text-amber-300 text-sm mb-2">
                  This invitation was sent to <strong>{inviteDetails.email}</strong>, but you're logged in as <strong>{user?.email}</strong>.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogoutAndSwitch}
                >
                  Log in with correct email
                </Button>
              </div>
            </div>
          </div>
        )}

        {inviteDetails && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Organization:</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {inviteDetails.organization?.name || 'Unknown'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Invited email:</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {inviteDetails.email}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Role:</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {inviteDetails.role}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-gray-400">Invited by:</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {inviteDetails.sender
                    ? `${inviteDetails.sender.firstName} ${inviteDetails.sender.lastName}`
                    : 'Unknown'}
                </dd>
              </div>
            </dl>
          </div>
        )}

        <div className="flex space-x-4">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleDecline}
            disabled={isLoading || emailMismatch}
          >
            Decline
          </Button>
          <Button
            className="flex-1"
            onClick={handleAccept}
            isLoading={isLoading}
            disabled={isLoading || emailMismatch}
          >
            Accept Invitation
          </Button>
        </div>

        {emailMismatch && (
          <p className="mt-4 text-center text-xs text-amber-600 dark:text-amber-400">
            Please log in with the correct email to accept this invitation.
          </p>
        )}

        {!emailMismatch && (
          <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            By accepting, you agree to the organization's terms and policies.
          </p>
        )}
      </div>
    </div>
  );
};

export default InviteAcceptPage;
