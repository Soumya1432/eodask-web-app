import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
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
} from '../slices/invitationSlice';
import { invitationService } from '@/services/invitationService';
import type { Invitation, Project } from '@/lib/api';

// Fetch invitation by token
function* handleFetchInvitation(action: PayloadAction<string>) {
  try {
    const invitation: Invitation = yield call(invitationService.getInvitation, action.payload);
    yield put(fetchInvitationSuccess(invitation));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch invitation';
    yield put(fetchInvitationFailure(message));
  }
}

// Accept invitation
function* handleAcceptInvitation(action: PayloadAction<string>) {
  try {
    const project: Project = yield call(invitationService.acceptInvitation, action.payload);
    yield put(acceptInvitationSuccess(project));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to accept invitation';
    yield put(acceptInvitationFailure(message));
  }
}

// Reject invitation
function* handleRejectInvitation(action: PayloadAction<string>) {
  try {
    yield call(invitationService.rejectInvitation, action.payload);
    yield put(rejectInvitationSuccess());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reject invitation';
    yield put(rejectInvitationFailure(message));
  }
}

// Fetch project invitations
function* handleFetchProjectInvitations(action: PayloadAction<string>) {
  try {
    const invitations: Invitation[] = yield call(invitationService.getProjectInvitations, action.payload);
    yield put(fetchProjectInvitationsSuccess(invitations));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch invitations';
    yield put(fetchProjectInvitationsFailure(message));
  }
}

// Create invitation
function* handleCreateInvitation(action: PayloadAction<{ projectId: string; email: string; role: string }>) {
  try {
    const invitation: Invitation = yield call(
      invitationService.createInvitation,
      action.payload.projectId,
      action.payload.email,
      action.payload.role
    );
    yield put(createInvitationSuccess(invitation));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send invitation';
    yield put(createInvitationFailure(message));
  }
}

// Cancel invitation
function* handleCancelInvitation(action: PayloadAction<string>) {
  try {
    yield call(invitationService.cancelInvitation, action.payload);
    yield put(cancelInvitationSuccess(action.payload));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to cancel invitation';
    yield put(cancelInvitationFailure(message));
  }
}

// Root invitation saga
export function* invitationSaga() {
  yield takeLatest(fetchInvitationRequest.type, handleFetchInvitation);
  yield takeLatest(acceptInvitationRequest.type, handleAcceptInvitation);
  yield takeLatest(rejectInvitationRequest.type, handleRejectInvitation);
  yield takeLatest(fetchProjectInvitationsRequest.type, handleFetchProjectInvitations);
  yield takeEvery(createInvitationRequest.type, handleCreateInvitation);
  yield takeEvery(cancelInvitationRequest.type, handleCancelInvitation);
}
