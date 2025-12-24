import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Invitation, InvitationState } from '../types';
import type { Project } from '@/modules/projects/types';

const initialState: InvitationState = {
  currentInvitation: null,
  currentInvitationLoading: false,
  currentInvitationError: null,

  projectInvitations: [],
  projectInvitationsLoading: false,
  projectInvitationsError: null,

  accepting: false,
  rejecting: false,
  creating: false,
  cancelling: false,
  operationError: null,
  operationSuccess: null,

  acceptedProject: null,
};

const invitationSlice = createSlice({
  name: 'invitations',
  initialState,
  reducers: {
    // Fetch invitation by token
    fetchInvitationRequest: (state, _action: PayloadAction<string>) => {
      state.currentInvitationLoading = true;
      state.currentInvitationError = null;
    },
    fetchInvitationSuccess: (state, action: PayloadAction<Invitation>) => {
      state.currentInvitationLoading = false;
      state.currentInvitation = action.payload;
    },
    fetchInvitationFailure: (state, action: PayloadAction<string>) => {
      state.currentInvitationLoading = false;
      state.currentInvitationError = action.payload;
    },

    // Accept invitation
    acceptInvitationRequest: (state, _action: PayloadAction<string>) => {
      state.accepting = true;
      state.operationError = null;
    },
    acceptInvitationSuccess: (state, action: PayloadAction<Project>) => {
      state.accepting = false;
      state.acceptedProject = action.payload;
      state.operationSuccess = 'Invitation accepted successfully!';
      if (state.currentInvitation) {
        state.currentInvitation.status = 'ACCEPTED';
      }
    },
    acceptInvitationFailure: (state, action: PayloadAction<string>) => {
      state.accepting = false;
      state.operationError = action.payload;
    },

    // Reject invitation
    rejectInvitationRequest: (state, _action: PayloadAction<string>) => {
      state.rejecting = true;
      state.operationError = null;
    },
    rejectInvitationSuccess: (state) => {
      state.rejecting = false;
      state.operationSuccess = 'Invitation rejected';
      if (state.currentInvitation) {
        state.currentInvitation.status = 'REJECTED';
      }
    },
    rejectInvitationFailure: (state, action: PayloadAction<string>) => {
      state.rejecting = false;
      state.operationError = action.payload;
    },

    // Fetch project invitations
    fetchProjectInvitationsRequest: (state, _action: PayloadAction<string>) => {
      state.projectInvitationsLoading = true;
      state.projectInvitationsError = null;
    },
    fetchProjectInvitationsSuccess: (state, action: PayloadAction<Invitation[]>) => {
      state.projectInvitationsLoading = false;
      state.projectInvitations = action.payload;
    },
    fetchProjectInvitationsFailure: (state, action: PayloadAction<string>) => {
      state.projectInvitationsLoading = false;
      state.projectInvitationsError = action.payload;
    },

    // Create invitation
    createInvitationRequest: (state, _action: PayloadAction<{ projectId: string; email: string; role: string }>) => {
      state.creating = true;
      state.operationError = null;
    },
    createInvitationSuccess: (state, action: PayloadAction<Invitation>) => {
      state.creating = false;
      state.projectInvitations.unshift(action.payload);
      state.operationSuccess = 'Invitation sent successfully!';
    },
    createInvitationFailure: (state, action: PayloadAction<string>) => {
      state.creating = false;
      state.operationError = action.payload;
    },

    // Cancel invitation
    cancelInvitationRequest: (state, _action: PayloadAction<string>) => {
      state.cancelling = true;
      state.operationError = null;
    },
    cancelInvitationSuccess: (state, action: PayloadAction<string>) => {
      state.cancelling = false;
      state.projectInvitations = state.projectInvitations.filter(i => i.id !== action.payload);
      state.operationSuccess = 'Invitation cancelled';
    },
    cancelInvitationFailure: (state, action: PayloadAction<string>) => {
      state.cancelling = false;
      state.operationError = action.payload;
    },

    // Clear current invitation
    clearCurrentInvitation: (state) => {
      state.currentInvitation = null;
      state.currentInvitationError = null;
      state.acceptedProject = null;
    },

    // Clear messages
    clearOperationMessages: (state) => {
      state.operationError = null;
      state.operationSuccess = null;
    },
  },
});

export const {
  fetchInvitationRequest,
  fetchInvitationSuccess,
  fetchInvitationFailure,
  acceptInvitationRequest,
  acceptInvitationSuccess,
  acceptInvitationFailure,
  rejectInvitationRequest,
  rejectInvitationSuccess,
  rejectInvitationFailure,
  fetchProjectInvitationsRequest,
  fetchProjectInvitationsSuccess,
  fetchProjectInvitationsFailure,
  createInvitationRequest,
  createInvitationSuccess,
  createInvitationFailure,
  cancelInvitationRequest,
  cancelInvitationSuccess,
  cancelInvitationFailure,
  clearCurrentInvitation,
  clearOperationMessages,
} = invitationSlice.actions;

export default invitationSlice.reducer;
