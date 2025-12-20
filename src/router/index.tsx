import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout, AuthLayout, DashboardLayout } from '@/layouts';
import { ProtectedRoute } from '@/components';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import {
  HomePage,
  NotFoundPage,
  ForbiddenPage,
  LoginPage,
  RegisterPage,
  TasksPage,
  AdminDashboardPage,
  UsersPage,
  SettingsPage,
  ReportsPage,
  CreateOrganizationPage,
  OrganizationDashboardPage,
  OrganizationMembersPage,
  OrganizationSettingsPage,
  OrganizationSwitcherPage,
  InviteAcceptPage,
  ProjectsListPage,
  ProjectDetailPage,
  ProfilePage,
  AnalyticsPage,
  CalendarPage,
  ChatPage,
  FilesPage,
} from '@/pages';
import { ROUTES } from '@/constants';
import { Permission, UserRole } from '@/types';

// Wrapper component for organization-scoped routes
const OrgLayout: React.FC = () => {
  return (
    <OrganizationProvider>
      <DashboardLayout />
    </OrganizationProvider>
  );
};

export const router = createBrowserRouter([
  // Public routes with MainLayout
  {
    path: ROUTES.HOME,
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },

  // Auth routes
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTES.REGISTER,
        element: <RegisterPage />,
      },
    ],
  },

  // Onboarding routes (protected but no org context needed)
  {
    path: ROUTES.ONBOARDING_CREATE_ORG,
    element: (
      <ProtectedRoute>
        <CreateOrganizationPage />
      </ProtectedRoute>
    ),
  },

  // Organization switcher (protected)
  {
    path: ROUTES.ORGANIZATIONS,
    element: (
      <ProtectedRoute>
        <OrganizationSwitcherPage />
      </ProtectedRoute>
    ),
  },

  // Invitation acceptance page (protected)
  {
    path: ROUTES.INVITE_ACCEPT,
    element: (
      <ProtectedRoute>
        <InviteAcceptPage />
      </ProtectedRoute>
    ),
  },

  // Organization-scoped routes
  {
    path: '/org/:slug',
    element: (
      <ProtectedRoute>
        <OrgLayout />
      </ProtectedRoute>
    ),
    children: [
      // Redirect /org/:slug to dashboard
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      // Organization Dashboard
      {
        path: 'dashboard',
        element: <OrganizationDashboardPage />,
      },
      // Projects list
      {
        path: 'projects',
        element: <ProjectsListPage />,
      },
      // Project detail with Kanban board
      {
        path: 'projects/:projectId',
        element: <ProjectDetailPage />,
      },
      // My tasks
      {
        path: 'tasks',
        element: <TasksPage />,
      },
      // Members management
      {
        path: 'members',
        element: <OrganizationMembersPage />,
      },
      // Organization settings
      {
        path: 'settings',
        element: <OrganizationSettingsPage />,
      },
      // Invitations management
      {
        path: 'invitations',
        element: <OrganizationMembersPage />, // Temporary - can be merged with members
      },
      // Reports
      {
        path: 'reports',
        element: (
          <ProtectedRoute permissions={[Permission.VIEW_REPORTS]}>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      // Analytics
      {
        path: 'analytics',
        element: <AnalyticsPage />,
      },
      // Calendar
      {
        path: 'calendar',
        element: <CalendarPage />,
      },
      // Chat
      {
        path: 'chat',
        element: <ChatPage />,
      },
      // Profile
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      // Files
      {
        path: 'files',
        element: <FilesPage />,
      },
    ],
  },

  // Legacy dashboard routes (redirect to organization selector)
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <Navigate to={ROUTES.ORGANIZATIONS} replace />
      </ProtectedRoute>
    ),
  },

  // Legacy protected dashboard routes
  {
    element: (
      <ProtectedRoute permissions={[Permission.VIEW_DASHBOARD]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTES.TASKS,
        element: (
          <ProtectedRoute permissions={[Permission.READ_TASK]}>
            <TasksPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.ADMIN,
        element: (
          <ProtectedRoute roles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.ADMIN_USERS,
        element: (
          <ProtectedRoute
            roles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}
            permissions={[Permission.READ_USER]}
          >
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.ADMIN_SETTINGS,
        element: (
          <ProtectedRoute permissions={[Permission.VIEW_SETTINGS]}>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.ADMIN_REPORTS,
        element: (
          <ProtectedRoute permissions={[Permission.VIEW_REPORTS]}>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Error routes
  {
    path: ROUTES.FORBIDDEN,
    element: <ForbiddenPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
