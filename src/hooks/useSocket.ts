import { useEffect, useCallback } from 'react';
import { socketManager } from '@/lib/socket';
import { useAppSelector } from './useAppSelector';

export const useSocket = () => {
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && token) {
      socketManager.connect(token);
    }

    return () => {
      if (!isAuthenticated) {
        socketManager.disconnect();
      }
    };
  }, [isAuthenticated, token]);

  const joinProject = useCallback((projectId: string) => {
    socketManager.joinProject(projectId);
  }, []);

  const leaveProject = useCallback((projectId: string) => {
    socketManager.leaveProject(projectId);
  }, []);

  const joinChat = useCallback((roomId: string) => {
    socketManager.joinChat(roomId);
  }, []);

  const leaveChat = useCallback((roomId: string) => {
    socketManager.leaveChat(roomId);
  }, []);

  const joinOrganization = useCallback((organizationId: string) => {
    socketManager.joinOrganization(organizationId);
  }, []);

  const leaveOrganization = useCallback((organizationId: string) => {
    socketManager.leaveOrganization(organizationId);
  }, []);

  const startTyping = useCallback((roomId: string) => {
    socketManager.startTyping(roomId);
  }, []);

  const stopTyping = useCallback((roomId: string) => {
    socketManager.stopTyping(roomId);
  }, []);

  const markMessagesAsRead = useCallback((roomId: string) => {
    socketManager.markMessagesAsRead(roomId);
  }, []);

  const on = useCallback((event: string, callback: (...args: unknown[]) => void) => {
    socketManager.on(event, callback);
    return () => socketManager.off(event, callback);
  }, []);

  const off = useCallback((event: string, callback: (...args: unknown[]) => void) => {
    socketManager.off(event, callback);
  }, []);

  return {
    isConnected: socketManager.isConnected(),
    joinProject,
    leaveProject,
    joinChat,
    leaveChat,
    joinOrganization,
    leaveOrganization,
    startTyping,
    stopTyping,
    markMessagesAsRead,
    on,
    off,
  };
};
