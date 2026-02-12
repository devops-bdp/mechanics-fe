"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  const [isDownloading, setIsDownloading] = useState(false);

  // Pagination states
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  // Aggregate stats from backend (across ALL mechanics, not just paginated)
  const [aggregateStats, setAggregateStats] = useState({
    totalMechanics: 0,
    totalActivities: 0,
    totalWorkTime: 0,
  });

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
  });

  // Search input state (for typing, not applied until Search button is clicked)
  const [searchInput, setSearchInput] = useState("");

  const loadReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filters.search && filters.search.trim() !== "") {
        params.search = filters.search;
      }

      const response = await apiClient.getMechanicsReport(params);
      if (response.success) {
        const mechanicsData = response.data || [];
        // Debug: Log to check data structure
        if (process.env.NODE_ENV === "development" && mechanicsData.length > 0) {
          console.log("Sample mechanic data:", mechanicsData[0]);
          console.log("Total work time sample:", {
            totalMechanicSeconds: mechanicsData[0]?.totalMechanicSeconds,
            totalMechanicTimeFormatted: mechanicsData[0]?.totalMechanicTimeFormatted,
            type: typeof mechanicsData[0]?.totalMechanicSeconds,
            hasTimeFormatted: !!mechanicsData[0]?.totalMechanicTimeFormatted,
          });
          // Log all mechanics' totalMechanicSeconds and formatted time
          mechanicsData.forEach((m: Mechanic, idx: number) => {
            console.log(`Mechanic ${idx + 1}: ${m.firstName} ${m.lastName}`, {
              totalMechanicSeconds: m.totalMechanicSeconds,
              totalMechanicTimeFormatted: m.totalMechanicTimeFormatted,
              totalActivities: m.totalActivities,
            });
          });
        }
        setMechanics(mechanicsData);
        setPagination((prev) => ({
          ...prev,
          total: response.total || 0,
          totalPages: response.totalPages || 0,
        }));
        // Set aggregate stats from backend (across ALL mechanics)
        if (response.stats) {
          setAggregateStats({
            totalMechanics: response.stats.totalMechanics || 0,
            totalActivities: response.stats.totalActivities || 0,
            totalWorkTime: response.stats.totalWorkTime || 0,
          });
        }
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
  }, [pagination.page, pagination.limit, filters.search]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleSearchInputChange = (value: string) => {
    // Only update the input state, don't trigger search yet
    setSearchInput(value);
  };

  const handleApplyFilters = () => {
    // Apply the search input to filters (this will trigger API call)
    setFilters((prev) => ({
      ...prev,
      search: searchInput,
    }));
    // Reset to page 1 when search is applied
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    // Clear both search input and filter
    setSearchInput("");
    setFilters({
      search: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const params: any = {};
      if (filters.search && filters.search.trim() !== "") {
        params.search = filters.search;
      }

      const blob = await apiClient.downloadMechanicsReportPDF(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mechanics-report-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error("Error downloading PDF:", err);
      setError("Failed to download PDF report");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setIsDownloading(true);
      const params: any = {};
      if (filters.search && filters.search.trim() !== "") {
        params.search = filters.search;
      }

      const blob = await apiClient.downloadMechanicsReportExcel(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mechanics-report-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error("Error downloading Excel:", err);
      setError("Failed to download Excel report");
    } finally {
      setIsDownloading(false);
    }
  };

  // Use aggregate stats from backend (across ALL mechanics, not just paginated)
  // This ensures stats reflect all mechanics, not just the current page
  const stats = useMemo(() => {
    return {
      total: aggregateStats.totalMechanics,
      totalActivities: aggregateStats.totalActivities,
      totalWorkTime: aggregateStats.totalWorkTime,
    };
  }, [aggregateStats]);

  if (isLoading) {
    return (
      <ProtectedRoute
        allowedPosisi={["PLANNER", "SUPERVISOR", "DEPT_HEAD", "MANAGEMENT"]}
        allowedRoles={["ADMIN", "SUPERADMIN"]}
      >
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading mechanics report...</p>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute
      allowedPosisi={["PLANNER", "SUPERVISOR", "DEPT_HEAD", "MANAGEMENT"]}
      allowedRoles={["ADMIN", "SUPERADMIN"]}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Back Button */}
          <div className="mb-6">
            <Link
              href="/planner/reports"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-all hover:shadow-md"
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

          {/* Enhanced Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl shadow-2xl p-8 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-extrabold text-white mb-3">
                    Mechanics Performance Report
                  </h1>
                  <p className="text-green-100 text-lg">
                    View mechanics performance, activities, tasks, and time spent
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading || mechanics.length === 0}
                    className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl shadow-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    PDF
                  </button>
                  <button
                    onClick={handleDownloadExcel}
                    disabled={isDownloading || mechanics.length === 0}
                    className="px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl shadow-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Excel
                  </button>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-5 shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Total Mechanics</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="bg-green-100 rounded-lg p-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Total Activities</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.totalActivities}</p>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Total Work Time</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.totalWorkTime > 0 ? (
                        (() => {
                          const hours = Math.floor(stats.totalWorkTime / 3600);
                          const minutes = Math.floor((stats.totalWorkTime % 3600) / 60);
                          const seconds = stats.totalWorkTime % 60;
                          if (hours > 0) {
                            return `${hours}h ${minutes}m`;
                          } else if (minutes > 0) {
                            return `${minutes}m ${seconds}s`;
                          }
                          return `${seconds}s`;
                        })()
                      ) : (
                        <span className="text-gray-400">0s</span>
                      )}
                    </p>
                  </div>
                  <div className="bg-purple-100 rounded-lg p-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Error Message */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border-l-4 border-red-500 p-4 shadow-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Enhanced Search Filter */}
          <div className="mb-6 bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Mechanic
              </h2>
              <div className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                {mechanics.length} Mechanic{mechanics.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Search by Mechanic Name or NRP
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleApplyFilters();
                      }
                    }}
                    placeholder="Enter mechanic name or NRP..."
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleApplyFilters();
                  }}
                  disabled={isLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-md hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition-all transform hover:scale-105"
                >
                  Search
                </button>
                {(searchInput || filters.search) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleClearFilters();
                    }}
                    className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm font-semibold transition-all"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Mechanics List */}
          {mechanics.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-dashed border-gray-300">
              <div className="max-w-md mx-auto">
                <svg
                  className="mx-auto h-24 w-24 text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Mechanics Found
                </h3>
                <p className="text-gray-500">
                  There are no mechanics with activities at the moment.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mechanics.map((mechanic) => (
                <Link
                  key={mechanic.id}
                  href={`/planner/reports/mechanics-report/${mechanic.id}`}
                  className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="px-6 py-5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold text-lg">
                            {mechanic.firstName[0]}{mechanic.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-extrabold text-white">
                            {mechanic.firstName} {mechanic.lastName}
                          </h3>
                          <p className="text-sm text-green-100 mt-1 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                            NRP: {mechanic.nrp}
                          </p>
                          <p className="text-xs text-green-200 mt-1 truncate max-w-xs">
                            {mechanic.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-5">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                        <span className="text-sm font-semibold text-gray-700 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Total Activities
                        </span>
                        <span className="text-xl font-bold text-blue-600">
                          {mechanic.totalActivities}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                        <span className="text-sm font-semibold text-gray-700 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Total Work Time
                        </span>
                        <span className={`text-sm font-bold ${mechanic.totalMechanicSeconds > 0 ? 'text-purple-600' : 'text-gray-400'}`}>
                          {mechanic.totalMechanicTimeFormatted || 
                            (mechanic.totalMechanicSeconds !== undefined && mechanic.totalMechanicSeconds !== null
                              ? (() => {
                                  const seconds = mechanic.totalMechanicSeconds || 0;
                                  const hours = Math.floor(seconds / 3600);
                                  const minutes = Math.floor((seconds % 3600) / 60);
                                  const secs = seconds % 60;
                                  if (hours > 0) {
                                    return `${hours}h ${minutes}m`;
                                  } else if (minutes > 0) {
                                    return `${minutes}m ${secs}s`;
                                  }
                                  return `${secs}s`;
                                })()
                              : "0s"
                            )
                          }
                        </span>
                      </div>
                    </div>
                    <div className="mt-5 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-green-600 font-semibold group-hover:text-green-700">
                        <span>View Full Report</span>
                        <svg
                          className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
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

          {/* Pagination */}
          {mechanics.length > 0 && pagination.totalPages > 1 && (
            <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-semibold">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
                  <span className="font-semibold">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{" "}
                  of <span className="font-semibold">{pagination.total}</span> mechanics
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || isLoading}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isLoading}
                          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                            pagination.page === pageNum
                              ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages || isLoading}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
