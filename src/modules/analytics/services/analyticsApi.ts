import { apiClient } from '@/lib/axios';
import type { OrganizationAnalytics, ProjectAnalytics } from '../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const analyticsApi = {
  getOrganizationAnalytics: async (organizationId: string): Promise<ApiResponse<OrganizationAnalytics>> => {
    const response = await apiClient.get<ApiResponse<OrganizationAnalytics>>(`/analytics/organizations/${organizationId}`);
    return response.data;
  },

  getProjectAnalytics: async (projectId: string): Promise<ApiResponse<ProjectAnalytics>> => {
    const response = await apiClient.get<ApiResponse<ProjectAnalytics>>(`/analytics/projects/${projectId}`);
    return response.data;
  },
};
