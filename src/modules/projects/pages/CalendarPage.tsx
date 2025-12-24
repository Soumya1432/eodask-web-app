import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useTheme } from '@/hooks';
import { useProjects } from '../hooks';
import { LoadingSpinner } from '@/shared/components/ui';

interface CalendarTask {
  id: string;
  title: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: string;
  projectId: string;
  projectName: string;
  projectColor: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: CalendarTask[];
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const priorityColors: Record<string, string> = {
  LOW: 'bg-green-500',
  MEDIUM: 'bg-amber-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500',
};

export const CalendarPage: React.FC = () => {
  const { organization } = useOrganizationContext();
  const { projects, fetchProjects, allTasks, allTasksLoading, fetchAllTasks } = useProjects();
  const { isDark } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');

  // Fetch projects on mount
  useEffect(() => {
    if (organization?.id) {
      fetchProjects();
    }
  }, [organization?.id, fetchProjects]);

  // Fetch all tasks from all projects
  useEffect(() => {
    if (projects.length > 0) {
      const projectIds = projects.map(p => p.id);
      fetchAllTasks(projectIds);
    }
  }, [projects, fetchAllTasks]);

  // Combine all tasks with project info
  const calendarTasks = useMemo((): CalendarTask[] => {
    const taskList: CalendarTask[] = [];

    allTasks.forEach(task => {
      if (task.dueDate) {
        const project = projects.find(p => p.id === task.projectId);
        taskList.push({
          id: task.id,
          title: task.title,
          dueDate: task.dueDate,
          priority: task.priority,
          status: task.status,
          projectId: task.projectId,
          projectName: project?.name || 'Unknown',
          projectColor: project?.color || '#6366f1',
        });
      }
    });

    return taskList;
  }, [projects, allTasks]);

  // Get tasks for a specific date
  const getTasksForDate = useCallback((date: Date): CalendarTask[] => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarTasks.filter(task => {
      const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  }, [calendarTasks]);

  // Generate calendar days for the current month view
  const calendarDays = useMemo((): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const current = new Date(startDate);
    while (current <= endDate) {
      const date = new Date(current);
      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        tasks: getTasksForDate(date),
      });
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate, getTasksForDate]);

  // Generate week days for week view
  const weekDays = useMemo((): CalendarDay[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const days: CalendarDay[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      days.push({
        date,
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
        isToday: date.getTime() === today.getTime(),
        tasks: getTasksForDate(date),
      });
    }

    return days;
  }, [currentDate, getTasksForDate]);

