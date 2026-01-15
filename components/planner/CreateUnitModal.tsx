"use client";

import { useState, FormEvent } from "react";
import { apiClient } from "@/lib/api";
import { showError, showSuccess } from "@/lib/swal";

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

interface CreateUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateUnitModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateUnitModalProps) {
  const [formData, setFormData] = useState({
    unitType: "",
    unitBrand: "",
    unitCode: "",
    unitDescription: "",
    unitImage: "",
    unitStatus: "ACTIVE",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.unitType || !formData.unitBrand || !formData.unitCode) {
      await showError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.createUnit({
        unitType: formData.unitType,
        unitBrand: formData.unitBrand,
        unitCode: formData.unitCode,
        unitDescription: formData.unitDescription || undefined,
        unitImage: formData.unitImage || undefined,
        unitStatus: formData.unitStatus,
      });

      if (response.success) {
        await showSuccess("Unit created successfully!");
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          unitType: "",
          unitBrand: "",
          unitCode: "",
          unitDescription: "",
          unitImage: "",
          unitStatus: "ACTIVE",
        });
      } else {
        await showError(response.message || "Failed to create unit");
      }
    } catch (err: any) {
      await showError(err.response?.data?.message || err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-lg font-medium text-gray-900">Create Unit</h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            {/* Unit Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.unitType}
                onChange={(e) =>
                  setFormData({ ...formData, unitType: e.target.value })
                }
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Select Unit Type</option>
                {UNIT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Brand <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.unitBrand}
                onChange={(e) =>
                  setFormData({ ...formData, unitBrand: e.target.value })
                }
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Select Unit Brand</option>
                {UNIT_BRANDS.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.unitCode}
                onChange={(e) =>
                  setFormData({ ...formData, unitCode: e.target.value.toUpperCase() })
                }
                required
                placeholder="e.g., DT001"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Unit code must be unique
              </p>
            </div>

            {/* Unit Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Description
              </label>
              <textarea
                value={formData.unitDescription}
                onChange={(e) =>
                  setFormData({ ...formData, unitDescription: e.target.value })
                }
                rows={3}
                placeholder="Optional description of the unit"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            {/* Unit Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Image URL
              </label>
              <input
                type="url"
                value={formData.unitImage}
                onChange={(e) =>
                  setFormData({ ...formData, unitImage: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional image URL for the unit
              </p>
            </div>

            {/* Unit Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Status
              </label>
              <select
                value={formData.unitStatus}
                onChange={(e) =>
                  setFormData({ ...formData, unitStatus: e.target.value })
                }
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                {UNIT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Actions */}
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
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Unit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

