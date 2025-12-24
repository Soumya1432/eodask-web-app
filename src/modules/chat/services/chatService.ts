import { chatApi } from './chatApi';
import type { ChatRoom, ChatMessage, CreateRoomData } from '../types';
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

export const chatService = {
  async getRooms(): Promise<ChatRoom[]> {
    try {
      const response = await chatApi.getRooms();
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getRoom(roomId: string): Promise<ChatRoom> {
    try {
      const response = await chatApi.getRoom(roomId);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async createRoom(data: CreateRoomData): Promise<ChatRoom> {
    try {
      const response = await chatApi.createRoom(data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getOrCreateDirectChat(userId: string): Promise<ChatRoom> {
    try {
      const response = await chatApi.getOrCreateDirectChat(userId);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const response = await chatApi.getUnreadCount();
      return response.data.count;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async getMessages(roomId: string, params?: { page?: number; limit?: number }): Promise<{
    messages: ChatMessage[];
    total: number;
  }> {
    try {
      const response = await chatApi.getMessages(roomId, params);
      return {
        messages: response.data,
        total: response.pagination.total,
      };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async sendMessage(roomId: string, content: string): Promise<ChatMessage> {
    try {
      const response = await chatApi.sendMessage(roomId, content);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async deleteMessage(messageId: string): Promise<void> {
    try {
      await chatApi.deleteMessage(messageId);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async addParticipant(roomId: string, userId: string): Promise<void> {
    try {
      await chatApi.addParticipant(roomId, userId);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  async removeParticipant(roomId: string, userId: string): Promise<void> {
    try {
      await chatApi.removeParticipant(roomId, userId);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};
