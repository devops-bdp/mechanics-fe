'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { apiClient } from '@/lib/api';
import { getUser } from '@/lib/auth';

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
  // Support for activities with multiple mechanics (if API returns it)
  mechanics?: MechanicAssignment[];
}

export default function MechanicsActivitiesPage() {
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
        
        // Backend already returns activities filtered by mechanicId
        // Each activity in the array is the mechanic's assignment (ActivityMechanic)
        // The status should be from the ActivityMechanic, not the main MechanicActivity
        // So we don't need to group - each mechanic sees their own assignments
        
        // Just set the activities directly - each one is already the mechanic's assignment
        setActivities(activitiesData);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (activity: Activity, action: 'start' | 'pause' | 'resume' | 'stop') => {
    try {
      // Use activity.activity.id (MechanicActivity id) for the endpoint
      // The endpoint expects MechanicActivity id, not ActivityMechanic id
      const activityId = activity.activity?.id;
      if (!activityId) {
        setError('Activity ID not found. Please refresh the page.');
        return;
      }

      let response;
      switch (action) {
        case 'start':
          response = await apiClient.startActivity(activityId);
          break;
        case 'pause':
          response = await apiClient.pauseActivity(activityId);
          break;
        case 'resume':
          response = await apiClient.resumeActivity(activityId);
          break;
        case 'stop':
          response = await apiClient.stopActivity(activityId);
          break;
      }

      if (response.success) {
        loadActivities();
      } else {
        setError(response.message || 'Action failed');
      }
    } catch (error: any) {
      console.error('Activity action error:', error);
      setError(error.response?.data?.message || error.message || 'An error occurred');
    }
  };

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

  const getStatusActions = (status: string) => {
    switch (status) {
      case 'PENDING':
        return [{ label: 'Start', action: 'start' as const }];
      case 'IN_PROGRESS':
        return [
          { label: 'Pause', action: 'pause' as const },
          { label: 'Stop', action: 'stop' as const },
        ];
      case 'PAUSED':
        return [
          { label: 'Resume', action: 'resume' as const },
          { label: 'Stop', action: 'stop' as const },
        ];
      default:
        return [];
    }
  };

  const calculateTaskTime = (task: { startedAt: string | null; stoppedAt: string | null }): number => {
    if (!task.startedAt) return 0;
    const start = new Date(task.startedAt);
    const end = task.stoppedAt ? new Date(task.stoppedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    return Math.floor(diffMs / 60000); // Convert to minutes
  };

  const calculateTaskTimeInSeconds = (task: { startedAt: string | null; stoppedAt: string | null }): number => {
    if (!task.startedAt) return 0;
    const start = new Date(task.startedAt);
    const end = task.stoppedAt ? new Date(task.stoppedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    return Math.floor(diffMs / 1000); // Convert to seconds
  };

  const formatTaskName = (taskName: string): string => {
    return taskName
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // Valid task names enum
  // Note: This list should match the backend enum, but we're lenient to support
  // task names that might exist in the database but aren't yet in the enum
  const VALID_TASK_NAMES = [
    'PREPARING_PART',
    'PREPARING_TOOLS',
    'WASHING_UNIT',
    'PRE_INSPECTION',
    'PELAKSANAAN_PS',
    'PELAKSANAAN_BACKLOG',
    'PAP',
    'PPM',
    'REPORTING',
    'HOUSEKEEPING',
    'TRAVELING', // Added based on backend data
    'ON_PROCESS', // Added based on backend data
    'FINAL_CHECK', // Added based on backend data
  ] as const;

  // Normalize taskName to ensure it matches the enum format
  // Note: We normalize the format but don't strictly validate, as the backend will validate
  // This allows for task names that might exist in the database but aren't in our frontend list
  const normalizeTaskName = (taskName: string): string => {
    if (!taskName) {
      throw new Error('Task name is required');
    }

    // Normalize: convert to uppercase, trim, and replace spaces with underscores
    const normalized = taskName.toUpperCase().trim().replace(/\s+/g, '_');
    
    // Log if it's not in our known list (for debugging), but still pass it through
    // The backend will validate and return an error if it's truly invalid
    if (!VALID_TASK_NAMES.includes(normalized as any)) {
      console.warn(`Task name "${taskName}" (normalized: "${normalized}") is not in the known valid list. Passing through to backend for validation.`);
    }
    
    return normalized;
  };

  const formatTime = (minutes: number): string => {
    if (minutes === 0) {
      return '0m';
    }
    if (minutes < 60) {
      return `${minutes}m`;
    }
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
      // Show minutes and seconds if there are remaining seconds
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    // Build the time string, only including non-zero parts
    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);
    
    return parts.length > 0 ? parts.join(' ') : '0s';
  };

  return (
    <ProtectedRoute allowedPosisi={['MEKANIK']}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Activities</h1>
              <p className="text-sm text-gray-600 mt-1">
                Activities that need your attention (Pending, In Progress, Paused, Delayed)
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/mechanics/activities/list'}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-primary-600 rounded-lg hover:bg-primary-700"
            >
              List Activities
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
          ) : (() => {
            // Filter activities that need attention: PENDING, IN_PROGRESS, PAUSED, DELAYED
            // Exclude COMPLETED activities from "My Activities" (they can be viewed in "List Activities")
            // Use the status from ActivityMechanic (the mechanic's assignment status)
            const myActivities = activities.filter(
              (activity) => {
                // activity.status is from ActivityMechanic, which is the correct status for this mechanic
                return activity.status === 'PENDING' || 
                       activity.status === 'IN_PROGRESS' || 
                       activity.status === 'PAUSED' || 
                       activity.status === 'DELAYED';
              }
            );
            
            return myActivities.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-4">No activities assigned yet.</p>
                <button
                  onClick={() => window.location.href = '/mechanics/activities/list'}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                  View All Activities
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {myActivities.map((activity) => {
                  const totalTaskTime = activity.tasks
                    ? activity.tasks.reduce((sum, task) => sum + calculateTaskTime(task), 0)
                    : 0;
                  const totalTime = activity.totalWorkTime || totalTaskTime;
                
                return (
                  <div
                    key={activity.id}
                    onClick={() => {
                      setSelectedActivity(activity);
                      setIsDetailModalOpen(true);
                    }}
                    className="bg-white shadow-lg rounded-xl border border-gray-200 hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {activity.activity.unit.unitCode}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {activity.activity.unit.unitType} - {activity.activity.unit.unitBrand}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.activity.activityName.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            activity.status
                          )}`}
                        >
                          {activity.status.replace('_', ' ')}
                        </span>
                      </div>

                      {totalTime > 0 && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-700">Total Time:</span>
                            <span className="text-base font-bold text-blue-700">
                              {formatTime(totalTime)}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                          Click to view details and manage tasks
                        </p>
                      </div>
                    </div>
                  </div>
                );
                })}
              </div>
            );
          })()}

          {/* Detail Modal */}
          {isDetailModalOpen && selectedActivity && (
            <ActivityDetailModal
              activity={selectedActivity}
              onClose={() => {
                setIsDetailModalOpen(false);
                setSelectedActivity(null);
              }}
              onRefresh={loadActivities}
              handleAction={handleAction}
              getStatusActions={getStatusActions}
              getStatusColor={getStatusColor}
              calculateTaskTime={calculateTaskTime}
              calculateTaskTimeInSeconds={calculateTaskTimeInSeconds}
              formatTaskName={formatTaskName}
              formatTime={formatTime}
              formatTimeDetailed={formatTimeDetailed}
              normalizeTaskName={normalizeTaskName}
              setError={setError}
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
  onRefresh,
  handleAction,
  getStatusActions,
  getStatusColor,
  calculateTaskTime,
  calculateTaskTimeInSeconds,
  formatTaskName,
  formatTime,
  formatTimeDetailed,
  normalizeTaskName,
  setError,
}: {
  activity: Activity;
  onClose: () => void;
  onRefresh: () => void;
  handleAction: (activity: Activity, action: 'start' | 'pause' | 'resume' | 'stop') => Promise<void>;
  getStatusActions: (status: string) => Array<{ label: string; action: 'start' | 'pause' | 'resume' | 'stop' }>;
  getStatusColor: (status: string) => string;
  calculateTaskTime: (task: { startedAt: string | null; stoppedAt: string | null }) => number;
  calculateTaskTimeInSeconds: (task: { startedAt: string | null; stoppedAt: string | null }) => number;
  formatTaskName: (taskName: string) => string;
  formatTime: (minutes: number) => string;
  formatTimeDetailed: (seconds: number) => string;
  normalizeTaskName: (taskName: string) => string;
  setError: (error: string) => void;
}) {
  const [currentActivity, setCurrentActivity] = useState<Activity>(activity);

  useEffect(() => {
    // Refresh activity data when modal opens
    const refreshActivity = async () => {
      try {
        const response = await apiClient.getMyActivities();
        if (response.success) {
          const activitiesData = response.data || [];
          
          // Find the activity by matching the ActivityMechanic id (activity.id)
          // or by matching the MechanicActivity id (activity.activity.id)
          const activityId = activity.activity?.id || activity.activityId;
          const foundActivity = activitiesData.find(
            (act: Activity) => 
              act.id === activity.id || // Match by ActivityMechanic id
              (act.activity?.id || act.activityId) === activityId // Match by MechanicActivity id
          );
          
          if (foundActivity) {
            setCurrentActivity(foundActivity);
          }
        }
      } catch (error) {
        console.error('Error refreshing activity:', error);
      }
    };
    refreshActivity();
  }, [activity]);

  const handleTaskAction = async (action: 'start' | 'stop', task: { taskName: string }) => {
    try {
      setError('');
      const activityId = currentActivity.activity?.id;
      if (!activityId) {
        setError('Activity ID not found. Please refresh the page.');
        return;
      }

      if (!task.taskName) {
        setError('Task name is missing. Please refresh the page.');
        return;
      }

      const normalizedTaskName = normalizeTaskName(task.taskName);

      let response;
      if (action === 'start') {
        response = await apiClient.startTask(activityId, normalizedTaskName);
      } else {
        response = await apiClient.stopTask(activityId, normalizedTaskName);
      }

      if (response.success) {
        onRefresh();
        // Refresh current activity in modal
        const refreshResponse = await apiClient.getMyActivities();
        if (refreshResponse.success) {
          const activitiesData = refreshResponse.data || [];
          
          // Find the activity by matching the ActivityMechanic id
          const foundActivity = activitiesData.find(
            (act: Activity) => act.id === currentActivity.id
          );
          
          if (foundActivity) {
            setCurrentActivity(foundActivity);
          }
        }
      } else {
        setError(response.message || 'Task action failed');
      }
    } catch (error: any) {
      console.error('Task action error:', error);
      setError(error.response?.data?.message || error.message || 'An error occurred');
    }
  };

  // currentActivity is already the ActivityMechanic for the current user
  // So we can directly use currentActivity.tasks and currentActivity.status
  const userTasks = currentActivity.tasks || [];
  const userStatus = currentActivity.status; // This is the ActivityMechanic status, which is correct
  
  const actions = getStatusActions(userStatus);
  const totalTaskTime = userTasks
    ? userTasks.reduce((sum, task) => sum + calculateTaskTime(task), 0)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border-2 border-gray-200">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 sticky top-0 z-10 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-extrabold text-white">Activity Details</h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                  currentActivity.status
                )}`}
              >
                {currentActivity.status.replace('_', ' ')}
              </span>
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
              <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
                {currentActivity.activity.unit.unitCode}
              </h2>
              <p className="text-sm font-medium text-gray-600">
                {currentActivity.activity.unit.unitType} - {currentActivity.activity.unit.unitBrand}
              </p>
            </div>

            {/* Activity Name */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200">
              <label className="text-xs font-bold text-amber-800 mb-2 uppercase tracking-wide">
                Activity Name
              </label>
              <p className="text-lg font-bold text-gray-900">
                {currentActivity.activity.activityName.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
              </p>
            </div>

            {/* Description */}
            {currentActivity.activity.description && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                <label className="text-xs font-bold text-green-800 mb-2 uppercase tracking-wide">
                  Description
                </label>
                <p className="text-sm font-medium text-gray-900">{currentActivity.activity.description}</p>
              </div>
            )}

            {/* Estimated Start */}
            {currentActivity.activity.estimatedStart && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-200">
                <label className="text-xs font-bold text-orange-800 mb-2 uppercase tracking-wide">
                  Estimated Start
                </label>
                <p className="text-base font-bold text-gray-900">
                  {new Date(currentActivity.activity.estimatedStart).toLocaleString()}
                </p>
              </div>
            )}

            {/* Activity Actions */}
            {actions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {actions.map(({ label, action }) => (
                  <button
                    key={action}
                    onClick={() => handleAction(currentActivity, action).then(() => {
                      onRefresh();
                      // Refresh activity in modal
                      apiClient.getMyActivities().then((response) => {
                        if (response.success) {
                          const activitiesData = response.data || [];
                          
                          // Find the activity by matching the ActivityMechanic id
                          const foundActivity = activitiesData.find(
                            (act: Activity) => act.id === currentActivity.id
                          );
                          
                          if (foundActivity) {
                            setCurrentActivity(foundActivity);
                          }
                        }
                      });
                    })}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 border border-transparent text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 transform ${
                      action === 'stop'
                        ? 'text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
                        : action === 'pause'
                        ? 'text-white bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700'
                        : action === 'resume'
                        ? 'text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                        : 'text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                  >
                    {action === 'start' && '▶'}
                    {action === 'pause' && '⏸'}
                    {action === 'resume' && '▶'}
                    {action === 'stop' && '⏹'}
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Tasks Breakdown */}
            {userTasks && userTasks.length > 0 && (
              <div className="mt-4 border-t-2 border-gray-300 pt-4">
                <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📋</span> Task Breakdown <span className="text-xs font-normal text-gray-500">(Must Complete in Order)</span>
                </h4>
                <div className="space-y-2">
                  {[...userTasks]
                    .sort((a, b) => a.order - b.order)
                    .map((task, index) => {
                      const taskTime = calculateTaskTime(task);
                      const taskTimeSeconds = calculateTaskTimeInSeconds(task);
                      const isActive = task.startedAt && !task.stoppedAt;
                      const isCompleted = task.startedAt && task.stoppedAt;

                      const sortedTasks = [...userTasks].sort((a, b) => a.order - b.order);
                      const previousTasks = sortedTasks.slice(0, index);
                      const allPreviousCompleted = previousTasks.length === 0 || previousTasks.every(
                        (prevTask) => prevTask.startedAt && prevTask.stoppedAt
                      );
                      const canStart = userStatus === 'IN_PROGRESS' && (index === 0 || allPreviousCompleted);
                      const isLocked = !canStart && !task.startedAt;

                      return (
                        <div
                          key={task.id}
                          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
                            isActive
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 shadow-md shadow-green-100'
                              : isCompleted
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-sm'
                              : isLocked
                              ? 'bg-gray-100 border-gray-300 opacity-60'
                              : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300'
                          }`}
                        >
                          <div className="flex-1 min-w-0 w-full sm:w-auto mb-2 sm:mb-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm ${
                                isLocked 
                                  ? 'bg-gray-300 text-gray-600' 
                                  : isActive
                                  ? 'bg-green-500 text-white'
                                  : isCompleted
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-amber-400 text-white'
                              }`}>
                                #{task.order}
                              </span>
                              <span className={`text-base font-bold ${
                                isLocked ? 'text-gray-500' : isActive ? 'text-green-800' : isCompleted ? 'text-blue-900' : 'text-gray-900'
                              }`}>
                                {formatTaskName(task.taskName)}
                              </span>
                              {isLocked && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 shadow-sm">
                                  <span>🔒</span> Locked
                                </span>
                              )}
                              {isActive && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white shadow-md animate-pulse">
                                  <span className="w-2 h-2 bg-white rounded-full"></span> Active
                                </span>
                              )}
                              {isCompleted && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-sm">
                                  <span>✓</span> Completed
                                </span>
                              )}
                            </div>
                            {isLocked && (
                              <p className="text-xs text-gray-500 mt-1">
                                Complete previous tasks first
                              </p>
                            )}
                            {task.startedAt && (
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-gray-500">⏱️ Started:</span>
                                  <span className="text-xs text-gray-700 font-medium">
                                    {new Date(task.startedAt).toLocaleString()}
                                  </span>
                                </div>
                                {task.stoppedAt && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-500">🏁 Stopped:</span>
                                    <span className="text-xs text-gray-700 font-medium">
                                      {new Date(task.stoppedAt).toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="text-right flex-shrink-0">
                              {isCompleted ? (
                                <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-blue-200">
                                  <span className={`text-lg font-bold ${
                                    taskTimeSeconds < 60 ? 'text-blue-600' : taskTimeSeconds < 300 ? 'text-indigo-600' : 'text-blue-800'
                                  }`}>
                                    {taskTimeSeconds < 60 ? formatTimeDetailed(taskTimeSeconds) : formatTime(taskTime)}
                                  </span>
                                  <p className="text-xs text-gray-600 mt-0.5 font-medium">
                                    {taskTimeSeconds < 60 ? `${taskTimeSeconds} seconds` : `${taskTime} minutes`}
                                  </p>
                                </div>
                              ) : isActive ? (
                                <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-green-200">
                                  <span className="text-sm font-semibold text-green-600 animate-pulse">
                                    In progress
                                  </span>
                                  <p className="text-xs text-gray-600 mt-0.5 font-medium">
                                    {formatTimeDetailed(taskTimeSeconds)}
                                  </p>
                                </div>
                              ) : (
                                <div className={`px-3 py-1.5 rounded-lg ${
                                  isLocked ? 'bg-gray-200 text-gray-500' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  <span className={`text-xs font-semibold`}>
                                    {isLocked ? '🔒 Locked' : '⏳ Ready'}
                                  </span>
                                </div>
                              )}
                            </div>
                            {/* Task Action Buttons */}
                            {userStatus === 'IN_PROGRESS' && (
                              <div className="flex gap-2">
                                {!task.startedAt && canStart && (
                                  <button
                                    onClick={() => handleTaskAction('start', task)}
                                    className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 transform"
                                  >
                                    ▶ Start
                                  </button>
                                )}
                                {isActive && (
                                  <button
                                    onClick={() => handleTaskAction('stop', task)}
                                    className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 transform"
                                  >
                                    ⏹ Stop
                                  </button>
                                )}
                                {isLocked && (
                                  <span className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-200 rounded-lg shadow-sm">
                                    🔒 Locked
                                  </span>
                                )}
                              </div>
                            )}
                            {userStatus !== 'IN_PROGRESS' && !task.startedAt && (
                              <span className="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-100 rounded-lg shadow-sm">
                                ⏸ Start activity first
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
                {userTasks.some((t) => t.startedAt) && (() => {
                  const totalTaskTimeSeconds = userTasks.reduce(
                    (sum, task) => sum + calculateTaskTimeInSeconds(task),
                    0
                  );
                  return (
                    <div className="mt-4 pt-4 border-t-2 border-gray-300">
                      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-lg border border-indigo-200">
                        <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                          <span>📊</span> Total Task Time:
                          <span className="text-xs font-normal text-gray-500">(Sum of all tasks in this activity)</span>
                        </span>
                        <div className="text-right">
                          <span className="text-lg font-extrabold text-indigo-700">
                            {formatTimeDetailed(totalTaskTimeSeconds)}
                          </span>
                          <p className="text-xs text-gray-500 mt-0.5">
                            ({totalTaskTimeSeconds}s total)
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
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

