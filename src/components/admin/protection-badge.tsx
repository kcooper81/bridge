"use client";

interface ProtectionBadgeProps {
  status: string;
  lastActive: string | null;
}

function getProtectionState(status: string, lastActive: string | null) {
  if (status === "session_lost") {
    return { color: "bg-red-500", label: "Unprotected" };
  }

  if (status === "active" && lastActive) {
    const diffMs = Date.now() - new Date(lastActive).getTime();
    const thirtyMin = 30 * 60 * 1000;
    if (diffMs < thirtyMin) {
      return { color: "bg-green-500", label: "Protected" };
    }
    return { color: "bg-gray-400", label: "Inactive" };
  }

  return { color: "bg-gray-400", label: "No Extension" };
}

export function ProtectionBadge({ status, lastActive }: ProtectionBadgeProps) {
  const { color, label } = getProtectionState(status, lastActive);

  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
