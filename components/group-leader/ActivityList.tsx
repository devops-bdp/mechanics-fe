"use client";

import { useState } from "react";
import { Activity } from "./types";
import { apiClient } from "@/lib/api";
import AssignMechanicsModal from "./AssignMechanicsModal";

interface ActivityListProps {
  activities: Activity[];
  user: any;
  onViewDetails: (activity: Activity) => void;
  formatActivityName: (name: string) => string;
  getStatusColor: (status: string) => string;
  onRefresh?: () => void;
}

export default function ActivityList({
  activities,
  user,
  onViewDetails,
  formatActivityName,
  getStatusColor,
  onRefresh,
}: ActivityListProps) {
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const handleViewClick = async (activity: Activity) => {
    try {
      const response = await apiClient.getGroupLeaderActivityById(activity.id);
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

  const handleAssignClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setAssignModalOpen(true);
  };

  const handleAssignSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Activity ID
              </th>
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
                Created By
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Assigned GL
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
                  <div className="text-sm font-mono text-gray-900">
                    {activity.id.substring(0, 8)}...
                  </div>
                </td>
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
                  {activity.creator ? (
                    <div className="text-sm text-gray-900">
                      {activity.creator.firstName} {activity.creator.lastName}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {activity.assignedGL ? (
                    <div className="text-sm text-gray-900">
                      {activity.assignedGL.firstName} {activity.assignedGL.lastName}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
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
                    {activity.mechanics.length === 0 && (
                      <button
                        onClick={() => handleAssignClick(activity)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                      >
                        Assign
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
        <AssignMechanicsModal
          isOpen={assignModalOpen}
          activityId={selectedActivity.id}
          assignedMechanicIds={selectedActivity.mechanics.map(m => m.mechanic.id)}
          onClose={() => {
            setAssignModalOpen(false);
            setSelectedActivity(null);
          }}
          onSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
}

