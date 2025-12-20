import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useOrganizationContext, OrgRoleGate } from '@/contexts/OrganizationContext';
import { useOrganizations } from '@/hooks/useOrganizations';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getOrgInitials } from '@/types';

export const OrganizationDashboardPage: React.FC = () => {
  const { organization } = useOrganizationContext();
  const { dashboardStats, isLoading, fetchDashboardStats } = useOrganizations();

  useEffect(() => {
    if (organization?.id) {
      fetchDashboardStats(organization.id);
    }
  }, [organization?.id, fetchDashboardStats]);

  if (!organization) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {organization.logo ? (
            <img
              src={organization.logo}
              alt={organization.name}
              className="w-16 h-16 rounded-xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
              {getOrgInitials(organization.name)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {organization.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {organization.description || 'Welcome to your organization dashboard'}
            </p>
          </div>
        </div>

        <OrgRoleGate minRole="ADMIN">
          <Link
            to={`/org/${organization.slug}/settings`}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Settings
          </Link>
        </OrgRoleGate>
      </div>

      {/* Stats Grid */}
      {isLoading && !dashboardStats ? (
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      ) : dashboardStats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Projects"
              value={dashboardStats.projectCount}
              icon="folder"
              color="blue"
            />
            <StatCard
              label="Team Members"
              value={dashboardStats.memberCount}
              icon="users"
              color="green"
            />
            <StatCard
              label="Total Tasks"
              value={dashboardStats.totalTasks}
              icon="tasks"
              color="purple"
            />
            <StatCard
              label="Completed"
              value={dashboardStats.completedTasks}
              icon="check"
              color="emerald"
              subtitle={
                dashboardStats.totalTasks > 0
                  ? `${Math.round((dashboardStats.completedTasks / dashboardStats.totalTasks) * 100)}%`
                  : '0%'
              }
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/org/${organization.slug}/projects/new`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + New Project
              </Link>
              <OrgRoleGate minRole="ADMIN">
                <Link
                  to={`/org/${organization.slug}/members`}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Invite Members
                </Link>
              </OrgRoleGate>
              <Link
                to={`/org/${organization.slug}/projects`}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                View All Projects
              </Link>
            </div>
          </div>

          {/* Recent Projects */}
          {dashboardStats.recentProjects.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Projects
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {dashboardStats.recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/org/${organization.slug}/projects/${project.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {project.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {project.key} &middot; {project._count.tasks} tasks
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {project.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {dashboardStats.recentActivity.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                {dashboardStats.recentActivity.map((activity) => (
                  <div key={activity.id} className="px-6 py-3 flex items-start space-x-3">
                    {activity.user.avatar ? (
                      <img
                        src={activity.user.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                        {activity.user.firstName[0]}
                        {activity.user.lastName[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">
                          {activity.user.firstName} {activity.user.lastName}
                        </span>{' '}
                        {activity.description}
                      </p>
                      {activity.task && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.task.project?.key}-{activity.task.taskNumber}: {activity.task.title}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, subtitle }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <span className="text-xl font-bold">{value > 99 ? '99+' : value}</span>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDashboardPage;
