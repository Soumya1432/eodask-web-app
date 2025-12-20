import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { rootReducer } from './rootReducer';
import { rootSaga } from './sagas';

// Create saga middleware
const sagaMiddleware = createSagaMiddleware();

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'files/uploadAttachmentRequest', 'files/uploadAvatarRequest'],
        ignoredActionPaths: ['payload.file'],
      },
    }).concat(sagaMiddleware),
  devTools: import.meta.env.DEV,
});

// Run saga middleware
sagaMiddleware.run(rootSaga);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Re-export slices - use namespaced imports to avoid conflicts
export * from './slices/authSlice';
export * from './slices/themeSlice';

// Export reducers
export { default as projectReducer } from './slices/projectSlice';
export { default as chatReducer } from './slices/chatSlice';
export { default as invitationReducer } from './slices/invitationSlice';
export { default as fileReducer } from './slices/fileSlice';
export { default as notificationReducer } from './slices/notificationSlice';

// Export project actions with prefix
export {
  fetchProjectsRequest,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  fetchProjectRequest,
  fetchProjectSuccess,
  fetchProjectFailure,
  createProjectRequest,
  createProjectSuccess,
  createProjectFailure,
  updateProjectRequest,
  updateProjectSuccess,
  updateProjectFailure,
  deleteProjectRequest,
  deleteProjectSuccess,
  deleteProjectFailure,
  fetchColumnsRequest,
  fetchColumnsSuccess,
  fetchColumnsFailure,
  createColumnRequest,
  createColumnSuccess,
  createColumnFailure,
  updateColumnRequest,
  updateColumnSuccess,
  updateColumnFailure,
  deleteColumnRequest,
  deleteColumnSuccess,
  deleteColumnFailure,
  fetchTasksRequest,
  fetchTasksSuccess,
  fetchTasksFailure,
  fetchTaskRequest,
  fetchTaskSuccess,
  fetchTaskFailure,
  createTaskRequest,
  createTaskSuccess,
  createTaskFailure,
  updateTaskRequest,
  updateTaskSuccess,
  updateTaskFailure,
  deleteTaskRequest,
  deleteTaskSuccess,
  deleteTaskFailure,
  moveTaskRequest,
  moveTaskSuccess,
  moveTaskFailure,
  fetchMembersRequest,
  fetchMembersSuccess,
  fetchMembersFailure,
  addMemberRequest,
  addMemberSuccess,
  addMemberFailure,
  removeMemberRequest,
  removeMemberSuccess,
  removeMemberFailure,
  setSelectedTask,
  clearCurrentProject,
  clearOperationError as clearProjectOperationError,
  taskCreated,
  taskUpdated,
  taskDeleted,
  taskMoved,
  fetchAllTasksRequest,
  fetchAllTasksAddBatch,
  fetchAllTasksComplete,
} from './slices/projectSlice';

// Export chat actions
export {
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
  clearOperationError as clearChatOperationError,
  messageReceived,
  messageDeleted,
  userStartedTyping,
  userStoppedTyping,
  messagesRead,
} from './slices/chatSlice';

// Export invitation actions
export {
  fetchInvitationRequest,
  fetchInvitationSuccess,
  fetchInvitationFailure,
  acceptInvitationRequest,
  acceptInvitationSuccess,
  acceptInvitationFailure,
  rejectInvitationRequest,
  rejectInvitationSuccess,
  rejectInvitationFailure,
  fetchProjectInvitationsRequest,
  fetchProjectInvitationsSuccess,
  fetchProjectInvitationsFailure,
  createInvitationRequest,
  createInvitationSuccess,
  createInvitationFailure,
  cancelInvitationRequest,
  cancelInvitationSuccess,
  cancelInvitationFailure,
  clearCurrentInvitation,
  clearOperationMessages,
} from './slices/invitationSlice';

// Export file actions
export {
  fetchAttachmentsRequest,
  fetchAttachmentsSuccess,
  fetchAttachmentsFailure,
  uploadAttachmentRequest,
  uploadAttachmentProgress,
  uploadAttachmentSuccess,
  uploadAttachmentFailure,
  deleteAttachmentRequest,
  deleteAttachmentSuccess,
  deleteAttachmentFailure,
  uploadAvatarRequest,
  uploadAvatarSuccess,
  uploadAvatarFailure,
  clearCompletedUploads,
  clearUpload,
  clearUploadError,
  clearDeleteError,
} from './slices/fileSlice';

// Export notification actions
export {
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
} from './slices/notificationSlice';
