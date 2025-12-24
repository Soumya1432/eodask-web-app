export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isArchived: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tasks: number;
    members: number;
  };
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER' | 'GUEST';
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

export interface BoardColumn {
  id: string;
  name: string;
  order: number;
  projectId: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
  dueDate?: string;
  order: number;
  columnId: string;
  projectId: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  assignees?: Array<{
    user: {
      id: string;
      firstName?: string;
      lastName?: string;
      name?: string;
      email: string;
      avatar?: string;
    };
  }>;
  labels?: string[];
  _count?: {
    comments: number;
    attachments: number;
  };
}

export interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
  organizationId: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  color?: string;
  isArchived?: boolean;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  columnId: string;
  assigneeIds?: string[];
  labels?: string[];
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status?: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
  dueDate?: string | null;
  columnId?: string;
  order?: number;
}

export interface ProjectState {
  projects: Project[];
  projectsLoading: boolean;
  projectsError: string | null;
  currentProject: Project | null;
  currentProjectLoading: boolean;
  currentProjectError: string | null;
  columns: BoardColumn[];
  columnsLoading: boolean;
  columnsError: string | null;
  tasks: Task[];
  tasksLoading: boolean;
  tasksError: string | null;
  tasksTotal: number;
  allTasks: Task[];
  allTasksLoading: boolean;
  selectedTask: Task | null;
  selectedTaskLoading: boolean;
  members: ProjectMember[];
  membersLoading: boolean;
  membersError: string | null;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  operationError: string | null;
}
