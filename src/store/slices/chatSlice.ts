import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ChatRoom, ChatMessage } from '@/lib/api';

interface ChatState {
  // Rooms
  rooms: ChatRoom[];
  roomsLoading: boolean;
  roomsError: string | null;

  // Current room
  currentRoom: ChatRoom | null;
  currentRoomLoading: boolean;

  // Messages
  messages: ChatMessage[];
  messagesLoading: boolean;
  messagesError: string | null;
  messagesTotal: number;
  messagesPage: number;
  hasMoreMessages: boolean;

  // Unread count
  unreadCount: number;

  // Typing indicators
  typingUsers: Record<string, string[]>; // roomId -> userId[]

  // Operation states
  sendingMessage: boolean;
  creatingRoom: boolean;
  operationError: string | null;
}

const initialState: ChatState = {
  rooms: [],
  roomsLoading: false,
  roomsError: null,

  currentRoom: null,
  currentRoomLoading: false,

  messages: [],
  messagesLoading: false,
  messagesError: null,
  messagesTotal: 0,
  messagesPage: 1,
  hasMoreMessages: true,

  unreadCount: 0,

  typingUsers: {},

  sendingMessage: false,
  creatingRoom: false,
  operationError: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Fetch rooms
    fetchRoomsRequest: (state) => {
      state.roomsLoading = true;
      state.roomsError = null;
    },
    fetchRoomsSuccess: (state, action: PayloadAction<ChatRoom[]>) => {
      state.roomsLoading = false;
      state.rooms = action.payload;
    },
    fetchRoomsFailure: (state, action: PayloadAction<string>) => {
      state.roomsLoading = false;
      state.roomsError = action.payload;
    },

    // Fetch single room
    fetchRoomRequest: (state, _action: PayloadAction<string>) => {
      state.currentRoomLoading = true;
    },
    fetchRoomSuccess: (state, action: PayloadAction<ChatRoom>) => {
      state.currentRoomLoading = false;
      state.currentRoom = action.payload;
    },
    fetchRoomFailure: (state, _action: PayloadAction<string>) => {
      state.currentRoomLoading = false;
    },

    // Create room
    createRoomRequest: (state, _action: PayloadAction<{ name: string; projectId?: string; participantIds: string[]; isGroup?: boolean }>) => {
      state.creatingRoom = true;
      state.operationError = null;
    },
    createRoomSuccess: (state, action: PayloadAction<ChatRoom>) => {
      state.creatingRoom = false;
      state.rooms.unshift(action.payload);
    },
    createRoomFailure: (state, action: PayloadAction<string>) => {
      state.creatingRoom = false;
      state.operationError = action.payload;
    },

    // Get or create direct chat
    getOrCreateDirectChatRequest: (state, _action: PayloadAction<string>) => {
      state.currentRoomLoading = true;
    },
    getOrCreateDirectChatSuccess: (state, action: PayloadAction<ChatRoom>) => {
      state.currentRoomLoading = false;
      state.currentRoom = action.payload;
      // Add to rooms if not exists
      if (!state.rooms.find(r => r.id === action.payload.id)) {
        state.rooms.unshift(action.payload);
      }
    },
    getOrCreateDirectChatFailure: (state, _action: PayloadAction<string>) => {
      state.currentRoomLoading = false;
    },

    // Fetch messages
    fetchMessagesRequest: (state, _action: PayloadAction<{ roomId: string; page?: number; limit?: number }>) => {
      state.messagesLoading = true;
      state.messagesError = null;
    },
    fetchMessagesSuccess: (state, action: PayloadAction<{ messages: ChatMessage[]; total: number; page: number }>) => {
      state.messagesLoading = false;
      if (action.payload.page === 1) {
        state.messages = action.payload.messages;
      } else {
        // Prepend older messages
        state.messages = [...action.payload.messages, ...state.messages];
      }
      state.messagesTotal = action.payload.total;
      state.messagesPage = action.payload.page;
      state.hasMoreMessages = state.messages.length < action.payload.total;
    },
    fetchMessagesFailure: (state, action: PayloadAction<string>) => {
      state.messagesLoading = false;
      state.messagesError = action.payload;
    },

    // Send message
    sendMessageRequest: (state, _action: PayloadAction<{ roomId: string; content: string }>) => {
      state.sendingMessage = true;
      state.operationError = null;
    },
    sendMessageSuccess: (state, action: PayloadAction<ChatMessage>) => {
      state.sendingMessage = false;
      state.messages.push(action.payload);
      // Update room's last message
      const roomIndex = state.rooms.findIndex(r => r.id === action.payload.roomId);
      if (roomIndex !== -1) {
        state.rooms[roomIndex].lastMessage = action.payload;
        // Move room to top
        const [room] = state.rooms.splice(roomIndex, 1);
        state.rooms.unshift(room);
      }
    },
    sendMessageFailure: (state, action: PayloadAction<string>) => {
      state.sendingMessage = false;
      state.operationError = action.payload;
    },

    // Delete message
    deleteMessageRequest: (state, _action: PayloadAction<string>) => {
      state.operationError = null;
    },
    deleteMessageSuccess: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(m => m.id !== action.payload);
    },
    deleteMessageFailure: (state, action: PayloadAction<string>) => {
      state.operationError = action.payload;
    },

    // Fetch unread count
    fetchUnreadCountRequest: () => {
      // No loading state needed
    },
    fetchUnreadCountSuccess: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },

    // Set current room
    setCurrentRoom: (state, action: PayloadAction<ChatRoom | null>) => {
      state.currentRoom = action.payload;
      state.messages = [];
      state.messagesPage = 1;
      state.hasMoreMessages = true;
    },

    // Clear messages
    clearMessages: (state) => {
      state.messages = [];
      state.messagesPage = 1;
      state.hasMoreMessages = true;
    },

    // Clear operation error
    clearOperationError: (state) => {
      state.operationError = null;
    },

    // Real-time updates
    messageReceived: (state, action: PayloadAction<ChatMessage>) => {
      // Don't add duplicate messages
      if (!state.messages.find(m => m.id === action.payload.id)) {
        state.messages.push(action.payload);
      }
      // Update room's last message
      const roomIndex = state.rooms.findIndex(r => r.id === action.payload.roomId);
      if (roomIndex !== -1) {
        state.rooms[roomIndex].lastMessage = action.payload;
        // Move room to top
        const [room] = state.rooms.splice(roomIndex, 1);
        state.rooms.unshift(room);
      }
      // Increment unread if not current room
      if (state.currentRoom?.id !== action.payload.roomId) {
        state.unreadCount += 1;
      }
    },
    messageDeleted: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(m => m.id !== action.payload);
    },
    userStartedTyping: (state, action: PayloadAction<{ roomId: string; userId: string }>) => {
      const { roomId, userId } = action.payload;
      if (!state.typingUsers[roomId]) {
        state.typingUsers[roomId] = [];
      }
      if (!state.typingUsers[roomId].includes(userId)) {
        state.typingUsers[roomId].push(userId);
      }
    },
    userStoppedTyping: (state, action: PayloadAction<{ roomId: string; userId: string }>) => {
      const { roomId, userId } = action.payload;
      if (state.typingUsers[roomId]) {
        state.typingUsers[roomId] = state.typingUsers[roomId].filter(id => id !== userId);
      }
    },
    messagesRead: (state, action: PayloadAction<{ roomId: string }>) => {
      // Update unread count for room
      const room = state.rooms.find(r => r.id === action.payload.roomId);
      if (room && room.unreadCount) {
        state.unreadCount -= room.unreadCount;
        room.unreadCount = 0;
      }
    },
  },
});

export const {
  fetchRoomsRequest,
  fetchRoomsSuccess,
  fetchRoomsFailure,
  fetchRoomRequest,
  fetchRoomSuccess,
  fetchRoomFailure,
  createRoomRequest,
  createRoomSuccess,
  createRoomFailure,
  getOrCreateDirectChatRequest,
  getOrCreateDirectChatSuccess,
  getOrCreateDirectChatFailure,
  fetchMessagesRequest,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  sendMessageRequest,
  sendMessageSuccess,
  sendMessageFailure,
  deleteMessageRequest,
  deleteMessageSuccess,
  deleteMessageFailure,
  fetchUnreadCountRequest,
  fetchUnreadCountSuccess,
  setCurrentRoom,
  clearMessages,
  clearOperationError,
  messageReceived,
  messageDeleted,
  userStartedTyping,
  userStoppedTyping,
  messagesRead,
} = chatSlice.actions;

export default chatSlice.reducer;
