import { useMemo } from 'react';
import type { Task } from '@/lib/api';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const priorityLabels = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

// 24 hours in milliseconds
const DAY_MS = 24 * 60 * 60 * 1000;

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onClick,
  onDragStart,
  onDragEnd,
}) => {
  // Memoize date calculations to avoid impure Date.now() calls during render
  const { isOverdue, isDueSoon } = useMemo(() => {
    if (!task.dueDate) {
      return { isOverdue: false, isDueSoon: false };
    }
    const now = Date.now();
    const dueTime = new Date(task.dueDate).getTime();
    const overdue = dueTime < now;
    const dueSoon = !overdue && dueTime - now < DAY_MS;
    return { isOverdue: overdue, isDueSoon: dueSoon };
  }, [task.dueDate]);

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow group"
    >
      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.slice(0, 3).map((label, index) => (
            <span
              key={index}
              className="px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
            >
              {label}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Title */}
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {/* Priority */}
          <span className={`px-2 py-0.5 text-xs rounded ${priorityColors[task.priority]}`}>
            {priorityLabels[task.priority]}
          </span>

          {/* Due Date */}
          {task.dueDate && (
            <span
              className={`flex items-center gap-1 text-xs ${
                isOverdue
                  ? 'text-red-600 dark:text-red-400'
                  : isDueSoon
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* Right side indicators */}
        <div className="flex items-center gap-2">
          {/* Comments count */}
          {task._count?.comments && task._count.comments > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {task._count.comments}
            </span>
          )}

          {/* Attachments count */}
          {task._count?.attachments && task._count.attachments > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              {task._count.attachments}
            </span>
          )}

          {/* Assignees */}
          {task.assignees && task.assignees.length > 0 && (
            <div className="flex -space-x-2">
              {task.assignees.slice(0, 3).map((assignee) => (
                <div
                  key={assignee.user.id}
                  className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-800"
                  title={assignee.user.firstName ? `${assignee.user.firstName} ${assignee.user.lastName}` : assignee.user.name}
                >
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
              ))}
              {task.assignees.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 text-xs font-medium border-2 border-white dark:border-gray-800">
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
