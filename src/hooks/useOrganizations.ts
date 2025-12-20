import { useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import {
  checkNeedsOrganizationRequest,
  fetchOrganizationsRequest,
  fetchOrganizationRequest,
  fetchOrganizationBySlugRequest,
  createOrganizationRequest,
  updateOrganizationRequest,
  deleteOrganizationRequest,
  switchOrganizationRequest,
  updateSettingsRequest,
  fetchMembersRequest,
  addMemberRequest,
  updateMemberRoleRequest,
  removeMemberRequest,
  fetchInvitationsRequest,
  createInvitationRequest,
  cancelInvitationRequest,
  acceptInvitationRequest,
  fetchDashboardStatsRequest,
  clearError,
  clearOrganizationData,
} from '@/store/slices/organizationSlice';
import type {
  ICreateOrganizationData,
  IUpdateOrganizationData,
  IUpdateSettingsData,
  OrganizationRole,
} from '@/types';

export const useOrganizations = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const organizations = useAppSelector((state) => state.organization.organizations);
  const currentOrganization = useAppSelector((state) => state.organization.currentOrganization);
  const members = useAppSelector((state) => state.organization.members);
  const invitations = useAppSelector((state) => state.organization.invitations);
  const dashboardStats = useAppSelector((state) => state.organization.dashboardStats);
  const isLoading = useAppSelector((state) => state.organization.isLoading);
  const error = useAppSelector((state) => state.organization.error);
  const needsOrganization = useAppSelector((state) => state.organization.needsOrganization);

  // Actions
  const checkNeedsOrganization = useCallback(() => {
    dispatch(checkNeedsOrganizationRequest());
  }, [dispatch]);

  const fetchOrganizations = useCallback(() => {
    dispatch(fetchOrganizationsRequest());
  }, [dispatch]);

  const fetchOrganization = useCallback(
    (orgId: string) => {
      dispatch(fetchOrganizationRequest(orgId));
    },
    [dispatch]
  );

  const fetchOrganizationBySlug = useCallback(
    (slug: string) => {
      dispatch(fetchOrganizationBySlugRequest(slug));
    },
    [dispatch]
  );

  const createOrganization = useCallback(
    (data: ICreateOrganizationData) => {
      dispatch(createOrganizationRequest(data));
    },
    [dispatch]
  );

  const updateOrganization = useCallback(
    (orgId: string, data: IUpdateOrganizationData) => {
      dispatch(updateOrganizationRequest({ orgId, data }));
    },
    [dispatch]
  );

  const deleteOrganization = useCallback(
    (orgId: string) => {
      dispatch(deleteOrganizationRequest(orgId));
    },
    [dispatch]
  );

  const switchOrganization = useCallback(
    (orgId: string) => {
      dispatch(switchOrganizationRequest(orgId));
    },
    [dispatch]
  );

  const updateSettings = useCallback(
    (orgId: string, data: IUpdateSettingsData) => {
      dispatch(updateSettingsRequest({ orgId, data }));
    },
    [dispatch]
  );

  // Members
  const fetchMembers = useCallback(
    (orgId: string) => {
      dispatch(fetchMembersRequest(orgId));
    },
    [dispatch]
  );

  const addMember = useCallback(
    (orgId: string, email: string, role: OrganizationRole) => {
      dispatch(addMemberRequest({ orgId, email, role }));
    },
    [dispatch]
  );

  const updateMemberRole = useCallback(
    (orgId: string, userId: string, role: OrganizationRole) => {
      dispatch(updateMemberRoleRequest({ orgId, userId, role }));
    },
    [dispatch]
  );

  const removeMember = useCallback(
    (orgId: string, userId: string) => {
      dispatch(removeMemberRequest({ orgId, userId }));
    },
    [dispatch]
  );

  // Invitations
  const fetchInvitations = useCallback(
    (orgId: string) => {
      dispatch(fetchInvitationsRequest(orgId));
    },
    [dispatch]
  );

  const createInvitation = useCallback(
    (orgId: string, email: string, role: OrganizationRole) => {
      dispatch(createInvitationRequest({ orgId, email, role }));
    },
    [dispatch]
  );

  const cancelInvitation = useCallback(
    (orgId: string, invitationId: string) => {
      dispatch(cancelInvitationRequest({ orgId, invitationId }));
    },
    [dispatch]
  );

  const acceptInvitation = useCallback(
    (token: string) => {
      dispatch(acceptInvitationRequest(token));
    },
    [dispatch]
  );

  // Dashboard
  const fetchDashboardStats = useCallback(
    (orgId: string) => {
      dispatch(fetchDashboardStatsRequest(orgId));
    },
    [dispatch]
  );

  // Utilities
  const clearOrganizationError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearAllOrganizationData = useCallback(() => {
    dispatch(clearOrganizationData());
  }, [dispatch]);

  // Helper to get current user's role in organization
  const currentUserRole = currentOrganization?.userRole;

  // Helper to check if user has minimum role
  const hasMinRole = useCallback(
    (minRole: OrganizationRole): boolean => {
      if (!currentUserRole) return false;
      const hierarchy: OrganizationRole[] = ['GUEST', 'MEMBER', 'MANAGER', 'ADMIN', 'OWNER'];
      return hierarchy.indexOf(currentUserRole) >= hierarchy.indexOf(minRole);
    },
    [currentUserRole]
  );

  return {
    // State
    organizations,
    currentOrganization,
    members,
    invitations,
    dashboardStats,
    isLoading,
    error,
    needsOrganization,
    currentUserRole,

    // Actions
    checkNeedsOrganization,
    fetchOrganizations,
    fetchOrganization,
    fetchOrganizationBySlug,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    switchOrganization,
    updateSettings,
    fetchMembers,
    addMember,
    updateMemberRole,
    removeMember,
    fetchInvitations,
    createInvitation,
    cancelInvitation,
    acceptInvitation,
    fetchDashboardStats,
    clearOrganizationError,
    clearAllOrganizationData,

    // Helpers
    hasMinRole,
  };
};
