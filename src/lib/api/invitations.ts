import { apiClient, type ApiResponse } from './client';
import type { Project } from './projects';

export interface Invitation {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER' | 'GUEST';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  token: string;
  projectId: string;
  inviterId: string;
  expiresAt: string;
  createdAt: string;
  project: {
    id: string;
    name: string;
  };
  inviter: {
    id: string;
    name: string;
    email: string;
  };
}

export const invitationsApi = {
  getInvitation: async (token: string): Promise<ApiResponse<Invitation>> => {
    const response = await apiClient.get<ApiResponse<Invitation>>(`/invitations/token/${token}`);
    return response.data;
  },

  acceptInvitation: async (token: string): Promise<ApiResponse<Project>> => {
    const response = await apiClient.post<ApiResponse<Project>>(`/invitations/token/${token}/accept`);
    return response.data;
  },

  rejectInvitation: async (token: string): Promise<void> => {
    await apiClient.post(`/invitations/token/${token}/reject`);
  },

  getProjectInvitations: async (projectId: string): Promise<ApiResponse<Invitation[]>> => {
    const response = await apiClient.get<ApiResponse<Invitation[]>>(`/invitations/project/${projectId}`);
    return response.data;
  },

  createInvitation: async (
    projectId: string,
    email: string,
    role: string
  ): Promise<ApiResponse<Invitation>> => {
    const response = await apiClient.post<ApiResponse<Invitation>>(`/invitations/project/${projectId}`, {
      email,
      role,
    });
    return response.data;
  },

  cancelInvitation: async (invitationId: string): Promise<void> => {
    await apiClient.delete(`/invitations/${invitationId}`);
  },
};
