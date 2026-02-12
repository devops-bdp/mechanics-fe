"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Activity } from "@/components/group-leader/types";
import ActivityList from "@/components/group-leader/ActivityList";
import ActivityDetailModal from "@/components/group-leader/ActivityDetailModal";
import {
  formatActivityName,
  getStatusColor,
} from "@/components/group-leader/utils";

export default function GroupLeaderActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const user = getUser();

  useEffect(() => {
    loadData();
  }, [debouncedSearch, currentPage]);

  // Debounce search query and reset to page 1 when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const activitiesRes = await apiClient.getGroupLeaderActivities({
        search: debouncedSearch || undefined,
        page: currentPage,
        limit: 10,
      });

      if (activitiesRes.success) {
        setActivities(activitiesRes.data || []);
        if (activitiesRes.pagination) {
          setPagination(activitiesRes.pagination);
        }
      } else {
        setError("Failed to load activities");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartActivity = async (activityId: string) => {
    try {
      setError("");
      const response = await apiClient.startActivityForAllMechanics(activityId);

      if (response.success) {
        // Close modal and reload data (stays on current page)
        setIsDetailModalOpen(false);
        setSelectedActivity(null);
        await loadData();
      } else {
        setError(response.message || "Failed to start activity");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "An error occurred";
      setError(errorMessage);
    }
  };

  const handleStopActivity = async (activityId: string) => {
    try {
      setError("");
      const response = await apiClient.stopActivityForAllMechanics(activityId);

      if (response.success) {
        // Close modal and reload data (stays on current page)
        setIsDetailModalOpen(false);
        setSelectedActivity(null);
        await loadData();
      } else {
        setError(response.message || "Failed to stop activity");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "An error occurred";
      setError(errorMessage);
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Activities</h1>
                <p className="text-sm text-gray-600 mt-1">
                  View and monitor activities assigned to your group
                </p>
              </div>
            </div>
            {/* Search Bar */}
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by Activity ID, description, or remarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg
                      className="h-5 w-5 text-gray-400 hover:text-gray-600"
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
                )}
              </div>
            </div>
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
            <>
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
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-4 bg-white px-6 py-4 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(pagination.currentPage - 1) * pagination.limit + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        pagination.currentPage * pagination.limit,
                        pagination.totalCount
                      )}
                    </span>{" "}
                    of <span className="font-medium">{pagination.totalCount}</span>{" "}
                    activities
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPrevPage || isLoading}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm font-medium text-gray-700">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNextPage || isLoading}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <ActivityDetailModal
            isOpen={isDetailModalOpen}
            activity={selectedActivity}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedActivity(null);
            }}
            onStartActivity={handleStartActivity}
            onStopActivity={handleStopActivity}
            onRefresh={async () => {
              // Refresh the activity details
              if (selectedActivity) {
                try {
                  const response = await apiClient.getGroupLeaderActivityById(
                    selectedActivity.id,
                  );
                  if (response.success) {
                    setSelectedActivity(response.data);
                  }
                } catch (error) {
                  console.error("Error refreshing activity:", error);
                }
              }
              await loadData();
            }}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}
