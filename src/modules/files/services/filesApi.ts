import { apiClient } from '@/lib/axios';
import type { FileUpload } from '../types';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const filesApi = {
  uploadTaskAttachment: async (taskId: string, file: File): Promise<ApiResponse<FileUpload>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<FileUpload>>(
      `/files/tasks/${taskId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getTaskAttachments: async (taskId: string): Promise<ApiResponse<FileUpload[]>> => {
    const response = await apiClient.get<ApiResponse<FileUpload[]>>(`/files/tasks/${taskId}/attachments`);
    return response.data;
  },

  downloadAttachment: async (attachmentId: string): Promise<Blob> => {
    const response = await apiClient.get(`/files/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  deleteAttachment: async (attachmentId: string): Promise<void> => {
    await apiClient.delete(`/files/attachments/${attachmentId}`);
  },

  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatar: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<ApiResponse<{ avatar: string }>>(
      '/files/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
