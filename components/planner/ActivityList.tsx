"use client";

import { Activity } from "./types";
import { apiClient } from "@/lib/api";

interface ActivityListProps {
  activities: Activity[];
  user: any;
  onViewDetails: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  formatActivityName: (name: string) => string;
  getStatusColor: (status: string) => string;
}

export default function ActivityList({
  activities,
  user,
  onViewDetails,
  onDelete,
  formatActivityName,
  getStatusColor,
}: ActivityListProps) {
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

  return (
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
            {activities.map((activity) => (
              <tr
                key={activity.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">
                    {activity.unit.unitCode}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {activity.unit.unitType}
                  </div>
                  <div className="text-xs text-gray-500">
                    {activity.unit.unitBrand}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {formatActivityName(activity.activityName)}
                  </div>
                  {activity.description && (
                    <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                      {activity.description}
                    </div>
                  )}
                  {activity.remarks && (
                    <div className="text-xs text-gray-400 italic mt-1 truncate max-w-xs">
                      {activity.remarks}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {activity.mechanics.length > 0 ? (
                      <div className="space-y-1">
                        {activity.mechanics.slice(0, 2).map((m) => (
                          <div key={m.mechanic.id} className="text-xs">
                            {m.mechanic.firstName} {m.mechanic.lastName}
                          </div>
                        ))}
                        {activity.mechanics.length > 2 && (
                          <div className="text-xs text-gray-500 font-medium">
                            +{activity.mechanics.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(activity.estimatedStart).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(activity.estimatedStart).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
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
                      className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                    >
                      View
                    </button>
                    {user?.role === "SUPERADMIN" && (
                      <button
                        onClick={() => onDelete(activity)}
                        className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
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
    </div>
  );
}

