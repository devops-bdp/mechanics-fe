"use client";

import { useState } from "react";
import { Activity } from "./types";
import {
  formatActivityName,
  formatTaskName,
  calculateTaskTime,
  formatTime,
  getStatusColor,
} from "./utils";
import { apiClient } from "@/lib/api";

interface ActivityDetailModalProps {
  isOpen: boolean;
  activity: Activity | null;
  onClose: () => void;
  onStartActivity?: (activityId: string) => void;
  onStopActivity?: (activityId: string) => void;
  onRefresh?: () => void;
}

export default function ActivityDetailModal({
  isOpen,
  activity,
  onClose,
  onStartActivity,
  onStopActivity,
  onRefresh,
}: ActivityDetailModalProps) {
  const [taskLoading, setTaskLoading] = useState<string | null>(null);
  const [taskError, setTaskError] = useState("");

  if (!isOpen || !activity) return null;

  const canStart =
    activity.activityStatus === "PENDING" && activity.mechanics.length > 0;
  const canStop = activity.activityStatus === "IN_PROGRESS";

  const handleStartTask = async (
    mechanicId: string,
    taskName: string,
  ) => {
    try {
      setTaskError("");
      setTaskLoading(`${mechanicId}-${taskName}`);
      const response = await apiClient.startMechanicTask(
        activity.id,
        mechanicId,
        taskName,
      );

      if (response.success) {
        if (onRefresh) {
          await onRefresh();
        }
      } else {
        setTaskError(response.message || "Failed to start task");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "An error occurred";
      setTaskError(errorMessage);
    } finally {
      setTaskLoading(null);
    }
  };

  const handleStopTask = async (
    mechanicId: string,
    taskName: string,
  ) => {
    try {
      setTaskError("");
      setTaskLoading(`${mechanicId}-${taskName}`);
      const response = await apiClient.stopMechanicTask(
        activity.id,
        mechanicId,
        taskName,
      );

      if (response.success) {
        if (onRefresh) {
          await onRefresh();
        }
      } else {
        setTaskError(response.message || "Failed to stop task");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "An error occurred";
      setTaskError(errorMessage);
    } finally {
      setTaskLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border-2 border-gray-200">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 sticky top-0 z-10 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Activity Details
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="px-6 py-6">
          <div className="space-y-6">
            {/* Status and Activity Name */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-md">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
                        {activity.unit.unitCode}
                      </h2>
                      <p className="text-sm font-medium text-gray-600">
                        {activity.unit.unitType} - {activity.unit.unitBrand}
                      </p>
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-md ${getStatusColor(
                    activity.activityStatus,
                  )}`}
                >
                  {activity.activityStatus.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Activity Name */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200">
              <label className="text-xs font-bold text-amber-800 mb-2 uppercase tracking-wide">
                📋 Activity Name
              </label>
              <p className="text-lg font-bold text-gray-900">
                {formatActivityName(activity.activityName)}
              </p>
            </div>

            {/* Description */}
            {activity.description && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                <label className="text-xs font-bold text-green-800 mb-2 uppercase tracking-wide">
                  📝 Description
                </label>
                <p className="text-sm font-medium text-gray-900 leading-relaxed">
                  {activity.description}
                </p>
              </div>
            )}

            {/* Remarks */}
            {activity.remarks && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                <label className="text-xs font-bold text-purple-800 mb-2 uppercase tracking-wide">
                  💬 Remarks
                </label>
                <p className="text-sm font-medium text-gray-700 italic leading-relaxed">
                  {activity.remarks}
                </p>
              </div>
            )}

            {/* Mechanics */}
            <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200 shadow-sm">
              <label className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Assigned Mechanics ({activity.mechanics.length})
              </label>
              <div className="space-y-3">
                {activity.mechanics.length > 0 ? (
                  activity.mechanics.map((m) => (
                    <div
                      key={m.mechanic.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 border-2 border-gray-200 shadow-md hover:shadow-lg transition-all duration-200 gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
                          <svg
                            className="h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-base">
                            {m.mechanic.firstName} {m.mechanic.lastName}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-semibold">NRP:</span>{" "}
                            {m.mechanic.nrp}
                            {m.mechanic.email && (
                              <span className="ml-2">
                                <span className="font-semibold">|</span>{" "}
                                <span className="font-semibold">Email:</span>{" "}
                                {m.mechanic.email}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      {m.status && (
                        <span
                          className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold shadow-md ${
                            m.status === "COMPLETED"
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                              : m.status === "IN_PROGRESS"
                                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                                : m.status === "PAUSED"
                                  ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white"
                                  : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                          }`}
                        >
                          {m.status.replace("_", " ")}
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-white/50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                    <p className="text-sm text-gray-500 text-center">
                      No mechanics assigned
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Average Total Task Time - Only show when COMPLETED */}
            {activity.activityStatus === "COMPLETED" &&
              activity.mechanics &&
              activity.mechanics.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-300 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg shadow-md">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-extrabold text-gray-900">
                      Average Total Task Time
                    </h3>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200 shadow-sm">
                    {(() => {
                      // Calculate total task time for each mechanic
                      const mechanicsWithTaskTime = activity.mechanics
                        .map((mechanic) => {
                          let totalTime = 0;
                          if (mechanic.totalTaskTimeMinutes !== undefined) {
                            totalTime = mechanic.totalTaskTimeMinutes;
                          } else if (mechanic.tasks && mechanic.tasks.length > 0) {
                            totalTime = mechanic.tasks.reduce(
                              (sum, task) =>
                                sum +
                                (task.durationMinutes ??
                                  calculateTaskTime(task)),
                              0,
                            );
                          } else if (mechanic.totalWorkTime) {
                            totalTime = mechanic.totalWorkTime;
                          }
                          return totalTime;
                        })
                        .filter((time) => time > 0);

                      if (mechanicsWithTaskTime.length === 0) {
                        return (
                          <p className="text-sm text-gray-600 text-center">
                            No task time data available
                          </p>
                        );
                      }

                      const averageTime =
                        mechanicsWithTaskTime.reduce((sum, time) => sum + time, 0) /
                        mechanicsWithTaskTime.length;
                      const averageTimeRounded = Math.round(averageTime);

                      return (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                              Average across {mechanicsWithTaskTime.length} mechanic
                              {mechanicsWithTaskTime.length > 1 ? "s" : ""}
                            </p>
                            <p className="text-xs text-gray-500">
                              Based on completed task times
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-extrabold text-green-700">
                              {formatTime(averageTimeRounded)}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              ({averageTimeRounded} menit)
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

            {/* Estimated Start */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-200">
              <label className="text-xs font-bold text-orange-800 mb-2 uppercase tracking-wide flex items-center gap-2">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Estimated Start Date & Time
              </label>
              <p className="text-base font-bold text-gray-900">
                {new Date(activity.estimatedStart).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Task Error Message */}
            {taskError && (
              <div className="mb-4 rounded-md bg-red-50 p-3 border border-red-200">
                <div className="text-sm text-red-800">{taskError}</div>
              </div>
            )}

            {/* Tasks Breakdown per Mechanic */}
            {activity.mechanics &&
              activity.mechanics.length > 0 &&
              activity.mechanics.some(
                (m) => m.tasks && m.tasks && m.tasks.length > 0,
              ) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Breakdown by Mechanic
                  </label>
                  <div className="space-y-4">
                    {activity.mechanics.map((mechanicAssignment) => {
                      if (
                        !mechanicAssignment.tasks ||
                        mechanicAssignment.tasks.length === 0
                      ) {
                        return null;
                      }

                      // Use backend calculated time if available, otherwise calculate
                      const totalMechanicTaskTime =
                        mechanicAssignment.totalTaskTimeMinutes ??
                        mechanicAssignment.tasks.reduce(
                          (sum, task) =>
                            sum +
                            (task.durationMinutes ?? calculateTaskTime(task)),
                          0,
                        );

                      return (
                        <div
                          key={mechanicAssignment.id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {mechanicAssignment.mechanic.firstName}{" "}
                                {mechanicAssignment.mechanic.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                NRP: {mechanicAssignment.mechanic.nrp}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-700">
                                Total Time
                              </p>
                              <p className="text-lg font-bold text-blue-600">
                                {mechanicAssignment.totalTaskTimeFormatted ??
                                  formatTime(totalMechanicTaskTime)}
                              </p>
                              {mechanicAssignment.totalTaskTimeMinutes && (
                                <p className="text-xs text-gray-500">
                                  ({mechanicAssignment.totalTaskTimeMinutes}{" "}
                                  menit)
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2">
                            {mechanicAssignment.tasks.map((task) => {
                              // Use backend calculated values if available
                              const taskTime =
                                task.durationMinutes ?? calculateTaskTime(task);
                              const isActive =
                                task.isActive ??
                                (task.startedAt && !task.stoppedAt);
                              const isCompleted =
                                task.startedAt && task.stoppedAt && !isActive;
                              return (
                                <div
                                  key={task.id}
                                  className={`flex items-center justify-between p-2 rounded-md border ${
                                    isActive
                                      ? "bg-green-50 border-green-300"
                                      : isCompleted
                                        ? "bg-gray-50 border-gray-200"
                                        : "bg-yellow-50 border-yellow-200"
                                  }`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-xs font-bold text-gray-600 bg-white px-1.5 py-0.5 rounded">
                                        #{task.order}
                                      </span>
                                      <span className="text-sm font-semibold text-gray-900">
                                        {formatTaskName(task.taskName)}
                                      </span>
                                      {isActive && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          ● Active
                                        </span>
                                      )}
                                      {isCompleted && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                          ✓ Completed
                                        </span>
                                      )}
                                    </div>
                                    {task.startedAt && (
                                      <div className="mt-1.5 space-y-0.5">
                                        <p className="text-xs text-gray-600">
                                          <span className="font-medium">
                                            Started:
                                          </span>{" "}
                                          {new Date(
                                            task.startedAt,
                                          ).toLocaleString()}
                                        </p>
                                        {task.stoppedAt && (
                                          <p className="text-xs text-gray-600">
                                            <span className="font-medium">
                                              Stopped:
                                            </span>{" "}
                                            {new Date(
                                              task.stoppedAt,
                                            ).toLocaleString()}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right ml-4 flex-shrink-0 flex items-center gap-2">
                                    <div>
                                      {task.durationFormatted ? (
                                        <div>
                                          <span className="text-base font-bold text-gray-900">
                                            {task.durationFormatted}
                                          </span>
                                          {task.durationMinutes && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                              {task.durationMinutes} menit
                                            </p>
                                          )}
                                        </div>
                                      ) : taskTime > 0 ? (
                                        <div>
                                          <span className="text-base font-bold text-gray-900">
                                            {formatTime(taskTime)}
                                          </span>
                                          <p className="text-xs text-gray-500 mt-0.5">
                                            {taskTime} menit
                                          </p>
                                        </div>
                                      ) : task.startedAt ? (
                                        <div>
                                          <span className="text-sm font-medium text-green-600">
                                            Sedang berjalan
                                          </span>
                                          <p className="text-xs text-gray-500 mt-0.5">
                                            {formatTime(calculateTaskTime(task))}
                                          </p>
                                        </div>
                                      ) : (
                                        <span className="text-xs text-gray-400 italic">
                                          Belum dimulai
                                        </span>
                                      )}
                                    </div>
                                    {/* Start/Stop Task Buttons */}
                                    {canStop && (
                                      <div className="flex gap-1">
                                        {!task.startedAt && (
                                          <button
                                            onClick={() =>
                                              handleStartTask(
                                                mechanicAssignment.mechanic.id,
                                                task.taskName,
                                              )
                                            }
                                            disabled={
                                              taskLoading ===
                                              `${mechanicAssignment.mechanic.id}-${task.taskName}`
                                            }
                                            className="px-2 py-1 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                            title="Start Task"
                                          >
                                            {taskLoading ===
                                            `${mechanicAssignment.mechanic.id}-${task.taskName}` ? (
                                              <svg
                                                className="animate-spin h-3 w-3"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                              >
                                                <circle
                                                  className="opacity-25"
                                                  cx="12"
                                                  cy="12"
                                                  r="10"
                                                  stroke="currentColor"
                                                  strokeWidth="4"
                                                />
                                                <path
                                                  className="opacity-75"
                                                  fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                              </svg>
                                            ) : (
                                              <svg
                                                className="h-3 w-3"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                                />
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                              </svg>
                                            )}
                                            Start
                                          </button>
                                        )}
                                        {task.startedAt && !task.stoppedAt && (
                                          <button
                                            onClick={() =>
                                              handleStopTask(
                                                mechanicAssignment.mechanic.id,
                                                task.taskName,
                                              )
                                            }
                                            disabled={
                                              taskLoading ===
                                              `${mechanicAssignment.mechanic.id}-${task.taskName}`
                                            }
                                            className="px-2 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                            title="Stop Task"
                                          >
                                            {taskLoading ===
                                            `${mechanicAssignment.mechanic.id}-${task.taskName}` ? (
                                              <svg
                                                className="animate-spin h-3 w-3"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                              >
                                                <circle
                                                  className="opacity-25"
                                                  cx="12"
                                                  cy="12"
                                                  r="10"
                                                  stroke="currentColor"
                                                  strokeWidth="4"
                                                />
                                                <path
                                                  className="opacity-75"
                                                  fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                              </svg>
                                            ) : (
                                              <svg
                                                className="h-3 w-3"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                                                />
                                              </svg>
                                            )}
                                            Stop
                                          </button>
                                        )}
                                      </div>
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
              )}

            {/* Created/Updated Info */}
            {(activity.createdAt || activity.updatedAt) && (
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500">
                  {activity.createdAt && (
                    <div>
                      <span className="font-medium">Created:</span>{" "}
                      {new Date(activity.createdAt).toLocaleString()}
                    </div>
                  )}
                  {activity.updatedAt && (
                    <div>
                      <span className="font-medium">Last Updated:</span>{" "}
                      {new Date(activity.updatedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="px-6 py-4 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-between items-center rounded-b-2xl">
          <div className="flex gap-3">
            {canStart && onStartActivity && (
              <button
                onClick={() => onStartActivity(activity.id)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center gap-2"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Start Activity
              </button>
            )}
            {canStop && onStopActivity && (
              <button
                onClick={() => onStopActivity(activity.id)}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center gap-2"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                  />
                </svg>
                Stop Activity
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
