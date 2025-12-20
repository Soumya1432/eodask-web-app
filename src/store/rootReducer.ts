import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import organizationReducer from './slices/organizationSlice';
import projectReducer from './slices/projectSlice';
import chatReducer from './slices/chatSlice';
import invitationReducer from './slices/invitationSlice';
import fileReducer from './slices/fileSlice';
import notificationReducer from './slices/notificationSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  theme: themeReducer,
  organization: organizationReducer,
  projects: projectReducer,
  chat: chatReducer,
  invitations: invitationReducer,
  files: fileReducer,
  notifications: notificationReducer,
});
