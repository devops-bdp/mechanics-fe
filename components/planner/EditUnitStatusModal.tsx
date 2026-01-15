"use client";

import { useState, useEffect, FormEvent } from "react";
import { apiClient } from "@/lib/api";

const UNIT_STATUSES = ["ACTIVE", "BREAKDOWN", "INACTIVE"];

interface EditUnitStatusModalProps {
  isOpen: boolean;
  unit: {
    id: string;
    unitCode: string;
    unitStatus: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUnitStatusModal({
  isOpen,
  unit,
  onClose,
  onSuccess,
}: EditUnitStatusModalProps) {
  const [unitStatus, setUnitStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (unit) {
      setUnitStatus(unit.unitStatus);
      setError("");
    }
  }, [unit, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!unit || !unitStatus) {
      setError("Please select a status");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.updateUnit(unit.id, {
        unitStatus,
      });

      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || "Failed to update unit status");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setError("");
    }
  };

  if (!isOpen || !unit) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Edit Unit Status</h3>
          <p className="text-sm text-gray-500 mt-1">Unit: {unit.unitCode}</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit Status <span className="text-red-500">*</span>
            </label>
            <select
              value={unitStatus}
              onChange={(e) => setUnitStatus(e.target.value)}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              {UNIT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {unitStatus === "ACTIVE" && (
              <p className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                ⚠️ Note: Planner cannot create activities for units with ACTIVE status. Unit must be in BREAKDOWN or INACTIVE status to create activities.
              </p>
            )}
            {(unitStatus === "BREAKDOWN" || unitStatus === "INACTIVE") && (
              <p className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                ℹ️ Unit with {unitStatus} status can have activities created.
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || unitStatus === unit.unitStatus}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

