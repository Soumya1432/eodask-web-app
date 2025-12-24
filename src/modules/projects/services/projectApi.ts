import { apiClient, type ApiResponse, type PaginatedResponse } from '@/lib/axios';
import type {
  Project,
  ProjectMember,
  BoardColumn,
  Task,
  CreateProjectData,
  UpdateProjectData,
  CreateTaskData,
  UpdateTaskData,
} from '../types';

export const projectsApi = {
  // Projects
  getProjects: async (): Promise<ApiResponse<Project[]>> => {
    const response = await apiClient.get<ApiResponse<Project[]>>('/projects');
    return response.data;
  },

  getProject: async (projectId: string): Promise<ApiResponse<Project>> => {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${projectId}`);
    return response.data;
  },

  createProject: async (data: CreateProjectData): Promise<ApiResponse<Project>> => {
    const response = await apiClient.post<ApiResponse<Project>>('/projects', data);
    return response.data;
  },

  updateProject: async (projectId: string, data: UpdateProjectData): Promise<ApiResponse<Project>> => {
    const response = await apiClient.patch<ApiResponse<Project>>(`/projects/${projectId}`, data);
    return response.data;
  },

  deleteProject: async (projectId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}`);
  },

  // Members
  getMembers: async (projectId: string): Promise<ApiResponse<ProjectMember[]>> => {
    const response = await apiClient.get<ApiResponse<ProjectMember[]>>(`/projects/${projectId}/members`);
    return response.data;
  },

  addMember: async (projectId: string, email: string, role: string): Promise<ApiResponse<{ type: string; message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ type: string; message: string }>>(`/projects/${projectId}/members`, { email, role });
    return response.data;
  },

  updateMemberRole: async (projectId: string, userId: string, role: string): Promise<void> => {
    await apiClient.patch(`/projects/${projectId}/members/${userId}`, { role });
  },

  removeMember: async (projectId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/members/${userId}`);
  },

  // Columns
  getColumns: async (projectId: string): Promise<ApiResponse<BoardColumn[]>> => {
    const response = await apiClient.get<ApiResponse<BoardColumn[]>>(`/projects/${projectId}/columns`);
    return response.data;
  },

  createColumn: async (projectId: string, name: string, order?: number): Promise<ApiResponse<BoardColumn>> => {
    const response = await apiClient.post<ApiResponse<BoardColumn>>(`/projects/${projectId}/columns`, {
      name,
      order,
    });
    return response.data;
  },

  updateColumn: async (
    projectId: string,
    columnId: string,
    data: { name?: string; order?: number }
  ): Promise<ApiResponse<BoardColumn>> => {
    const response = await apiClient.patch<ApiResponse<BoardColumn>>(
      `/projects/${projectId}/columns/${columnId}`,
      data
    );
    return response.data;
  },

  deleteColumn: async (projectId: string, columnId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/columns/${columnId}`);
  },

  reorderColumns: async (
    projectId: string,
    columnOrders: Array<{ id: string; order: number }>
  ): Promise<void> => {
    await apiClient.put(`/projects/${projectId}/columns/reorder`, { columnOrders });
  },

  // Tasks
  getTasks: async (
    projectId: string,
    params?: {
      status?: string;
      priority?: string;
      assigneeId?: string;
      search?: string;
      columnId?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<Task>> => {
    const response = await apiClient.get<PaginatedResponse<Task>>(`/projects/${projectId}/tasks`, {
      params,
    });
    return response.data;
  },

  getTask: async (projectId: string, taskId: string): Promise<ApiResponse<Task>> => {
    const response = await apiClient.get<ApiResponse<Task>>(`/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  },

  createTask: async (projectId: string, data: CreateTaskData): Promise<ApiResponse<Task>> => {
    const response = await apiClient.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, data);
    return response.data;
  },

  updateTask: async (projectId: string, taskId: string, data: UpdateTaskData): Promise<ApiResponse<Task>> => {
    const response = await apiClient.patch<ApiResponse<Task>>(`/projects/${projectId}/tasks/${taskId}`, data);
    return response.data;
  },

  deleteTask: async (projectId: string, taskId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/tasks/${taskId}`);
  },

  moveTask: async (
    projectId: string,
    taskId: string,
    columnId: string,
    order: number
  ): Promise<ApiResponse<Task>> => {
    const response = await apiClient.put<ApiResponse<Task>>(`/projects/${projectId}/tasks/${taskId}/move`, {
      columnId,
      order,
    });
    return response.data;
  },

  // Assignees
  addAssignee: async (projectId: string, taskId: string, userId: string): Promise<void> => {
    await apiClient.post(`/projects/${projectId}/tasks/${taskId}/assignees`, { userId });
  },

  removeAssignee: async (projectId: string, taskId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/tasks/${taskId}/assignees/${userId}`);
  },
};
