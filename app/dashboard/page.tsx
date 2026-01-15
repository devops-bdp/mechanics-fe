'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getUser } from '@/lib/auth';
import { apiClient } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    workTimes: 0,
    activities: 0,
    activeActivities: 0,
    totalPopulation: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadStats();
  }, [router]);

  const [activities, setActivities] = useState<any[]>([]);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const [completedActivities, setCompletedActivities] = useState(0);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const currentUser = getUser();
      
      if (currentUser?.posisi === 'MEKANIK') {
        const activitiesRes = await apiClient.getMyActivities();
        
        const activitiesData = activitiesRes.data || [];
        const activeActivities = activitiesData.filter((a: any) => a.status === 'IN_PROGRESS' || a.status === 'PAUSED').length || 0;
        const completed = activitiesData.filter((a: any) => a.status === 'COMPLETED').length || 0;
        
        // Calculate total work time from tasks of all activities
        // Work Time = sum of all tasks from all activities for this mechanic
        const calculateTaskTime = (task: { startedAt: string | null; stoppedAt: string | null }): number => {
          if (!task.startedAt) return 0;
          const start = new Date(task.startedAt);
          const end = task.stoppedAt ? new Date(task.stoppedAt) : new Date();
          const diffMs = end.getTime() - start.getTime();
          return Math.floor(diffMs / 60000); // Convert to minutes
        };
        
        // Sum all task times from all activities
        const totalWT = activitiesData.reduce((total: number, activity: any) => {
          if (activity.tasks && activity.tasks.length > 0) {
            const activityTaskTime = activity.tasks.reduce((sum: number, task: any) => {
              return sum + calculateTaskTime(task);
            }, 0);
            return total + activityTaskTime;
          }
          return total;
        }, 0);
        
        // Count total tasks across all activities
        const totalTasks = activitiesData.reduce((count: number, activity: any) => {
          return count + (activity.tasks?.length || 0);
        }, 0);
        
        setStats({
          workTimes: totalTasks, // Total number of tasks across all activities
          activities: activitiesData.length || 0,
          activeActivities: activeActivities,
          totalPopulation: 0, // Not applicable for mechanics
        });
        setActivities(activitiesData.slice(0, 5)); // Show latest 5 activities
        setTotalWorkTime(totalWT); // Total time in minutes from all tasks
        setCompletedActivities(completed);
      } else if (currentUser?.posisi === 'PLANNER' || currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPERADMIN') {
        const [activitiesRes, unitsRes] = await Promise.all([
          apiClient.getAllActivities(),
          apiClient.getUnits({ limit: 1, page: 1 })
        ]);
        setStats({
          workTimes: 0,
          activities: activitiesRes.data?.length || 0,
          activeActivities: activitiesRes.data?.filter((a: any) => a.status === 'IN_PROGRESS' || a.status === 'PAUSED').length || 0,
          totalPopulation: unitsRes.pagination?.totalCount || 0,
        });
      } else if (currentUser?.posisi === 'GROUP_LEADER_MEKANIK' || currentUser?.posisi === 'GROUP_LEADER_TYRE') {
        const [activitiesRes, unitsRes] = await Promise.all([
          apiClient.getGroupLeaderActivities(),
          apiClient.getUnits({ limit: 1, page: 1 })
        ]);
        setStats({
          workTimes: 0,
          activities: activitiesRes.data?.length || 0,
          activeActivities: activitiesRes.data?.filter((a: any) => a.activityStatus === 'IN_PROGRESS' || a.activityStatus === 'PAUSED').length || 0,
          totalPopulation: unitsRes.pagination?.totalCount || 0,
        });
        setActivities(activitiesRes.data?.slice(0, 5) || []);
      } else if (currentUser?.posisi === 'SUPERVISOR') {
        const [activitiesRes, unitsRes] = await Promise.all([
          apiClient.getSupervisorActivities(),
          apiClient.getUnits({ limit: 1, page: 1 })
        ]);
        setStats({
          workTimes: 0,
          activities: activitiesRes.data?.length || 0,
          activeActivities: activitiesRes.data?.filter((a: any) => a.activityStatus === 'IN_PROGRESS' || a.activityStatus === 'PAUSED').length || 0,
          totalPopulation: unitsRes.pagination?.totalCount || 0,
        });
        setActivities(activitiesRes.data?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome back, {user?.name || 'User'}!
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : user?.posisi === 'MEKANIK' ? (
            <>
              {/* Performance Dashboard for Mechanics - Mobile First */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Overview</h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Total Work Time */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <svg className="w-6 h-6 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm opacity-90 mb-1">Total Work Time</p>
                    <p className="text-xs opacity-75 mb-1">(Sum of all tasks from all activities)</p>
                    <p className="text-lg sm:text-2xl font-bold">
                      {Math.floor(totalWorkTime / 60)}h {totalWorkTime % 60}m
                    </p>
                  </div>

                  {/* Completed Activities */}
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <svg className="w-6 h-6 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm opacity-90 mb-1">Completed</p>
                    <p className="text-lg sm:text-2xl font-bold">{completedActivities}</p>
                  </div>

                  {/* Active Activities */}
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <svg className="w-6 h-6 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm opacity-90 mb-1">Active</p>
                    <p className="text-lg sm:text-2xl font-bold">{stats.activeActivities}</p>
                  </div>

                  {/* Total Activities */}
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <svg className="w-6 h-6 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm opacity-90 mb-1">Total Tasks</p>
                    <p className="text-lg sm:text-2xl font-bold">{stats.activities}</p>
                  </div>
                </div>
              </div>

              {/* Assigned Activities */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Assigned Activities</h2>
                  <a
                    href="/mechanics/activities"
                    className="text-sm text-primary-600 font-medium hover:text-primary-700"
                  >
                    View All
                  </a>
                </div>
                {activities.length === 0 ? (
                  <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-500 text-sm">No activities assigned yet</p>
                    <p className="text-gray-400 text-xs mt-1">Wait for planner to assign activities</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity: any) => {
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'PENDING':
                            return 'bg-gray-100 text-gray-800';
                          case 'IN_PROGRESS':
                            return 'bg-blue-100 text-blue-800';
                          case 'PAUSED':
                            return 'bg-yellow-100 text-yellow-800';
                          case 'COMPLETED':
                            return 'bg-green-100 text-green-800';
                          default:
                            return 'bg-gray-100 text-gray-800';
                        }
                      };

                      const formatActivityName = (name: string) => {
                        return name.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
                      };

                      return (
                        <a
                          key={activity.id}
                          href="/mechanics/activities"
                          className="block bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-300 transition-all active:scale-[0.98]"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-gray-900 truncate">
                                {activity.activity?.unit?.unitCode || 'N/A'}
                              </h3>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {activity.activity?.unit?.unitType} - {activity.activity?.unit?.unitBrand}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatActivityName(activity.activity?.activityName || '')}
                              </p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${getStatusColor(activity.status)}`}>
                              {activity.status.replace('_', ' ')}
                            </span>
                          </div>
                          {activity.activity?.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {activity.activity.description}
                            </p>
                          )}
                          {activity.totalWorkTime > 0 && (
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Work Time: {Math.floor(activity.totalWorkTime / 60)}h {activity.totalWorkTime % 60}m</span>
                            </div>
                          )}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="/mechanics/activities"
                    className="flex flex-col items-center justify-center p-4 bg-primary-50 rounded-lg border border-primary-200 hover:bg-primary-100 active:scale-95 transition-all"
                  >
                    <svg className="w-6 h-6 text-primary-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-xs font-medium text-primary-700 text-center">My Activities</span>
                  </a>
                  <a
                    href="/mechanics/activities/list"
                    className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 active:scale-95 transition-all"
                  >
                    <svg className="w-6 h-6 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <span className="text-xs font-medium text-green-700 text-center">List Activities</span>
                  </a>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Activities</dt>
                          <dd className="text-2xl font-semibold text-gray-900">{stats.activities}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                      {(user?.posisi === 'PLANNER' || user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
                        <a href="/planner/activities" className="font-medium text-primary-700 hover:text-primary-900">
                          View all activities
                        </a>
                      )}
                      {(user?.posisi === 'GROUP_LEADER_MEKANIK' || user?.posisi === 'GROUP_LEADER_TYRE') && (
                        <a href="/group-leader/activities" className="font-medium text-primary-700 hover:text-primary-900">
                          View all activities
                        </a>
                      )}
                      {user?.posisi === 'SUPERVISOR' && (
                        <a href="/supervisor/activities" className="font-medium text-primary-700 hover:text-primary-900">
                          View all activities
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Active Activities</dt>
                          <dd className="text-2xl font-semibold text-gray-900">{stats.activeActivities}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm text-gray-500">
                      Currently in progress
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Population</dt>
                          <dd className="text-2xl font-semibold text-gray-900">{stats.totalPopulation}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm text-gray-500">
                      Total units in system
                    </div>
                  </div>
                </div>
              </div>

              {/* Activities List for Group Leaders and Supervisors */}
              {(user?.posisi === 'GROUP_LEADER_MEKANIK' || user?.posisi === 'GROUP_LEADER_TYRE' || user?.posisi === 'SUPERVISOR') && activities.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
                    <a
                      href={user?.posisi === 'SUPERVISOR' ? '/supervisor/activities' : '/group-leader/activities'}
                      className="text-sm text-primary-600 font-medium hover:text-primary-700"
                    >
                      View All
                    </a>
                  </div>
                  <div className="space-y-3">
                    {activities.map((activity: any) => {
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'PENDING':
                            return 'bg-gray-100 text-gray-800';
                          case 'IN_PROGRESS':
                            return 'bg-blue-100 text-blue-800';
                          case 'PAUSED':
                            return 'bg-yellow-100 text-yellow-800';
                          case 'COMPLETED':
                            return 'bg-green-100 text-green-800';
                          default:
                            return 'bg-gray-100 text-gray-800';
                        }
                      };

                      const formatActivityName = (name: string) => {
                        return name.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
                      };

                      return (
                        <a
                          key={activity.id}
                          href={user?.posisi === 'SUPERVISOR' ? '/supervisor/activities' : '/group-leader/activities'}
                          className="block bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-300 transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-semibold text-gray-900 truncate">
                                {activity.unit?.unitCode || 'N/A'}
                              </h3>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {activity.unit?.unitType} - {activity.unit?.unitBrand}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatActivityName(activity.activityName || '')}
                              </p>
                            </div>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${getStatusColor(activity.activityStatus)}`}>
                              {activity.activityStatus?.replace('_', ' ')}
                            </span>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {activity.description}
                            </p>
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {user?.posisi !== 'MEKANIK' && (
            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(user?.posisi === 'PLANNER' || user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
                  <a
                    href="/planner/activities"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <svg className="h-5 w-5 text-primary-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Create Activity</span>
                  </a>
                )}
                {(user?.posisi === 'GROUP_LEADER_MEKANIK' || user?.posisi === 'GROUP_LEADER_TYRE') && (
                  <a
                    href="/group-leader/activities"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <svg className="h-5 w-5 text-primary-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">View Activities</span>
                  </a>
                )}
                {user?.posisi === 'SUPERVISOR' && (
                  <a
                    href="/supervisor/activities"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <svg className="h-5 w-5 text-primary-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">View Activities</span>
                  </a>
                )}
                <a
                  href="/profile"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="h-5 w-5 text-primary-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">Edit Profile</span>
                </a>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

