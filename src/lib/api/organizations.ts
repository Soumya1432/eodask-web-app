import { apiClient, type ApiResponse } from './client';
import type {
  IOrganization,
  IOrganizationDetails,
  IOrganizationMember,
  IOrganizationInvitation,
  IOrganizationDashboardStats,
  ICreateOrganizationData,
  IUpdateOrganizationData,
  IUpdateSettingsData,
  OrganizationRole,
  IOrganizationSettings,
} from '@/types';

export const organizationsApi = {
  // Check if user needs to create an organization
  checkStatus: async (): Promise<ApiResponse<{ needsOrganization: boolean }>> => {
    const response = await apiClient.get<ApiResponse<{ needsOrganization: boolean }>>(
      '/organizations/check-status'
    );
    return response.data;
  },

  // Get all organizations for current user
  getAll: async (): Promise<ApiResponse<IOrganization[]>> => {
    const response = await apiClient.get<ApiResponse<IOrganization[]>>('/organizations');
    return response.data;
  },

  // Get organization by ID
  getById: async (orgId: string): Promise<ApiResponse<IOrganizationDetails>> => {
    const response = await apiClient.get<ApiResponse<IOrganizationDetails>>(
      `/organizations/${orgId}`
    );
    return response.data;
  },

  // Get organization by slug
  getBySlug: async (slug: string): Promise<ApiResponse<IOrganizationDetails>> => {
    const response = await apiClient.get<ApiResponse<IOrganizationDetails>>(
      `/organizations/slug/${slug}`
    );
    return response.data;
  },

  // Create organization
  create: async (data: ICreateOrganizationData): Promise<ApiResponse<IOrganizationDetails>> => {
    const response = await apiClient.post<ApiResponse<IOrganizationDetails>>(
      '/organizations',
      data
    );
    return response.data;
  },

  // Update organization
  update: async (
    orgId: string,
    data: IUpdateOrganizationData
  ): Promise<ApiResponse<IOrganization>> => {
    const response = await apiClient.patch<ApiResponse<IOrganization>>(
      `/organizations/${orgId}`,
      data
    );
    return response.data;
  },

  // Update slug
  updateSlug: async (orgId: string, slug: string): Promise<ApiResponse<IOrganization>> => {
    const response = await apiClient.patch<ApiResponse<IOrganization>>(
      `/organizations/${orgId}/slug`,
      { slug }
    );
    return response.data;
  },

  // Delete organization
  delete: async (orgId: string): Promise<void> => {
    await apiClient.delete(`/organizations/${orgId}`);
  },

  // Switch organization
  switch: async (organizationId: string): Promise<ApiResponse<IOrganization>> => {
    const response = await apiClient.post<ApiResponse<IOrganization>>('/organizations/switch', {
      organizationId,
    });
    return response.data;
  },

  // Settings
  updateSettings: async (
    orgId: string,
    data: IUpdateSettingsData
  ): Promise<ApiResponse<IOrganizationSettings>> => {
    const response = await apiClient.patch<ApiResponse<IOrganizationSettings>>(
      `/organizations/${orgId}/settings`,
      data
    );
    return response.data;
  },

  // Upload logo
  uploadLogo: async (orgId: string, file: File): Promise<ApiResponse<IOrganization>> => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await apiClient.post<ApiResponse<IOrganization>>(
      `/organizations/${orgId}/logo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Members
  getMembers: async (orgId: string): Promise<ApiResponse<IOrganizationMember[]>> => {
    const response = await apiClient.get<ApiResponse<IOrganizationMember[]>>(
      `/organizations/${orgId}/members`
    );
    return response.data;
  },

  addMember: async (
    orgId: string,
    email: string,
    role: OrganizationRole
  ): Promise<ApiResponse<IOrganizationMember>> => {
    const response = await apiClient.post<ApiResponse<IOrganizationMember>>(
      `/organizations/${orgId}/members`,
      { email, role }
    );
    return response.data;
  },

  updateMemberRole: async (
    orgId: string,
    userId: string,
    role: OrganizationRole
  ): Promise<ApiResponse<IOrganizationMember>> => {
    const response = await apiClient.patch<ApiResponse<IOrganizationMember>>(
      `/organizations/${orgId}/members/${userId}`,
      { role }
    );
    return response.data;
  },

  removeMember: async (orgId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/organizations/${orgId}/members/${userId}`);
  },

  transferOwnership: async (orgId: string, newOwnerId: string): Promise<void> => {
    await apiClient.post(`/organizations/${orgId}/transfer-ownership`, { newOwnerId });
  },

  // Invitations
  getInvitations: async (orgId: string): Promise<ApiResponse<IOrganizationInvitation[]>> => {
    const response = await apiClient.get<ApiResponse<IOrganizationInvitation[]>>(
      `/organizations/${orgId}/invitations`
    );
    return response.data;
  },

  createInvitation: async (
    orgId: string,
    email: string,
    role: OrganizationRole
  ): Promise<ApiResponse<IOrganizationInvitation>> => {
    const response = await apiClient.post<ApiResponse<IOrganizationInvitation>>(
      `/organizations/${orgId}/invitations`,
      { email, role }
    );
    return response.data;
  },

  cancelInvitation: async (orgId: string, invitationId: string): Promise<void> => {
    await apiClient.delete(`/organizations/${orgId}/invitations/${invitationId}`);
  },

  // Public invitation endpoints
  getInvitationByToken: async (token: string): Promise<ApiResponse<IOrganizationInvitation>> => {
    const response = await apiClient.get<ApiResponse<IOrganizationInvitation>>(
      `/organizations/invitations/token/${token}`
    );
    return response.data;
  },

  acceptInvitation: async (token: string): Promise<ApiResponse<IOrganizationMember>> => {
    const response = await apiClient.post<ApiResponse<IOrganizationMember>>(
      `/organizations/invitations/token/${token}/accept`
    );
    return response.data;
  },

  rejectInvitation: async (token: string): Promise<void> => {
    await apiClient.post(`/organizations/invitations/token/${token}/reject`);
  },

  // Dashboard
  getDashboardStats: async (orgId: string): Promise<ApiResponse<IOrganizationDashboardStats>> => {
    const response = await apiClient.get<ApiResponse<IOrganizationDashboardStats>>(
      `/organizations/${orgId}/dashboard`
    );
    return response.data;
  },

  // Projects
  getProjects: async (
    orgId: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<{ projects: any[]; total: number }>> => {
    const response = await apiClient.get<ApiResponse<{ projects: any[]; total: number }>>(
      `/organizations/${orgId}/projects`,
      { params: { page, limit } }
    );
    return response.data;
  },
};
