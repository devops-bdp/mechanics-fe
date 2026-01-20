"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";

interface Task {
  id: string;
  taskName: string;
  order: number;
  startedAt: string | null;
  stoppedAt: string | null;
  durationSeconds: number;
  durationFormatted: string;
  isActive: boolean;
}

interface Activity {
  id: string;
  activityId: string;
  activityName: string;
  unitCode: string;
  unitType: string;
  unitBrand: string;
  status: string;
  startedAt: string | null;
  stoppedAt: string | null;
  createdAt: string;
  tasks: Task[];
  totalActivitySeconds: number;
  totalActivityTimeFormatted: string;
}

interface Mechanic {
  id: string;
  firstName: string;
  lastName: string;
  nrp: number;
  email: string;
  activities: Activity[];
  totalActivities: number;
  totalMechanicSeconds: number;
  totalMechanicTimeFormatted: string;
}

export default function MechanicsReportPage() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
  });

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setIsLoading(true);
      setError("");
      const params: any = {};
      if (filters.search && filters.search.trim() !== "") {
        params.search = filters.search;
      }

      const response = await apiClient.getMechanicsReport(params);
      if (response.success) {
        setMechanics(response.data || []);
      } else {
        setError(response.message || "Failed to load mechanics report");
      }
    } catch (err: any) {
      console.error("Error loading mechanics report:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load mechanics report"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApplyFilters = () => {
    loadReport();
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
    });
    // Load report with empty filters after state update
    setTimeout(() => {
      loadReport();
    }, 100);
  };


  if (isLoading) {
    return (
      <ProtectedRoute
        allowedPosisi={["PLANNER", "SUPERVISOR", "DEPT_HEAD", "MANAGEMENT"]}
        allowedRoles={["ADMIN", "SUPERADMIN"]}
      >
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading mechanics report...</p>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute
      allowedPosisi={["PLANNER"]}
      allowedRoles={["ADMIN", "SUPERADMIN"]}
    >
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/planner/reports"
              className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Reports
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mechanics Report
            </h1>
            <p className="text-gray-600">
              View mechanics performance, activities, tasks, and time spent
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search Filter */}
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Search Mechanic
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Search by Mechanic Name or NRP
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleApplyFilters();
                    }
                  }}
                  placeholder="Enter mechanic name or NRP..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <button
                  onClick={handleApplyFilters}
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Search
                </button>
                {filters.search && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Total Mechanics: {mechanics.length}
              </h3>
            </div>
          </div>

          {/* Mechanics List */}
          {mechanics.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No Mechanics Found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no mechanics with activities at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mechanics.map((mechanic) => (
                <Link
                  key={mechanic.id}
                  href={`/planner/reports/mechanics-report/${mechanic.id}`}
                  className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200"
                >
                  <div className="px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {mechanic.firstName} {mechanic.lastName}
                        </h3>
                        <p className="text-sm text-primary-100 mt-1">
                          NRP: {mechanic.nrp}
                        </p>
                        <p className="text-xs text-primary-200 mt-1">
                          {mechanic.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Total Activities
                        </span>
                        <span className="text-lg font-bold text-primary-600">
                          {mechanic.totalActivities}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Total Work Time
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {mechanic.totalMechanicTimeFormatted}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-primary-600 font-medium">
                        <span>View Details</span>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
