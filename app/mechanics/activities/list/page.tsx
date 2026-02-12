'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api';

interface MechanicInfo {
  id: string;
  firstName: string;
  lastName: string;
  nrp: number;
  email?: string;
}

interface MechanicAssignment {
  id: string;
  status?: string;
  startedAt?: string | null;
  stoppedAt?: string | null;
  totalWorkTime?: number;
  mechanic?: MechanicInfo;
  mechanicId?: string;
  tasks?: Array<{
    id: string;
    taskName: string;
    order: number;
    startedAt: string | null;
    stoppedAt: string | null;
  }>;
}

interface Activity {
  id: string;
  activityId: string;
  mechanicId: string;
  status: string;
  startedAt: string | null;
  pausedAt: string | null;
  stoppedAt: string | null;
  pauseReason: string | null;
  totalWorkTime: number;
  createdAt: string;
  updatedAt: string;
  mechanic?: MechanicInfo; // Mechanic info from backend
  activity: {
    id: string;
    activityName: string;
    unitId: string;
    description: string | null;
    remarks: string | null;
    activityStatus: string;
    estimatedStart: string;
    createdAt: string;
    updatedAt: string;
    unit: {
      id: string;
      unitCode: string;
      unitType: string;
      unitBrand: string;
      unitDescription: string | null;
    };
  };
  tasks?: Array<{
    id: string;
    taskName: string;
    order: number;
    startedAt: string | null;
    stoppedAt: string | null;
  }>;
  mechanics?: MechanicAssignment[];
}

