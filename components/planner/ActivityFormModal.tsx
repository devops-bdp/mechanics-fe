"use client";

import { FormEvent } from "react";
import { Unit } from "./types";

interface ActivityFormModalProps {
  isOpen: boolean;
  formData: {
    activityName: string;
    unitId: string;
    description: string;
    remarks: string;
    estimatedStart: string;
  };
  units: Unit[];
  isSubmitting: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  onFormDataChange: (data: any) => void;
  onError: (error: string) => void;
}

export default function ActivityFormModal({
  isOpen,
  formData,
  units,
  isSubmitting,
  error,
  onClose,
  onSubmit,
  onFormDataChange,
  onError,
}: ActivityFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-lg font-medium text-gray-900">Create Activity</h3>
        </div>
        <form onSubmit={onSubmit} className="px-6 py-4">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3">
              <div className="text-sm text-red-800 whitespace-pre-line">
                {error}
              </div>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="activityName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Activity Name <span className="text-red-500">*</span>
              </label>
              <select
                id="activityName"
                value={formData.activityName}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    activityName: e.target.value,
                  })
                }
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <optgroup label="General Activities">
                  <option value="PERIODIC_SERVICE">Periodic Service</option>
                  <option value="SCHEDULED_MAINTENANCE">
                    Scheduled Maintenance
                  </option>
                  <option value="UNSCHEDULED_MAINTENANCE">
                    Unscheduled Maintenance
                  </option>
                  <option value="TROUBLESHOOTING">Troubleshooting</option>
                  <option value="REPAIR_AND_ADJUSTMENT">
                    Repair and Adjustment
                  </option>
                  <option value="GENERAL_REPAIR">General Repair</option>
                  <option value="PERIODIC_INSPECTION">
                    Periodic Inspection
                  </option>
                </optgroup>
                <optgroup label="Tyre Activities">
                  <option value="PERIODIC_INSPECTION_TYRE">
                    Periodic Inspection Tyre
                  </option>
                  <option value="PERIODIC_SERVICE_TYRE">
                    Periodic Service Tyre
                  </option>
                  <option value="RETORQUE_TYRE">Retorque Tyre</option>
                  <option value="REPAIR_TYRE">Repair Tyre</option>
                  <option value="TROUBLESHOOTING_TYRE">
                    Troubleshooting Tyre
                  </option>
                </optgroup>
                <optgroup label="Other">
                  <option value="OTHER">Other</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label
                htmlFor="unitId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                id="unitId"
                value={formData.unitId}
                onChange={(e) =>
                  onFormDataChange({ ...formData, unitId: e.target.value })
                }
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Select a unit</option>
                {units
                  .filter(
                    (unit) =>
                      unit.unitStatus === "BREAKDOWN" ||
                      unit.unitStatus === "INACTIVE",
                  )
                  .map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.unitCode} - {unit.unitType} ({unit.unitBrand}) -{" "}
                      {unit.unitStatus}
                    </option>
                  ))}
              </select>
              {units.filter(
                (unit) =>
                  unit.unitStatus === "BREAKDOWN" ||
                  unit.unitStatus === "INACTIVE",
              ).length === 0 && (
                <p className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  ⚠️ No units with BREAKDOWN or INACTIVE status available.
                  Please change unit status first.
                </p>
              )}
              {units.filter(
                (unit) =>
                  unit.unitStatus === "BREAKDOWN" ||
                  unit.unitStatus === "INACTIVE",
              ).length > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Only units with BREAKDOWN or INACTIVE status can be selected
                  for activities.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Activity description"
              />
            </div>

            <div>
              <label
                htmlFor="remarks"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Remarks
              </label>
              <textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) =>
                  onFormDataChange({ ...formData, remarks: e.target.value })
                }
                rows={2}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Additional remarks"
              />
            </div>

            <div>
              <label
                htmlFor="estimatedStart"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Estimated Start <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="estimatedStart"
                value={formData.estimatedStart}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    estimatedStart: e.target.value,
                  })
                }
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
