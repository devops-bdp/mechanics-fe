"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";

interface Task {
  id: string;
  taskName: string;
  order: number;
  startedAt: string | null;
  stoppedAt: string | null;
  durationSeconds: number;
  durationFormatted: string;
  isActive: boolean;
}

interface Activity {
  id: string;
  activityId: string;
  activityName: string;
  unitCode: string;
  unitType: string;
  unitBrand: string;
  status: string;
  startedAt: string | null;
  stoppedAt: string | null;
  createdAt: string;
  tasks: Task[];
  totalActivitySeconds: number;
  totalActivityTimeFormatted: string;
}

interface Mechanic {
  id: string;
  firstName: string;
  lastName: string;
  nrp: number;
  email: string;
  activities: Activity[];
  totalActivities: number;
  totalMechanicSeconds: number;
  totalMechanicTimeFormatted: string;
}

const formatActivityName = (name: string): string => {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const formatTaskName = (name: string): string => {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800 border-green-300";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "PAUSED":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "DELAYED":
      return "bg-red-100 text-red-800 border-red-300";
    case "CANCELLED":
      return "bg-gray-100 text-gray-800 border-gray-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

export default function MechanicDetailPage() {
  const params = useParams();
  const mechanicId = params?.mechanicId as string;

  const [mechanic, setMechanic] = useState<Mechanic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (mechanicId) {
      loadMechanicDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mechanicId]);

  const loadMechanicDetail = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await apiClient.getMechanicReportById(mechanicId);
      if (response.success) {
        setMechanic(response.data);
      } else {
        setError(response.message || "Failed to load mechanic details");
      }
    } catch (err: any) {
      console.error("Error loading mechanic details:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load mechanic details"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActivity = (activityId: string) => {
    setExpandedActivities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <ProtectedRoute
        allowedPosisi={["PLANNER", "SUPERVISOR", "DEPT_HEAD", "MANAGEMENT"]}
        allowedRoles={["ADMIN", "SUPERADMIN"]}
      >
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading mechanic details...</p>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !mechanic) {
    return (
      <ProtectedRoute
        allowedPosisi={["PLANNER", "SUPERVISOR", "DEPT_HEAD", "MANAGEMENT"]}
        allowedRoles={["ADMIN", "SUPERADMIN"]}
      >
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <Link
                href="/planner/reports/mechanics-report"
                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Mechanics Report
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {error || "Mechanic not found"}
              </h3>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute
      allowedPosisi={["PLANNER", "SUPERVISOR", "DEPT_HEAD", "MANAGEMENT"]}
      allowedRoles={["ADMIN", "SUPERADMIN"]}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Back Button */}
          <div className="mb-6">
            <Link
              href="/planner/reports/mechanics-report"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-all hover:shadow-md"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Mechanics Report
            </Link>
          </div>

          {/* Enhanced Mechanic Header */}
          <div className="mb-6 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold text-white mb-2">
                    {mechanic.firstName} {mechanic.lastName}
                  </h1>
                  <div className="flex items-center gap-4 text-green-100">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      <span className="font-semibold">NRP: {mechanic.nrp}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="font-semibold">{mechanic.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Performance Metrics */}
            <div className="px-8 py-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Performance Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-700">Total Activities</p>
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">{mechanic.totalActivities}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-700">Total Work Time</p>
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">{mechanic.totalMechanicTimeFormatted}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-700">Completed Activities</p>
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    {mechanic.activities.filter((a) => a.status === "COMPLETED").length}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-l-4 border-orange-500">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-700">Average Activity Time</p>
                    <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-orange-600">
                    {mechanic.activities.length > 0
                      ? (() => {
                          const avgSeconds = Math.floor(
                            mechanic.activities.reduce((sum, a) => sum + a.totalActivitySeconds, 0) /
                              mechanic.activities.length
                          );
                          const hours = Math.floor(avgSeconds / 3600);
                          const minutes = Math.floor((avgSeconds % 3600) / 60);
                          return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                        })()
                      : "0m"}
                  </p>
                </div>
              </div>

              {/* Activity Status Breakdown */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-xs font-semibold text-yellow-800 mb-1">Pending</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {mechanic.activities.filter((a) => a.status === "PENDING").length}
                  </p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-800 mb-1">In Progress</p>
                  <p className="text-xl font-bold text-blue-600">
                    {mechanic.activities.filter((a) => a.status === "IN_PROGRESS").length}
                  </p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-xs font-semibold text-orange-800 mb-1">Paused</p>
                  <p className="text-xl font-bold text-orange-600">
                    {mechanic.activities.filter((a) => a.status === "PAUSED").length}
                  </p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs font-semibold text-red-800 mb-1">Delayed</p>
                  <p className="text-xl font-bold text-red-600">
                    {mechanic.activities.filter((a) => a.status === "DELAYED").length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Activities List */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900">
                Activities ({mechanic.activities.length})
              </h2>
            </div>

            {mechanic.activities.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-dashed border-gray-300">
                <svg
                  className="mx-auto h-24 w-24 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Activities
                </h3>
                <p className="text-gray-500">
                  This mechanic has no assigned activities.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mechanic.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    {/* Enhanced Activity Header */}
                    <button
                      onClick={() => toggleActivity(activity.id)}
                      className="w-full px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <h3 className="text-lg font-extrabold text-gray-900">
                              {formatActivityName(activity.activityName)}
                            </h3>
                          </div>
                          <div className="ml-12 space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                              <span className="font-semibold">{activity.unitCode}</span>
                              <span>•</span>
                              <span>{activity.unitType}</span>
                              <span>({activity.unitBrand})</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Created: {formatDateTime(activity.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right bg-white px-4 py-2 rounded-lg">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                              Activity Time
                            </p>
                            <p className="text-lg font-bold text-green-600">
                              {activity.totalActivityTimeFormatted}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold border-2 shadow-sm ${getStatusBadgeColor(
                              activity.status
                            )}`}
                          >
                            {activity.status
                              .split("_")
                              .map(
                                (word) =>
                                  word.charAt(0) +
                                  word.slice(1).toLowerCase()
                              )
                              .join(" ")}
                          </span>
                          <svg
                            className={`w-6 h-6 text-gray-400 transition-transform ${
                              expandedActivities.has(activity.id)
                                ? "transform rotate-180"
                                : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {/* Tasks Dropdown */}
                    {expandedActivities.has(activity.id) && (
                      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <p className="text-xs font-medium text-gray-700 uppercase mb-3">
                          Tasks ({activity.tasks.length})
                        </p>
                        {activity.tasks.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-2">
                            No tasks recorded
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {activity.tasks.map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center justify-between p-3 bg-white rounded border border-gray-200"
                              >
                                <div className="flex items-center space-x-3">
                                  <span className="text-xs font-medium text-gray-500 w-8 text-center">
                                    #{task.order}
                                  </span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {formatTaskName(task.taskName)}
                                  </span>
                                  {task.isActive && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {task.durationFormatted}
                                  </p>
                                  {task.startedAt && (
                                    <p className="text-xs text-gray-500">
                                      {task.stoppedAt
                                        ? `Completed: ${formatDateTime(
                                            task.stoppedAt
                                          )}`
                                        : `Started: ${formatDateTime(
                                            task.startedAt
                                          )}`}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

