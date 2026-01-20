'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getUser } from '@/lib/auth';
import { apiClient } from '@/lib/api';
import { getEquivalentPosisi } from '@/lib/access-control';

export default function ManagementDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadDashboardStats();
  }, [router]);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getDashboardStats();
      if (response.success) {
        setStats(response.data.counts);
        setRecentActivities(response.data.recentActivities || []);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load dashboard stats');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserName = () => {
    if (!user) return 'Management';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.name) return user.name;
    return 'Management';
  };

  // Calculate efficiency metrics
  const completionRate = stats?.totalActivities 
    ? ((stats.completedActivities / stats.totalActivities) * 100).toFixed(1)
    : '0';
  
  const activeRate = stats?.totalActivities
    ? ((stats.activeActivities / stats.totalActivities) * 100).toFixed(1)
    : '0';

  return (
    <ProtectedRoute allowedPosisi={["DEPT_HEAD", "MANAGEMENT"]} allowedRoles={['SUPERADMIN']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Executive Header */}
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-6 sm:p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                {user?.avatar && (
                  <div className="flex-shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name || 'Profile'}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                    Management Dashboard
                  </h1>
                  <p className="text-indigo-100 text-sm sm:text-base">
                    Welcome back, {getUserName()}! Here's your executive overview.
                  </p>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="text-right">
                  <p className="text-indigo-100 text-sm">Today</p>
                  <p className="text-2xl font-bold">{new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Key Performance Indicators (KPIs) */}
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Key Performance Indicators</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* Total Users */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-blue-100 rounded-lg p-3">
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Workforce</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                    <p className="text-xs text-gray-500 mt-2">Active personnel</p>
                  </div>

                  {/* Total Units */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-green-100 rounded-lg p-3">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">Fleet</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Units</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalUnits || 0}</p>
                    <p className="text-xs text-gray-500 mt-2">Fleet size</p>
                  </div>

                  {/* Total Activities */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-purple-100 rounded-lg p-3">
                        <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Operations</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Total Activities</h3>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalActivities || 0}</p>
                    <p className="text-xs text-gray-500 mt-2">All operations</p>
                  </div>

                  {/* Completion Rate */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-amber-100 rounded-lg p-3">
                        <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Efficiency</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 mb-1">Completion Rate</h3>
                    <p className="text-3xl font-bold text-gray-900">{completionRate}%</p>
                    <p className="text-xs text-gray-500 mt-2">{stats?.completedActivities || 0} completed</p>
                  </div>
                </div>
              </div>

              {/* Operational Status */}
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Operational Status</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  {/* Active Activities */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-white/20 rounded-lg p-3">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">In Progress</span>
                    </div>
                    <h3 className="text-sm font-medium text-blue-100 mb-2">Active Activities</h3>
                    <p className="text-4xl font-bold mb-1">{stats?.activeActivities || 0}</p>
                    <p className="text-xs text-blue-100">Currently running</p>
                    <div className="mt-4 bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white rounded-full h-2 transition-all duration-500"
                        style={{ width: `${activeRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Completed Activities */}
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-white/20 rounded-lg p-3">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">Success</span>
                    </div>
                    <h3 className="text-sm font-medium text-green-100 mb-2">Completed</h3>
                    <p className="text-4xl font-bold mb-1">{stats?.completedActivities || 0}</p>
                    <p className="text-xs text-green-100">Finished operations</p>
                    <div className="mt-4 bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white rounded-full h-2 transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Pending Activities */}
                  <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-white/20 rounded-lg p-3">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">Awaiting</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-100 mb-2">Pending</h3>
                    <p className="text-4xl font-bold mb-1">{stats?.pendingActivities || 0}</p>
                    <p className="text-xs text-gray-100">In queue</p>
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                {/* Total Work Times */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Total Work Hours</h3>
                    <div className="bg-yellow-100 rounded-lg p-2">
                      <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.totalWorkTimes || 0}</p>
                  <p className="text-sm text-gray-600">Total work time records logged</p>
                </div>

                {/* System Health */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                    <div className="bg-green-100 rounded-lg p-2">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <p className="text-3xl font-bold text-green-600 mb-2">Operational</p>
                      <p className="text-sm text-gray-600">All systems running</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              {recentActivities.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
                      <a
                        href="/planner/activities"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        View All →
                      </a>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                  </svg>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">
                                  {activity.unit?.unitCode || 'N/A'} - {activity.unit?.unitType || 'Unknown'}
                                </p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                  {activity.description || 'No description'}
                                </p>
                                {activity.mechanics && activity.mechanics.length > 0 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Assigned to: {activity.mechanics.map((m: any) => `${m.mechanic.firstName} ${m.mechanic.lastName}`).join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              activity.activityStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              activity.activityStatus === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                              activity.activityStatus === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {activity.activityStatus?.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <a
                    href="/planner/activities"
                    className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 hover:from-indigo-100 hover:to-blue-100 transition-all"
                  >
                    <svg className="h-6 w-6 text-indigo-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900">Activities</span>
                  </a>
                  <a
                    href="/planner/units"
                    className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 hover:from-green-100 hover:to-emerald-100 transition-all"
                  >
                    <svg className="h-6 w-6 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900">Units</span>
                  </a>
                  <a
                    href="/planner/reports"
                    className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 hover:from-purple-100 hover:to-pink-100 transition-all"
                  >
                    <svg className="h-6 w-6 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900">Reports</span>
                  </a>
                  <a
                    href="/superadmin/users"
                    className="flex items-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 hover:from-amber-100 hover:to-orange-100 transition-all"
                  >
                    <svg className="h-6 w-6 text-amber-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900">Users</span>
                  </a>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

