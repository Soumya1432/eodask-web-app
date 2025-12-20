import { projectsApi, type Project, type BoardColumn, type ProjectMember, type Task } from '@/lib/api';
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

export const projectService = {
  // Projects
  async getProjects(): Promise<Project[]> {
    try {
      const response = await projectsApi.getProjects();
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getProject(projectId: string): Promise<Project> {
    try {
      const response = await projectsApi.getProject(projectId);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async createProject(data: { name: string; description?: string; color?: string; organizationId: string }): Promise<Project> {
    try {
      const response = await projectsApi.createProject(data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateProject(projectId: string, data: { name?: string; description?: string; color?: string; isArchived?: boolean }): Promise<Project> {
    try {
      const response = await projectsApi.updateProject(projectId, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async deleteProject(projectId: string): Promise<void> {
    try {
      await projectsApi.deleteProject(projectId);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Members
  async getMembers(projectId: string): Promise<ProjectMember[]> {
    try {
      const response = await projectsApi.getMembers(projectId);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async addMember(projectId: string, email: string, role: string): Promise<{ type: string; message: string }> {
    try {
      const response = await projectsApi.addMember(projectId, email, role);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateMemberRole(projectId: string, userId: string, role: string): Promise<void> {
    try {
      await projectsApi.updateMemberRole(projectId, userId, role);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async removeMember(projectId: string, userId: string): Promise<void> {
    try {
      await projectsApi.removeMember(projectId, userId);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Columns
  async getColumns(projectId: string): Promise<BoardColumn[]> {
    try {
      const response = await projectsApi.getColumns(projectId);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async createColumn(projectId: string, name: string, order?: number): Promise<BoardColumn> {
    try {
      const response = await projectsApi.createColumn(projectId, name, order);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateColumn(projectId: string, columnId: string, data: { name?: string; order?: number }): Promise<BoardColumn> {
    try {
      const response = await projectsApi.updateColumn(projectId, columnId, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async deleteColumn(projectId: string, columnId: string): Promise<void> {
    try {
      await projectsApi.deleteColumn(projectId, columnId);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async reorderColumns(projectId: string, columnOrders: Array<{ id: string; order: number }>): Promise<void> {
    try {
      await projectsApi.reorderColumns(projectId, columnOrders);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Tasks
  async getTasks(projectId: string, params?: {
    status?: string;
    priority?: string;
    assigneeId?: string;
    search?: string;
    columnId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ tasks: Task[]; total: number }> {
    try {
      const response = await projectsApi.getTasks(projectId, params);
      return {
        tasks: response.data,
        total: response.pagination.total,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getTask(projectId: string, taskId: string): Promise<Task> {
    try {
      const response = await projectsApi.getTask(projectId, taskId);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async createTask(projectId: string, data: {
    title: string;
    description?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: string;
    columnId: string;
    assigneeIds?: string[];
    labels?: string[];
  }): Promise<Task> {
    try {
      const response = await projectsApi.createTask(projectId, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async updateTask(projectId: string, taskId: string, data: {
    title?: string;
    description?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status?: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
    dueDate?: string | null;
    columnId?: string;
    order?: number;
  }): Promise<Task> {
    try {
      const response = await projectsApi.updateTask(projectId, taskId, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async deleteTask(projectId: string, taskId: string): Promise<void> {
    try {
      await projectsApi.deleteTask(projectId, taskId);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async moveTask(projectId: string, taskId: string, columnId: string, order: number): Promise<Task> {
    try {
      const response = await projectsApi.moveTask(projectId, taskId, columnId, order);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async addAssignee(projectId: string, taskId: string, userId: string): Promise<void> {
    try {
      await projectsApi.addAssignee(projectId, taskId, userId);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async removeAssignee(projectId: string, taskId: string, userId: string): Promise<void> {
    try {
      await projectsApi.removeAssignee(projectId, taskId, userId);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
