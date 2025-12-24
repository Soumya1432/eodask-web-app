export interface ChatRoom {
  id: string;
  name?: string;
  isGroup: boolean;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: ChatMessage;
  unreadCount?: number;
  participants?: ChatParticipant[];
}

export interface ChatParticipant {
  id: string;
  roomId: string;
  userId: string;
  joinedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

export interface ChatMessage {
  id: string;
  content: string;
  roomId: string;
  senderId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  sender?: {
    id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
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

export interface ChatState {
  rooms: ChatRoom[];
  roomsLoading: boolean;
  roomsError: string | null;
  currentRoom: ChatRoom | null;
  currentRoomLoading: boolean;
  messages: ChatMessage[];
  messagesLoading: boolean;
  messagesError: string | null;
  messagesTotal: number;
  messagesPage: number;
  hasMoreMessages: boolean;
  unreadCount: number;
  typingUsers: Record<string, string[]>;
  sendingMessage: boolean;
  creatingRoom: boolean;
  operationError: string | null;
}