export default function MechanicsListActivitiesPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getMyActivities();
      if (response.success) {
        const activitiesData = response.data || [];
        
        // Group activities by activityId to show all mechanics per activity
        const groupedActivities = new Map<string, any[]>();
        
        activitiesData.forEach((activity: any) => {
          const activityId = activity.activity?.id || activity.activityId;
          if (!groupedActivities.has(activityId)) {
            groupedActivities.set(activityId, []);
          }
          groupedActivities.get(activityId)!.push(activity);
        });
        
        // Convert to array and add mechanics array to each activity group
        const processedActivities: Activity[] = [];
        groupedActivities.forEach((activityGroup, activityId) => {
          if (activityGroup.length > 0) {
            const mainActivity = activityGroup[0] as Activity;
            // Always add mechanics array to show all mechanics assigned to this activity
            mainActivity.mechanics = activityGroup.map((act: any) => {
              // The backend returns mechanic info in the activity object
              const mechanicInfo = act.mechanic || {
                id: act.mechanicId,
                firstName: 'Unknown',
                lastName: 'Mechanic',
                nrp: 0,
              };
              
              return {
                id: act.id,
                status: act.status,
                startedAt: act.startedAt,
                stoppedAt: act.stoppedAt,
                totalWorkTime: act.totalWorkTime,
                mechanicId: act.mechanicId,
                mechanic: mechanicInfo, // Include mechanic info
                tasks: act.tasks,
              };
            });
            processedActivities.push(mainActivity);
          }
        });
        
        setActivities(processedActivities);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (activity: Activity) => {
    try {
      // Fetch fresh activity data with tasks
      const response = await apiClient.getMyActivities();
      if (response.success) {
        const activitiesData = response.data || [];
        const foundActivity = activitiesData.find(
          (act: Activity) => (act.activity?.id || act.activityId) === (activity.activity?.id || activity.activityId)
        );
        if (foundActivity) {
          setSelectedActivity(foundActivity);
          setIsDetailModalOpen(true);
        } else {
          setSelectedActivity(activity);
          setIsDetailModalOpen(true);
        }
      } else {
        setSelectedActivity(activity);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching activity details:', error);
      setSelectedActivity(activity);
      setIsDetailModalOpen(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PAUSED':
      case 'DELAYED':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTaskTime = (task: { startedAt: string | null; stoppedAt: string | null }): number => {
    if (!task.startedAt) return 0;
    const start = new Date(task.startedAt);
    const end = task.stoppedAt ? new Date(task.stoppedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    return Math.floor(diffMs / 60000);
  };

  const formatTaskName = (taskName: string): string => {
    return taskName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatTime = (minutes: number): string => {
    if (minutes === 0) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <ProtectedRoute allowedPosisi={['MEKANIK']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">List Activities</h1>
              <p className="text-sm text-gray-600 mt-1">
                All assigned activities
              </p>
            </div>
            <button
              onClick={() => router.push('/mechanics/activities')}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-primary-600 rounded-lg hover:bg-primary-700"
            >
              My Activities
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">No activities assigned yet.</p>
            </div>
          ) : (
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Unit Code
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Unit Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Activity Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Mechanics
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Estimated Start
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activities.map((activity) => {
                      const totalTaskTime = activity.tasks
                        ? activity.tasks.reduce((sum, task) => sum + calculateTaskTime(task), 0)
                        : 0;
                      
                      return (
                        <tr
                          key={activity.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">
                              {activity.activity.unit.unitCode}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {activity.activity.unit.unitType}
                            </div>
                            <div className="text-xs text-gray-500">
                              {activity.activity.unit.unitBrand}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {activity.activity.activityName.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                            </div>
                            {activity.activity.description && (
                              <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                                {activity.activity.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {activity.mechanics && activity.mechanics.length > 0 ? (
                                <div className="space-y-1">
                                  {activity.mechanics.slice(0, 2).map((m) => (
                                    <div key={m.id} className="text-xs">
                                      {m.mechanic?.firstName} {m.mechanic?.lastName}
                                    </div>
                                  ))}
                                  {activity.mechanics.length > 2 && (
                                    <div className="text-xs text-gray-500 font-medium">
                                      +{activity.mechanics.length - 2} more
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(activity.activity.estimatedStart).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(activity.activity.estimatedStart).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                                activity.status
                              )}`}
                            >
                              {activity.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleViewDetails(activity)}
                              className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Detail Modal */}
          {isDetailModalOpen && selectedActivity && (
            <ActivityDetailModal
              activity={selectedActivity}
              onClose={() => {
                setIsDetailModalOpen(false);
                setSelectedActivity(null);
              }}
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

// Activity Detail Modal Component
function ActivityDetailModal({
  activity,
  onClose,
}: {
  activity: Activity;
  onClose: () => void;
}) {
  const calculateTaskTime = (task: { startedAt: string | null; stoppedAt: string | null }): number => {
    if (!task.startedAt) return 0;
    const start = new Date(task.startedAt);
    const end = task.stoppedAt ? new Date(task.stoppedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    return Math.floor(diffMs / 60000);
  };

  const calculateTaskTimeInSeconds = (task: { startedAt: string | null; stoppedAt: string | null }): number => {
    if (!task.startedAt) return 0;
    const start = new Date(task.startedAt);
    const end = task.stoppedAt ? new Date(task.stoppedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    return Math.floor(diffMs / 1000);
  };

  const formatTaskName = (taskName: string): string => {
    return taskName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatTime = (minutes: number): string => {
    if (minutes === 0) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatTimeDetailed = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);
    
    return parts.length > 0 ? parts.join(' ') : '0s';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'PAUSED':
      case 'DELAYED':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border-2 border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 sticky top-0 z-10 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-extrabold text-white">Activity Details</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="px-6 py-6">
          <div className="space-y-6">
            {/* Unit Info */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
                    {activity.activity.unit.unitCode}
                  </h2>
                  <p className="text-sm font-medium text-gray-600">
                    {activity.activity.unit.unitType} - {activity.activity.unit.unitBrand}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-md ${getStatusColor(
                    activity.status
                  )}`}
                >
                  {activity.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Activity Name */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200">
              <label className="text-xs font-bold text-amber-800 mb-2 uppercase tracking-wide">
                Activity Name
              </label>
              <p className="text-lg font-bold text-gray-900">
                {activity.activity.activityName.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
              </p>
            </div>

            {/* Description */}
            {activity.activity.description && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                <label className="text-xs font-bold text-green-800 mb-2 uppercase tracking-wide">
                  Description
                </label>
                <p className="text-sm font-medium text-gray-900">{activity.activity.description}</p>
              </div>
            )}

            {/* Remarks */}
            {activity.activity.remarks && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                <label className="text-xs font-bold text-purple-800 mb-2 uppercase tracking-wide">
                  Remarks
                </label>
                <p className="text-sm font-medium text-gray-700 italic">{activity.activity.remarks}</p>
              </div>
            )}

            {/* Estimated Start */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-200">
              <label className="text-xs font-bold text-orange-800 mb-2 uppercase tracking-wide">
                Estimated Start Date & Time
              </label>
              <p className="text-base font-bold text-gray-900">
                {new Date(activity.activity.estimatedStart).toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {/* Tasks Breakdown */}
            {activity.tasks && activity.tasks.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Breakdown</label>
                <div className="space-y-2">
                  {[...activity.tasks]
                    .sort((a, b) => a.order - b.order)
                    .map((task) => {
                      const taskTime = calculateTaskTime(task);
                      const taskTimeSeconds = calculateTaskTimeInSeconds(task);
                      const isCompleted = task.startedAt && task.stoppedAt;
                      const isActive = task.startedAt && !task.stoppedAt;

                      return (
                        <div
                          key={task.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isActive
                              ? 'bg-green-50 border-green-300'
                              : isCompleted
                              ? 'bg-blue-50 border-blue-300'
                              : 'bg-amber-50 border-amber-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-1 rounded bg-white">#{task.order}</span>
                            <span className="text-sm font-medium text-gray-900">{formatTaskName(task.taskName)}</span>
                            {isActive && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500 text-white">
                                Active
                              </span>
                            )}
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500 text-white">
                                Completed
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            {isCompleted && (
                              <div>
                                <span className={`text-sm font-bold ${
                                  taskTimeSeconds < 60 ? 'text-blue-600' : taskTimeSeconds < 300 ? 'text-indigo-600' : 'text-blue-800'
                                }`}>
                                  {taskTimeSeconds < 60 ? formatTimeDetailed(taskTimeSeconds) : formatTime(taskTime)}
                                </span>
                                {taskTimeSeconds >= 60 && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    ({taskTimeSeconds}s)
                                  </p>
                                )}
                              </div>
                            )}
                            {isActive && (
                              <div>
                                <span className="text-xs font-semibold text-green-600">In progress</span>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {formatTimeDetailed(taskTimeSeconds)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
                {activity.tasks.some((t) => t.startedAt) && (() => {
                  const totalTaskTimeMinutes = activity.tasks.reduce((sum, task) => sum + calculateTaskTime(task), 0);
                  const totalTaskTimeSeconds = activity.tasks.reduce((sum, task) => sum + calculateTaskTimeInSeconds(task), 0);
                  return (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-lg">
                        <span className="text-sm font-bold text-gray-800">Total Task Time:</span>
                        <div className="text-right">
                          <span className="text-lg font-extrabold text-indigo-700">
                            {totalTaskTimeSeconds < 60 ? formatTimeDetailed(totalTaskTimeSeconds) : formatTime(totalTaskTimeMinutes)}
                          </span>
                          {totalTaskTimeSeconds >= 60 && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              ({totalTaskTimeSeconds}s)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Dates */}
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500">
                {activity.startedAt && (
                  <div>
                    <span className="font-medium">Started:</span>{' '}
                    {new Date(activity.startedAt).toLocaleString()}
                  </div>
                )}
                {activity.stoppedAt && (
                  <div>
                    <span className="font-medium">Stopped:</span>{' '}
                    {new Date(activity.stoppedAt).toLocaleString()}
                  </div>
                )}
                {activity.createdAt && (
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {new Date(activity.createdAt).toLocaleString()}
                  </div>
                )}
                {activity.updatedAt && (
                  <div>
                    <span className="font-medium">Last Updated:</span>{' '}
                    {new Date(activity.updatedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

