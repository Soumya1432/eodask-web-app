import { apiClient, type ApiResponse, type PaginatedResponse } from './client';

export interface ChatRoom {
  id: string;
  name?: string;
  isGroup: boolean;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
}

export interface ChatParticipant {
  id: string;
  userId: string;
  roomId: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    isOnline?: boolean;
  };
}

export interface ChatMessage {
  id: string;
  content: string;
  roomId: string;
  senderId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface CreateRoomData {
  name: string;
  projectId?: string;
  participantIds: string[];
  isGroup?: boolean;
}

export const chatApi = {
  // Rooms
  getRooms: async (): Promise<ApiResponse<ChatRoom[]>> => {
    const response = await apiClient.get<ApiResponse<ChatRoom[]>>('/chat');
    return response.data;
  },

  getRoom: async (roomId: string): Promise<ApiResponse<ChatRoom>> => {
    const response = await apiClient.get<ApiResponse<ChatRoom>>(`/chat/${roomId}`);
    return response.data;
  },

  createRoom: async (data: CreateRoomData): Promise<ApiResponse<ChatRoom>> => {
    const response = await apiClient.post<ApiResponse<ChatRoom>>('/chat', data);
    return response.data;
  },

  getOrCreateDirectChat: async (userId: string): Promise<ApiResponse<ChatRoom>> => {
    const response = await apiClient.get<ApiResponse<ChatRoom>>(`/chat/direct/${userId}`);
    return response.data;
  },

  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/chat/unread');
    return response.data;
  },

  // Messages
  getMessages: async (
    roomId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<ChatMessage>> => {
    const response = await apiClient.get<PaginatedResponse<ChatMessage>>(`/chat/${roomId}/messages`, {
      params,
    });
    return response.data;
  },

  sendMessage: async (roomId: string, content: string): Promise<ApiResponse<ChatMessage>> => {
    const response = await apiClient.post<ApiResponse<ChatMessage>>(`/chat/${roomId}/messages`, {
      content,
    });
    return response.data;
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    await apiClient.delete(`/chat/messages/${messageId}`);
  },

  // Participants
  addParticipant: async (roomId: string, userId: string): Promise<void> => {
    await apiClient.post(`/chat/${roomId}/participants`, { userId });
  },

  removeParticipant: async (roomId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/chat/${roomId}/participants/${userId}`);
  },
};
