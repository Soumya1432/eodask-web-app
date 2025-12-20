import { filesApi, type FileUpload } from '@/lib/api';
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

export const fileService = {
  async uploadTaskAttachment(taskId: string, file: File): Promise<FileUpload> {
    try {
      const response = await filesApi.uploadTaskAttachment(taskId, file);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getTaskAttachments(taskId: string): Promise<FileUpload[]> {
    try {
      const response = await filesApi.getTaskAttachments(taskId);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async downloadAttachment(attachmentId: string, filename: string): Promise<void> {
    try {
      const blob = await filesApi.downloadAttachment(attachmentId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async deleteAttachment(attachmentId: string): Promise<void> {
    try {
      await filesApi.deleteAttachment(attachmentId);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async uploadAvatar(file: File): Promise<string> {
    try {
      const response = await filesApi.uploadAvatar(file);
      return response.data.avatar;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Validation helpers
  validateFile(file: File, options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}): { valid: boolean; error?: string } {
    const { maxSize = 10 * 1024 * 1024, allowedTypes } = options; // Default 10MB

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${Math.round(maxSize / 1024 / 1024)}MB`,
      };
    }

    if (allowedTypes && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    return { valid: true };
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};
