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
  }, [mechanicId]);

  const loadMechanicDetail = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await apiClient.getMechanicsReport();
      if (response.success) {
        const mechanics = response.data || [];
        const foundMechanic = mechanics.find(
          (m: Mechanic) => m.id === mechanicId
        );
        if (foundMechanic) {
          setMechanic(foundMechanic);
        } else {
          setError("Mechanic not found");
        }
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
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading mechanic details...</p>
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
      allowedPosisi={["PLANNER"]}
      allowedRoles={["ADMIN", "SUPERADMIN"]}
    >
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
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

          {/* Mechanic Header */}
          <div className="mb-6 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600">
              <h1 className="text-2xl font-bold text-white">
                {mechanic.firstName} {mechanic.lastName}
              </h1>
              <p className="text-sm text-primary-100 mt-1">
                NRP: {mechanic.nrp} • Email: {mechanic.email}
              </p>
            </div>
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold text-primary-600">
                  {mechanic.totalActivities}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Work Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mechanic.totalMechanicTimeFormatted}
                </p>
              </div>
            </div>
          </div>

          {/* Activities List */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Activities ({mechanic.activities.length})
            </h2>

            {mechanic.activities.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No Activities
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  This mechanic has no assigned activities.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mechanic.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                  >
                    {/* Activity Header */}
                    <button
                      onClick={() => toggleActivity(activity.id)}
                      className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formatActivityName(activity.activityName)}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.unitCode} • {activity.unitType} (
                            {activity.unitBrand})
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Created: {formatDateTime(activity.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase">
                              Activity Time
                            </p>
                            <p className="text-sm font-bold text-primary-600">
                              {activity.totalActivityTimeFormatted}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
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
                            className={`w-5 h-5 text-gray-400 transition-transform ${
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

