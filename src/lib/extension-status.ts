export type ExtensionStatus = "active" | "inactive" | "not_installed";

const ACTIVE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getExtensionStatus(lastActive: string | null): ExtensionStatus {
  if (!lastActive) return "not_installed";
  const elapsed = Date.now() - new Date(lastActive).getTime();
  return elapsed <= ACTIVE_THRESHOLD_MS ? "active" : "inactive";
}

export function getStatusColor(status: ExtensionStatus): string {
  switch (status) {
    case "active":
      return "bg-green-500";
    case "inactive":
      return "bg-yellow-500";
    case "not_installed":
      return "bg-gray-400";
  }
}

export function getStatusLabel(status: ExtensionStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "not_installed":
      return "Not installed";
  }
}
