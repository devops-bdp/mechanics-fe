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
        setActivities(activitiesRes.data);
      } else {
        setError("Failed to load activities");
      }

      if (unitsRes.success) {
        setUnits(unitsRes.data);
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
      // Check if selected unit has BREAKDOWN or INACTIVE status
      const selectedUnit = units.find((u) => u.id === formData.unitId);
      if (selectedUnit && selectedUnit.unitStatus !== "BREAKDOWN" && selectedUnit.unitStatus !== "INACTIVE") {
        setError(`Cannot create activity for unit with ${selectedUnit.unitStatus} status. Unit must be in BREAKDOWN or INACTIVE status. Please change the unit status first.`);
        return;
      }

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
      const errorMessage = err.response?.data?.message || err.message || "An error occurred";
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
        deleteConfirm.activity.id
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
              onClick={() => setIsModalOpen(true)}
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
