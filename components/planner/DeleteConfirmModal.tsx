"use client";

import { Activity } from "./types";
import { formatActivityName } from "./utils";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  activity: Activity | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  activity,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen || !activity) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Confirm Delete Activity
          </h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-gray-700 mb-4">
            Are you sure you want to permanently delete this activity? This
            action cannot be undone.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-gray-900">
              {activity.unit.unitCode} - {activity.unit.unitType}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatActivityName(activity.activityName)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {activity.mechanics.length} mechanic(s) assigned
            </p>
          </div>
          <p className="text-xs text-red-600 mb-4">
            ⚠️ Warning: This will permanently delete the activity and all
            associated mechanic assignments and tasks.
          </p>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

