import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput, FormTextarea, FormSelect, Button } from '@/components';
import type { Task } from '@/lib/api';

interface TaskModalProps {
  task: Task;
  projectId: string;
  onClose: () => void;
  onUpdate: (data: Partial<Task>) => void;
  onDelete: () => void;
}

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']),
  dueDate: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

const priorityOptions = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const statusOptions = [
  { value: 'BACKLOG', label: 'Backlog' },
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'DONE', label: 'Done' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    },
  });

  const onSubmit = (data: TaskFormData) => {
    onUpdate({
      ...data,
      dueDate: data.dueDate || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative inline-block w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Task Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormInput
                  id="title"
                  label="Title"
                  error={errors.title?.message}
                  {...register('title')}
                />

                <FormTextarea
                  id="description"
                  label="Description"
                  rows={4}
                  error={errors.description?.message}
                  {...register('description')}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormSelect
                    id="priority"
                    label="Priority"
                    options={priorityOptions}
                    error={errors.priority?.message}
                    {...register('priority')}
                  />

                  <FormSelect
                    id="status"
                    label="Status"
                    options={statusOptions}
                    error={errors.status?.message}
                    {...register('status')}
                  />
                </div>

                <FormInput
                  id="dueDate"
                  type="date"
                  label="Due Date"
                  error={errors.dueDate?.message}
                  {...register('dueDate')}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!isDirty}>
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {task.title}
                  </h3>
                  {task.description ? (
                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                      {task.description}
                    </p>
                  ) : (
                    <p className="text-gray-400 dark:text-gray-500 italic">
                      No description provided
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Priority
                    </span>
                    <p className="mt-1 text-gray-900 dark:text-white capitalize">
                      {task.priority.toLowerCase()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </span>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {statusOptions.find((s) => s.value === task.status)?.label}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Due Date
                    </span>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Created
                    </span>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Assignees */}
                {task.assignees && task.assignees.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">
                      Assignees
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {task.assignees.map((assignee) => (
                        <div
                          key={assignee.user.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-medium">
                            {assignee.user.avatar ? (
                              <img
                                src={assignee.user.avatar}
                                alt={assignee.user.firstName ? `${assignee.user.firstName} ${assignee.user.lastName}` : assignee.user.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              (assignee.user.firstName || assignee.user.name || '?').charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-200">
                            {assignee.user.firstName ? `${assignee.user.firstName} ${assignee.user.lastName}` : assignee.user.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!isEditing && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
              >
                Delete Task
              </button>
              <Button onClick={() => setIsEditing(true)}>Edit Task</Button>
            </div>
          )}

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 bg-white dark:bg-gray-800 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                  <svg
                    className="h-6 w-6 text-red-600 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Delete Task
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this task? This action cannot be undone.
                </p>
                <div className="flex justify-center gap-3">
                  <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </Button>
                  <button
                    onClick={onDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
