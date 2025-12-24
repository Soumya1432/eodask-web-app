import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/shared/hooks';
import {
  fetchRoomsRequest,
  fetchRoomRequest,
  createRoomRequest,
  getOrCreateDirectChatRequest,
  fetchMessagesRequest,
  sendMessageRequest,
  deleteMessageRequest,
  fetchUnreadCountRequest,
  setCurrentRoom,
  clearMessages,
  clearOperationError,
} from '../store/chatSlice';
import type { ChatRoom, CreateRoomData } from '../types';

export const useChat = () => {
  const dispatch = useAppDispatch();
  const {
    rooms,
    roomsLoading,
    roomsError,
    currentRoom,
    currentRoomLoading,
    messages,
    messagesLoading,
    messagesError,
    messagesTotal,
    messagesPage,
    hasMoreMessages,
    unreadCount,
    typingUsers,
    sendingMessage,
    creatingRoom,
    operationError,
  } = useAppSelector((state) => state.chat);

  // Room actions
  const fetchRooms = useCallback(() => {
    dispatch(fetchRoomsRequest());
  }, [dispatch]);

  const fetchRoom = useCallback((roomId: string) => {
    dispatch(fetchRoomRequest(roomId));
  }, [dispatch]);

  const createRoom = useCallback((data: CreateRoomData) => {
    dispatch(createRoomRequest(data));
  }, [dispatch]);

  const getOrCreateDirectChat = useCallback((userId: string) => {
    dispatch(getOrCreateDirectChatRequest(userId));
  }, [dispatch]);

  const selectRoom = useCallback((room: ChatRoom | null) => {
    dispatch(setCurrentRoom(room));
  }, [dispatch]);

  // Message actions
  const fetchMessages = useCallback((roomId: string, page?: number, limit?: number) => {
    dispatch(fetchMessagesRequest({ roomId, page, limit }));
  }, [dispatch]);

  const loadMoreMessages = useCallback(() => {
    if (currentRoom && hasMoreMessages && !messagesLoading) {
      dispatch(fetchMessagesRequest({ roomId: currentRoom.id, page: messagesPage + 1 }));
    }
  }, [dispatch, currentRoom, hasMoreMessages, messagesLoading, messagesPage]);

  const sendMessage = useCallback((roomId: string, content: string) => {
    dispatch(sendMessageRequest({ roomId, content }));
  }, [dispatch]);

  const deleteMessage = useCallback((messageId: string) => {
    dispatch(deleteMessageRequest(messageId));
  }, [dispatch]);

  // Unread count
  const fetchUnreadCount = useCallback(() => {
    dispatch(fetchUnreadCountRequest());
  }, [dispatch]);

  // Clear actions
  const clearChatMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearOperationError());
  }, [dispatch]);

  // Get typing users for current room
  const currentRoomTypingUsers = currentRoom ? (typingUsers[currentRoom.id] || []) : [];

  return {
    // State
    rooms,
    roomsLoading,
    roomsError,
    currentRoom,
    currentRoomLoading,
    messages,
    messagesLoading,
    messagesError,
    messagesTotal,
    hasMoreMessages,
    unreadCount,
    typingUsers: currentRoomTypingUsers,
    sendingMessage,
    creatingRoom,
    operationError,
    error: operationError || roomsError || messagesError,

    // Room actions
    fetchRooms,
    fetchRoom,
    createRoom,
    getOrCreateDirectChat,
    selectRoom,

    // Message actions
    fetchMessages,
    loadMoreMessages,
    sendMessage,
    deleteMessage,

    // Other actions
    fetchUnreadCount,
    clearChatMessages,
    clearError,
  };
};
