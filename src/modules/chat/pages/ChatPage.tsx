import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useProjects, useTheme, useSocket } from '@/hooks';
import { useAppSelector } from '@/shared/hooks';
import { LoadingSpinner } from '@/shared/components/ui';
import { useChat } from '../hooks';
import type { ChatRoom } from '../types';
import toast from 'react-hot-toast';

export const ChatPage: React.FC = () => {
  const { organization } = useOrganizationContext();
  const { projects, fetchProjects } = useProjects();
  const { user } = useAppSelector((state) => state.auth);
  const { isDark } = useTheme();
  const { joinChat, leaveChat, startTyping, stopTyping, markMessagesAsRead, on } = useSocket();

  const {
    rooms,
    roomsLoading,
    currentRoom,
    messages,
    messagesLoading,
    sendingMessage,
    creatingRoom,
    typingUsers,
    fetchRooms,
    selectRoom,
    fetchMessages,
    sendMessage,
    createRoom,
    error,
  } = useChat();

  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch rooms and projects on mount
  useEffect(() => {
    if (organization?.id) {
      fetchRooms();
      fetchProjects();
    }
  }, [organization?.id, fetchRooms, fetchProjects]);

  // Join/leave chat room for real-time updates
  useEffect(() => {
    if (currentRoom) {
      joinChat(currentRoom.id);
      fetchMessages(currentRoom.id, 1, 50);
      markMessagesAsRead(currentRoom.id);

      return () => {
        leaveChat(currentRoom.id);
      };
    }
  }, [currentRoom, joinChat, leaveChat, fetchMessages, markMessagesAsRead]);

  // Listen for real-time messages
  useEffect(() => {
    const unsubscribeMessage = on('chat:message', () => {
      // Messages are handled by Redux via messageReceived action
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    const unsubscribeTyping = on('chat:typing', () => {
      // Typing indicators are handled by Redux
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
    };
  }, [on]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Select first room by default
  useEffect(() => {
    if (!currentRoom && rooms.length > 0) {
      selectRoom(rooms[0]);
    }
  }, [rooms, currentRoom, selectRoom]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!currentRoom) return;

    if (!isTyping) {
      setIsTyping(true);
      startTyping(currentRoom.id);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(currentRoom.id);
    }, 2000);
  }, [currentRoom, isTyping, startTyping, stopTyping]);

  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentRoom || sendingMessage) return;

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    if (currentRoom) {
      stopTyping(currentRoom.id);
    }

    sendMessage(currentRoom.id, newMessage.trim());
    setNewMessage('');
  }, [newMessage, currentRoom, sendingMessage, sendMessage, stopTyping]);

  const handleCreateRoom = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim() || creatingRoom) return;

    createRoom({
      name: newRoomName.trim(),
      projectId: selectedProjectId || undefined,
      participantIds: [],
      isGroup: true,
    });

    setNewRoomName('');
    setSelectedProjectId('');
    setShowCreateModal(false);
    toast.success('Chat room created successfully!');
  }, [newRoomName, selectedProjectId, creatingRoom, createRoom]);

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const filteredRooms = rooms.filter(room =>
    (room.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSenderName = (sender?: ChatRoom['participants'][0]['user']): string => {
    if (!sender) return 'Unknown';
    if (sender.firstName && sender.lastName) {
      return `${sender.firstName} ${sender.lastName}`;
    }
    return sender.email || 'Unknown';
  };

  const getRoomName = (room: ChatRoom): string => {
    if (room.name) return room.name;
    if (!room.isGroup && room.participants) {
      const otherParticipant = room.participants.find(p => p.userId !== user?.id);
      if (otherParticipant?.user) {
        return getSenderName(otherParticipant.user);
      }
      return 'Direct Message';
    }
    return 'Chat Room';
  };

  const getRoomColor = (room: ChatRoom): string => {
    if (room.projectId) {
      const project = projects.find(p => p.id === room.projectId);
      return project?.color || '#6366f1';
    }
    return room.isGroup ? '#22c55e' : '#6366f1';
  };

  return (
    <div className={`flex h-[calc(100vh-64px)] ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Channels Sidebar */}
      <div className={`w-[280px] flex flex-col border-r ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        {/* Sidebar Header */}
        <div className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center mb-3">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Messages
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center text-lg hover:bg-indigo-600 transition-colors"
            >
              +
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDark
                ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-400'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto p-2">
          {roomsLoading && rooms.length === 0 ? (
            <div className="flex justify-center py-5">
              <LoadingSpinner size="md" />
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className={`p-5 text-center text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
              {searchQuery ? 'No channels found' : 'No chat rooms yet. Create one to start messaging!'}
            </div>
          ) : (
            filteredRooms.map(room => (
              <div
                key={room.id}
                onClick={() => selectRoom(room)}
                className={`p-3 rounded-lg cursor-pointer mb-1 transition-colors ${
                  currentRoom?.id === room.id
                    ? isDark ? 'bg-indigo-500/20' : 'bg-indigo-50'
                    : isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Channel Icon */}
                  <div
                    style={{ backgroundColor: getRoomColor(room) }}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                  >
                    {room.isGroup ? '#' : getInitials(getRoomName(room))}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {getRoomName(room)}
                      </span>
                      {room.unreadCount && room.unreadCount > 0 && (
                        <span className="bg-indigo-500 text-white text-[11px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex-shrink-0">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>

                    {room.lastMessage && (
                      <div className="flex justify-between items-center">
                        <span className={`text-xs truncate max-w-[120px] ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                          {room.lastMessage.content}
                        </span>
                        <span className={`text-[11px] flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                          {formatTime(room.lastMessage.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {currentRoom ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className={`px-5 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              <div
                style={{ backgroundColor: getRoomColor(currentRoom) }}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold text-white"
              >
                {currentRoom.isGroup ? '#' : getInitials(getRoomName(currentRoom))}
              </div>
              <div>
                <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {getRoomName(currentRoom)}
                </h3>
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                  {currentRoom.participants?.length || 0} members
                </span>
              </div>
            </div>

            <button className={`px-3 py-2 rounded-md border text-sm transition-colors ${
              isDark
                ? 'border-slate-600 text-slate-400 hover:text-white hover:border-slate-500'
                : 'border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400'
            }`}>
              Members
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {messagesLoading && messages.length === 0 ? (
              <div className="flex-1 flex justify-center items-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : messages.length === 0 ? (
              <div className={`flex-1 flex justify-center items-center ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message, index) => {
                const isOwn = message.senderId === user?.id;
                const showAvatar = index === 0 ||
                  messages[index - 1].senderId !== message.senderId ||
                  new Date(message.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 300000;

                const senderName = message.sender?.firstName && message.sender?.lastName
                  ? `${message.sender.firstName} ${message.sender.lastName}`
                  : message.sender?.name || message.sender?.email || 'Unknown';

                return (
                  <div
                    key={message.id}
                    className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    {showAvatar && !isOwn ? (
                      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                        {getInitials(senderName)}
                      </div>
                    ) : (
                      <div className="w-8 flex-shrink-0" />
                    )}

                    <div className={`max-w-[70%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      {showAvatar && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                            {isOwn ? 'You' : senderName}
                          </span>
                          <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                            {formatMessageTime(message.createdAt)}
                          </span>
                        </div>
                      )}

                      <div className={`px-3.5 py-2.5 text-sm leading-relaxed ${
                        isOwn
                          ? 'bg-indigo-500 text-white rounded-2xl rounded-br-sm'
                          : isDark
                            ? 'bg-slate-800 text-white rounded-2xl rounded-bl-sm'
                            : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm'
                      }`}>
                        {message.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className={`px-5 py-2 text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {typingUsers.length === 1
                ? 'Someone is typing...'
                : `${typingUsers.length} people are typing...`}
            </div>
          )}

          {/* Message Input */}
          <form
            onSubmit={handleSendMessage}
            className={`px-5 py-4 border-t ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}
          >
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                placeholder={`Message #${getRoomName(currentRoom)}...`}
                className={`flex-1 px-4 py-3 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark
                    ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-400'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />

              <button
                type="submit"
                disabled={!newMessage.trim() || sendingMessage}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                  newMessage.trim() && !sendingMessage
                    ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                    : isDark
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {sendingMessage ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className={`flex-1 flex items-center justify-center flex-col ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 text-4xl ${
            isDark ? 'bg-slate-800' : 'bg-gray-100'
          }`}>
            {String.fromCodePoint(0x1F4AC)}
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Welcome to Chat
          </h3>
          <p className="mb-4">
            {rooms.length > 0 ? 'Select a channel to start messaging' : 'Create a room to start chatting'}
          </p>
          {rooms.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors"
            >
              Create Chat Room
            </button>
          )}
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCreateModal(false)}
          />
          <div className={`relative rounded-xl p-6 w-full max-w-md mx-4 ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}>
            <h2 className={`text-lg font-semibold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Create Chat Room
            </h2>

            <form onSubmit={handleCreateRoom}>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Room Name *
                </label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g., General Discussion"
                  required
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark
                      ? 'bg-slate-900 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              <div className="mb-5">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Link to Project (optional)
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border text-sm outline-none cursor-pointer ${
                    isDark
                      ? 'bg-slate-900 border-slate-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">No project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                    isDark
                      ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newRoomName.trim() || creatingRoom}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    newRoomName.trim() && !creatingRoom
                      ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                      : isDark
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {creatingRoom ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
