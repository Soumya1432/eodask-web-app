import { call, put, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  checkNeedsOrganizationRequest,
  checkNeedsOrganizationSuccess,
  checkNeedsOrganizationFailure,
  fetchOrganizationsRequest,
  fetchOrganizationsSuccess,
  fetchOrganizationsFailure,
  fetchOrganizationRequest,
  fetchOrganizationSuccess,
  fetchOrganizationFailure,
  fetchOrganizationBySlugRequest,
  fetchOrganizationBySlugSuccess,
  fetchOrganizationBySlugFailure,
  createOrganizationRequest,
  createOrganizationSuccess,
  createOrganizationFailure,
  updateOrganizationRequest,
  updateOrganizationSuccess,
  updateOrganizationFailure,
  deleteOrganizationRequest,
  deleteOrganizationSuccess,
  deleteOrganizationFailure,
  switchOrganizationRequest,
  switchOrganizationSuccess,
  switchOrganizationFailure,
  updateSettingsRequest,
  updateSettingsSuccess,
  updateSettingsFailure,
  fetchMembersRequest,
  fetchMembersSuccess,
  fetchMembersFailure,
  addMemberRequest,
  addMemberSuccess,
  addMemberFailure,
  updateMemberRoleRequest,
  updateMemberRoleSuccess,
  updateMemberRoleFailure,
  removeMemberRequest,
  removeMemberSuccess,
  removeMemberFailure,
  fetchInvitationsRequest,
  fetchInvitationsSuccess,
  fetchInvitationsFailure,
  createInvitationRequest,
  createInvitationSuccess,
  createInvitationFailure,
  cancelInvitationRequest,
  cancelInvitationSuccess,
  cancelInvitationFailure,
  acceptInvitationRequest,
  acceptInvitationSuccess,
  acceptInvitationFailure,
  fetchDashboardStatsRequest,
  fetchDashboardStatsSuccess,
  fetchDashboardStatsFailure,
} from '../slices/organizationSlice';
import type {
  ICreateOrganizationData,
  IUpdateOrganizationData,
  IUpdateSettingsData,
  OrganizationRole,
} from '@/types';
import { organizationsApi } from '@/lib/api';

