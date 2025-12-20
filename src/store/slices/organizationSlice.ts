import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  IOrganizationState,
  IOrganization,
  IOrganizationDetails,
  IOrganizationMember,
  IOrganizationInvitation,
  IOrganizationDashboardStats,
  ICreateOrganizationData,
  IUpdateOrganizationData,
  IUpdateSettingsData,
  OrganizationRole,
} from '@/types';
import { STORAGE_KEYS } from '@/constants';

const CURRENT_ORG_KEY = 'current_organization';

// Helper to get initial state from storage
const getInitialState = (): IOrganizationState => {
  try {
    const orgStr = localStorage.getItem(CURRENT_ORG_KEY);
    const currentOrganization = orgStr ? JSON.parse(orgStr) : null;

    return {
      organizations: [],
      currentOrganization,
      members: [],
      invitations: [],
      dashboardStats: null,
      isLoading: false,
      error: null,
      needsOrganization: false,
    };
  } catch {
    return {
      organizations: [],
      currentOrganization: null,
      members: [],
      invitations: [],
      dashboardStats: null,
      isLoading: false,
      error: null,
      needsOrganization: false,
    };
  }
};

const initialState: IOrganizationState = getInitialState();

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    // Check if user needs organization
    checkNeedsOrganizationRequest: (state) => {
      state.isLoading = true;
    },
    checkNeedsOrganizationSuccess: (state, action: PayloadAction<boolean>) => {
      state.isLoading = false;
      state.needsOrganization = action.payload;
    },
    checkNeedsOrganizationFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch organizations
    fetchOrganizationsRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchOrganizationsSuccess: (state, action: PayloadAction<IOrganization[]>) => {
      state.isLoading = false;
      state.organizations = action.payload;
      state.needsOrganization = action.payload.length === 0;
    },
    fetchOrganizationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch organization by ID
    fetchOrganizationRequest: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchOrganizationSuccess: (state, action: PayloadAction<IOrganizationDetails>) => {
      state.isLoading = false;
      state.currentOrganization = action.payload;
      state.members = action.payload.members;
      localStorage.setItem(CURRENT_ORG_KEY, JSON.stringify(action.payload));
    },
    fetchOrganizationFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Fetch organization by slug
    fetchOrganizationBySlugRequest: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchOrganizationBySlugSuccess: (state, action: PayloadAction<IOrganizationDetails>) => {
      state.isLoading = false;
      state.currentOrganization = action.payload;
      state.members = action.payload.members;
      localStorage.setItem(CURRENT_ORG_KEY, JSON.stringify(action.payload));
    },
    fetchOrganizationBySlugFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Create organization
    createOrganizationRequest: (state, _action: PayloadAction<ICreateOrganizationData>) => {
      state.isLoading = true;
      state.error = null;
    },
    createOrganizationSuccess: (state, action: PayloadAction<IOrganizationDetails>) => {
      state.isLoading = false;
      state.organizations.push(action.payload);
      state.currentOrganization = action.payload;
      state.needsOrganization = false;
      localStorage.setItem(CURRENT_ORG_KEY, JSON.stringify(action.payload));
    },
    createOrganizationFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update organization
    updateOrganizationRequest: (
      state,
      _action: PayloadAction<{ orgId: string; data: IUpdateOrganizationData }>
    ) => {
      state.isLoading = true;
      state.error = null;
    },
    updateOrganizationSuccess: (state, action: PayloadAction<IOrganization>) => {
      state.isLoading = false;
      const index = state.organizations.findIndex((o) => o.id === action.payload.id);
      if (index !== -1) {
        state.organizations[index] = { ...state.organizations[index], ...action.payload };
      }
      if (state.currentOrganization?.id === action.payload.id) {
        state.currentOrganization = { ...state.currentOrganization, ...action.payload };
        localStorage.setItem(CURRENT_ORG_KEY, JSON.stringify(state.currentOrganization));
      }
    },
    updateOrganizationFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Delete organization
    deleteOrganizationRequest: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
    },
    deleteOrganizationSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.organizations = state.organizations.filter((o) => o.id !== action.payload);
      if (state.currentOrganization?.id === action.payload) {
        state.currentOrganization = null;
        localStorage.removeItem(CURRENT_ORG_KEY);
      }
    },
    deleteOrganizationFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Switch organization
    switchOrganizationRequest: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
    },
    switchOrganizationSuccess: (state, action: PayloadAction<IOrganization>) => {
      state.isLoading = false;
      // Will fetch full details after switch
    },
    switchOrganizationFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update settings
    updateSettingsRequest: (
      state,
      _action: PayloadAction<{ orgId: string; data: IUpdateSettingsData }>
    ) => {
      state.isLoading = true;
      state.error = null;
    },
    updateSettingsSuccess: (state, action: PayloadAction<IOrganizationDetails['settings']>) => {
      state.isLoading = false;
      if (state.currentOrganization) {
        state.currentOrganization.settings = action.payload;
        localStorage.setItem(CURRENT_ORG_KEY, JSON.stringify(state.currentOrganization));
      }
    },
    updateSettingsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Members
    fetchMembersRequest: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchMembersSuccess: (state, action: PayloadAction<IOrganizationMember[]>) => {
      state.isLoading = false;
      state.members = action.payload;
    },
    fetchMembersFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    addMemberRequest: (
      state,
      _action: PayloadAction<{ orgId: string; email: string; role: OrganizationRole }>
    ) => {
      state.isLoading = true;
      state.error = null;
    },
    addMemberSuccess: (state, action: PayloadAction<IOrganizationMember>) => {
      state.isLoading = false;
      state.members.push(action.payload);
    },
    addMemberFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    updateMemberRoleRequest: (
      state,
      _action: PayloadAction<{ orgId: string; userId: string; role: OrganizationRole }>
    ) => {
      state.isLoading = true;
      state.error = null;
    },
    updateMemberRoleSuccess: (state, action: PayloadAction<IOrganizationMember>) => {
      state.isLoading = false;
      const index = state.members.findIndex((m) => m.userId === action.payload.userId);
      if (index !== -1) {
        state.members[index] = action.payload;
      }
    },
    updateMemberRoleFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    removeMemberRequest: (state, _action: PayloadAction<{ orgId: string; userId: string }>) => {
      state.isLoading = true;
      state.error = null;
    },
    removeMemberSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.members = state.members.filter((m) => m.userId !== action.payload);
    },
    removeMemberFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Invitations
    fetchInvitationsRequest: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchInvitationsSuccess: (state, action: PayloadAction<IOrganizationInvitation[]>) => {
      state.isLoading = false;
      state.invitations = action.payload;
    },
    fetchInvitationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    createInvitationRequest: (
      state,
      _action: PayloadAction<{ orgId: string; email: string; role: OrganizationRole }>
    ) => {
      state.isLoading = true;
      state.error = null;
    },
    createInvitationSuccess: (state, action: PayloadAction<IOrganizationInvitation>) => {
      state.isLoading = false;
      state.invitations.push(action.payload);
    },
    createInvitationFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    cancelInvitationRequest: (
      state,
      _action: PayloadAction<{ orgId: string; invitationId: string }>
    ) => {
      state.isLoading = true;
      state.error = null;
    },
    cancelInvitationSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.invitations = state.invitations.filter((i) => i.id !== action.payload);
    },
    cancelInvitationFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Accept invitation
    acceptInvitationRequest: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
    },
    acceptInvitationSuccess: (state, _action: PayloadAction<IOrganizationMember>) => {
      state.isLoading = false;
      state.needsOrganization = false;
    },
    acceptInvitationFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Dashboard stats
    fetchDashboardStatsRequest: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchDashboardStatsSuccess: (state, action: PayloadAction<IOrganizationDashboardStats>) => {
      state.isLoading = false;
      state.dashboardStats = action.payload;
    },
    fetchDashboardStatsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Clear current organization (on logout)
    clearCurrentOrganization: (state) => {
      state.currentOrganization = null;
      state.members = [];
      state.invitations = [];
      state.dashboardStats = null;
      localStorage.removeItem(CURRENT_ORG_KEY);
    },

    // Clear all organization data (on logout)
    clearOrganizationData: (state) => {
      state.organizations = [];
      state.currentOrganization = null;
      state.members = [];
      state.invitations = [];
      state.dashboardStats = null;
      state.needsOrganization = false;
      localStorage.removeItem(CURRENT_ORG_KEY);
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set current organization (for context)
    setCurrentOrganization: (state, action: PayloadAction<IOrganizationDetails | null>) => {
      state.currentOrganization = action.payload;
      if (action.payload) {
        state.members = action.payload.members;
        localStorage.setItem(CURRENT_ORG_KEY, JSON.stringify(action.payload));
      } else {
        state.members = [];
        localStorage.removeItem(CURRENT_ORG_KEY);
      }
    },
  },
});

export const {
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
  clearCurrentOrganization,
  clearOrganizationData,
  clearError,
  setCurrentOrganization,
} = organizationSlice.actions;

export default organizationSlice.reducer;
