import { apiClient, type ApiResponse } from './client';

export interface AnalyticsOverview {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalMembers: number;
  tasksThisWeek: number;
  tasksLastWeek: number;
  weeklyChange: number;
}

export interface TasksByStatus {
  status: string;
  count: number;
  color: string;
}

export interface TasksByPriority {
  priority: string;
  count: number;
  color: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  user: { id: string; name: string; avatar: string | null };
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Performance {
  completionRate: number;
  onTimeDeliveryRate: number;
  avgCompletionTime: number;
  overdueTasksCount: number;
}

export interface ProjectStats {
  id: string;
  name: string;
  color: string;
  taskCount: number;
  completedCount: number;
  memberCount: number;
}

export interface WeeklyTrend {
  week: string;
  created: number;
  completed: number;
}

export interface OrganizationAnalytics {
  overview: AnalyticsOverview;
  tasksByStatus: TasksByStatus[];
  tasksByPriority: TasksByPriority[];
  recentActivity: ActivityItem[];
  performance: Performance;
  projectStats: ProjectStats[];
  weeklyTrend: WeeklyTrend[];
}

export interface ProjectAnalytics {
  project: {
    id: string;
    name: string;
    color: string;
  };
  overview: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    memberCount: number;
  };
  tasksByStatus: TasksByStatus[];
  tasksByPriority: TasksByPriority[];
  tasksByAssignee: Array<{
    userId: string;
    name: string;
    avatar: string | null;
    count: number;
  }>;
  overdueTasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    priority: string;
  }>;
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
