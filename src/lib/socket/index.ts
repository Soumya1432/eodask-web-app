import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketManager {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    // Re-register all listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: unknown[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback: (...args: unknown[]) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, ...args: unknown[]): void {
    if (this.socket?.connected) {
      this.socket.emit(event, ...args);
    }
  }

  // Project room management
  joinProject(projectId: string): void {
    this.emit('project:join', projectId);
  }

  leaveProject(projectId: string): void {
    this.emit('project:leave', projectId);
  }

  // Chat room management
  joinChat(roomId: string): void {
    this.emit('chat:join', roomId);
  }

  leaveChat(roomId: string): void {
    this.emit('chat:leave', roomId);
  }

  // Organization room management (for analytics updates)
  joinOrganization(organizationId: string): void {
    this.emit('organization:join', organizationId);
  }

  leaveOrganization(organizationId: string): void {
    this.emit('organization:leave', organizationId);
  }

  // Typing indicators
  startTyping(roomId: string): void {
    this.emit('chat:typing', roomId);
  }

  stopTyping(roomId: string): void {
    this.emit('chat:stop_typing', roomId);
  }

  markMessagesAsRead(roomId: string): void {
    this.emit('chat:mark_read', roomId);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketManager = new SocketManager();

// Socket event types
export interface TaskCreatedEvent {
  id: string;
  title: string;
  columnId: string;
  projectId: string;
}

export interface TaskUpdatedEvent {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  columnId?: string;
  order?: number;
}

export interface TaskMovedEvent {
  id: string;
  columnId: string;
  order: number;
}

export interface TaskDeletedEvent {
  taskId: string;
}

export interface ChatMessageEvent {
  id: string;
  content: string;
  roomId: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface UserTypingEvent {
  roomId: string;
  userId: string;
  email: string;
}

export interface UserOnlineEvent {
  userId: string;
}

export interface UserOfflineEvent {
  userId: string;
  lastSeen: string;
}

export interface NotificationEvent {
  type: string;
  title: string;
  message: string;
  taskId?: string;
  projectId?: string;
}

export interface AnalyticsUpdatedEvent {
  overview: unknown;
  tasksByStatus: unknown[];
  tasksByPriority: unknown[];
  recentActivity: unknown[];
  performance: unknown;
  projectStats: unknown[];
  weeklyTrend: unknown[];
}

export interface AnalyticsStatUpdatedEvent {
  metric: string;
  value: unknown;
}