  const navigatePrevious = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (view === 'month') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setDate(newDate.getDate() - 7);
      }
      return newDate;
    });
  };

  const navigateNext = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (view === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get upcoming tasks
  const upcomingTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return calendarTasks
      .filter(task => new Date(task.dueDate) >= today)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 10);
  }, [calendarTasks]);

  // Get overdue tasks
  const overdueTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return calendarTasks
      .filter(task => new Date(task.dueDate) < today && task.status !== 'DONE')
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [calendarTasks]);

  const displayDays = view === 'month' ? calendarDays : weekDays;

  if (allTasksLoading && calendarTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Calendar
          </h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            View and manage your task deadlines across all projects
          </p>
        </div>

        <div className="flex gap-3">
          {/* View Toggle */}
          <div className={`flex rounded-lg p-1 ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`}>
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                view === 'month'
                  ? 'bg-indigo-500 text-white'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                view === 'week'
                  ? 'bg-indigo-500 text-white'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
          </div>

          <button
            onClick={goToToday}
            className={`px-5 py-2 rounded-lg border text-sm font-medium transition-all ${
              isDark
                ? 'bg-slate-800 border-slate-600 text-white hover:bg-slate-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Calendar Grid */}
        <div className={`rounded-xl p-5 border ${
          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          {/* Month/Week Navigation */}
          <div className="flex justify-between items-center mb-5">
            <button
              onClick={navigatePrevious}
              className={`w-9 h-9 rounded-lg border flex items-center justify-center text-lg transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-600 text-white hover:bg-slate-700'
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              ‹
            </button>

            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {view === 'month'
                ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                : `Week of ${weekDays[0]?.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              }
            </h2>

            <button
              onClick={navigateNext}
              className={`w-9 h-9 rounded-lg border flex items-center justify-center text-lg transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-600 text-white hover:bg-slate-700'
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              ›
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map(day => (
              <div
                key={day}
                className={`p-2 text-center text-xs font-semibold uppercase ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {displayDays.map((day, index) => (
              <div
                key={index}
                onClick={() => setSelectedDate(day.date)}
                className={`p-2 rounded-lg cursor-pointer transition-all border ${
                  view === 'month' ? 'min-h-[100px]' : 'min-h-[200px]'
                } ${
                  day.isToday
                    ? isDark
                      ? 'bg-indigo-500/20 border-indigo-500'
                      : 'bg-indigo-50 border-indigo-400'
                    : selectedDate?.getTime() === day.date.getTime()
                    ? isDark
                      ? 'bg-indigo-500/10 border-indigo-500'
                      : 'bg-indigo-50/50 border-indigo-300'
                    : isDark
                      ? 'bg-slate-900 border-transparent hover:border-slate-600'
                      : 'bg-gray-50 border-transparent hover:border-gray-300'
                } ${day.isCurrentMonth ? 'opacity-100' : 'opacity-40'}`}
              >
                <div className={`text-sm mb-1 ${
                  day.isToday
                    ? 'font-bold text-indigo-500'
                    : isDark ? 'text-white font-medium' : 'text-gray-900 font-medium'
                }`}>
                  {day.date.getDate()}
                </div>

                {/* Task indicators */}
                <div className="flex flex-col gap-0.5">
                  {day.tasks.slice(0, view === 'month' ? 3 : 6).map(task => (
                    <div
                      key={task.id}
                      style={{ backgroundColor: task.projectColor }}
                      className="px-1.5 py-0.5 rounded text-[11px] text-white whitespace-nowrap overflow-hidden text-ellipsis"
                      title={`${task.title} - ${task.projectName}`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {day.tasks.length > (view === 'month' ? 3 : 6) && (
                    <div className={`text-[11px] pl-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      +{day.tasks.length - (view === 'month' ? 3 : 6)} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Selected Date Tasks */}
          {selectedDate && (
            <div className={`rounded-xl p-4 border ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'
            }`}>
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>

              {getTasksForDate(selectedDate).length === 0 ? (
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                  No tasks due on this date
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {getTasksForDate(selectedDate).map(task => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-lg ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}
                      style={{ borderLeft: `3px solid ${task.projectColor}` }}
                    >
                      <div className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {task.title}
                      </div>
                      <div className={`text-xs flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        <span>{task.projectName}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] text-white font-semibold ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div className={`rounded-xl p-4 border border-red-600 ${
              isDark ? 'bg-slate-800' : 'bg-white shadow-sm'
            }`}>
              <h3 className="text-sm font-semibold mb-3 text-red-500 flex items-center gap-2">
                <span className="text-base">!</span>
                Overdue Tasks ({overdueTasks.length})
              </h3>

              <div className="flex flex-col gap-2">
                {overdueTasks.slice(0, 5).map(task => (
                  <div
                    key={task.id}
                    className={`p-2.5 rounded-lg ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}
                  >
                    <div className={`text-[13px] font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {task.title}
                    </div>
                    <div className="text-[11px] text-red-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Tasks */}
          <div className={`rounded-xl p-4 border ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Upcoming Tasks
            </h3>

            {upcomingTasks.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                No upcoming tasks
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {upcomingTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-2.5 rounded-lg ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}
                    style={{ borderLeft: `3px solid ${task.projectColor}` }}
                  >
                    <div className={`text-[13px] font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {task.title}
                    </div>
                    <div className={`text-[11px] flex justify-between ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      <span>{task.projectName}</span>
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className={`rounded-xl p-4 border ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Priority Legend
            </h3>

            <div className="flex flex-col gap-2">
              {Object.entries(priorityColors).map(([priority, colorClass]) => (
                <div key={priority} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${colorClass}`} />
                  <span className={`text-[13px] ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    {priority.charAt(0) + priority.slice(1).toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
