import { invitationsApi, type Invitation, type Project } from '@/lib/api';
import type { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return axiosError.response?.data?.message ||
           axiosError.response?.data?.error ||
           axiosError.message ||
           'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An error occurred';
};

export const invitationService = {
  async getInvitation(token: string): Promise<Invitation> {
    try {
      const response = await invitationsApi.getInvitation(token);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async acceptInvitation(token: string): Promise<Project> {
    try {
      const response = await invitationsApi.acceptInvitation(token);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async rejectInvitation(token: string): Promise<void> {
    try {
      await invitationsApi.rejectInvitation(token);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getProjectInvitations(projectId: string): Promise<Invitation[]> {
    try {
      const response = await invitationsApi.getProjectInvitations(projectId);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async createInvitation(projectId: string, email: string, role: string): Promise<Invitation> {
    try {
      const response = await invitationsApi.createInvitation(projectId, email, role);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async cancelInvitation(invitationId: string): Promise<void> {
    try {
      await invitationsApi.cancelInvitation(invitationId);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
