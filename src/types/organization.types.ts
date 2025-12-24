// Organization roles
export const OrganizationRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  MEMBER: 'MEMBER',
  GUEST: 'GUEST',
} as const;

export type OrganizationRole = (typeof OrganizationRole)[keyof typeof OrganizationRole];

// Organization role hierarchy (for permission checks)
export const ORG_ROLE_HIERARCHY: OrganizationRole[] = ['GUEST', 'MEMBER', 'MANAGER', 'ADMIN', 'OWNER'];

// Organization interface
export interface IOrganization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  role?: OrganizationRole; // Current user's role in this org
  userRole?: OrganizationRole; // Alternative field name for user's role
  memberCount?: number;
  projectCount?: number;
  _count?: {
    projects: number;
    members: number;
  };
}

// Organization with full details
export interface IOrganizationDetails extends IOrganization {
  members: IOrganizationMember[];
  settings?: IOrganizationSettings;
  userRole: OrganizationRole;
  _count: {
    projects: number;
    members: number;
  };
}

// Organization member
export interface IOrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  title?: string;
  department?: string;
  joinedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  // Included when accepting invitation
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
}

// Organization settings
export interface IOrganizationSettings {
  id: string;
  organizationId: string;
  allowMemberInvites: boolean;
  defaultProjectRole: string;
  requireApprovalToJoin: boolean;
}

// Organization invitation
export interface IOrganizationInvitation {
  id: string;
  email: string;
  organizationId: string;
  role: OrganizationRole;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  senderId: string;
  expiresAt: string;
  createdAt: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Create organization data
export interface ICreateOrganizationData {
  name: string;
  slug?: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
}

// Update organization data
export interface IUpdateOrganizationData {
  name?: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
}

// Update settings data
export interface IUpdateSettingsData {
  allowMemberInvites?: boolean;
  defaultProjectRole?: string;
  requireApprovalToJoin?: boolean;
}

// Dashboard stats
export interface IOrganizationDashboardStats {
  projectCount: number;
  memberCount: number;
  totalTasks: number;
  completedTasks: number;
  tasksByStatus: Record<string, number>;
  recentActivity: IActivityItem[];
  recentProjects: IRecentProject[];
}

export interface IActivityItem {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  task?: {
    id: string;
    title: string;
    taskNumber: number;
    project?: {
      key: string;
    };
  };
}

export interface IRecentProject {
  id: string;
  name: string;
  key: string;
  color: string;
  status: string;
  updatedAt: string;
  _count: {
    tasks: number;
    members: number;
  };
}

// Organization state for Redux
export interface IOrganizationState {
  organizations: IOrganization[];
  currentOrganization: IOrganizationDetails | null;
  members: IOrganizationMember[];
  invitations: IOrganizationInvitation[];
  dashboardStats: IOrganizationDashboardStats | null;
  isLoading: boolean;
  error: string | null;
  needsOrganization: boolean;
}

// Helper to check if user has minimum role level
export const hasMinOrgRole = (userRole: OrganizationRole | undefined, minRole: OrganizationRole): boolean => {
  if (!userRole) return false;
  return ORG_ROLE_HIERARCHY.indexOf(userRole) >= ORG_ROLE_HIERARCHY.indexOf(minRole);
};

// Helper to get user's display name
export const getOrgMemberName = (member: IOrganizationMember): string => {
  const { firstName, lastName } = member.user;
  return `${firstName} ${lastName}`.trim() || member.user.email;
};

// Helper to get organization initials for avatar fallback
export const getOrgInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};
