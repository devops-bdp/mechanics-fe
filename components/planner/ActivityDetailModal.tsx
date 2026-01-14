"use client";

import { Activity } from "./types";
import {
  formatActivityName,
  formatTaskName,
  calculateTaskTime,
  formatTime,
  getStatusColor,
} from "./utils";

interface ActivityDetailModalProps {
  isOpen: boolean;
  activity: Activity | null;
  onClose: () => void;
}

export default function ActivityDetailModal({
  isOpen,
  activity,
  onClose,
}: ActivityDetailModalProps) {
  if (!isOpen || !activity) return null;

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
                    activity.activityStatus
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

            {/* Tasks Breakdown per Mechanic */}
            {activity.mechanics &&
              activity.mechanics.length > 0 &&
              activity.mechanics.some(
                (m) => m.tasks && m.tasks && m.tasks.length > 0
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
                          0
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
                                            task.startedAt
                                          ).toLocaleString()}
                                        </p>
                                        {task.stoppedAt && (
                                          <p className="text-xs text-gray-600">
                                            <span className="font-medium">
                                              Stopped:
                                            </span>{" "}
                                            {new Date(
                                              task.stoppedAt
                                            ).toLocaleString()}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right ml-4 flex-shrink-0">
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
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Total Activity Time - Breakdown Per Mechanic */}
                  <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300 shadow-lg">
                    {/* Per-Mechanic Breakdown */}
                    <div className="space-y-2">
                      {activity.mechanics.map((mechanicAssignment, index) => {
                        if (
                          !mechanicAssignment.tasks ||
                          mechanicAssignment.tasks.length === 0
                        )
                          return null;

                        const mechanicTotalTaskTime =
                          mechanicAssignment.tasks.reduce(
                            (sum, task) =>
                              sum +
                              (task.durationMinutes ?? calculateTaskTime(task)),
                            0
                          );

                        if (mechanicTotalTaskTime === 0) return null;

                        const mechanicName = mechanicAssignment.mechanic
                          ? `${mechanicAssignment.mechanic.firstName} ${mechanicAssignment.mechanic.lastName}`
                          : `Mechanic ${String.fromCharCode(65 + index)}`; // A, B, C, etc.

                        return (
                          <div
                            key={mechanicAssignment.id || index}
                            className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200 shadow-sm"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-blue-900 flex items-center gap-2">
                                <span>👤</span> Total Time Activity{" "}
                                {mechanicName}:
                              </span>
                              <span className="text-lg font-extrabold text-blue-900">
                                {formatTime(mechanicTotalTaskTime)}
                              </span>
                            </div>
                            <p className="text-xs text-blue-700 mt-1 ml-6">
                              ({mechanicTotalTaskTime} menit)
                            </p>
                          </div>
                        );
                      })}
                    </div>
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
        <div className="px-6 py-4 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-end rounded-b-2xl">
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

