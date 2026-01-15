"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import Image from "next/image";

interface AssignedMechanic {
  id: string;
  firstName: string;
  lastName: string;
  nrp: number;
  email: string;
  status: string;
}

interface Activity {
  id: string;
  activityName: string;
  activityStatus: string;
  estimatedStart: string;
  createdAt: string;
  updatedAt: string;
  description: string | null;
  remarks: string | null;
  completedOn: string | null;
  totalActivityTimeSeconds: number;
  totalActivityTimeFormatted: string;
  assignedMechanics: AssignedMechanic[];
}

interface BreakdownUnit {
  id: string;
  unitCode: string;
  unitType: string;
  unitBrand: string;
  unitDescription: string | null;
  unitImage: string | null;
  unitStatus: string;
  createdAt: string;
  updatedAt: string;
  activities: Activity[];
}

const formatActivityName = (name: string): string => {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800 border-green-300";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "PAUSED":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "DELAYED":
      return "bg-red-100 text-red-800 border-red-300";
    case "CANCELLED":
      return "bg-gray-100 text-gray-800 border-gray-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const getUnitStatusColor = (status: string): string => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800 border-green-300";
    case "BREAKDOWN":
      return "bg-red-100 text-red-800 border-red-300";
    case "INACTIVE":
      return "bg-gray-100 text-gray-800 border-gray-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

export default function UnitReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const unitId = params?.unitId as string;

  const [unit, setUnit] = useState<BreakdownUnit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (unitId) {
      loadUnitDetail();
    }
  }, [unitId]);

  const loadUnitDetail = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await apiClient.getBreakdownUnitsReport();
      if (response.success) {
        const units = response.data || [];
        const foundUnit = units.find((u: BreakdownUnit) => u.id === unitId);
        if (foundUnit) {
          setUnit(foundUnit);
        } else {
          setError("Unit not found");
        }
      } else {
        setError(response.message || "Failed to load unit details");
      }
    } catch (err: any) {
      console.error("Error loading unit details:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load unit details"
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
                <p className="text-gray-600">Loading unit details...</p>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !unit) {
    return (
      <ProtectedRoute
        allowedPosisi={["PLANNER"]}
        allowedRoles={["ADMIN", "SUPERADMIN"]}
      >
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {error || "Unit not found"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                The unit you're looking for doesn't exist or has been removed.
              </p>
              <div className="mt-6">
                <Link
                  href="/planner/unit-report"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  Back to Report
                </Link>
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
              href="/planner/unit-report"
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
              Back to Report
            </Link>
          </div>

          {/* Unit Header */}
          <div
            className={`mb-6 rounded-lg shadow-lg overflow-hidden border-2 ${
              unit.unitStatus === "BREAKDOWN"
                ? "border-red-200"
                : unit.unitStatus === "ACTIVE"
                ? "border-green-200"
                : "border-gray-200"
            }`}
          >
            <div
              className={`px-6 py-4 ${
                unit.unitStatus === "BREAKDOWN"
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : unit.unitStatus === "ACTIVE"
                  ? "bg-gradient-to-r from-green-500 to-green-600"
                  : "bg-gradient-to-r from-gray-500 to-gray-600"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {unit.unitImage &&
                  !unit.unitImage.includes("example.com") &&
                  unit.unitImage.startsWith("http") ? (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-white flex-shrink-0">
                      <Image
                        src={unit.unitImage}
                        alt={unit.unitCode}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-white flex-shrink-0 bg-white bg-opacity-20 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-white opacity-70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-white mb-2">
                      {unit.unitCode}
                    </h1>
                    <p className="text-white text-base opacity-90 mb-1">
                      {unit.unitType} • {unit.unitBrand}
                    </p>
                    {unit.unitDescription && (
                      <p className="text-white text-sm mt-1 opacity-90">
                        {unit.unitDescription}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white border ${
                      unit.unitStatus === "BREAKDOWN"
                        ? "bg-red-700 border-red-800"
                        : unit.unitStatus === "ACTIVE"
                        ? "bg-green-700 border-green-800"
                        : "bg-gray-700 border-gray-800"
                    }`}
                  >
                    {unit.unitStatus}
                  </span>
                  <p className="text-white text-xs mt-2 opacity-90">
                    Updated: {formatDate(unit.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Unit Info */}
            <div className="bg-white px-6 py-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Created At
                  </p>
                  <p className="text-sm text-gray-900 mt-1">
                    {formatDate(unit.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Updated At
                  </p>
                  <p className="text-sm text-gray-900 mt-1">
                    {formatDate(unit.updatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Total Activities
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {unit.activities.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Activities Section */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Associated Activities ({unit.activities.length})
            </h2>

            {unit.activities.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <svg
                  className="mx-auto h-8 w-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500">
                  No activities associated with this unit
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {unit.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {formatActivityName(activity.activityName)}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <span>
                            📅 Estimated Start:{" "}
                            {formatDateTime(activity.estimatedStart)}
                          </span>
                          <span>•</span>
                          <span>
                            📝 Created: {formatDate(activity.createdAt)}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                          activity.activityStatus
                        )}`}
                      >
                        {activity.activityStatus
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0) + word.slice(1).toLowerCase()
                          )
                          .join(" ")}
                      </span>
                    </div>

                    {/* Completed On & Total Activity Time */}
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activity.completedOn && (
                          <div>
                            <span className="text-xs font-medium text-gray-600 uppercase block mb-1">
                              Completed On
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {formatDateTime(activity.completedOn)}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-medium text-gray-600 uppercase block mb-1">
                            AVG Activity Time of Mechanics
                          </span>
                          <span className="text-sm font-semibold text-blue-700">
                            {activity.totalActivityTimeFormatted || "0s"}
                            {activity.assignedMechanics.length > 0 && (
                              <span className="text-xs text-gray-500 ml-2 font-normal">
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Activity Details */}
                    {(activity.description || activity.remarks) && (
                      <div className="mb-4 space-y-2">
                        {activity.description && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Description:</span>{" "}
                            {activity.description}
                          </p>
                        )}
                        {activity.remarks && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Remarks:</span>{" "}
                            {activity.remarks}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Assigned Mechanics */}
                    {activity.assignedMechanics.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          Assigned Mechanics (
                          {activity.assignedMechanics.length}
                          ):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {activity.assignedMechanics.map((mechanic) => (
                            <div
                              key={mechanic.id}
                              className="inline-flex items-center px-3 py-2 rounded-md bg-gray-100 text-sm text-gray-700"
                            >
                              <span className="font-medium">
                                {mechanic.firstName} {mechanic.lastName}
                              </span>
                              <span className="mx-2 text-gray-400">•</span>
                              <span className="text-gray-600">
                                NRP: {mechanic.nrp}
                              </span>
                              <span
                                className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeColor(
                                  mechanic.status
                                )}`}
                              >
                                {mechanic.status
                                  .split("_")
                                  .map(
                                    (word) =>
                                      word.charAt(0) +
                                      word.slice(1).toLowerCase()
                                  )
                                  .join(" ")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
