"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import CreateUnitModal from "@/components/planner/CreateUnitModal";
import EditUnitStatusModal from "@/components/planner/EditUnitStatusModal";

const UNIT_TYPES = [
  "PMVV",
  "DT",
  "LV",
  "CT",
  "WT",
  "GENSET",
  "OTHER",
];

const UNIT_BRANDS = [
  "VOLVO",
  "NISSAN",
  "TOYOTA",
  "MITSUBISHI",
  "KOMATSU",
  "LIEBHERR",
  "ISUZU",
  "DAIHATSU",
  "KENT_POWER",
  "SANY",
  "JIEFANG",
  "HYUNDAI",
  "FUJI",
  "YUCHAI",
  "YANMAR",
  "DONGFENG",
  "OTHER",
];

const UNIT_STATUSES = ["ACTIVE", "BREAKDOWN", "INACTIVE"];

interface Unit {
  id: string;
  unitType: string;
  unitBrand: string;
  unitCode: string;
  unitDescription?: string;
  unitImage?: string;
  unitStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    brand: "",
    search: "",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  useEffect(() => {
    loadUnits();
  }, [currentPage, filters]);

  const loadUnits = async () => {
    try {
      setIsLoading(true);
      setError("");

      const params: any = {
        page: currentPage,
        limit,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.brand) params.brand = filters.brand;
      if (filters.search) params.search = filters.search;

      const response = await apiClient.getUnits(params);

      if (response.success) {
        setUnits(response.data || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalCount(response.pagination?.totalCount || 0);
      } else {
        setError("Failed to load units");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleClearFilters = () => {
    setFilters({
      status: "",
      type: "",
      brand: "",
      search: "",
    });
    setCurrentPage(1);
  };

  const handleCreateSuccess = () => {
    loadUnits();
  };

  const handleEditClick = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    loadUnits();
  };

  return (
    <ProtectedRoute allowedPosisi={["PLANNER"]} allowedRoles={["ADMIN", "SUPERADMIN"]}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Units</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and view all units in the system
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-sm font-medium"
            >
              + Create Unit
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white shadow-md rounded-lg p-4 mb-6 border border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Search by unit code or description..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                >
                  <option value="">All Status</option>
                  {UNIT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                >
                  <option value="">All Types</option>
                  {UNIT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange("brand", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                >
                  <option value="">All Brands</option>
                  {UNIT_BRANDS.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(filters.status || filters.type || filters.brand || filters.search) && (
              <div className="mt-4">
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {/* Units Table */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : units.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No units found.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Unit Code
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Brand
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {units.map((unit) => (
                        <tr
                          key={unit.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">
                              {unit.unitCode}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {unit.unitType}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {unit.unitBrand}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {unit.unitDescription || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                unit.unitStatus === "ACTIVE"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {unit.unitStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(unit.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(unit.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleEditClick(unit)}
                              className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                            >
                              Edit Status
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * limit + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(currentPage * limit, totalCount)}
                      </span>{" "}
                      of <span className="font-medium">{totalCount}</span> units
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-2 text-sm font-medium text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Create Unit Modal */}
          <CreateUnitModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={handleCreateSuccess}
          />

          {/* Edit Unit Status Modal */}
          <EditUnitStatusModal
            isOpen={isEditModalOpen}
            unit={selectedUnit}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedUnit(null);
            }}
            onSuccess={handleEditSuccess}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}

