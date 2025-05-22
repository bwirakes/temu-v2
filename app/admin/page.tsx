import { Metadata } from 'next';
import AdminLayout from '@/components/admin/admin-layout';
import DashboardMetrics from '@/components/admin/dashboard-metrics';
import { getAllAdminMetrics } from '@/lib/data/admin';

export const metadata: Metadata = {
  title: 'Admin Dashboard | TEMU',
  description: 'Administrative dashboard for TEMU platform',
};

// Enable ISR with 5-minute revalidation interval
export const revalidate = 300;

export default async function AdminDashboard() {
  // Fetch initial data server-side
  const initialMetrics = await getAllAdminMetrics();

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-500">Welcome to the admin dashboard. Here&apos;s an overview of your platform&apos;s metrics.</p>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-700 mb-4">Key Metrics</h2>
          <DashboardMetrics initialData={initialMetrics} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Recent Activity</h2>
            <p className="text-gray-500 text-sm">This section will display recent activity logs.</p>
            <div className="mt-4 text-center py-8 border border-dashed border-gray-200 rounded-md">
              <p className="text-gray-400 text-sm">Activity logs coming soon</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm text-center transition-colors">
                Approve Jobs
              </button>
              <button className="p-4 bg-green-50 hover:bg-green-100 text-green-700 rounded-md text-sm text-center transition-colors">
                View Reports
              </button>
              <button className="p-4 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-md text-sm text-center transition-colors">
                Manage Users
              </button>
              <button className="p-4 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md text-sm text-center transition-colors">
                System Settings
              </button>
              <button className="p-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-sm text-center transition-colors">
                View Logs
              </button>
              <button className="p-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md text-sm text-center transition-colors">
                Backup Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 