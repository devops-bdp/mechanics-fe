"use client";

import { useState, useEffect, FormEvent } from "react";
import { apiClient } from "@/lib/api";

interface AssignMechanicsModalProps {
  isOpen: boolean;
  activityId: string;
  assignedMechanicIds?: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignMechanicsModal({
  isOpen,
  activityId,
  assignedMechanicIds = [],
  onClose,
  onSuccess,
}: AssignMechanicsModalProps) {
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [selectedMechanicIds, setSelectedMechanicIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadMechanics();
      setSelectedMechanicIds([]);
      setError("");
    }
  }, [isOpen, activityId, assignedMechanicIds]);

  const loadMechanics = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getGroupLeaderMechanics();
      if (response.success) {
        // Filter out mechanics that are already assigned to this activity
        const allMechanics = response.data || [];
        const availableMechanics = allMechanics.filter(
          (mechanic: any) => !assignedMechanicIds.includes(mechanic.id)
        );
        setMechanics(availableMechanics);
      } else {
        setError("Failed to load mechanics");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load mechanics");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedMechanicIds.length === 0) {
      setError("Please select at least one mechanic");
      return;
    }
    if (selectedMechanicIds.length > 7) {
      setError("Maximum 7 mechanics allowed");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await apiClient.assignMechanicsToActivityGroupLeader(
        activityId,
        selectedMechanicIds
      );

      if (response.success) {
        onSuccess();
        onClose();
        setSelectedMechanicIds([]);
      } else {
        const errorMessage = response.message || "Failed to assign mechanics";
        const errorDetails = (response as any).details as string[] | undefined;
        if (errorDetails && Array.isArray(errorDetails)) {
          setError(`${errorMessage}\n\n${errorDetails.join('\n')}`);
        } else {
          setError(errorMessage);
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "An error occurred";
      const errorDetails = err.response?.data?.details as string[] | undefined;
      if (errorDetails && Array.isArray(errorDetails)) {
        setError(`${errorMessage}\n\n${errorDetails.join('\n')}`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMechanic = (mechanicId: string) => {
    if (selectedMechanicIds.includes(mechanicId)) {
      setSelectedMechanicIds(selectedMechanicIds.filter((id) => id !== mechanicId));
    } else {
      if (selectedMechanicIds.length < 7) {
        setSelectedMechanicIds([...selectedMechanicIds, mechanicId]);
      } else {
        setError("Maximum 7 mechanics allowed");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-lg font-medium text-gray-900">Assign Mechanics</h3>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3">
              <div className="text-sm text-red-800 whitespace-pre-line">{error}</div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Mechanics (1-7) <span className="text-red-500">*</span>
            </label>
            {isLoading ? (
              <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500">
                Loading mechanics...
              </div>
            ) : (
              <>
                <select
                  multiple
                  size={8}
                  value={selectedMechanicIds}
                  onChange={(e) => {
                    const selected = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );
                    if (selected.length <= 7) {
                      setSelectedMechanicIds(selected);
                      setError("");
                    } else {
                      setError("Maximum 7 mechanics allowed");
                    }
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  {mechanics.length === 0 ? (
                    <option value="" disabled>
                      No mechanics available
                    </option>
                  ) : (
                    mechanics.map((mechanic) => (
                      <option key={mechanic.id} value={mechanic.id}>
                        {mechanic.firstName} {mechanic.lastName} (NRP: {mechanic.nrp}) - {mechanic.posisi}
                      </option>
                    ))
                  )}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {selectedMechanicIds.length}/7 mechanics selected. Hold Ctrl/Cmd to select multiple.
                </p>
                {selectedMechanicIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedMechanicIds.map((id) => {
                      const mechanic = mechanics.find((m) => m.id === id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                        >
                          {mechanic
                            ? `${mechanic.firstName} ${mechanic.lastName}`
                            : id}
                          <button
                            type="button"
                            onClick={() => toggleMechanic(id)}
                            className="ml-2 text-primary-600 hover:text-primary-800"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </>
            )}
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
              disabled={isSubmitting || selectedMechanicIds.length === 0}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting ? "Assigning..." : "Assign Mechanics"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

