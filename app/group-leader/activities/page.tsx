"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Activity } from "@/components/group-leader/types";
import ActivityList from "@/components/group-leader/ActivityList";
import ActivityDetailModal from "@/components/group-leader/ActivityDetailModal";
import { formatActivityName, getStatusColor } from "@/components/group-leader/utils";

export default function GroupLeaderActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const user = getUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const activitiesRes = await apiClient.getGroupLeaderActivities();

      if (activitiesRes.success) {
        setActivities(activitiesRes.data || []);
      } else {
        setError("Failed to load activities");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute
      allowedPosisi={["GROUP_LEADER_MEKANIK", "GROUP_LEADER_TYRE"]}
      allowedRoles={["ADMIN", "SUPERADMIN"]}
    >
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
            <p className="text-sm text-gray-600 mt-1">
              View and monitor activities assigned to your group
            </p>
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
              <p className="text-gray-500">No activities available.</p>
            </div>
          ) : (
            <ActivityList
              activities={activities}
              user={user}
              onViewDetails={(activity) => {
                setSelectedActivity(activity);
                setIsDetailModalOpen(true);
              }}
              formatActivityName={formatActivityName}
              getStatusColor={getStatusColor}
              onRefresh={loadData}
            />
          )}

          <ActivityDetailModal
            isOpen={isDetailModalOpen}
            activity={selectedActivity}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedActivity(null);
            }}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}

