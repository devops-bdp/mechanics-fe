"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ActivityAnalytics {
  byStatus: { status: string; count: number }[];
  byType: { activityName: string; count: number }[];
  monthlyTrend: { month: string; count: number; completed: number }[];
}

interface UnitAnalytics {
  byStatus: { status: string; count: number }[];
  byType: { unitType: string; count: number }[];
  byBrand: { unitBrand: string; count: number }[];
  byActivityCount: { range: string; count: number }[];
}

interface MechanicAnalytics {
  topByActivities: {
    id: string;
    name: string;
    nrp: number;
    totalActivities: number;
    totalWorkTimeSeconds: number;
    totalWorkTimeFormatted: string;
    rank: number;
  }[];
  topByWorkTime: {
    id: string;
    name: string;
    nrp: number;
    totalActivities: number;
    totalWorkTimeSeconds: number;
    totalWorkTimeFormatted: string;
    rank: number;
  }[];
}

const COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

const formatActivityName = (name: string): string => {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export default function AnalyticsPage() {
  const [activityAnalytics, setActivityAnalytics] =
    useState<ActivityAnalytics | null>(null);
  const [unitAnalytics, setUnitAnalytics] = useState<UnitAnalytics | null>(
    null
  );
  const [mechanicsAnalytics, setMechanicsAnalytics] =
    useState<MechanicAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [activityRes, unitRes, mechanicsRes] = await Promise.all([
        apiClient.getActivityAnalytics(),
        apiClient.getUnitAnalytics(),
        apiClient.getMechanicsAnalytics(),
      ]);

      if (activityRes.success) {
        setActivityAnalytics(activityRes.data);
      } else {
        setError(activityRes.message || "Failed to load activity analytics");
      }

      if (unitRes.success) {
        setUnitAnalytics(unitRes.data);
      } else {
        setError(unitRes.message || "Failed to load unit analytics");
      }

      if (mechanicsRes.success) {
        setMechanicsAnalytics(mechanicsRes.data);
      } else {
        setError(mechanicsRes.message || "Failed to load mechanics analytics");
      }
    } catch (err: any) {
      console.error("Error loading analytics:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load analytics"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute
        allowedPosisi={["PLANNER"]}
        allowedRoles={["ADMIN", "SUPERADMIN"]}
      >
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading analytics...</p>
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Visual insights into activities and units
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

          {/* Activity Analytics Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Activity Analytics
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Status Pie Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Activities by Status
                </h3>
                {activityAnalytics?.byStatus && activityAnalytics.byStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={activityAnalytics.byStatus.map((item) => ({
                          name: item.status
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0) +
                                word.slice(1).toLowerCase()
                            )
                            .join(" "),
                          value: item.count,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {activityAnalytics.byStatus.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No data available</p>
                  </div>
                )}
              </div>

              {/* Activity Type Pie Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Activities by Type
                </h3>
                {activityAnalytics?.byType && activityAnalytics.byType.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={activityAnalytics.byType.map((item) => ({
                          name: formatActivityName(item.activityName),
                          value: item.count,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {activityAnalytics.byType.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No data available</p>
                  </div>
                )}
              </div>

              {/* Monthly Trend Bar Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Monthly Activity Trend (Last 6 Months)
                </h3>
                {activityAnalytics?.monthlyTrend &&
                activityAnalytics.monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={activityAnalytics.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3b82f6" name="Total Activities" />
                      <Bar
                        dataKey="completed"
                        fill="#10b981"
                        name="Completed Activities"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Unit Analytics Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Unit Analytics
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Unit Status Pie Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Units by Status
                </h3>
                {unitAnalytics?.byStatus && unitAnalytics.byStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={unitAnalytics.byStatus.map((item) => ({
                          name: item.status,
                          value: item.count,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {unitAnalytics.byStatus.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No data available</p>
                  </div>
                )}
              </div>

              {/* Unit Type Pie Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Units by Type
                </h3>
                {unitAnalytics?.byType && unitAnalytics.byType.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={unitAnalytics.byType.map((item) => ({
                          name: item.unitType,
                          value: item.count,
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {unitAnalytics.byType.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No data available</p>
                  </div>
                )}
              </div>

              {/* Unit Brand Bar Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Units by Brand
                </h3>
                {unitAnalytics?.byBrand && unitAnalytics.byBrand.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={unitAnalytics.byBrand}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="unitBrand" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No data available</p>
                  </div>
                )}
              </div>

              {/* Unit Activity Count Bar Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Units by Activity Count
                </h3>
                {unitAnalytics?.byActivityCount &&
                unitAnalytics.byActivityCount.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={unitAnalytics.byActivityCount}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mechanics Analytics Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Mechanics Analytics
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Mechanics by Activities Bar Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top 10 Mechanics by Activity Count
                </h3>
                {mechanicsAnalytics?.topByActivities &&
                mechanicsAnalytics.topByActivities.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={mechanicsAnalytics.topByActivities}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={120}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value: any, name: string) => {
                            if (name === "totalActivities") {
                              return [`${value} activities`, "Activity Count"];
                            }
                            return value;
                          }}
                        />
                        <Bar
                          dataKey="totalActivities"
                          fill="#3b82f6"
                          name="Activity Count"
                        >
                          {mechanicsAnalytics.topByActivities.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    {/* Ranking List */}
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Ranking:
                      </p>
                      {mechanicsAnalytics.topByActivities.map((mechanic) => (
                        <div
                          key={mechanic.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-primary-600 w-6">
                              #{mechanic.rank}
                            </span>
                            <span className="text-sm text-gray-900">
                              {mechanic.name} (NRP: {mechanic.nrp})
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">
                            {mechanic.totalActivities} activities
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No data available</p>
                  </div>
                )}
              </div>

              {/* Top Mechanics by Work Time Bar Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top 10 Mechanics by Work Time
                </h3>
                {mechanicsAnalytics?.topByWorkTime &&
                mechanicsAnalytics.topByWorkTime.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={mechanicsAnalytics.topByWorkTime.map((m) => ({
                          ...m,
                          workTimeHours: Math.floor(m.totalWorkTimeSeconds / 3600),
                        }))}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={120}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                          formatter={(value: any, name: string) => {
                            if (name === "workTimeHours") {
                              const mechanic = mechanicsAnalytics.topByWorkTime.find(
                                (m) => Math.floor(m.totalWorkTimeSeconds / 3600) === value
                              );
                              return [
                                mechanic?.totalWorkTimeFormatted || `${value}h`,
                                "Work Time",
                              ];
                            }
                            return value;
                          }}
                        />
                        <Bar
                          dataKey="workTimeHours"
                          fill="#10b981"
                          name="Work Time"
                        >
                          {mechanicsAnalytics.topByWorkTime.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    {/* Ranking List */}
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Ranking:
                      </p>
                      {mechanicsAnalytics.topByWorkTime.map((mechanic) => (
                        <div
                          key={mechanic.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-primary-600 w-6">
                              #{mechanic.rank}
                            </span>
                            <span className="text-sm text-gray-900">
                              {mechanic.name} (NRP: {mechanic.nrp})
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">
                            {mechanic.totalWorkTimeFormatted}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">No data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

