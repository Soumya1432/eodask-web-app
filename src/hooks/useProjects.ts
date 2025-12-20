import { useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import {
  fetchProjectsRequest,
  fetchProjectRequest,
  createProjectRequest,
  updateProjectRequest,
  deleteProjectRequest,
  fetchColumnsRequest,
  createColumnRequest,
  updateColumnRequest,
  deleteColumnRequest,
  fetchTasksRequest,
  fetchTaskRequest,
  createTaskRequest,
  updateTaskRequest,
  deleteTaskRequest,
  moveTaskRequest,
  fetchMembersRequest,
  addMemberRequest,
  removeMemberRequest,
  setSelectedTask,
  clearCurrentProject,
  clearProjectOperationError,
  fetchAllTasksRequest,
  fetchAllTasksAddBatch,
  fetchAllTasksComplete,
} from '@/store';
import { projectService } from '@/services/projectService';
import type { Task } from '@/lib/api';

export const useProjects = () => {
  const dispatch = useAppDispatch();
  const {
    projects,
    projectsLoading,
    projectsError,
    currentProject,
    currentProjectLoading,
    currentProjectError,
    columns,
    columnsLoading,
    tasks,
    tasksLoading,
    tasksTotal,
    allTasks,
    allTasksLoading,
    selectedTask,
    selectedTaskLoading,
    members,
    membersLoading,
    creating,
    updating,
    deleting,
    operationError,
  } = useAppSelector((state) => state.projects);

  // Project actions
  const fetchProjects = useCallback(() => {
    dispatch(fetchProjectsRequest());
  }, [dispatch]);

  const fetchProject = useCallback((projectId: string) => {
    dispatch(fetchProjectRequest(projectId));
  }, [dispatch]);

  const createProject = useCallback((data: { name: string; description?: string; color?: string; organizationId: string }) => {
    dispatch(createProjectRequest(data));
  }, [dispatch]);

  const updateProject = useCallback((projectId: string, data: { name?: string; description?: string; color?: string; isArchived?: boolean }) => {
    dispatch(updateProjectRequest({ projectId, data }));
  }, [dispatch]);

  const deleteProject = useCallback((projectId: string) => {
    dispatch(deleteProjectRequest(projectId));
  }, [dispatch]);

  // Column actions
  const fetchColumns = useCallback((projectId: string) => {
    dispatch(fetchColumnsRequest(projectId));
  }, [dispatch]);

  const createColumn = useCallback((projectId: string, name: string, order?: number) => {
    dispatch(createColumnRequest({ projectId, name, order }));
  }, [dispatch]);

  const updateColumn = useCallback((projectId: string, columnId: string, data: { name?: string; order?: number }) => {
    dispatch(updateColumnRequest({ projectId, columnId, data }));
  }, [dispatch]);

  const deleteColumn = useCallback((projectId: string, columnId: string) => {
    dispatch(deleteColumnRequest({ projectId, columnId }));
  }, [dispatch]);

  // Task actions
  const fetchTasks = useCallback((projectId: string, params?: Record<string, unknown>) => {
    dispatch(fetchTasksRequest({ projectId, params }));
  }, [dispatch]);

  const fetchTask = useCallback((projectId: string, taskId: string) => {
    dispatch(fetchTaskRequest({ projectId, taskId }));
  }, [dispatch]);

  const createTask = useCallback((projectId: string, data: { title: string; columnId: string; description?: string; priority?: string; dueDate?: string; assigneeIds?: string[]; labels?: string[] }) => {
    dispatch(createTaskRequest({ projectId, data }));
  }, [dispatch]);

  const updateTask = useCallback((projectId: string, taskId: string, data: Record<string, unknown>) => {
    dispatch(updateTaskRequest({ projectId, taskId, data }));
  }, [dispatch]);

  const deleteTask = useCallback((projectId: string, taskId: string) => {
    dispatch(deleteTaskRequest({ projectId, taskId }));
  }, [dispatch]);

  const moveTask = useCallback((projectId: string, taskId: string, columnId: string, order: number) => {
    dispatch(moveTaskRequest({ projectId, taskId, columnId, order }));
  }, [dispatch]);

  const selectTask = useCallback((task: Task | null) => {
    dispatch(setSelectedTask(task));
  }, [dispatch]);

  // Fetch all tasks across all projects
  const fetchAllTasks = useCallback(async (projectIds: string[]) => {
    dispatch(fetchAllTasksRequest());
    try {
      for (const projectId of projectIds) {
        const result = await projectService.getTasks(projectId, {});
        dispatch(fetchAllTasksAddBatch(result.tasks));
      }
      dispatch(fetchAllTasksComplete());
    } catch {
      dispatch(fetchAllTasksComplete());
    }
  }, [dispatch]);

  // Member actions
  const fetchMembers = useCallback((projectId: string) => {
    dispatch(fetchMembersRequest(projectId));
  }, [dispatch]);

  const addMember = useCallback((projectId: string, email: string, role: string) => {
    dispatch(addMemberRequest({ projectId, email, role }));
  }, [dispatch]);

  const removeMember = useCallback((projectId: string, userId: string) => {
    dispatch(removeMemberRequest({ projectId, userId }));
  }, [dispatch]);

  // Clear actions
  const clearProject = useCallback(() => {
    dispatch(clearCurrentProject());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearProjectOperationError());
  }, [dispatch]);

  return {
    // State
    projects,
    projectsLoading,
    projectsError,
    currentProject,
    currentProjectLoading,
    currentProjectError,
    columns,
    columnsLoading,
    tasks,
    tasksLoading,
    tasksTotal,
    allTasks,
    allTasksLoading,
    selectedTask,
    selectedTaskLoading,
    members,
    membersLoading,
    creating,
    updating,
    deleting,
    operationError,

    // Project actions
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,

    // Column actions
    fetchColumns,
    createColumn,
    updateColumn,
    deleteColumn,

    // Task actions
    fetchTasks,
    fetchTask,
    fetchAllTasks,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    selectTask,

    // Member actions
    fetchMembers,
    addMember,
    removeMember,

    // Clear actions
    clearProject,
    clearError,
  };
};
