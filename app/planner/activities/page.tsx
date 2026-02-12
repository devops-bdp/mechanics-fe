"use client";

import { useState, useEffect, FormEvent } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Activity, Unit } from "@/components/planner/types";
import ActivityList from "@/components/planner/ActivityList";
import ActivityFormModal from "@/components/planner/ActivityFormModal";
import ActivityDetailModal from "@/components/planner/ActivityDetailModal";
import DeleteConfirmModal from "@/components/planner/DeleteConfirmModal";
import { formatActivityName, getStatusColor } from "@/components/planner/utils";

export default function PlannerActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    activityName: "PERIODIC_SERVICE",
    unitId: "",
    description: "",
    remarks: "",
    estimatedStart: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
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
        apiClient.getUnits({
          page: 1,
          limit: 1000,
          sortBy: "unitCode",
          sortOrder: "asc",
        }),
      ]);

      if (activitiesRes.success) {
        setActivities(activitiesRes.data);
      } else {
        setError("Failed to load activities");
      }

      if (unitsRes.success) {
        console.log("Full API Response:", unitsRes);
        console.log("Units data:", unitsRes.data);
        console.log("Total units:", unitsRes.data?.length);

        // Check if data is in pagination format
        const unitsArray = Array.isArray(unitsRes.data)
          ? unitsRes.data
          : unitsRes.data?.data || [];

        console.log("Units array:", unitsArray);
        console.log(
          "BREAKDOWN units:",
          unitsArray.filter((u: any) => u.unitStatus === "BREAKDOWN"),
        );
        console.log(
          "INACTIVE units:",
          unitsArray.filter((u: any) => u.unitStatus === "INACTIVE"),
        );

        setUnits(unitsArray);
      } else {
        setError("Failed to load units");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await apiClient.createActivity({
        activityName: formData.activityName,
        unitId: formData.unitId,
        description: formData.description || undefined,
        remarks: formData.remarks || undefined,
        estimatedStart: formData.estimatedStart,
      });

      if (response.success) {
        setIsModalOpen(false);
        setFormData({
          activityName: "PERIODIC_SERVICE",
          unitId: "",
          description: "",
          remarks: "",
          estimatedStart: "",
        });
        loadData();
        setError("");
      } else {
        setError(response.message || "Failed to create activity");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "An error occurred";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.activity) return;

    setIsDeleting(true);
    try {
      const response = await apiClient.deleteActivityAdmin(
        deleteConfirm.activity.id,
      );
      if (response.success) {
        setDeleteConfirm({ isOpen: false, activity: null });
        loadData();
      } else {
        setError(response.message || "Failed to delete activity");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, activity: null });
  };

  // Calculate statistics
  const stats = {
    total: activities.length,
    pending: activities.filter((a) => a.activityStatus === "PENDING").length,
    inProgress: activities.filter((a) => a.activityStatus === "IN_PROGRESS").length,
    completed: activities.filter((a) => a.activityStatus === "COMPLETED").length,
    withoutGL: activities.filter((a) => !a.assignedGroupLeader).length,
    withoutMechanics: activities.filter((a) => !a.mechanics || a.mechanics.length === 0).length,
  };

  return (
    <ProtectedRoute
      allowedPosisi={["PLANNER", "SUPERVISOR", "DEPT_HEAD", "MANAGEMENT"]}
      allowedRoles={["ADMIN", "SUPERADMIN"]}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Header Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-6 sm:p-8 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                    Activity Management
                  </h1>
                  <p className="text-blue-100 text-sm sm:text-base">
                    Manage and monitor all mechanic activities
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all transform hover:scale-105"
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
                  Create New Activity
                </button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-gray-400 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-2">
                    <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <div className="bg-green-100 rounded-lg p-2">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-amber-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Need GL</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.withoutGL}</p>
                  </div>
                  <div className="bg-amber-100 rounded-lg p-2">
                    <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Need Mechanics</p>
                    <p className="text-2xl font-bold text-red-600">{stats.withoutMechanics}</p>
                  </div>
                  <div className="bg-red-100 rounded-lg p-2">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border-l-4 border-red-500 p-4 shadow-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm font-medium text-red-800">{error}</div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading activities...</p>
              </div>
            </div>
          ) : activities.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-dashed border-gray-300">
              <div className="max-w-md mx-auto">
                <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No activities yet</h3>
                <p className="text-gray-500 mb-6">Get started by creating your first activity</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all transform hover:scale-105"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Your First Activity
                </button>
              </div>
            </div>
          ) : (
            <ActivityList
              activities={activities}
              user={user}
              onViewDetails={(activity) => {
                setSelectedActivity(activity);
                setIsDetailModalOpen(true);
              }}
              onDelete={(activity) =>
                setDeleteConfirm({ isOpen: true, activity })
              }
              formatActivityName={formatActivityName}
              getStatusColor={getStatusColor}
              onRefresh={loadData}
            />
          )}

          <ActivityFormModal
            isOpen={isModalOpen}
            formData={formData}
            units={units}
            isSubmitting={isSubmitting}
            error={error}
            onClose={() => {
              setIsModalOpen(false);
              setError("");
            }}
            onSubmit={handleSubmit}
            onFormDataChange={setFormData}
            onError={setError}
          />

          <ActivityDetailModal
            isOpen={isDetailModalOpen}
            activity={selectedActivity}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedActivity(null);
            }}
          />

          <DeleteConfirmModal
            isOpen={deleteConfirm.isOpen}
            activity={deleteConfirm.activity}
            isDeleting={isDeleting}
            onCancel={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}