// Helper to extract error message
function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    if (axiosError.message) {
      return axiosError.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

// Check if user needs organization
function* handleCheckNeedsOrganization() {
  try {
    const response: { data: { needsOrganization: boolean } } = yield call(
      organizationsApi.checkStatus
    );
    yield put(checkNeedsOrganizationSuccess(response.data?.needsOrganization ?? true));
  } catch (error) {
    const message = getErrorMessage(error, 'Failed to check status');
    console.error('checkNeedsOrganization error:', error);
    yield put(checkNeedsOrganizationFailure(message));
  }
}

// Fetch organizations
function* handleFetchOrganizations() {
  try {
    const response: { data: any[] } = yield call(organizationsApi.getAll);
    yield put(fetchOrganizationsSuccess(response.data || []));
  } catch (error) {
    const message = getErrorMessage(error, 'Failed to fetch organizations');
    console.error('fetchOrganizations error:', error);
    yield put(fetchOrganizationsFailure(message));
  }
}

// Fetch organization by ID
function* handleFetchOrganization(action: PayloadAction<string>) {
  try {
    const response: { data: any } = yield call(organizationsApi.getById, action.payload);
    yield put(fetchOrganizationSuccess(response.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch organization';
    yield put(fetchOrganizationFailure(message));
  }
}

// Fetch organization by slug
function* handleFetchOrganizationBySlug(action: PayloadAction<string>) {
  try {
    const response: { data: any } = yield call(organizationsApi.getBySlug, action.payload);
    yield put(fetchOrganizationBySlugSuccess(response.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch organization';
    yield put(fetchOrganizationBySlugFailure(message));
  }
}

// Create organization
function* handleCreateOrganization(action: PayloadAction<ICreateOrganizationData>) {
  try {
    const response: { data: any } = yield call(organizationsApi.create, action.payload);
    yield put(createOrganizationSuccess(response.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create organization';
    yield put(createOrganizationFailure(message));
  }
}

// Update organization
function* handleUpdateOrganization(
  action: PayloadAction<{ orgId: string; data: IUpdateOrganizationData }>
) {
  try {
    const { orgId, data } = action.payload;
    const response: { data: any } = yield call(organizationsApi.update, orgId, data);
    yield put(updateOrganizationSuccess(response.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update organization';
    yield put(updateOrganizationFailure(message));
  }
}

// Delete organization
function* handleDeleteOrganization(action: PayloadAction<string>) {
  try {
    yield call(organizationsApi.delete, action.payload);
    yield put(deleteOrganizationSuccess(action.payload));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete organization';
    yield put(deleteOrganizationFailure(message));
  }
}

// Switch organization
function* handleSwitchOrganization(action: PayloadAction<string>) {
  try {
    const response: { data: any } = yield call(organizationsApi.switch, action.payload);
    yield put(switchOrganizationSuccess(response.data));
    // Fetch full details after switch
    yield put(fetchOrganizationRequest(action.payload));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to switch organization';
    yield put(switchOrganizationFailure(message));
  }
}

// Update settings
function* handleUpdateSettings(
  action: PayloadAction<{ orgId: string; data: IUpdateSettingsData }>
) {
  try {
    const { orgId, data } = action.payload;
    const response: { data: any } = yield call(organizationsApi.updateSettings, orgId, data);
    yield put(updateSettingsSuccess(response.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update settings';
    yield put(updateSettingsFailure(message));
  }
}

// Fetch members
function* handleFetchMembers(action: PayloadAction<string>) {
  try {
    const response: { data: any[] } = yield call(organizationsApi.getMembers, action.payload);
    yield put(fetchMembersSuccess(response.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch members';
    yield put(fetchMembersFailure(message));
  }
}

// Add member
function* handleAddMember(
  action: PayloadAction<{ orgId: string; email: string; role: OrganizationRole }>
) {
  try {
    const { orgId, email, role } = action.payload;
    const response: { data: any } = yield call(organizationsApi.addMember, orgId, email, role);
    yield put(addMemberSuccess(response.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add member';
    yield put(addMemberFailure(message));
  }
}

// Update member role
function* handleUpdateMemberRole(
  action: PayloadAction<{ orgId: string; userId: string; role: OrganizationRole }>
) {
  try {
    const { orgId, userId, role } = action.payload;
    const response: { data: any } = yield call(
      organizationsApi.updateMemberRole,
      orgId,
      userId,
      role
    );
    yield put(updateMemberRoleSuccess(response.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update member role';
    yield put(updateMemberRoleFailure(message));
  }
}

// Remove member
function* handleRemoveMember(action: PayloadAction<{ orgId: string; userId: string }>) {
  try {
    const { orgId, userId } = action.payload;
    yield call(organizationsApi.removeMember, orgId, userId);
    yield put(removeMemberSuccess(userId));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to remove member';
    yield put(removeMemberFailure(message));
  }
}

// Fetch invitations
function* handleFetchInvitations(action: PayloadAction<string>) {
  try {
    const response: { data: any[] } = yield call(organizationsApi.getInvitations, action.payload);
    yield put(fetchInvitationsSuccess(response.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch invitations';
    yield put(fetchInvitationsFailure(message));
  }
}

// Create invitation
function* handleCreateInvitation(
  action: PayloadAction<{ orgId: string; email: string; role: OrganizationRole }>
) {
  try {
    const { orgId, email, role } = action.payload;
    const response: { data: any } = yield call(
      organizationsApi.createInvitation,
      orgId,
      email,
      role
    );
    yield put(createInvitationSuccess(response.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create invitation';
    yield put(createInvitationFailure(message));
  }
}

// Cancel invitation
function* handleCancelInvitation(
  action: PayloadAction<{ orgId: string; invitationId: string }>
) {
  try {
    const { orgId, invitationId } = action.payload;
    yield call(organizationsApi.cancelInvitation, orgId, invitationId);
    yield put(cancelInvitationSuccess(invitationId));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to cancel invitation';
    yield put(cancelInvitationFailure(message));
  }
}

// Accept invitation
function* handleAcceptInvitation(action: PayloadAction<string>) {
  try {
    const response: { data: any } = yield call(organizationsApi.acceptInvitation, action.payload);
    yield put(acceptInvitationSuccess(response.data));
    // Fetch organizations to get the new one
    yield put(fetchOrganizationsRequest());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to accept invitation';
    yield put(acceptInvitationFailure(message));
  }
}

// Fetch dashboard stats
function* handleFetchDashboardStats(action: PayloadAction<string>) {
  try {
    const response: { data: any } = yield call(
      organizationsApi.getDashboardStats,
      action.payload
    );
    yield put(fetchDashboardStatsSuccess(response.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
    yield put(fetchDashboardStatsFailure(message));
  }
}

// Root organization saga
export function* organizationSaga() {
  yield takeLatest(checkNeedsOrganizationRequest.type, handleCheckNeedsOrganization);
  yield takeLatest(fetchOrganizationsRequest.type, handleFetchOrganizations);
  yield takeLatest(fetchOrganizationRequest.type, handleFetchOrganization);
  yield takeLatest(fetchOrganizationBySlugRequest.type, handleFetchOrganizationBySlug);
  yield takeLatest(createOrganizationRequest.type, handleCreateOrganization);
  yield takeLatest(updateOrganizationRequest.type, handleUpdateOrganization);
  yield takeLatest(deleteOrganizationRequest.type, handleDeleteOrganization);
  yield takeLatest(switchOrganizationRequest.type, handleSwitchOrganization);
  yield takeLatest(updateSettingsRequest.type, handleUpdateSettings);
  yield takeLatest(fetchMembersRequest.type, handleFetchMembers);
  yield takeLatest(addMemberRequest.type, handleAddMember);
  yield takeLatest(updateMemberRoleRequest.type, handleUpdateMemberRole);
  yield takeLatest(removeMemberRequest.type, handleRemoveMember);
  yield takeLatest(fetchInvitationsRequest.type, handleFetchInvitations);
  yield takeLatest(createInvitationRequest.type, handleCreateInvitation);
  yield takeLatest(cancelInvitationRequest.type, handleCancelInvitation);
  yield takeLatest(acceptInvitationRequest.type, handleAcceptInvitation);
  yield takeLatest(fetchDashboardStatsRequest.type, handleFetchDashboardStats);
}
