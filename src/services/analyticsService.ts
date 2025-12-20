import { analyticsApi, type OrganizationAnalytics, type ProjectAnalytics } from '@/lib/api';
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

export const analyticsService = {
  async getOrganizationAnalytics(organizationId: string): Promise<OrganizationAnalytics> {
    try {
      const response = await analyticsApi.getOrganizationAnalytics(organizationId);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getProjectAnalytics(projectId: string): Promise<ProjectAnalytics> {
    try {
      const response = await analyticsApi.getProjectAnalytics(projectId);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
