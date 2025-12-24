// Organization roles
export const OrganizationRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  MEMBER: 'MEMBER',
  GUEST: 'GUEST',
} as const;

export type OrganizationRole = (typeof OrganizationRole)[keyof typeof OrganizationRole];

export const ORG_ROLE_HIERARCHY: OrganizationRole[] = ['GUEST', 'MEMBER', 'MANAGER', 'ADMIN', 'OWNER'];

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
  role?: OrganizationRole;
  memberCount?: number;
  projectCount?: number;
}

export interface IOrganizationDetails extends IOrganization {
  members: IOrganizationMember[];
  settings?: IOrganizationSettings;
  userRole: OrganizationRole;
  _count: {
    projects: number;
    members: number;
  };
}

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
}

export interface IOrganizationSettings {
  id: string;
  organizationId: string;
  allowMemberInvites: boolean;
  defaultProjectRole: string;
  requireApprovalToJoin: boolean;
}

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

export interface ICreateOrganizationData {
  name: string;
  slug?: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
}

export interface IUpdateOrganizationData {
  name?: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
}

export interface IUpdateSettingsData {
  allowMemberInvites?: boolean;
  defaultProjectRole?: string;
  requireApprovalToJoin?: boolean;
}

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

// Helpers
export const hasMinOrgRole = (userRole: OrganizationRole | undefined, minRole: OrganizationRole): boolean => {
  if (!userRole) return false;
  return ORG_ROLE_HIERARCHY.indexOf(userRole) >= ORG_ROLE_HIERARCHY.indexOf(minRole);
};

export const getOrgMemberName = (member: IOrganizationMember): string => {
  const { firstName, lastName } = member.user;
  return `${firstName} ${lastName}`.trim() || member.user.email;
};

export const getOrgInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};
