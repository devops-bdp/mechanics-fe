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
  const [allMechanics, setAllMechanics] = useState<any[]>([]); // Store all mechanics for filtering
  const [selectedMechanicIds, setSelectedMechanicIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadMechanics();
      setSelectedMechanicIds([]);
      setError("");
      setSearchQuery("");
    }
  }, [isOpen, activityId, assignedMechanicIds]);

  // Filter mechanics based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setMechanics(allMechanics);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allMechanics.filter((mechanic: any) => {
        const fullName = `${mechanic.firstName} ${mechanic.lastName}`.toLowerCase();
        const nrp = String(mechanic.nrp).toLowerCase();
        return fullName.includes(query) || nrp.includes(query);
      });
      setMechanics(filtered);
    }
  }, [searchQuery, allMechanics]);

  const loadMechanics = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getGroupLeaderMechanics();
      if (response.success) {
        // Filter out mechanics that are already assigned to this activity
        const allMechanicsData = response.data || [];
        const availableMechanics = allMechanicsData.filter(
          (mechanic: any) => !assignedMechanicIds.includes(mechanic.id)
        );
        setAllMechanics(availableMechanics);
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
                {/* Search Input */}
                <div className="mb-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or NRP..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  {searchQuery && (
                    <p className="mt-1 text-xs text-gray-500">
                      Found {mechanics.length} mechanic{mechanics.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
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

