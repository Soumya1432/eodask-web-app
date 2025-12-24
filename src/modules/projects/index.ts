// Public API for projects module

// Types
export * from './types';

// Services
export { projectService, projectsApi } from './services';

// Store
export { projectReducer, projectSaga } from './store';
export * from './store/projectSlice';

// Hooks
export * from './hooks';

// Pages
export { CalendarPage, ProjectsListPage, ProjectDetailPage, TasksPage } from './pages';
