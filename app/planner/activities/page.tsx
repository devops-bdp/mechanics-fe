"use client";

import { useState, useEffect, FormEvent } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import { getUser } from "@/lib/auth";

interface Activity {
  id: string;
  activityName: string;
  description?: string;
  remarks?: string;
  activityStatus: string;
  estimatedStart: string;
  createdAt?: string;
  updatedAt?: string;
  unit: {
    id: string;
    unitCode: string;
    unitType: string;
    unitBrand: string;
    unitDescription?: string;
  };
  mechanics: Array<{
    id: string;
    status?: string;
    startedAt?: string | null;
    stoppedAt?: string | null;
    totalWorkTime?: number;
    mechanic: {
      id: string;
      firstName: string;
      lastName: string;
      nrp: number;
      email?: string;
    };
    tasks?: Array<{
      id: string;
      taskName: string;
      order: number;
      startedAt: string | null;
      stoppedAt: string | null;
      durationMinutes?: number;
      durationFormatted?: string;
      isActive?: boolean;
    }>;
    totalTaskTimeMinutes?: number;
    totalTaskTimeFormatted?: string;
  }>;
}

interface Unit {
  id: string;
  unitCode: string;
  unitType: string;
  unitBrand: string;
  unitDescription?: string;
}

export default function PlannerActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    activityName: "PERIODIC_SERVICE",
    unitId: "",
    mechanicIds: [] as string[],
    description: "",
    remarks: "",
    estimatedStart: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [isLoadingMechanics, setIsLoadingMechanics] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    activity: Activity | null;
  }>({ isOpen: false, activity: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const user = getUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [activitiesRes, unitsRes] = await Promise.all([
        apiClient.getAllActivities(),
        apiClient.getUnits(),
      ]);

      if (activitiesRes.success) {
        setActivities(activitiesRes.data || []);
      }
      if (unitsRes.success) {
        setUnits(unitsRes.data || []);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMechanics = async () => {
    try {
      setIsLoadingMechanics(true);
      const response = await apiClient.getMechanics();
      if (response.success) {
        setMechanics(response.data || []);
      } else {
        setError(response.message || "Failed to load mechanics");
      }
    } catch (error: any) {
      console.error("Failed to load mechanics:", error);
      setError(
        error.response?.data?.message ||
          "Failed to load mechanics. Please refresh the page."
      );
    } finally {
      setIsLoadingMechanics(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validate mechanicIds
      if (formData.mechanicIds.length === 0) {
        setError("Please add at least one mechanic");
        setIsSubmitting(false);
        return;
      }

      if (formData.mechanicIds.length > 7) {
        setError("Maximum 7 mechanics allowed");
        setIsSubmitting(false);
        return;
      }

      const response = await apiClient.createActivity({
        activityName: formData.activityName,
        unitId: formData.unitId,
        mechanicIds: formData.mechanicIds,
        description: formData.description || undefined,
        remarks: formData.remarks || undefined,
        estimatedStart: formData.estimatedStart,
      });

      if (response.success) {
        setIsModalOpen(false);
        setFormData({
          activityName: "PERIODIC_SERVICE",
          unitId: "",
          mechanicIds: [],
          description: "",
          remarks: "",
          estimatedStart: "",
        });
        loadData();
      } else {
        setError(response.message || "Failed to create activity");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-gray-100 text-gray-800";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatActivityName = (name: string) => {
    return name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.activity) return;

    try {
      setIsDeleting(true);
      const response = await apiClient.deleteActivityAdmin(
        deleteConfirm.activity!.id
      );
      if (response.success) {
        // Remove deleted activity from list
        setActivities((prev) =>
          prev.filter((a) => a.id !== deleteConfirm.activity!.id)
        );
        setDeleteConfirm({ isOpen: false, activity: null });
        setError("");
      } else {
        setError(response.message || "Failed to delete activity");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete activity");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, activity: null });
  };

  const formatTaskName = (taskName: string): string => {
    return taskName
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const calculateTaskTime = (task: {
    startedAt: string | null;
    stoppedAt: string | null;
  }): number => {
    if (!task.startedAt) return 0;
    const start = new Date(task.startedAt);
    const end = task.stoppedAt ? new Date(task.stoppedAt) : new Date();
    const diffMs = end.getTime() - start.getTime();
    return Math.floor(diffMs / 60000); // Convert to minutes
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <ProtectedRoute
      allowedPosisi={["PLANNER"]}
      allowedRoles={["ADMIN", "SUPERADMIN"]}
    >
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
              Activities
            </h1>
            <button
              onClick={() => {
                setIsModalOpen(true);
                loadMechanics();
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create Activity
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
              <p className="text-gray-500">No activities created yet.</p>
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
                              <span className="text-xs text-gray-400">
                                None
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(
                              activity.estimatedStart
                            ).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(
                              activity.estimatedStart
                            ).toLocaleTimeString()}
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
                              onClick={async () => {
                                // Fetch fresh activity data with tasks
                                try {
                                  const response =
                                    await apiClient.getActivityById(
                                      activity.id
                                    );
                                  if (response.success) {
                                    setSelectedActivity(response.data);
                                    setIsDetailModalOpen(true);
                                  } else {
                                    // Fallback to activity from list if fetch fails
                                    setSelectedActivity(activity);
                                    setIsDetailModalOpen(true);
                                  }
                                } catch (error) {
                                  // Fallback to activity from list if fetch fails
                                  console.error(
                                    "Error fetching activity details:",
                                    error
                                  );
                                  setSelectedActivity(activity);
                                  setIsDetailModalOpen(true);
                                }
                              }}
                              className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                            >
                              View
                            </button>
                            {user?.role === "SUPERADMIN" && (
                              <button
                                onClick={() =>
                                  setDeleteConfirm({ isOpen: true, activity })
                                }
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
          )}

          {/* Activity Detail Modal */}
          {isDetailModalOpen && selectedActivity && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
              <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      Activity Details
                    </h3>
                    <button
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        setSelectedActivity(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
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
                <div className="px-6 py-4">
                  <div className="space-y-6">
                    {/* Status and Activity Name */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                          {selectedActivity.unit.unitCode}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {selectedActivity.unit.unitType} -{" "}
                          {selectedActivity.unit.unitBrand}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          selectedActivity.activityStatus
                        )}`}
                      >
                        {selectedActivity.activityStatus.replace("_", " ")}
                      </span>
                    </div>

                    {/* Activity Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Activity Name
                      </label>
                      <p className="text-sm text-gray-900">
                        {formatActivityName(selectedActivity.activityName)}
                      </p>
                    </div>

                    {/* Unit Details */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Details
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">
                              Unit Code:
                            </span>
                            <p className="text-gray-900">
                              {selectedActivity.unit.unitCode}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Unit Type:
                            </span>
                            <p className="text-gray-900">
                              {selectedActivity.unit.unitType}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Unit Brand:
                            </span>
                            <p className="text-gray-900">
                              {selectedActivity.unit.unitBrand}
                            </p>
                          </div>
                          {selectedActivity.unit.unitDescription && (
                            <div className="col-span-2">
                              <span className="font-medium text-gray-600">
                                Description:
                              </span>
                              <p className="text-gray-900">
                                {selectedActivity.unit.unitDescription}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {selectedActivity.description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                          {selectedActivity.description}
                        </p>
                      </div>
                    )}

                    {/* Remarks */}
                    {selectedActivity.remarks && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Remarks
                        </label>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 italic">
                          {selectedActivity.remarks}
                        </p>
                      </div>
                    )}

                    {/* Mechanics */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assigned Mechanics ({selectedActivity.mechanics.length})
                      </label>
                      <div className="bg-gray-50 rounded-lg p-4">
                        {selectedActivity.mechanics.length > 0 ? (
                          <div className="space-y-3">
                            {selectedActivity.mechanics.map((m) => (
                              <div
                                key={m.mechanic.id}
                                className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200"
                              >
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {m.mechanic.firstName} {m.mechanic.lastName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    NRP: {m.mechanic.nrp} | Email:{" "}
                                    {m.mechanic.email}
                                  </p>
                                </div>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    m.status === "COMPLETED"
                                      ? "bg-green-100 text-green-800"
                                      : m.status === "IN_PROGRESS"
                                      ? "bg-blue-100 text-blue-800"
                                      : m.status === "PAUSED"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {m.status?.replace("_", " ") || "PENDING"}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No mechanics assigned
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Estimated Start */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Start Date & Time
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                        {new Date(
                          selectedActivity.estimatedStart
                        ).toLocaleString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Created/Updated Info */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500">
                        <div>
                          <span className="font-medium">Created:</span>{" "}
                          {selectedActivity.createdAt
                            ? new Date(
                                selectedActivity.createdAt
                              ).toLocaleString()
                            : "N/A"}
                        </div>
                        {selectedActivity.updatedAt && (
                          <div>
                            <span className="font-medium">Last Updated:</span>{" "}
                            {new Date(
                              selectedActivity.updatedAt
                            ).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setSelectedActivity(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                  <h3 className="text-lg font-medium text-gray-900">
                    Create Activity
                  </h3>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-4">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="activityName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Activity Name <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="activityName"
                        value={formData.activityName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            activityName: e.target.value,
                          })
                        }
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <optgroup label="General Activities">
                          <option value="PERIODIC_SERVICE">
                            Periodic Service
                          </option>
                          <option value="SCHEDULED_MAINTENANCE">
                            Scheduled Maintenance
                          </option>
                          <option value="UNSCHEDULED_MAINTENANCE">
                            Unscheduled Maintenance
                          </option>
                          <option value="TROUBLESHOOTING">
                            Troubleshooting
                          </option>
                          <option value="REPAIR_AND_ADJUSTMENT">
                            Repair and Adjustment
                          </option>
                          <option value="GENERAL_REPAIR">General Repair</option>
                          <option value="PERIODIC_INSPECTION">
                            Periodic Inspection
                          </option>
                        </optgroup>
                        <optgroup label="Tyre Activities">
                          <option value="PERIODIC_INSPECTION_TYRE">
                            Periodic Inspection Tyre
                          </option>
                          <option value="PERIODIC_SERVICE_TYRE">
                            Periodic Service Tyre
                          </option>
                          <option value="RETORQUE_TYRE">Retorque Tyre</option>
                          <option value="REPAIR_TYRE">Repair Tyre</option>
                          <option value="TROUBLESHOOTING_TYRE">
                            Troubleshooting Tyre
                          </option>
                        </optgroup>
                        <optgroup label="Other">
                          <option value="OTHER">Other</option>
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="unitId"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Unit <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="unitId"
                        value={formData.unitId}
                        onChange={(e) =>
                          setFormData({ ...formData, unitId: e.target.value })
                        }
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="">Select a unit</option>
                        {units.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.unitCode} - {unit.unitType} ({unit.unitBrand})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="mechanicIds"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Mechanics (1-7) <span className="text-red-500">*</span>
                      </label>
                      {isLoadingMechanics ? (
                        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500">
                          Loading mechanics...
                        </div>
                      ) : (
                        <>
                          <select
                            id="mechanicIds"
                            multiple
                            size={5}
                            value={formData.mechanicIds}
                            onChange={(e) => {
                              const selectedIds = Array.from(
                                e.target.selectedOptions,
                                (option) => option.value
                              );
                              if (selectedIds.length <= 7) {
                                setFormData({
                                  ...formData,
                                  mechanicIds: selectedIds,
                                });
                              } else {
                                setError("Maximum 7 mechanics allowed");
                              }
                            }}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                          >
                            {mechanics.length === 0 ? (
                              <option value="" disabled>
                                No mechanics available
                              </option>
                            ) : (
                              mechanics.map((mechanic) => (
                                <option key={mechanic.id} value={mechanic.id}>
                                  {mechanic.firstName} {mechanic.lastName} (NRP:{" "}
                                  {mechanic.nrp}) - {mechanic.email}
                                </option>
                              ))
                            )}
                          </select>
                          <p className="mt-1 text-xs text-gray-500">
                            {formData.mechanicIds.length}/7 mechanics selected.
                            Hold Ctrl/Cmd to select multiple.
                          </p>
                          {formData.mechanicIds.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {formData.mechanicIds.map((id) => {
                                const mechanic = mechanics.find(
                                  (m) => m.id === id
                                );
                                return (
                                  <span
                                    key={id}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                                  >
                                    {mechanic
                                      ? `${mechanic.firstName} ${mechanic.lastName}`
                                      : id}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFormData({
                                          ...formData,
                                          mechanicIds:
                                            formData.mechanicIds.filter(
                                              (mechId) => mechId !== id
                                            ),
                                        });
                                      }}
                                      className="ml-2 text-primary-600 hover:text-primary-800"
                                    >
                                      ×
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Activity description"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="remarks"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Remarks
                      </label>
                      <textarea
                        id="remarks"
                        value={formData.remarks}
                        onChange={(e) =>
                          setFormData({ ...formData, remarks: e.target.value })
                        }
                        rows={2}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Additional remarks"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="estimatedStart"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Estimated Start <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        id="estimatedStart"
                        value={formData.estimatedStart}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            estimatedStart: e.target.value,
                          })
                        }
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {isSubmitting ? "Creating..." : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Activity Detail Modal */}
          {isDetailModalOpen && selectedActivity && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
              <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      Activity Details
                    </h3>
                    <button
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        setSelectedActivity(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
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
                <div className="px-6 py-4">
                  <div className="space-y-6">
                    {/* Status and Activity Name */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                          {selectedActivity.unit.unitCode}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {selectedActivity.unit.unitType} -{" "}
                          {selectedActivity.unit.unitBrand}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          selectedActivity.activityStatus
                        )}`}
                      >
                        {selectedActivity.activityStatus.replace("_", " ")}
                      </span>
                    </div>

                    {/* Activity Name */}
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200">
                      <label className="text-xs font-bold text-amber-800 mb-2 uppercase tracking-wide">
                        📋 Activity Name
                      </label>
                      <p className="text-lg font-bold text-gray-900">
                        {formatActivityName(selectedActivity.activityName)}
                      </p>
                    </div>

                    {/* Description */}
                    {selectedActivity.description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                          {selectedActivity.description}
                        </p>
                      </div>
                    )}

                    {/* Remarks */}
                    {selectedActivity.remarks && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Remarks
                        </label>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 italic">
                          {selectedActivity.remarks}
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
                        Assigned Mechanics ({selectedActivity.mechanics.length})
                      </label>
                      <div className="space-y-3">
                        {selectedActivity.mechanics.length > 0 ? (
                          selectedActivity.mechanics.map((m) => (
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
                                        <span className="font-semibold">
                                          Email:
                                        </span>{" "}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Start Date & Time
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                        {new Date(
                          selectedActivity.estimatedStart
                        ).toLocaleString("en-US", {
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
                    {selectedActivity.mechanics &&
                      selectedActivity.mechanics.length > 0 &&
                      selectedActivity.mechanics.some(
                        (m) => m.tasks && m.tasks && m.tasks.length > 0
                      ) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Task Breakdown by Mechanic
                          </label>
                          <div className="space-y-4">
                            {selectedActivity.mechanics.map(
                              (mechanicAssignment) => {
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
                                      (task.durationMinutes ??
                                        calculateTaskTime(task)),
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
                                          {
                                            mechanicAssignment.mechanic
                                              .firstName
                                          }{" "}
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
                                            (
                                            {
                                              mechanicAssignment.totalTaskTimeMinutes
                                            }{" "}
                                            menit)
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      {mechanicAssignment.tasks.map((task) => {
                                        // Use backend calculated values if available
                                        const taskTime =
                                          task.durationMinutes ??
                                          calculateTaskTime(task);
                                        const isActive =
                                          task.isActive ??
                                          (task.startedAt && !task.stoppedAt);
                                        const isCompleted =
                                          task.startedAt &&
                                          task.stoppedAt &&
                                          !isActive;
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
                                                  {formatTaskName(
                                                    task.taskName
                                                  )}
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
                                                      {task.durationMinutes}{" "}
                                                      menit
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
                                                    {formatTime(
                                                      calculateTaskTime(task)
                                                    )}
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
                              }
                            )}
                          </div>
                          {/* Total Activity Time - Breakdown Per Mechanic */}
                          <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300 shadow-lg">
                            {/* Per-Mechanic Breakdown */}
                            <div className="space-y-2">
                              {selectedActivity.mechanics.map(
                                (mechanicAssignment, index) => {
                                  if (
                                    !mechanicAssignment.tasks ||
                                    mechanicAssignment.tasks.length === 0
                                  )
                                    return null;

                                  const mechanicTotalTaskTime =
                                    mechanicAssignment.tasks.reduce(
                                      (sum, task) =>
                                        sum +
                                        (task.durationMinutes ??
                                          calculateTaskTime(task)),
                                      0
                                    );

                                  if (mechanicTotalTaskTime === 0) return null;

                                  const mechanicName =
                                    mechanicAssignment.mechanic
                                      ? `${mechanicAssignment.mechanic.firstName} ${mechanicAssignment.mechanic.lastName}`
                                      : `Mechanic ${String.fromCharCode(
                                          65 + index
                                        )}`; // A, B, C, etc.

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
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Created/Updated Info */}
                    {(selectedActivity.createdAt ||
                      selectedActivity.updatedAt) && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500">
                          {selectedActivity.createdAt && (
                            <div>
                              <span className="font-medium">Created:</span>{" "}
                              {new Date(
                                selectedActivity.createdAt
                              ).toLocaleString()}
                            </div>
                          )}
                          {selectedActivity.updatedAt && (
                            <div>
                              <span className="font-medium">Last Updated:</span>{" "}
                              {new Date(
                                selectedActivity.updatedAt
                              ).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-6 py-4 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-end rounded-b-2xl">
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setSelectedActivity(null);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteConfirm.isOpen && deleteConfirm.activity && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Confirm Delete Activity
                  </h3>
                </div>
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-700 mb-4">
                    Are you sure you want to permanently delete this activity?
                    This action cannot be undone.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-gray-900">
                      {deleteConfirm.activity.unit.unitCode} -{" "}
                      {deleteConfirm.activity.unit.unitType}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatActivityName(deleteConfirm.activity.activityName)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {deleteConfirm.activity.mechanics.length} mechanic(s)
                      assigned
                    </p>
                  </div>
                  <p className="text-xs text-red-600 mb-4">
                    ⚠️ Warning: This will permanently delete the activity and
                    all associated mechanic assignments and tasks.
                  </p>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                  <button
                    onClick={handleDeleteCancel}
                    disabled={isDeleting}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete Permanently"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
