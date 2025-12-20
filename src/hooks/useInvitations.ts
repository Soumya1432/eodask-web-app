import { useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import {
  fetchInvitationRequest,
  acceptInvitationRequest,
  rejectInvitationRequest,
  fetchProjectInvitationsRequest,
  createInvitationRequest,
  cancelInvitationRequest,
  clearCurrentInvitation,
  clearOperationMessages,
} from '@/store/slices/invitationSlice';

export const useInvitations = () => {
  const dispatch = useAppDispatch();
  const {
    currentInvitation,
    currentInvitationLoading,
    currentInvitationError,
    projectInvitations,
    projectInvitationsLoading,
    projectInvitationsError,
    accepting,
    rejecting,
    creating,
    cancelling,
    operationError,
    operationSuccess,
    acceptedProject,
  } = useAppSelector((state) => state.invitations);

  // Fetch invitation by token
  const fetchInvitation = useCallback((token: string) => {
    dispatch(fetchInvitationRequest(token));
  }, [dispatch]);

  // Accept invitation
  const acceptInvitation = useCallback((token: string) => {
    dispatch(acceptInvitationRequest(token));
  }, [dispatch]);

  // Reject invitation
  const rejectInvitation = useCallback((token: string) => {
    dispatch(rejectInvitationRequest(token));
  }, [dispatch]);

  // Fetch invitations for a project
  const fetchProjectInvitations = useCallback((projectId: string) => {
    dispatch(fetchProjectInvitationsRequest(projectId));
  }, [dispatch]);

  // Create invitation
  const createInvitation = useCallback((data: { projectId: string; email: string; role: string }) => {
    dispatch(createInvitationRequest(data));
  }, [dispatch]);

  // Cancel invitation
  const cancelInvitation = useCallback((invitationId: string) => {
    dispatch(cancelInvitationRequest(invitationId));
  }, [dispatch]);

  // Clear current invitation
  const clearInvitation = useCallback(() => {
    dispatch(clearCurrentInvitation());
  }, [dispatch]);

  // Clear operation messages
  const clearMessages = useCallback(() => {
    dispatch(clearOperationMessages());
  }, [dispatch]);

  return {
    // State
    currentInvitation,
    currentInvitationLoading,
    currentInvitationError,
    projectInvitations,
    projectInvitationsLoading,
    projectInvitationsError,
    accepting,
    rejecting,
    creating,
    cancelling,
    operationError,
    operationSuccess,
    acceptedProject,

    // Actions
    fetchInvitation,
    acceptInvitation,
    rejectInvitation,
    fetchProjectInvitations,
    createInvitation,
    cancelInvitation,
    clearInvitation,
    clearMessages,
  };
};
