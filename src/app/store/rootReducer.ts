import { combineReducers } from '@reduxjs/toolkit';

// Module reducers
import { authReducer } from '@/modules/auth';
import { projectReducer } from '@/modules/projects';
import { organizationReducer } from '@/modules/organization';
import { chatReducer } from '@/modules/chat';
import { notificationReducer } from '@/modules/notifications';
import { fileReducer } from '@/modules/files';
import { invitationReducer } from '@/modules/invitations';

// Shared reducers
import { themeReducer } from '@/shared/store';

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

export type RootState = ReturnType<typeof rootReducer>;
