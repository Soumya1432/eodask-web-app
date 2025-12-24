import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
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
} from './projectSlice';
import { projectService } from '../services';
import type { Project, BoardColumn, Task, ProjectMember } from '../types';

function* handleFetchProjects() {
  try {
    const projects: Project[] = yield call(projectService.getProjects);
    yield put(fetchProjectsSuccess(projects));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch projects';
    yield put(fetchProjectsFailure(message));
  }
}

function* handleFetchProject(action: PayloadAction<string>) {
  try {
    const project: Project = yield call(projectService.getProject, action.payload);
    yield put(fetchProjectSuccess(project));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch project';
    yield put(fetchProjectFailure(message));
  }
}

function* handleCreateProject(action: PayloadAction<{ name: string; description?: string; color?: string; organizationId: string }>) {
  try {
    const project: Project = yield call(projectService.createProject, action.payload);
    yield put(createProjectSuccess(project));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create project';
    yield put(createProjectFailure(message));
  }
}

function* handleUpdateProject(action: PayloadAction<{ projectId: string; data: { name?: string; description?: string; color?: string; isArchived?: boolean } }>) {
  try {
    const project: Project = yield call(projectService.updateProject, action.payload.projectId, action.payload.data);
    yield put(updateProjectSuccess(project));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update project';
    yield put(updateProjectFailure(message));
  }
}

function* handleDeleteProject(action: PayloadAction<string>) {
  try {
    yield call(projectService.deleteProject, action.payload);
    yield put(deleteProjectSuccess(action.payload));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete project';
    yield put(deleteProjectFailure(message));
  }
}

function* handleFetchColumns(action: PayloadAction<string>) {
  try {
    const columns: BoardColumn[] = yield call(projectService.getColumns, action.payload);
    yield put(fetchColumnsSuccess(columns));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch columns';
    yield put(fetchColumnsFailure(message));
  }
}

function* handleCreateColumn(action: PayloadAction<{ projectId: string; name: string; order?: number }>) {
  try {
    const column: BoardColumn = yield call(projectService.createColumn, action.payload.projectId, action.payload.name, action.payload.order);
    yield put(createColumnSuccess(column));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create column';
    yield put(createColumnFailure(message));
  }
}

function* handleUpdateColumn(action: PayloadAction<{ projectId: string; columnId: string; data: { name?: string; order?: number } }>) {
  try {
    const column: BoardColumn = yield call(projectService.updateColumn, action.payload.projectId, action.payload.columnId, action.payload.data);
    yield put(updateColumnSuccess(column));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update column';
    yield put(updateColumnFailure(message));
  }
}

function* handleDeleteColumn(action: PayloadAction<{ projectId: string; columnId: string }>) {
  try {
    yield call(projectService.deleteColumn, action.payload.projectId, action.payload.columnId);
    yield put(deleteColumnSuccess(action.payload.columnId));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete column';
    yield put(deleteColumnFailure(message));
  }
}

