import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
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
} from './chatSlice';
import { chatService } from '../services';
import type { ChatRoom, ChatMessage, CreateRoomData } from '../types';

// Fetch all rooms
function* handleFetchRooms() {
  try {
    const rooms: ChatRoom[] = yield call(chatService.getRooms);
    yield put(fetchRoomsSuccess(rooms));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch chat rooms';
    yield put(fetchRoomsFailure(message));
  }
}

// Fetch single room
function* handleFetchRoom(action: PayloadAction<string>) {
  try {
    const room: ChatRoom = yield call(chatService.getRoom, action.payload);
    yield put(fetchRoomSuccess(room));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch chat room';
    yield put(fetchRoomFailure(message));
  }
}

// Create room
function* handleCreateRoom(action: PayloadAction<CreateRoomData>) {
  try {
    const room: ChatRoom = yield call(chatService.createRoom, action.payload);
    yield put(createRoomSuccess(room));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create chat room';
    yield put(createRoomFailure(message));
  }
}

// Get or create direct chat
function* handleGetOrCreateDirectChat(action: PayloadAction<string>) {
  try {
    const room: ChatRoom = yield call(chatService.getOrCreateDirectChat, action.payload);
    yield put(getOrCreateDirectChatSuccess(room));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get direct chat';
    yield put(getOrCreateDirectChatFailure(message));
  }
}

// Fetch messages
function* handleFetchMessages(action: PayloadAction<{ roomId: string; page?: number; limit?: number }>) {
  try {
    const page = action.payload.page || 1;
    const result: { messages: ChatMessage[]; total: number } = yield call(
      chatService.getMessages,
      action.payload.roomId,
      { page, limit: action.payload.limit || 50 }
    );
    yield put(fetchMessagesSuccess({ ...result, page }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch messages';
    yield put(fetchMessagesFailure(message));
  }
}

// Send message
function* handleSendMessage(action: PayloadAction<{ roomId: string; content: string }>) {
  try {
    const message: ChatMessage = yield call(chatService.sendMessage, action.payload.roomId, action.payload.content);
    yield put(sendMessageSuccess(message));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send message';
    yield put(sendMessageFailure(message));
  }
}

// Delete message
function* handleDeleteMessage(action: PayloadAction<string>) {
  try {
    yield call(chatService.deleteMessage, action.payload);
    yield put(deleteMessageSuccess(action.payload));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete message';
    yield put(deleteMessageFailure(message));
  }
}

// Fetch unread count
function* handleFetchUnreadCount() {
  try {
    const count: number = yield call(chatService.getUnreadCount);
    yield put(fetchUnreadCountSuccess(count));
  } catch {
    // Silently fail for unread count
  }
}

// Root chat saga
export function* chatSaga() {
  yield takeLatest(fetchRoomsRequest.type, handleFetchRooms);
  yield takeLatest(fetchRoomRequest.type, handleFetchRoom);
  yield takeLatest(createRoomRequest.type, handleCreateRoom);
  yield takeLatest(getOrCreateDirectChatRequest.type, handleGetOrCreateDirectChat);
  yield takeLatest(fetchMessagesRequest.type, handleFetchMessages);
  yield takeEvery(sendMessageRequest.type, handleSendMessage);
  yield takeEvery(deleteMessageRequest.type, handleDeleteMessage);
  yield takeLatest(fetchUnreadCountRequest.type, handleFetchUnreadCount);
}
