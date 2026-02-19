"use client";

import { formatDistanceToNow } from "date-fns";
import {
  getExtensionStatus,
  getStatusColor,
  getStatusLabel,
} from "@/lib/extension-status";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ExtensionStatusBadgeProps {
  lastActive: string | null;
  version: string | null;
}

export function ExtensionStatusBadge({ lastActive, version }: ExtensionStatusBadgeProps) {
  const status = getExtensionStatus(lastActive);
  const color = getStatusColor(status);
  const label = getStatusLabel(status);

  const tooltipLines: string[] = [];
  if (version) tooltipLines.push(`v${version}`);
  if (lastActive) {
    tooltipLines.push(`Last active ${formatDistanceToNow(new Date(lastActive), { addSuffix: true })}`);
  }

  const badge = (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );

  if (tooltipLines.length === 0) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{tooltipLines.join(" · ")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
