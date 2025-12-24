import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useProjects } from '../hooks';
import { projectService } from '../services';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/common/Button';
import type { Task } from '@/lib/api';

type TabType = 'board' | 'list' | 'chat' | 'members' | 'settings';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { organization } = useOrganizationContext();
  const [activeTab, setActiveTab] = useState<TabType>('board');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');

  const {
    currentProject,
    currentProjectLoading,
    currentProjectError,
    columns,
    columnsLoading,
    members,
    membersLoading,
    fetchProject,
    fetchColumns,
    fetchTasks,
    fetchMembers,
    createColumn,
    updateColumn,
    deleteColumn,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    clearProject,
  } = useProjects();

  // Fetch project data on mount
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      fetchColumns(projectId);
      fetchTasks(projectId, {});
      fetchMembers(projectId);
    }

    return () => {
      clearProject();
    };
  }, [projectId, fetchProject, fetchColumns, fetchTasks, fetchMembers, clearProject]);

  // Event handlers for Kanban board
  const handleTaskMove = useCallback(
    (taskId: string, columnId: string, order: number) => {
      if (projectId) {
        moveTask(projectId, taskId, columnId, order);
      }
    },
    [projectId, moveTask]
  );

  const handleTaskCreate = useCallback(
    (columnId: string, title: string) => {
      if (projectId) {
        createTask(projectId, { title, columnId });
      }
    },
    [projectId, createTask]
  );

  const handleTaskUpdate = useCallback(
    (taskId: string, data: Partial<Task>) => {
      if (projectId) {
        updateTask(projectId, taskId, data);
      }
    },
    [projectId, updateTask]
  );

  const handleTaskDelete = useCallback(
    (taskId: string) => {
      if (projectId) {
        deleteTask(projectId, taskId);
      }
    },
    [projectId, deleteTask]
  );

  const handleColumnCreate = useCallback(
    (name: string) => {
      if (projectId) {
        createColumn(projectId, name);
      }
    },
    [projectId, createColumn]
  );

  const handleColumnUpdate = useCallback(
    (columnId: string, name: string) => {
      if (projectId) {
        updateColumn(projectId, columnId, { name });
      }
    },
    [projectId, updateColumn]
  );

  const handleColumnDelete = useCallback(
    (columnId: string) => {
      if (projectId) {
        deleteColumn(projectId, columnId);
      }
    },
    [projectId, deleteColumn]
  );

  const handleAddMember = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (projectId && memberEmail.trim()) {
        try {
          const result = await projectService.addMember(projectId, memberEmail.trim(), 'MEMBER');
          toast.success(result.message || 'Member added successfully');
          setMemberEmail('');
          setShowMemberModal(false);
          fetchMembers(projectId);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Failed to add member');
        }
      }
    },
    [projectId, memberEmail, fetchMembers]
  );

  const handleRemoveMember = useCallback(
    async (userId: string) => {
      if (projectId && confirm('Are you sure you want to remove this member?')) {
        try {
          await projectService.removeMember(projectId, userId);
          toast.success('Member removed successfully');
          fetchMembers(projectId);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Failed to remove member');
        }
      }
    },
    [projectId, fetchMembers]
  );

  if (currentProjectLoading && !currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (currentProjectError) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Project
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{currentProjectError}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Project Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The project you're looking for doesn't exist or you don't have access.
          </p>
          {organization && (
            <Link to={`/org/${organization.slug}/projects`}>
              <Button>Back to Projects</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Project Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {organization && (
              <Link
                to={`/org/${organization.slug}/projects`}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            )}
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: currentProject.color || '#3b82f6' }}
              />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentProject.name}
              </h1>
              {currentProject.isArchived && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                  Archived
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Members preview */}
            <div className="flex items-center mr-4">
              <div className="flex -space-x-2">
                {members.slice(0, 4).map((member) => (
                  <div
                    key={member.id}
                    className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium border-2 border-white dark:border-gray-800"
                    title={`${member.user.firstName} ${member.user.lastName}`}
                  >
                    {member.user.avatar ? (
                      <img
                        src={member.user.avatar}
                        alt={`${member.user.firstName} ${member.user.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      (member.user.firstName || '?').charAt(0).toUpperCase()
                    )}
                  </div>
                ))}
                {members.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 text-xs font-medium border-2 border-white dark:border-gray-800">
                    +{members.length - 4}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowMemberModal(true)}
                className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Add member"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </button>
            </div>

            <Button variant="secondary" size="sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              Filter
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {[
            { id: 'board' as TabType, label: 'Board', icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' },
            { id: 'list' as TabType, label: 'List', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
            { id: 'chat' as TabType, label: 'Chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
            { id: 'members' as TabType, label: 'Members', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
            { id: 'settings' as TabType, label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        {activeTab === 'board' && (
          <div className="h-full p-4">
            {columnsLoading && columns.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <KanbanBoard
                columns={columns}
                projectId={projectId!}
                onTaskMove={handleTaskMove}
                onTaskCreate={handleTaskCreate}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
                onColumnCreate={handleColumnCreate}
                onColumnUpdate={handleColumnUpdate}
                onColumnDelete={handleColumnDelete}
              />
            )}
          </div>
        )}

        {activeTab === 'list' && (
          <div className="p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Tasks</h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {columns.flatMap((col) => col.tasks || []).length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No tasks yet. Create your first task on the Board tab.
                  </div>
                ) : (
                  columns.flatMap((col) =>
                    (col.tasks || []).map((task) => (
                      <div
                        key={task.id}
                        className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                              {col.name}
                            </span>
                            <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                task.priority === 'URGENT'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                  : task.priority === 'HIGH'
                                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                  : task.priority === 'MEDIUM'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {task.priority}
                            </span>
                            {task.dueDate && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-full flex flex-col bg-white dark:bg-gray-800">
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Project Chat
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Discuss {currentProject.name} with your team
                </p>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Project Discussion
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                    Start a conversation with your team about this project. All project members can see messages here.
                  </p>
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Button>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Project Members</h2>
                <Button size="sm" onClick={() => setShowMemberModal(true)}>
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Member
                </Button>
              </div>
              {membersLoading && members.length === 0 ? (
                <div className="p-8 flex justify-center">
                  <LoadingSpinner size="md" />
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {members.map((member) => (
                    <div key={member.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                          {member.user.avatar ? (
                            <img
                              src={member.user.avatar}
                              alt={`${member.user.firstName} ${member.user.lastName}`}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            (member.user.firstName || '?').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{member.user.firstName} {member.user.lastName}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{member.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">
                          {member.role}
                        </span>
                        {member.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleRemoveMember(member.userId)}
                            className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Remove member"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6 max-w-2xl">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Project Settings</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    defaultValue={currentProject.name}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    defaultValue={currentProject.description || ''}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                  <button className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    Delete Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMemberModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label
                  htmlFor="memberEmail"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="memberEmail"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="member@example.com"
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowMemberModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
