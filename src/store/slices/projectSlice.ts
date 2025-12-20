import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Project, BoardColumn, Task, ProjectMember } from '@/lib/api';

interface ProjectState {
  // Projects list
  projects: Project[];
  projectsLoading: boolean;
  projectsError: string | null;

  // Current project
  currentProject: Project | null;
  currentProjectLoading: boolean;
  currentProjectError: string | null;

  // Board columns with tasks
  columns: BoardColumn[];
  columnsLoading: boolean;
  columnsError: string | null;

  // Tasks
  tasks: Task[];
  tasksLoading: boolean;
  tasksError: string | null;
  tasksTotal: number;

  // All tasks across projects (for My Tasks page)
  allTasks: Task[];
  allTasksLoading: boolean;

  // Selected task
  selectedTask: Task | null;
  selectedTaskLoading: boolean;

  // Members
  members: ProjectMember[];
  membersLoading: boolean;
  membersError: string | null;

  // Operation states
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  operationError: string | null;
}

const initialState: ProjectState = {
  projects: [],
  projectsLoading: false,
  projectsError: null,

  currentProject: null,
  currentProjectLoading: false,
  currentProjectError: null,

  columns: [],
  columnsLoading: false,
  columnsError: null,

  tasks: [],
  tasksLoading: false,
  tasksError: null,
  tasksTotal: 0,

  allTasks: [],
  allTasksLoading: false,

  selectedTask: null,
  selectedTaskLoading: false,

  members: [],
  membersLoading: false,
  membersError: null,

  creating: false,
  updating: false,
  deleting: false,
  operationError: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    // Fetch projects
    fetchProjectsRequest: (state) => {
      state.projectsLoading = true;
      state.projectsError = null;
    },
    fetchProjectsSuccess: (state, action: PayloadAction<Project[]>) => {
      state.projectsLoading = false;
      state.projects = action.payload;
    },
    fetchProjectsFailure: (state, action: PayloadAction<string>) => {
      state.projectsLoading = false;
      state.projectsError = action.payload;
    },

    // Fetch single project
    fetchProjectRequest: (state, _action: PayloadAction<string>) => {
      state.currentProjectLoading = true;
      state.currentProjectError = null;
    },
    fetchProjectSuccess: (state, action: PayloadAction<Project>) => {
      state.currentProjectLoading = false;
      state.currentProject = action.payload;
    },
    fetchProjectFailure: (state, action: PayloadAction<string>) => {
      state.currentProjectLoading = false;
      state.currentProjectError = action.payload;
    },

    // Create project
    createProjectRequest: (state, _action: PayloadAction<{ name: string; description?: string; color?: string; organizationId: string }>) => {
      state.creating = true;
      state.operationError = null;
    },
    createProjectSuccess: (state, action: PayloadAction<Project>) => {
      state.creating = false;
      state.projects.unshift(action.payload);
    },
    createProjectFailure: (state, action: PayloadAction<string>) => {
      state.creating = false;
      state.operationError = action.payload;
    },

    // Update project
    updateProjectRequest: (state, _action: PayloadAction<{ projectId: string; data: { name?: string; description?: string; color?: string; isArchived?: boolean } }>) => {
      state.updating = true;
      state.operationError = null;
    },
    updateProjectSuccess: (state, action: PayloadAction<Project>) => {
      state.updating = false;
      const index = state.projects.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
      if (state.currentProject?.id === action.payload.id) {
        state.currentProject = action.payload;
      }
    },
    updateProjectFailure: (state, action: PayloadAction<string>) => {
      state.updating = false;
      state.operationError = action.payload;
    },

    // Delete project
    deleteProjectRequest: (state, _action: PayloadAction<string>) => {
      state.deleting = true;
      state.operationError = null;
    },
    deleteProjectSuccess: (state, action: PayloadAction<string>) => {
      state.deleting = false;
      state.projects = state.projects.filter(p => p.id !== action.payload);
      if (state.currentProject?.id === action.payload) {
        state.currentProject = null;
      }
    },
    deleteProjectFailure: (state, action: PayloadAction<string>) => {
      state.deleting = false;
      state.operationError = action.payload;
    },

    // Fetch columns
    fetchColumnsRequest: (state, _action: PayloadAction<string>) => {
      state.columnsLoading = true;
      state.columnsError = null;
    },
    fetchColumnsSuccess: (state, action: PayloadAction<BoardColumn[]>) => {
      state.columnsLoading = false;
      // Populate column.tasks from existing tasks array if available
      state.columns = action.payload.map(column => ({
        ...column,
        tasks: state.tasks.filter(task => task.columnId === column.id),
      }));
    },
    fetchColumnsFailure: (state, action: PayloadAction<string>) => {
      state.columnsLoading = false;
      state.columnsError = action.payload;
    },

    // Create column
    createColumnRequest: (state, _action: PayloadAction<{ projectId: string; name: string; order?: number }>) => {
      state.creating = true;
      state.operationError = null;
    },
    createColumnSuccess: (state, action: PayloadAction<BoardColumn>) => {
      state.creating = false;
      // Ensure column has tasks array initialized
      state.columns.push({ ...action.payload, tasks: action.payload.tasks || [] });
    },
    createColumnFailure: (state, action: PayloadAction<string>) => {
      state.creating = false;
      state.operationError = action.payload;
    },

    // Update column
    updateColumnRequest: (state, _action: PayloadAction<{ projectId: string; columnId: string; data: { name?: string; order?: number } }>) => {
      state.updating = true;
      state.operationError = null;
    },
    updateColumnSuccess: (state, action: PayloadAction<BoardColumn>) => {
      state.updating = false;
      const index = state.columns.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.columns[index] = action.payload;
      }
    },
    updateColumnFailure: (state, action: PayloadAction<string>) => {
      state.updating = false;
      state.operationError = action.payload;
    },

    // Delete column
    deleteColumnRequest: (state, _action: PayloadAction<{ projectId: string; columnId: string }>) => {
      state.deleting = true;
      state.operationError = null;
    },
    deleteColumnSuccess: (state, action: PayloadAction<string>) => {
      state.deleting = false;
      state.columns = state.columns.filter(c => c.id !== action.payload);
    },
    deleteColumnFailure: (state, action: PayloadAction<string>) => {
      state.deleting = false;
      state.operationError = action.payload;
    },

    // Fetch tasks
    fetchTasksRequest: (state, _action: PayloadAction<{ projectId: string; params?: Record<string, unknown> }>) => {
      state.tasksLoading = true;
      state.tasksError = null;
    },
    fetchTasksSuccess: (state, action: PayloadAction<{ tasks: Task[]; total: number }>) => {
      state.tasksLoading = false;
      state.tasks = action.payload.tasks;
      state.tasksTotal = action.payload.total;
      // Populate column.tasks from the tasks array
      state.columns.forEach(column => {
        column.tasks = action.payload.tasks.filter(task => task.columnId === column.id);
      });
    },
    fetchTasksFailure: (state, action: PayloadAction<string>) => {
      state.tasksLoading = false;
      state.tasksError = action.payload;
    },

    // Fetch all tasks across projects (for My Tasks page)
    fetchAllTasksRequest: (state) => {
      state.allTasksLoading = true;
      state.allTasks = [];
    },
    fetchAllTasksAddBatch: (state, action: PayloadAction<Task[]>) => {
      // Accumulate tasks from multiple projects
      state.allTasks = [...state.allTasks, ...action.payload];
    },
    fetchAllTasksComplete: (state) => {
      state.allTasksLoading = false;
    },

    // Fetch single task
    fetchTaskRequest: (state, _action: PayloadAction<{ projectId: string; taskId: string }>) => {
      state.selectedTaskLoading = true;
    },
    fetchTaskSuccess: (state, action: PayloadAction<Task>) => {
      state.selectedTaskLoading = false;
      state.selectedTask = action.payload;
    },
    fetchTaskFailure: (state, _action: PayloadAction<string>) => {
      state.selectedTaskLoading = false;
    },

    // Create task
    createTaskRequest: (state, _action: PayloadAction<{ projectId: string; data: { title: string; columnId: string; description?: string; priority?: string; dueDate?: string; assigneeIds?: string[]; labels?: string[] } }>) => {
      state.creating = true;
      state.operationError = null;
    },
    createTaskSuccess: (state, action: PayloadAction<Task>) => {
      state.creating = false;
      state.tasks.unshift(action.payload);
      // Add task to column
      const column = state.columns.find(c => c.id === action.payload.columnId);
      if (column) {
        if (!column.tasks) column.tasks = [];
        column.tasks.push(action.payload);
      }
    },
    createTaskFailure: (state, action: PayloadAction<string>) => {
      state.creating = false;
      state.operationError = action.payload;
    },

    // Update task
    updateTaskRequest: (state, _action: PayloadAction<{ projectId: string; taskId: string; data: Record<string, unknown> }>) => {
      state.updating = true;
      state.operationError = null;
    },
    updateTaskSuccess: (state, action: PayloadAction<Task>) => {
      state.updating = false;
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      if (state.selectedTask?.id === action.payload.id) {
        state.selectedTask = action.payload;
      }
      // Update in columns
      state.columns.forEach(column => {
        if (column.tasks) {
          const taskIndex = column.tasks.findIndex(t => t.id === action.payload.id);
          if (taskIndex !== -1) {
            column.tasks[taskIndex] = action.payload;
          }
        }
      });
    },
    updateTaskFailure: (state, action: PayloadAction<string>) => {
      state.updating = false;
      state.operationError = action.payload;
    },

    // Delete task
    deleteTaskRequest: (state, _action: PayloadAction<{ projectId: string; taskId: string }>) => {
      state.deleting = true;
      state.operationError = null;
    },
    deleteTaskSuccess: (state, action: PayloadAction<string>) => {
      state.deleting = false;
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
      if (state.selectedTask?.id === action.payload) {
        state.selectedTask = null;
      }
      // Remove from columns
      state.columns.forEach(column => {
        if (column.tasks) {
          column.tasks = column.tasks.filter(t => t.id !== action.payload);
        }
      });
    },
    deleteTaskFailure: (state, action: PayloadAction<string>) => {
      state.deleting = false;
      state.operationError = action.payload;
    },

    // Move task
    moveTaskRequest: (state, _action: PayloadAction<{ projectId: string; taskId: string; columnId: string; order: number }>) => {
      state.updating = true;
    },
    moveTaskSuccess: (state, action: PayloadAction<Task>) => {
      state.updating = false;
      // Update task in tasks array
      const taskIndex = state.tasks.findIndex(t => t.id === action.payload.id);
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = action.payload;
      }
      // Move task between columns
      state.columns.forEach(column => {
        if (column.tasks) {
          column.tasks = column.tasks.filter(t => t.id !== action.payload.id);
        }
      });
      const targetColumn = state.columns.find(c => c.id === action.payload.columnId);
      if (targetColumn) {
        if (!targetColumn.tasks) targetColumn.tasks = [];
        targetColumn.tasks.push(action.payload);
        targetColumn.tasks.sort((a, b) => a.order - b.order);
      }
    },
    moveTaskFailure: (state, action: PayloadAction<string>) => {
      state.updating = false;
      state.operationError = action.payload;
    },

    // Fetch members
    fetchMembersRequest: (state, _action: PayloadAction<string>) => {
      state.membersLoading = true;
      state.membersError = null;
    },
    fetchMembersSuccess: (state, action: PayloadAction<ProjectMember[]>) => {
      state.membersLoading = false;
      state.members = action.payload;
    },
    fetchMembersFailure: (state, action: PayloadAction<string>) => {
      state.membersLoading = false;
      state.membersError = action.payload;
    },

    // Add member
    addMemberRequest: (state, _action: PayloadAction<{ projectId: string; email: string; role: string }>) => {
      state.creating = true;
      state.operationError = null;
    },
    addMemberSuccess: (state, action: PayloadAction<ProjectMember>) => {
      state.creating = false;
      state.members.push(action.payload);
    },
    addMemberFailure: (state, action: PayloadAction<string>) => {
      state.creating = false;
      state.operationError = action.payload;
    },

    // Remove member
    removeMemberRequest: (state, _action: PayloadAction<{ projectId: string; userId: string }>) => {
      state.deleting = true;
      state.operationError = null;
    },
    removeMemberSuccess: (state, action: PayloadAction<string>) => {
      state.deleting = false;
      state.members = state.members.filter(m => m.userId !== action.payload);
    },
    removeMemberFailure: (state, action: PayloadAction<string>) => {
      state.deleting = false;
      state.operationError = action.payload;
    },

    // Set selected task
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },

    // Clear current project
    clearCurrentProject: (state) => {
      state.currentProject = null;
      state.columns = [];
      state.tasks = [];
      state.members = [];
      state.selectedTask = null;
    },

    // Clear operation error
    clearOperationError: (state) => {
      state.operationError = null;
    },

    // Real-time updates
    taskCreated: (state, action: PayloadAction<Task>) => {
      if (!state.tasks.find(t => t.id === action.payload.id)) {
        state.tasks.unshift(action.payload);
      }
      const column = state.columns.find(c => c.id === action.payload.columnId);
      if (column && !column.tasks?.find(t => t.id === action.payload.id)) {
        if (!column.tasks) column.tasks = [];
        column.tasks.push(action.payload);
      }
    },
    taskUpdated: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      state.columns.forEach(column => {
        if (column.tasks) {
          const taskIndex = column.tasks.findIndex(t => t.id === action.payload.id);
          if (taskIndex !== -1) {
            column.tasks[taskIndex] = action.payload;
          }
        }
      });
    },
    taskDeleted: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
      state.columns.forEach(column => {
        if (column.tasks) {
          column.tasks = column.tasks.filter(t => t.id !== action.payload);
        }
      });
    },
    taskMoved: (state, action: PayloadAction<Task>) => {
      state.columns.forEach(column => {
        if (column.tasks) {
          column.tasks = column.tasks.filter(t => t.id !== action.payload.id);
        }
      });
      const targetColumn = state.columns.find(c => c.id === action.payload.columnId);
      if (targetColumn) {
        if (!targetColumn.tasks) targetColumn.tasks = [];
        targetColumn.tasks.push(action.payload);
        targetColumn.tasks.sort((a, b) => a.order - b.order);
      }
    },
  },
});

export const {
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
  clearOperationError,
  taskCreated,
  taskUpdated,
  taskDeleted,
  taskMoved,
  fetchAllTasksRequest,
  fetchAllTasksAddBatch,
  fetchAllTasksComplete,
} = projectSlice.actions;

export default projectSlice.reducer;