function* handleFetchTasks(action: PayloadAction<{ projectId: string; params?: Record<string, unknown> }>) {
  try {
    const result: { tasks: Task[]; total: number } = yield call(
      projectService.getTasks,
      action.payload.projectId,
      action.payload.params as Parameters<typeof projectService.getTasks>[1]
    );
    yield put(fetchTasksSuccess(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tasks';
    yield put(fetchTasksFailure(message));
  }
}

function* handleFetchTask(action: PayloadAction<{ projectId: string; taskId: string }>) {
  try {
    const task: Task = yield call(projectService.getTask, action.payload.projectId, action.payload.taskId);
    yield put(fetchTaskSuccess(task));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch task';
    yield put(fetchTaskFailure(message));
  }
}

function* handleCreateTask(action: PayloadAction<{ projectId: string; data: { title: string; columnId: string; description?: string; priority?: string; dueDate?: string; assigneeIds?: string[]; labels?: string[] } }>) {
  try {
    const task: Task = yield call(
      projectService.createTask,
      action.payload.projectId,
      action.payload.data as Parameters<typeof projectService.createTask>[1]
    );
    yield put(createTaskSuccess(task));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create task';
    yield put(createTaskFailure(message));
  }
}

function* handleUpdateTask(action: PayloadAction<{ projectId: string; taskId: string; data: Record<string, unknown> }>) {
  try {
    const task: Task = yield call(
      projectService.updateTask,
      action.payload.projectId,
      action.payload.taskId,
      action.payload.data as Parameters<typeof projectService.updateTask>[2]
    );
    yield put(updateTaskSuccess(task));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update task';
    yield put(updateTaskFailure(message));
  }
}

function* handleDeleteTask(action: PayloadAction<{ projectId: string; taskId: string }>) {
  try {
    yield call(projectService.deleteTask, action.payload.projectId, action.payload.taskId);
    yield put(deleteTaskSuccess(action.payload.taskId));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete task';
    yield put(deleteTaskFailure(message));
  }
}

function* handleMoveTask(action: PayloadAction<{ projectId: string; taskId: string; columnId: string; order: number }>) {
  try {
    const task: Task = yield call(
      projectService.moveTask,
      action.payload.projectId,
      action.payload.taskId,
      action.payload.columnId,
      action.payload.order
    );
    yield put(moveTaskSuccess(task));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to move task';
    yield put(moveTaskFailure(message));
  }
}

function* handleFetchMembers(action: PayloadAction<string>) {
  try {
    const members: ProjectMember[] = yield call(projectService.getMembers, action.payload);
    yield put(fetchMembersSuccess(members));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch members';
    yield put(fetchMembersFailure(message));
  }
}

function* handleAddMember(action: PayloadAction<{ projectId: string; email: string; role: string }>) {
  try {
    yield call(projectService.addMember, action.payload.projectId, action.payload.email, action.payload.role);
    const members: ProjectMember[] = yield call(projectService.getMembers, action.payload.projectId);
    const newMember = members.find(m => m.user.email === action.payload.email);
    if (newMember) {
      yield put(addMemberSuccess(newMember));
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add member';
    yield put(addMemberFailure(message));
  }
}

function* handleRemoveMember(action: PayloadAction<{ projectId: string; userId: string }>) {
  try {
    yield call(projectService.removeMember, action.payload.projectId, action.payload.userId);
    yield put(removeMemberSuccess(action.payload.userId));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to remove member';
    yield put(removeMemberFailure(message));
  }
}

export function* projectSaga() {
  yield takeLatest(fetchProjectsRequest.type, handleFetchProjects);
  yield takeLatest(fetchProjectRequest.type, handleFetchProject);
  yield takeLatest(createProjectRequest.type, handleCreateProject);
  yield takeLatest(updateProjectRequest.type, handleUpdateProject);
  yield takeLatest(deleteProjectRequest.type, handleDeleteProject);
  yield takeLatest(fetchColumnsRequest.type, handleFetchColumns);
  yield takeEvery(createColumnRequest.type, handleCreateColumn);
  yield takeEvery(updateColumnRequest.type, handleUpdateColumn);
  yield takeEvery(deleteColumnRequest.type, handleDeleteColumn);
  yield takeLatest(fetchTasksRequest.type, handleFetchTasks);
  yield takeLatest(fetchTaskRequest.type, handleFetchTask);
  yield takeEvery(createTaskRequest.type, handleCreateTask);
  yield takeEvery(updateTaskRequest.type, handleUpdateTask);
  yield takeEvery(deleteTaskRequest.type, handleDeleteTask);
  yield takeEvery(moveTaskRequest.type, handleMoveTask);
  yield takeLatest(fetchMembersRequest.type, handleFetchMembers);
  yield takeEvery(addMemberRequest.type, handleAddMember);
  yield takeEvery(removeMemberRequest.type, handleRemoveMember);
}
