import { useState, useRef } from 'react';
import { TaskCard } from './TaskCard';
import type { BoardColumn, Task } from '@/lib/api';

interface KanbanColumnProps {
  column: BoardColumn;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskCreate: (title: string) => void;
  onColumnUpdate: (name: string) => void;
  onColumnDelete: () => void;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  onDrop: (order: number) => void;
  isDragOver: boolean;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  onTaskClick,
  onTaskCreate,
  onColumnUpdate,
  onColumnDelete,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragOver,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [columnName, setColumnName] = useState(column.name);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleColumnNameUpdate = () => {
    if (columnName.trim() && columnName !== column.name) {
      onColumnUpdate(columnName.trim());
    }
    setIsEditing(false);
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onTaskCreate(newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const order = tasks.length;
    onDrop(order);
  };

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  return (
    <div
      className={`flex-shrink-0 w-72 flex flex-col max-h-full ${
        isDragOver ? 'ring-2 ring-primary-500 ring-offset-2 rounded-lg' : ''
      }`}
    >
      {/* Column Header */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-t-lg px-3 py-2 flex items-center justify-between">
        {isEditing ? (
          <input
            type="text"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            onBlur={handleColumnNameUpdate}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleColumnNameUpdate();
              if (e.key === 'Escape') {
                setColumnName(column.name);
                setIsEditing(false);
              }
            }}
            className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            autoFocus
          />
        ) : (
          <h3
            className="text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer"
            onClick={() => setIsEditing(true)}
          >
            {column.name}
          </h3>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      onColumnDelete();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tasks Container */}
      <div
        ref={dropZoneRef}
        className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg p-2 space-y-2 overflow-y-auto min-h-[200px]"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {sortedTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            onDragStart={() => onDragStart(task)}
            onDragEnd={onDragEnd}
          />
        ))}

        {/* Add Task Input */}
        {isAddingTask ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm border border-gray-200 dark:border-gray-700">
            <textarea
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={2}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAddTask();
                }
                if (e.key === 'Escape') {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                }
              }}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddTask}
                className="flex-1 px-3 py-1.5 bg-primary-600 text-white rounded text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                }}
                className="flex-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingTask(true)}
            className="w-full p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Task</span>
          </button>
        )}
      </div>
    </div>
  );
};
