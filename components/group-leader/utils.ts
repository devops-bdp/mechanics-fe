export const formatActivityName = (name: string): string => {
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const formatTaskName = (taskName: string): string => {
  return taskName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const calculateTaskTime = (task: {
  startedAt: string | null;
  stoppedAt: string | null;
}): number => {
  if (!task.startedAt) return 0;
  const start = new Date(task.startedAt);
  const end = task.stoppedAt ? new Date(task.stoppedAt) : new Date();
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / 1000); // Return seconds
};

export const formatTime = (seconds: number): string => {
  if (seconds <= 0) {
    return "0s";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "PENDING":
      return "bg-gray-100 text-gray-800";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800";
    case "PAUSED":
      return "bg-yellow-100 text-yellow-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

