import { RoleGate } from '@/components';
import { UserRole } from '@/types';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Admin Dashboard
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">156</p>
          <p className="text-xs text-green-600 mt-1">+12% from last month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Tasks</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">324</p>
          <p className="text-xs text-blue-600 mt-1">47 in progress</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Completed This Week</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">89</p>
          <p className="text-xs text-green-600 mt-1">+23% from last week</p>
        </div>

        <RoleGate roles={[UserRole.SUPER_ADMIN]}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">System Health</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">99.9%</p>
            <p className="text-xs text-gray-500 mt-1">All systems operational</p>
          </div>
        </RoleGate>
      </div>

      {/* Recent activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[
            { user: 'John Doe', action: 'completed task', item: 'Update homepage design', time: '5 min ago' },
            { user: 'Jane Smith', action: 'created task', item: 'Implement dark mode', time: '15 min ago' },
            { user: 'Bob Wilson', action: 'assigned task', item: 'Fix login bug', time: '1 hour ago' },
            { user: 'Alice Brown', action: 'updated task', item: 'API integration', time: '2 hours ago' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                  {activity.user.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">{activity.user}</span>{' '}
                  {activity.action}{' '}
                  <span className="font-medium">{activity.item}</span>
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
