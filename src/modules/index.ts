// Re-export all modules
// Each module has its own public API defined in its index.ts
// Using named imports to avoid export conflicts between modules

// Auth module
export * from './auth';

// Projects module - export specific items to avoid conflicts with organization
export {
  ProjectsListPage,
  ProjectDetailPage,
  TasksPage,
  CalendarPage,
  projectService,
  projectsApi,
  projectReducer,
  projectSaga,
} from './projects';

// Notifications module
export * from './notifications';

// Organization module - export specific items to avoid conflicts
export {
  organizationsApi,
  organizationReducer,
  organizationSaga,
} from './organization';

// Chat module - export specific items to avoid conflicts
export {
  ChatPage,
  useChat,
  chatApi,
  chatService,
  chatReducer,
  chatSaga,
} from './chat';

// Files module
export * from './files';

// Analytics module
export * from './analytics';
