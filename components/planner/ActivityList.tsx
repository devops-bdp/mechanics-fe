"use client";

import { useState } from "react";
import { Activity } from "./types";
import { apiClient } from "@/lib/api";
import AssignGroupLeaderModal from "./AssignGroupLeaderModal";

interface ActivityListProps {
  activities: Activity[];
  user: any;
  onViewDetails: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  onAssignGroupLeader?: (activity: Activity) => void;
  formatActivityName: (name: string) => string;
  getStatusColor: (status: string) => string;
  onRefresh?: () => void;
}

export default function ActivityList({
  activities,
  user,
  onViewDetails,
  onDelete,
  onAssignGroupLeader,
  formatActivityName,
  getStatusColor,
  onRefresh,
}: ActivityListProps) {
  const [assignGLModalOpen, setAssignGLModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );

  const handleViewClick = async (activity: Activity) => {
    try {
      const response = await apiClient.getActivityById(activity.id);
      if (response.success) {
        onViewDetails(response.data);
      } else {
        onViewDetails(activity);
      }
    } catch (error) {
      console.error("Error fetching activity details:", error);
      onViewDetails(activity);
    }
  };

  const handleAssignGLClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setAssignGLModalOpen(true);
  };

  const handleAssignGLSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Unit Code
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Unit Info
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Activity Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Assigned GL
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Mechanics
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Estimated Start
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr
                key={activity.id}
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border-b border-gray-100"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">
                        {activity.unit.unitCode.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      {activity.unit.unitCode}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">
                    {activity.unit.unitType}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center mt-1">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    {activity.unit.unitBrand}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {formatActivityName(activity.activityName)}
                  </div>
                  {activity.description && (
                    <div className="text-xs text-gray-500 mt-1 truncate max-w-xs flex items-center">
                      <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      {activity.description}
                    </div>
                  )}
                  {activity.remarks && (
                    <div className="text-xs text-gray-400 italic mt-1 truncate max-w-xs">
                      {activity.remarks}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {activity.assignedGroupLeader ? (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-green-700 font-semibold text-xs">
                          {activity.assignedGroupLeader.firstName[0]}{activity.assignedGroupLeader.lastName[0]}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {activity.assignedGroupLeader.firstName}{" "}
                        {activity.assignedGroupLeader.lastName}
                      </div>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Not assigned
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {activity.mechanics.length > 0 ? (
                      <div className="flex items-center space-x-1">
                        {activity.mechanics.slice(0, 3).map((m, idx) => (
                          <div key={m.mechanic.id} className="flex-shrink-0 w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white">
                            <span className="text-blue-700 font-semibold text-xs">
                              {m.mechanic.firstName[0]}{m.mechanic.lastName[0]}
                            </span>
                          </div>
                        ))}
                        {activity.mechanics.length > 3 && (
                          <div className="flex-shrink-0 w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white">
                            <span className="text-gray-700 font-semibold text-xs">
                              +{activity.mechanics.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        None
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(activity.estimatedStart).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center mt-1">
                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(activity.estimatedStart).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${getStatusColor(
                      activity.activityStatus
                    )}`}
                  >
                    {activity.activityStatus.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleViewClick(activity)}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-all hover:shadow-md hover:scale-105"
                    >
                      View
                    </button>
                    {!activity.assignedGroupLeader && (
                      <button
                        onClick={() => handleAssignGLClick(activity)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105"
                        title="Assign Group Leader"
                      >
                        Assign GL
                      </button>
                    )}
                    {user?.role === "SUPERADMIN" && (
                      <button
                        onClick={() => onDelete(activity)}
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-all hover:scale-110"
                        title="Delete Activity"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedActivity && (
        <AssignGroupLeaderModal
          isOpen={assignGLModalOpen}
          activityId={selectedActivity.id}
          assignedGroupLeaderId={selectedActivity.assignedGroupLeader?.id}
          onClose={() => {
            setAssignGLModalOpen(false);
            setSelectedActivity(null);
          }}
          onSuccess={handleAssignGLSuccess}
        />
      )}
    </div>
  );
}

