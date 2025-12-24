import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth, usePermissions } from '@/hooks';
import { useOrganizations } from '@/hooks/useOrganizations';
import { ThemeToggle } from '@/components';
import { ROUTES, getOrgRoute } from '@/constants';
import { Permission, UserRole, getOrgInitials, OrganizationRole } from '@/types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  permissions?: Permission[];
  roles?: UserRole[];
  orgRoles?: OrganizationRole[];
  minOrgRole?: OrganizationRole;
}

// SVG Icons as components
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ProjectsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const TasksIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const MembersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ReportsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const InviteIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const SwitchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const FilesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// Role hierarchy for checking minimum role
const ORG_ROLE_HIERARCHY: OrganizationRole[] = ['GUEST', 'MEMBER', 'MANAGER', 'ADMIN', 'OWNER'];

const hasMinOrgRole = (userRole: OrganizationRole | null, minRole: OrganizationRole): boolean => {
  if (!userRole) return false;
  const userRoleIndex = ORG_ROLE_HIERARCHY.indexOf(userRole);
  const minRoleIndex = ORG_ROLE_HIERARCHY.indexOf(minRole);
  return userRoleIndex >= minRoleIndex;
};

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { user, logout } = useAuth();
  const { role, hasAnyPermission, hasAnyRole } = usePermissions();
  const { currentOrganization, organizations } = useOrganizations();

  // Check if we're in org context
  const isOrgContext = !!slug && !!currentOrganization;

  // Generate org-scoped nav items
  const getOrgNavItems = (): NavItem[] => {
    if (!slug) return [];

    return [
      {
        label: 'Dashboard',
        path: getOrgRoute(ROUTES.ORG_DASHBOARD, slug),
        icon: <DashboardIcon />,
      },
      {
        label: 'Projects',
        path: getOrgRoute(ROUTES.ORG_PROJECTS, slug),
        icon: <ProjectsIcon />,
      },
      {
        label: 'My Tasks',
        path: getOrgRoute(ROUTES.ORG_TASKS, slug),
        icon: <TasksIcon />,
      },
      {
        label: 'Calendar',
        path: `/org/${slug}/calendar`,
        icon: <CalendarIcon />,
      },
      {
        label: 'Files',
        path: `/org/${slug}/files`,
        icon: <FilesIcon />,
      },
      {
        label: 'Chat',
        path: `/org/${slug}/chat`,
        icon: <ChatIcon />,
        minOrgRole: 'MEMBER' as OrganizationRole,
      },
      {
        label: 'Members',
        path: getOrgRoute(ROUTES.ORG_MEMBERS, slug),
        icon: <MembersIcon />,
        minOrgRole: 'MEMBER' as OrganizationRole,
      },
      {
        label: 'Analytics',
        path: `/org/${slug}/analytics`,
        icon: <AnalyticsIcon />,
        minOrgRole: 'MANAGER' as OrganizationRole,
      },
      {
        label: 'Reports',
        path: getOrgRoute(ROUTES.ORG_REPORTS, slug),
        icon: <ReportsIcon />,
        minOrgRole: 'MANAGER' as OrganizationRole,
      },
      {
        label: 'Invitations',
        path: getOrgRoute(ROUTES.ORG_INVITATIONS, slug),
        icon: <InviteIcon />,
        minOrgRole: 'ADMIN' as OrganizationRole,
      },
      {
        label: 'Settings',
        path: getOrgRoute(ROUTES.ORG_SETTINGS, slug),
        icon: <SettingsIcon />,
        minOrgRole: 'ADMIN' as OrganizationRole,
      },
    ];
  };

  // Legacy nav items for non-org routes
  const legacyNavItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: ROUTES.DASHBOARD,
      icon: <DashboardIcon />,
      permissions: [Permission.VIEW_DASHBOARD],
    },
    {
      label: 'Tasks',
      path: ROUTES.TASKS,
      icon: <TasksIcon />,
      permissions: [Permission.READ_TASK],
    },
    {
      label: 'Reports',
      path: ROUTES.ADMIN_REPORTS,
      icon: <ReportsIcon />,
      permissions: [Permission.VIEW_REPORTS],
    },
    {
      label: 'Users',
      path: ROUTES.ADMIN_USERS,
      icon: <MembersIcon />,
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    },
    {
      label: 'Settings',
      path: ROUTES.ADMIN_SETTINGS,
      icon: <SettingsIcon />,
      permissions: [Permission.VIEW_SETTINGS],
    },
  ];

  const navItems = isOrgContext ? getOrgNavItems() : legacyNavItems;

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const canAccessNavItem = (item: NavItem) => {
    // Check org role requirements
    if (item.minOrgRole && currentOrganization) {
      if (!hasMinOrgRole(currentOrganization.userRole, item.minOrgRole)) {
        return false;
      }
    }
    if (item.orgRoles && currentOrganization) {
      if (!item.orgRoles.includes(currentOrganization.userRole as OrganizationRole)) {
        return false;
      }
    }
    // Check legacy permission/role requirements
    if (item.permissions && !hasAnyPermission(item.permissions)) return false;
    if (item.roles && !hasAnyRole(item.roles)) return false;
    return true;
  };

  const handleSwitchOrg = (orgSlug: string) => {
    setOrgDropdownOpen(false);
    navigate(getOrgRoute(ROUTES.ORG_DASHBOARD, orgSlug));
  };

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 bg-white dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-200
          flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static
        `}
      >
        {/* Organization Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {isOrgContext && currentOrganization ? (
            <div className="relative flex-1">
              <button
                onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                className="flex items-center space-x-3 w-full hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-1 -ml-1 transition-colors"
              >
                {currentOrganization.logo ? (
                  <img
                    src={currentOrganization.logo}
                    alt={currentOrganization.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {getOrgInitials(currentOrganization.name)}
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {currentOrganization.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {currentOrganization.userRole?.toLowerCase()}
                  </p>
                </div>
                <ChevronDownIcon />
              </button>

              {/* Organization Dropdown */}
              {orgDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setOrgDropdownOpen(false)}
                  />
                  <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-2">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Switch Organization
                    </div>
                    {organizations.map((org) => (
                      <button
                        key={org.id}
                        onClick={() => handleSwitchOrg(org.slug)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          org.slug === slug ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        {org.logo ? (
                          <img
                            src={org.logo}
                            alt={org.name}
                            className="w-6 h-6 rounded object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            {getOrgInitials(org.name)}
                          </div>
                        )}
                        <span className="text-sm text-gray-900 dark:text-white truncate">
                          {org.name}
                        </span>
                        {org.slug === slug && (
                          <svg className="w-4 h-4 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                      <Link
                        to={ROUTES.ORGANIZATIONS}
                        onClick={() => setOrgDropdownOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <SwitchIcon />
                        <span>All Organizations</span>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to={ROUTES.ORGANIZATIONS}
              className="text-xl font-bold text-primary-600 dark:text-primary-400"
            >
              eodask
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ml-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(
            (item) =>
              canAccessNavItem(item) && (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-colors text-sm font-medium
                    ${
                      isActiveRoute(item.path)
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <span className="text-gray-500 dark:text-gray-400">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
          )}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            to={slug ? `/org/${slug}/profile` : '/profile'}
            className="flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
              <span className="text-primary-600 dark:text-primary-400 font-medium">
                {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {role}
              </p>
            </div>
            <ProfileIcon />
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Breadcrumb or page title could go here */}
          <div className="hidden lg:block" />

          {/* Right side */}
          <div className="flex items-center gap-4 ml-auto">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
