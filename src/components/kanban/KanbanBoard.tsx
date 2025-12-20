import { useState, useCallback } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { TaskModal } from './TaskModal';
import type { BoardColumn, Task } from '@/lib/api';

interface KanbanBoardProps {
  columns: BoardColumn[];
  projectId: string;
  onTaskMove: (taskId: string, columnId: string, order: number) => void;
  onTaskCreate: (columnId: string, title: string) => void;
  onTaskUpdate: (taskId: string, data: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  onColumnCreate: (name: string) => void;
  onColumnUpdate: (columnId: string, name: string) => void;
  onColumnDelete: (columnId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  projectId,
  onTaskMove,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  onColumnCreate,
  onColumnUpdate,
  onColumnDelete,
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handleDragStart = useCallback((task: Task) => {
    setDraggedTask(task);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
  }, []);

  const handleDrop = useCallback(
    (columnId: string, order: number) => {
      if (draggedTask) {
        onTaskMove(draggedTask.id, columnId, order);
        setDraggedTask(null);
      }
    },
    [draggedTask, onTaskMove]
  );

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      onColumnCreate(newColumnName.trim());
      setNewColumnName('');
      setIsAddingColumn(false);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  // Create a copy before sorting to avoid mutating Redux state
  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  return (
    <div className="h-full">
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {sortedColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={column.tasks || []}
              onTaskClick={handleTaskClick}
              onTaskCreate={(title) => onTaskCreate(column.id, title)}
              onColumnUpdate={(name) => onColumnUpdate(column.id, name)}
              onColumnDelete={() => onColumnDelete(column.id)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={(order) => handleDrop(column.id, order)}
              isDragOver={draggedTask !== null && draggedTask.columnId !== column.id}
            />
          ))}

        {/* Add Column */}
        <div className="flex-shrink-0 w-72">
          {isAddingColumn ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Enter column name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddColumn();
                  if (e.key === 'Escape') {
                    setIsAddingColumn(false);
                    setNewColumnName('');
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddColumn}
                  className="flex-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingColumn(false);
                    setNewColumnName('');
                  }}
                  className="flex-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="w-full p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Column</span>
            </button>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          projectId={projectId}
          onClose={() => setSelectedTask(null)}
          onUpdate={(data) => {
            onTaskUpdate(selectedTask.id, data);
          }}
          onDelete={() => {
            onTaskDelete(selectedTask.id);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};
