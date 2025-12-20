import React, { useEffect, useState, useCallback } from 'react';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useProjects } from '@/hooks/useProjects';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import type { Task } from '@/lib/api';

interface TaskWithProject extends Task {
  projectName: string;
  projectColor: string;
}

const statusColors: Record<string, string> = {
  BACKLOG: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  TODO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  IN_REVIEW: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  DONE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const priorityColors: Record<string, string> = {
  LOW: 'text-gray-500 dark:text-gray-400',
  MEDIUM: 'text-yellow-500 dark:text-yellow-400',
  HIGH: 'text-orange-500 dark:text-orange-400',
  URGENT: 'text-red-500 dark:text-red-400',
};

const priorityIcons: Record<string, string> = {
  LOW: '○',
  MEDIUM: '◐',
  HIGH: '●',
  URGENT: '⚠',
};

export const TasksPage: React.FC = () => {
  const { organization } = useOrganizationContext();
  const {
    projects,
    allTasks,
    allTasksLoading,
    fetchProjects,
    fetchAllTasks,
    updateTask,
    deleteTask,
  } = useProjects();

  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'done'>('all');
  const [selectedTask, setSelectedTask] = useState<TaskWithProject | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Fetch projects on mount
  useEffect(() => {
    if (organization?.id) {
      fetchProjects();
    }
  }, [organization?.id, fetchProjects]);

  // Fetch tasks for all projects when projects load
  useEffect(() => {
    if (projects.length > 0) {
      // Fetch tasks from all projects
      const projectIds = projects.map(p => p.id);
      fetchAllTasks(projectIds);
    }
  }, [projects, fetchAllTasks]);

  // Combine tasks with project info
  const tasksWithProject: TaskWithProject[] = allTasks.map(task => {
    const project = projects.find(p => p.id === task.projectId);
    return {
      ...task,
      projectName: project?.name || 'Unknown',
      projectColor: project?.color || '#6366f1',
    };
  });

  // Filter tasks
  const filteredTasks = tasksWithProject.filter(task => {
    switch (filter) {
      case 'todo':
        return task.status === 'TODO' || task.status === 'BACKLOG';
      case 'in_progress':
        return task.status === 'IN_PROGRESS' || task.status === 'IN_REVIEW';
      case 'done':
        return task.status === 'DONE';
      default:
        return true;
    }
  });

  const handleStatusChange = useCallback((task: TaskWithProject, newStatus: string) => {
    updateTask(task.projectId, task.id, { status: newStatus });
  }, [updateTask]);

  const handleDeleteTask = useCallback((task: TaskWithProject) => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTask(task.projectId, task.id);
    }
  }, [deleteTask]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date() && dateString;
  };

  if (allTasksLoading && allTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} across all projects
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: 'All Tasks' },
          { key: 'todo', label: 'To Do' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'done', label: 'Done' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tasks Table */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'all' ? 'Create tasks in your projects to see them here' : 'No tasks match this filter'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTasks.map((task) => (
                <tr
                  key={task.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={task.status === 'DONE'}
                        onChange={() => handleStatusChange(task, task.status === 'DONE' ? 'TODO' : 'DONE')}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 mr-3"
                      />
                      <div>
                        <span className={`text-sm font-medium ${
                          task.status === 'DONE'
                            ? 'text-gray-400 dark:text-gray-500 line-through'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {task.title}
                        </span>
                        {task.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${task.projectColor}20`,
                        color: task.projectColor,
                      }}
                    >
                      {task.projectName}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      className={`px-2 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${statusColors[task.status] || statusColors.BACKLOG}`}
                    >
                      <option value="BACKLOG">Backlog</option>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="IN_REVIEW">In Review</option>
                      <option value="DONE">Done</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 text-sm font-medium ${priorityColors[task.priority] || priorityColors.MEDIUM}`}>
                      <span>{priorityIcons[task.priority] || '○'}</span>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${
                      isOverdue(task.dueDate)
                        ? 'text-red-600 dark:text-red-400 font-medium'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatDate(task.dueDate)}
                      {isOverdue(task.dueDate) && task.status !== 'DONE' && (
                        <span className="ml-1 text-xs">(Overdue)</span>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTaskModal(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task)}
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowTaskModal(false);
              setSelectedTask(null);
            }}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mb-2"
                    style={{
                      backgroundColor: `${selectedTask.projectColor}20`,
                      color: selectedTask.projectColor,
                    }}
                  >
                    {selectedTask.projectName}
                  </span>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedTask.title}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowTaskModal(false);
                    setSelectedTask(null);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedTask.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {selectedTask.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Status
                  </label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedTask.status]}`}>
                    {selectedTask.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Priority
                  </label>
                  <span className={`flex items-center gap-1 text-sm font-medium ${priorityColors[selectedTask.priority]}`}>
                    {priorityIcons[selectedTask.priority]} {selectedTask.priority}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Due Date
                  </label>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {formatDate(selectedTask.dueDate) || 'No due date'}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Created
                  </label>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {formatDate(selectedTask.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowTaskModal(false);
                    setSelectedTask(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    handleDeleteTask(selectedTask);
                    setShowTaskModal(false);
                    setSelectedTask(null);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
