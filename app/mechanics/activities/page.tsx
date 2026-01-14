'use client';

import { useState, useEffect } from 'react';
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
        const groupedActivities = new Map<string, Activity[]>();
        
        activitiesData.forEach((activity: Activity) => {
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
            const mainActivity = activityGroup[0];
            // If multiple mechanics, add mechanics array
            if (activityGroup.length > 1) {
              mainActivity.mechanics = activityGroup.map(act => ({
                id: act.id,
                status: act.status,
                startedAt: act.startedAt,
                stoppedAt: act.stoppedAt,
                totalWorkTime: act.totalWorkTime,
                mechanicId: act.mechanicId,
                tasks: act.tasks,
              }));
            }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">My Activities</h1>

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
            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
              {activities.map((activity) => {
                const actions = getStatusActions(activity.status);
                const totalTaskTime = activity.tasks
                  ? activity.tasks.reduce((sum, task) => sum + calculateTaskTime(task), 0)
                  : 0;
                return (
                  <div key={activity.id} className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {activity.activity.unit.unitCode}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {activity.activity.unit.unitType} - {activity.activity.unit.unitBrand}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
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

                      {activity.activity.description && (
                        <p className="text-sm text-gray-700 mb-4">{activity.activity.description}</p>
                      )}

                      {activity.activity.estimatedStart && (
                        <p className="text-xs text-gray-500 mb-1">
                          Estimated Start: {new Date(activity.activity.estimatedStart).toLocaleString()}
                        </p>
                      )}

                      {activity.startedAt && (
                        <p className="text-xs text-gray-500 mb-1">
                          Started: {new Date(activity.startedAt).toLocaleString()}
                        </p>
                      )}
                      {activity.stoppedAt && (
                        <p className="text-xs text-gray-500 mb-1">
                          Stopped: {new Date(activity.stoppedAt).toLocaleString()}
                        </p>
                      )}
                      {/* Total Work Time Summary */}
                      {activity.mechanics && activity.mechanics.length > 0 ? (
                        // Show per-mechanic totals if multiple mechanics
                        <div className="mb-4 space-y-3">
                          {activity.mechanics.map((mechanicAssignment, index) => {
                            const mechanicTaskTime = mechanicAssignment.tasks
                              ? mechanicAssignment.tasks.reduce((sum, task) => sum + calculateTaskTime(task), 0)
                              : 0;
                            const mechanicTotalTime = mechanicAssignment.totalWorkTime || mechanicTaskTime;
                            const mechanicName = mechanicAssignment.mechanic 
                              ? `${mechanicAssignment.mechanic.firstName} ${mechanicAssignment.mechanic.lastName}`
                              : `Mechanic ${index + 1}`;
                            
                            if (mechanicTotalTime === 0 && mechanicTaskTime === 0) return null;
                            
                            return (
                              <div key={mechanicAssignment.id || index} className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl border-2 border-blue-400 shadow-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold text-white flex items-center gap-2">
                                    <span>⏱️</span> {mechanicName}:
                                  </span>
                                  <span className="text-2xl font-extrabold text-white drop-shadow-md">
                                    {formatTime(mechanicTotalTime || mechanicTaskTime)}
                                  </span>
                                </div>
                                {mechanicAssignment.totalWorkTime > 0 && mechanicTaskTime > 0 && (
                                  <p className="text-xs text-blue-100 mt-2 font-medium">
                                    (From tasks: {formatTime(mechanicTaskTime)})
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (activity.totalWorkTime > 0 || totalTaskTime > 0) ? (
                        // Single mechanic total
                        <div className="mb-4 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl border-2 border-blue-400 shadow-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-white flex items-center gap-2">
                              <span>⏱️</span> Total Work Time:
                            </span>
                            <span className="text-2xl font-extrabold text-white drop-shadow-md">
                              {formatTime(activity.totalWorkTime || totalTaskTime)}
                            </span>
                          </div>
                          {activity.totalWorkTime > 0 && totalTaskTime > 0 && (
                            <p className="text-xs text-blue-100 mt-2 font-medium">
                              (Calculated from tasks: {formatTime(totalTaskTime)})
                            </p>
                          )}
                        </div>
                      ) : null}

                      {/* Tasks Breakdown - Per Mechanic */}
                      {activity.mechanics && activity.mechanics.length > 0 ? (
                        // Show breakdown per mechanic if mechanics array exists
                        <div className="mt-4 border-t-2 border-gray-300 pt-4">
                          <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span>👥</span> Task Breakdown by Mechanic
                          </h4>
                          <div className="space-y-6">
                            {activity.mechanics.map((mechanicAssignment, mechanicIndex) => {
                              if (!mechanicAssignment.tasks || mechanicAssignment.tasks.length === 0) {
                                return null;
                              }
                              
                              const mechanicTotalTime = mechanicAssignment.tasks.reduce(
                                (sum, task) => sum + calculateTaskTime(task),
                                0
                              );
                              const mechanicName = mechanicAssignment.mechanic 
                                ? `${mechanicAssignment.mechanic.firstName} ${mechanicAssignment.mechanic.lastName} (NRP: ${mechanicAssignment.mechanic.nrp})`
                                : `Mechanic ${mechanicIndex + 1}`;
                              
                              return (
                                <div key={mechanicAssignment.id || mechanicIndex} className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-4 border-2 border-gray-300 shadow-md">
                                  <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-gray-300">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">👤</span>
                                      <span className="text-sm font-bold text-gray-900">{mechanicName}</span>
                                    </div>
                                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-3 py-1 rounded-lg shadow-sm">
                                      <span className="text-xs font-bold text-white">
                                        Total: {formatTime(mechanicTotalTime)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    {[...mechanicAssignment.tasks]
                                      .sort((a, b) => a.order - b.order)
                                      .map((task, index) => {
                                        const taskTime = calculateTaskTime(task);
                                        const taskTimeSeconds = calculateTaskTimeInSeconds(task);
                                        const isActive = task.startedAt && !task.stoppedAt;
                                        const isCompleted = task.startedAt && task.stoppedAt;
                                        
                                        return (
                                          <div
                                            key={task.id}
                                            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${
                                              isActive
                                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 shadow-md'
                                                : isCompleted
                                                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 shadow-sm'
                                                : 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300'
                                            }`}
                                          >
                                            <div className="flex-1 min-w-0 w-full sm:w-auto mb-2 sm:mb-0">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-lg shadow-sm ${
                                                  isActive
                                                    ? 'bg-green-500 text-white'
                                                    : isCompleted
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-amber-400 text-white'
                                                }`}>
                                                  #{task.order}
                                                </span>
                                                <span className={`text-sm font-bold ${
                                                  isActive ? 'text-green-800' : isCompleted ? 'text-blue-900' : 'text-gray-900'
                                                }`}>
                                                  {formatTaskName(task.taskName)}
                                                </span>
                                                {isActive && (
                                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500 text-white shadow-sm animate-pulse">
                                                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span> Active
                                                  </span>
                                                )}
                                                {isCompleted && (
                                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-sm">
                                                    ✓ Completed
                                                  </span>
                                                )}
                                              </div>
                                              {task.startedAt && (
                                                <div className="mt-1.5 space-y-0.5">
                                                  <p className="text-xs text-gray-600">
                                                    <span className="font-semibold">Started:</span> {new Date(task.startedAt).toLocaleString()}
                                                  </p>
                                                  {task.stoppedAt && (
                                                    <p className="text-xs text-gray-600">
                                                      <span className="font-semibold">Stopped:</span> {new Date(task.stoppedAt).toLocaleString()}
                                                    </p>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                              {isCompleted ? (
                                                <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-blue-200">
                                                  <span className={`text-base font-bold ${
                                                    taskTimeSeconds < 60 ? 'text-blue-600' : taskTimeSeconds < 300 ? 'text-indigo-600' : 'text-blue-800'
                                                  }`}>
                                                    {taskTimeSeconds < 60 ? formatTimeDetailed(taskTimeSeconds) : formatTime(taskTime)}
                                                  </span>
                                                  <p className="text-xs text-gray-600 mt-0.5 font-medium">
                                                    {taskTimeSeconds < 60 ? `${taskTimeSeconds}s` : `${taskTime}m`}
                                                  </p>
                                                </div>
                                              ) : isActive ? (
                                                <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-green-200">
                                                  <span className="text-xs font-semibold text-green-600 animate-pulse">
                                                    In progress
                                                  </span>
                                                  <p className="text-xs text-gray-600 mt-0.5 font-medium">
                                                    {formatTimeDetailed(taskTimeSeconds)}
                                                  </p>
                                                </div>
                                              ) : (
                                                <span className="text-xs text-gray-500">Pending</span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : activity.tasks && activity.tasks.length > 0 ? (
                        // Fallback to single mechanic breakdown if no mechanics array
                        <div className="mt-4 border-t-2 border-gray-300 pt-4">
                          <h4 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span>📋</span> Task Breakdown <span className="text-xs font-normal text-gray-500">(Must Complete in Order)</span>
                          </h4>
                          <div className="space-y-2">
                            {[...activity.tasks]
                              .sort((a, b) => a.order - b.order)
                              .map((task, index) => {
                              const taskTime = calculateTaskTime(task);
                              const taskTimeSeconds = calculateTaskTimeInSeconds(task);
                              const isActive = task.startedAt && !task.stoppedAt;
                              const isCompleted = task.startedAt && task.stoppedAt;
                              
                              // Check if previous tasks are completed
                              // Tasks are already sorted by order from backend, but we sort again to be sure
                              const sortedTasks = [...activity.tasks!].sort((a, b) => a.order - b.order);
                              const previousTasks = sortedTasks.slice(0, index);
                              const allPreviousCompleted = previousTasks.length === 0 || previousTasks.every(
                                (prevTask) => prevTask.startedAt && prevTask.stoppedAt
                              );
                              // Can start if: activity is IN_PROGRESS AND (first task OR all previous tasks completed)
                              const canStart = activity.status === 'IN_PROGRESS' && (index === 0 || allPreviousCompleted);
                              const isLocked = !canStart && !task.startedAt;

                              const handleTaskAction = async (action: 'start' | 'stop') => {
                                try {
                                  setError('');
                                  // Use activity.activity.id (MechanicActivity id) for the endpoint
                                  // The endpoint expects MechanicActivity id, not ActivityMechanic id
                                  const activityId = activity.activity?.id;
                                  if (!activityId) {
                                    setError('Activity ID not found. Please refresh the page.');
                                    console.error('Activity ID missing:', activity);
                                    return;
                                  }
                                  
                                  // Normalize and validate taskName
                                  if (!task.taskName) {
                                    setError('Task name is missing. Please refresh the page.');
                                    console.error('Task name missing:', task);
                                    return;
                                  }
                                  
                                  const normalizedTaskName = normalizeTaskName(task.taskName);
                                  
                                  console.log(`Attempting to ${action} task:`, {
                                    activityId,
                                    originalTaskName: task.taskName,
                                    normalizedTaskName,
                                    url: `/api/mechanics/activities/${activityId}/tasks/${action}`
                                  });
                                  
                                  let response;
                                  if (action === 'start') {
                                    response = await apiClient.startTask(activityId, normalizedTaskName);
                                  } else {
                                    response = await apiClient.stopTask(activityId, normalizedTaskName);
                                  }

                                  if (response.success) {
                                    loadActivities();
                                  } else {
                                    setError(response.message || 'Task action failed');
                                  }
                                } catch (error: any) {
                                  console.error('Task action error:', error);
                                  const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
                                  setError(errorMessage);
                                  if (error.response?.status === 404) {
                                    setError(`Route not found. Please check if the backend server is running and the route is registered.`);
                                  }
                                }
                              };

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
                                        // For completed tasks, always show the time (even if 0 minutes, show seconds)
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
                                        // For active tasks, show "In progress" with live time
                                        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm border border-green-200">
                                          <span className="text-sm font-semibold text-green-600 animate-pulse">
                                            In progress
                                          </span>
                                          <p className="text-xs text-gray-600 mt-0.5 font-medium">
                                            {formatTimeDetailed(taskTimeSeconds)}
                                          </p>
                                        </div>
                                      ) : (
                                        // For pending/locked tasks
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
                                    {activity.status === 'IN_PROGRESS' && (
                                      <div className="flex gap-2">
                                        {!task.startedAt && canStart && (
                                          <button
                                            onClick={() => handleTaskAction('start')}
                                            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 transform"
                                          >
                                            ▶ Start
                                          </button>
                                        )}
                                        {isActive && (
                                          <button
                                            onClick={() => handleTaskAction('stop')}
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
                                    {activity.status !== 'IN_PROGRESS' && !task.startedAt && (
                                      <span className="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-100 rounded-lg shadow-sm">
                                        ⏸ Start activity first
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {activity.tasks.some((t) => t.startedAt) && (
                            <div className="mt-4 pt-4 border-t-2 border-gray-300">
                              <div className="flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-lg border border-indigo-200">
                                <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                  <span>📊</span> Total Task Time:
                                </span>
                                <span className="text-lg font-extrabold text-indigo-700">
                                  {formatTime(
                                    activity.tasks.reduce(
                                      (sum, task) => sum + calculateTaskTime(task),
                                      0
                                    )
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null}

                      {/* Total Activity Time - Breakdown Per Mechanic */}
                      {((activity.mechanics && activity.mechanics.length > 0 && activity.mechanics.some(m => m.tasks && m.tasks.some(t => t.startedAt))) || 
                        (activity.tasks && activity.tasks.some(t => t.startedAt))) && (
                        <div className="mt-6 pt-6 border-t-4 border-purple-400">
                          <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-5 shadow-2xl border-2 border-purple-400">
                            <h5 className="text-lg font-extrabold text-white mb-4 flex items-center gap-2">
                              <span>⏱️</span> Total Activity Time (Jumlah Semua Tasks)
                            </h5>
                            
                            {activity.mechanics && activity.mechanics.length > 0 ? (
                              // Multiple mechanics breakdown
                              <div className="space-y-3">
                                {activity.mechanics.map((mechanicAssignment, index) => {
                                  if (!mechanicAssignment.tasks || mechanicAssignment.tasks.length === 0) return null;
                                  
                                  const mechanicTotalTaskTime = mechanicAssignment.tasks.reduce(
                                    (sum, task) => sum + calculateTaskTime(task),
                                    0
                                  );
                                  
                                  if (mechanicTotalTaskTime === 0) return null;
                                  
                                  const mechanicName = mechanicAssignment.mechanic 
                                    ? `${mechanicAssignment.mechanic.firstName} ${mechanicAssignment.mechanic.lastName}`
                                    : `Mechanic ${String.fromCharCode(65 + index)}`; // A, B, C, etc.
                                  
                                  return (
                                    <div key={mechanicAssignment.id || index} className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-white flex items-center gap-2">
                                          <span>👤</span> Total Time Activity {mechanicName}:
                                        </span>
                                        <span className="text-xl font-extrabold text-white drop-shadow-lg">
                                          {formatTime(mechanicTotalTaskTime)}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                                
                                {/* Grand Total */}
                                <div className="mt-4 pt-3 border-t-2 border-white/30">
                                  <div className="flex items-center justify-between">
                                    <span className="text-base font-extrabold text-white flex items-center gap-2">
                                      <span>🎯</span> Grand Total (All Mechanics):
                                    </span>
                                    <span className="text-2xl font-black text-yellow-300 drop-shadow-lg">
                                      {formatTime(
                                        activity.mechanics.reduce((total, mechanicAssignment) => {
                                          if (!mechanicAssignment.tasks) return total;
                                          return total + mechanicAssignment.tasks.reduce(
                                            (sum, task) => sum + calculateTaskTime(task),
                                            0
                                          );
                                        }, 0)
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ) : activity.tasks && activity.tasks.some(t => t.startedAt) ? (
                              // Single mechanic
                              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold text-white flex items-center gap-2">
                                    <span>👤</span> Total Time Activity:
                                  </span>
                                  <span className="text-xl font-extrabold text-white drop-shadow-lg">
                                    {formatTime(
                                      activity.tasks.reduce(
                                        (sum, task) => sum + calculateTaskTime(task),
                                        0
                                      )
                                    )}
                                  </span>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      )}

                      {actions.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {actions.map(({ label, action }) => (
                            <button
                              key={action}
                              onClick={() => handleAction(activity, action)}
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

