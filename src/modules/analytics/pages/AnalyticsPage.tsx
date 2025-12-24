import React, { useState, useEffect, useCallback } from 'react';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useSocket, useTheme } from '@/hooks';
import { LoadingSpinner } from '@/shared/components/ui';
import { analyticsService } from '../services';
import type { OrganizationAnalytics } from '../types';
import toast from 'react-hot-toast';

// Simple stat card component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  isDark: boolean;
}> = ({ title, value, change, changeType = 'neutral', icon, isDark }) => (
  <div className={`rounded-xl shadow-sm border p-6 ${
    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
  }`}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{title}</p>
        <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        {change && (
          <p
            className={`text-sm mt-2 ${
              changeType === 'positive'
                ? 'text-green-500'
                : changeType === 'negative'
                ? 'text-red-500'
                : isDark ? 'text-slate-400' : 'text-gray-600'
            }`}
          >
            {change}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
        {icon}
      </div>
    </div>
  </div>
);

// Simple bar for chart visualization
const ProgressBar: React.FC<{
  label: string;
  value: number;
  total: number;
  color: string;
  isDark: boolean;
}> = ({ label, value, total, color, isDark }) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-1">
      <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>{label}</span>
      <span className={isDark ? 'text-slate-400' : 'text-gray-500'}>{value}</span>
    </div>
    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${total > 0 ? (value / total) * 100 : 0}%`,
          backgroundColor: color,
        }}
      />
    </div>
  </div>
);

// Weekly trend mini chart
const TrendChart: React.FC<{
  data: Array<{ week: string; created: number; completed: number }>;
  isDark: boolean;
}> = ({ data, isDark }) => {
  const maxValue = Math.max(...data.flatMap(d => [d.created, d.completed]), 1);

  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-1">
          <div className="flex gap-0.5 items-end h-16">
            <div
              className="w-2 bg-indigo-500 rounded-t transition-all duration-500"
              style={{ height: `${(item.created / maxValue) * 100}%` }}
              title={`Created: ${item.created}`}
            />
            <div
              className="w-2 bg-green-500 rounded-t transition-all duration-500"
              style={{ height: `${(item.completed / maxValue) * 100}%` }}
              title={`Completed: ${item.completed}`}
            />
          </div>
          <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
            {item.week.split(' ')[0]}
          </span>
        </div>
      ))}
    </div>
  );
};

export const AnalyticsPage: React.FC = () => {
  const { organization } = useOrganizationContext();
  const { isDark } = useTheme();
  const { on, joinOrganization, leaveOrganization } = useSocket();

  const [analytics, setAnalytics] = useState<OrganizationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    if (!organization?.id) return;

    try {
      const data = await analyticsService.getOrganizationAnalytics(organization.id);
      setAnalytics(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load analytics';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [organization?.id]);

  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Join organization room for real-time updates
  useEffect(() => {
    if (!organization?.id) return;

    joinOrganization(organization.id);

    return () => {
      leaveOrganization(organization.id);
    };
  }, [organization?.id, joinOrganization, leaveOrganization]);

  // Listen for real-time analytics updates
  useEffect(() => {
    const unsubscribeRefresh = on('analytics:refresh', () => {
      fetchAnalytics();
    });

    const unsubscribeUpdated = on('analytics:updated', (data: unknown) => {
      setAnalytics(data as OrganizationAnalytics);
      setLastUpdated(new Date());
    });

    const unsubscribeStatUpdated = on('analytics:stat_updated', ((...args: unknown[]) => {
      const data = args[0] as { metric: string; value: unknown };
      setAnalytics(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          overview: {
            ...prev.overview,
            [data.metric]: data.value,
          },
        };
      });
      setLastUpdated(new Date());
    }) as (...args: unknown[]) => void);

    // Also listen for task events to trigger analytics refresh
    const unsubscribeTaskCreated = on('task:created', () => {
      fetchAnalytics();
    });

    const unsubscribeTaskUpdated = on('task:updated', () => {
      fetchAnalytics();
    });

    const unsubscribeTaskDeleted = on('task:deleted', () => {
      fetchAnalytics();
    });

    return () => {
      unsubscribeRefresh();
      unsubscribeUpdated();
      unsubscribeStatUpdated();
      unsubscribeTaskCreated();
      unsubscribeTaskUpdated();
      unsubscribeTaskDeleted();
    };
  }, [on, fetchAnalytics]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className={`p-6 text-center ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
        <p>{error || 'No analytics data available'}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const { overview, tasksByStatus, tasksByPriority, recentActivity, performance, projectStats, weeklyTrend } = analytics;
  const totalTasks = tasksByStatus.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className={`p-6 min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Analytics</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Overview of {organization?.name || 'your organization'}'s performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchAnalytics}
            className={`p-2 rounded-lg border transition-colors ${
              isDark
                ? 'border-slate-600 text-slate-400 hover:text-white hover:border-slate-500'
                : 'border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400'
            }`}
            title="Refresh analytics"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Projects"
          value={overview.totalProjects}
          change={`${overview.activeProjects} active`}
          changeType="neutral"
          isDark={isDark}
          icon={
            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Total Tasks"
          value={overview.totalTasks}
          change={`${overview.totalTasks > 0 ? Math.round((overview.completedTasks / overview.totalTasks) * 100) : 0}% completed`}
          changeType="positive"
          isDark={isDark}
          icon={
            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
        <StatCard
          title="Team Members"
          value={overview.totalMembers}
          change="Across all projects"
          changeType="neutral"
          isDark={isDark}
          icon={
            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatCard
          title="Tasks This Week"
          value={overview.tasksThisWeek}
          change={overview.weeklyChange >= 0 ? `+${overview.weeklyChange}% from last week` : `${overview.weeklyChange}% from last week`}
          changeType={overview.weeklyChange >= 0 ? 'positive' : 'negative'}
          isDark={isDark}
          icon={
            <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tasks by Status */}
        <div className={`rounded-xl shadow-sm border p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Tasks by Status</h3>
          {tasksByStatus.length > 0 ? (
            tasksByStatus.map((item) => (
              <ProgressBar key={item.status} label={item.status.replace('_', ' ')} value={item.count} total={totalTasks} color={item.color} isDark={isDark} />
            ))
          ) : (
            <p className={isDark ? 'text-slate-500' : 'text-gray-500'}>No task data available</p>
          )}
        </div>

        {/* Tasks by Priority */}
        <div className={`rounded-xl shadow-sm border p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Tasks by Priority</h3>
          {tasksByPriority.length > 0 ? (
            tasksByPriority.map((item) => (
              <ProgressBar key={item.priority} label={item.priority} value={item.count} total={totalTasks} color={item.color} isDark={isDark} />
            ))
          ) : (
            <p className={isDark ? 'text-slate-500' : 'text-gray-500'}>No priority data available</p>
          )}
        </div>
      </div>

      {/* Weekly Trend */}
      {weeklyTrend.length > 0 && (
        <div className={`rounded-xl shadow-sm border p-6 mb-8 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Weekly Trend</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-indigo-500" />
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Created</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Completed</span>
              </div>
            </div>
          </div>
          <TrendChart data={weeklyTrend} isDark={isDark} />
        </div>
      )}

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className={`lg:col-span-2 rounded-xl shadow-sm border p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {activity.user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <span className="font-medium">{activity.user.name}</span>{' '}
                      <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>{activity.description}</span>
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className={isDark ? 'text-slate-500' : 'text-gray-500'}>No recent activity</p>
            )}
          </div>
        </div>

        {/* Performance */}
        <div className={`rounded-xl shadow-sm border p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Performance</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>Completion Rate</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {performance.completionRate}%
                </span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${performance.completionRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>On-time Delivery</span>
                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {performance.onTimeDeliveryRate}%
                </span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${performance.onTimeDeliveryRate}%` }}
                />
              </div>
            </div>

            <div className={`pt-4 border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
              <p className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Avg. Completion Time</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {performance.avgCompletionTime} days
              </p>
            </div>

            {performance.overdueTasksCount > 0 && (
              <div className={`pt-4 border-t ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-red-500 text-lg">!</span>
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    {performance.overdueTasksCount} overdue tasks
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Stats */}
      {projectStats.length > 0 && (
        <div className={`mt-8 rounded-xl shadow-sm border p-6 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Project Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectStats.map((project) => (
              <div
                key={project.id}
                className={`p-4 rounded-lg border ${isDark ? 'border-slate-700' : 'border-gray-200'}`}
                style={{ borderLeftColor: project.color, borderLeftWidth: '4px' }}
              >
                <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{project.name}</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{project.taskCount}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Tasks</p>
                  </div>
                  <div>
                    <p className={`text-lg font-semibold text-green-500`}>{project.completedCount}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Done</p>
                  </div>
                  <div>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{project.memberCount}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Members</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
