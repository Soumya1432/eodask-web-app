import { PermissionGate } from '@/components';
import { Permission } from '@/types';
import { Button } from '@/components';

export const ReportsPage: React.FC = () => {
  const reports = [
    { id: 1, name: 'Weekly Task Summary', type: 'Tasks', date: '2024-01-15', status: 'ready' },
    { id: 2, name: 'User Activity Report', type: 'Users', date: '2024-01-14', status: 'ready' },
    { id: 3, name: 'Performance Metrics', type: 'Analytics', date: '2024-01-13', status: 'processing' },
    { id: 4, name: 'Monthly Overview', type: 'Summary', date: '2024-01-01', status: 'ready' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reports
        </h1>
        <PermissionGate permissions={Permission.EXPORT_REPORTS}>
          <Button>Generate New Report</Button>
        </PermissionGate>
      </div>

      {/* Quick stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Reports Generated</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">47</p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Data Points Analyzed</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">12.4K</p>
          <p className="text-xs text-green-600 mt-1">+18% from last month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Downloads</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">89</p>
          <p className="text-xs text-gray-500 mt-1">Total exports</p>
        </div>
      </div>

      {/* Reports list */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Reports
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Report Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {reports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {report.name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {report.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {report.date}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    report.status === 'ready'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3">
                    View
                  </button>
                  <PermissionGate permissions={Permission.EXPORT_REPORTS}>
                    <button
                      className={`text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 ${
                        report.status !== 'ready' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={report.status !== 'ready'}
                    >
                      Download
                    </button>
                  </PermissionGate>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
