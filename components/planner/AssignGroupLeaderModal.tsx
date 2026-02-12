"use client";

import { useState, useEffect, FormEvent } from "react";
import { apiClient } from "@/lib/api";

interface AssignGroupLeaderModalProps {
  isOpen: boolean;
  activityId: string;
  assignedGroupLeaderId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignGroupLeaderModal({
  isOpen,
  activityId,
  assignedGroupLeaderId,
  onClose,
  onSuccess,
}: AssignGroupLeaderModalProps) {
  const [groupLeaders, setGroupLeaders] = useState<any[]>([]);
  const [selectedGroupLeaderId, setSelectedGroupLeaderId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadGroupLeaders();
      setSelectedGroupLeaderId(assignedGroupLeaderId || "");
      setError("");
    }
  }, [isOpen, activityId, assignedGroupLeaderId]);

  const loadGroupLeaders = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getPlannerGroupLeaders();
      if (response.success) {
        setGroupLeaders(response.data || []);
      } else {
        setError("Failed to load group leaders");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load group leaders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedGroupLeaderId) {
      setError("Please select a Group Leader");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await apiClient.assignGroupLeaderToActivity(
        activityId,
        selectedGroupLeaderId
      );

      if (response.success) {
        onSuccess();
        onClose();
        setSelectedGroupLeaderId("");
      } else {
        setError(response.message || "Failed to assign Group Leader");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "An error occurred";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-lg font-medium text-gray-900">
            Assign Group Leader
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Group Leader <span className="text-red-500">*</span>
            </label>
            {isLoading ? (
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500">
                Loading group leaders...
              </div>
            ) : (
              <select
                value={selectedGroupLeaderId}
                onChange={(e) => {
                  setSelectedGroupLeaderId(e.target.value);
                  setError("");
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">-- Select Group Leader --</option>
                {groupLeaders.length === 0 ? (
                  <option value="" disabled>
                    No group leaders available
                  </option>
                ) : (
                  groupLeaders.map((gl) => (
                    <option key={gl.id} value={gl.id}>
                      {gl.firstName} {gl.lastName} (NRP: {gl.nrp}) - {gl.posisi}
                    </option>
                  ))
                )}
              </select>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Select a Group Leader to assign to this activity. The Group Leader
              will then be able to assign mechanics.
            </p>
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
              disabled={isSubmitting || !selectedGroupLeaderId}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting ? "Assigning..." : "Assign Group Leader"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

