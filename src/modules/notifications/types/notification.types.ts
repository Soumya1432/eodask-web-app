export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'task' | 'project' | 'chat';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: {
    taskId?: string;
    projectId?: string;
    roomId?: string;
    userId?: string;
  };
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  showPanel: boolean;
}
