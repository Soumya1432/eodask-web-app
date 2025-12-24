import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Notification, NotificationState } from '../types';

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  showPanel: false,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'read' | 'createdAt'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllAsRead: (state) => {
      state.notifications.forEach(n => {
        n.read = true;
      });
      state.unreadCount = 0;
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },

    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    toggleNotificationPanel: (state) => {
      state.showPanel = !state.showPanel;
    },

    setNotificationPanelVisible: (state, action: PayloadAction<boolean>) => {
      state.showPanel = action.payload;
    },

    taskOverdueNotification: (state, action: PayloadAction<{
      taskId: string;
      projectId: string;
      title: string;
      message: string;
    }>) => {
      const notification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: 'warning',
        title: action.payload.title,
        message: action.payload.message,
        read: false,
        createdAt: new Date().toISOString(),
        data: {
          taskId: action.payload.taskId,
          projectId: action.payload.projectId,
        },
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },

    taskDueSoonNotification: (state, action: PayloadAction<{
      taskId: string;
      projectId: string;
      title: string;
      message: string;
    }>) => {
      const notification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: 'info',
        title: action.payload.title,
        message: action.payload.message,
        read: false,
        createdAt: new Date().toISOString(),
        data: {
          taskId: action.payload.taskId,
          projectId: action.payload.projectId,
        },
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },

    taskAssignedNotification: (state, action: PayloadAction<{
      taskId: string;
      projectId: string;
      taskTitle: string;
    }>) => {
      const notification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: 'task',
        title: 'Task Assigned',
        message: `You have been assigned to "${action.payload.taskTitle}"`,
        read: false,
        createdAt: new Date().toISOString(),
        data: {
          taskId: action.payload.taskId,
          projectId: action.payload.projectId,
        },
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },

    projectInviteNotification: (state, action: PayloadAction<{
      projectId: string;
      projectName: string;
      inviterName: string;
    }>) => {
      const notification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: 'project',
        title: 'Project Invitation',
        message: `${action.payload.inviterName} invited you to join "${action.payload.projectName}"`,
        read: false,
        createdAt: new Date().toISOString(),
        data: {
          projectId: action.payload.projectId,
        },
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },

    newMessageNotification: (state, action: PayloadAction<{
      roomId: string;
      senderName: string;
      message: string;
    }>) => {
      const notification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: 'chat',
        title: `Message from ${action.payload.senderName}`,
        message: action.payload.message.substring(0, 100) + (action.payload.message.length > 100 ? '...' : ''),
        read: false,
        createdAt: new Date().toISOString(),
        data: {
          roomId: action.payload.roomId,
        },
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  toggleNotificationPanel,
  setNotificationPanelVisible,
  taskOverdueNotification,
  taskDueSoonNotification,
  taskAssignedNotification,
  projectInviteNotification,
  newMessageNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
