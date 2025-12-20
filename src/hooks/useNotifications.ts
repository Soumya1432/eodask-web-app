import { useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  toggleNotificationPanel,
  setNotificationPanelVisible,
} from '@/store/slices/notificationSlice';
import type { Notification } from '@/store/slices/notificationSlice';

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const {
    notifications,
    unreadCount,
    showPanel,
  } = useAppSelector((state) => state.notifications);

  // Add a new notification
  const notify = useCallback((notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    dispatch(addNotification(notification));
  }, [dispatch]);

  // Shorthand notification methods
  const notifySuccess = useCallback((title: string, message: string) => {
    dispatch(addNotification({ type: 'success', title, message }));
  }, [dispatch]);

  const notifyError = useCallback((title: string, message: string) => {
    dispatch(addNotification({ type: 'error', title, message }));
  }, [dispatch]);

  const notifyWarning = useCallback((title: string, message: string) => {
    dispatch(addNotification({ type: 'warning', title, message }));
  }, [dispatch]);

  const notifyInfo = useCallback((title: string, message: string) => {
    dispatch(addNotification({ type: 'info', title, message }));
  }, [dispatch]);

  // Mark notification as read
  const markRead = useCallback((notificationId: string) => {
    dispatch(markAsRead(notificationId));
  }, [dispatch]);

  // Mark all notifications as read
  const markAllRead = useCallback(() => {
    dispatch(markAllAsRead());
  }, [dispatch]);

  // Remove a notification
  const remove = useCallback((notificationId: string) => {
    dispatch(removeNotification(notificationId));
  }, [dispatch]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    dispatch(clearAllNotifications());
  }, [dispatch]);

  // Toggle notification panel visibility
  const togglePanel = useCallback(() => {
    dispatch(toggleNotificationPanel());
  }, [dispatch]);

  // Set notification panel visibility
  const setPanelVisible = useCallback((visible: boolean) => {
    dispatch(setNotificationPanelVisible(visible));
  }, [dispatch]);

  // Get unread notifications
  const unreadNotifications = notifications.filter(n => !n.read);

  // Get notifications by type
  const getByType = useCallback((type: Notification['type']) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  return {
    // State
    notifications,
    unreadCount,
    unreadNotifications,
    showPanel,

    // Actions
    notify,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    markRead,
    markAllRead,
    remove,
    clearAll,
    togglePanel,
    setPanelVisible,

    // Helpers
    getByType,
  };
};
