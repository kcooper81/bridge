"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface UsageIndicatorProps {
  label: string;
  current: number;
  max: number;
  className?: string;
}

/**
 * Compact inline usage pill — always visible so admins know their plan limits.
 * Shows "Members: 3 / 12" with a tiny progress bar. Links to plan settings.
 */
export function UsageIndicator({ label, current, max, className }: UsageIndicatorProps) {
  const isUnlimited = max === -1;
  if (isUnlimited) return null;

  const pct = max === 0 ? 100 : Math.min((current / max) * 100, 100);
  const atLimit = current >= max;
  const approaching = pct >= 80 && !atLimit;

  return (
    <Link
      href="/settings/plan"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-lg border px-3 py-1.5 text-xs transition-colors hover:bg-muted/50",
        atLimit
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : approaching
            ? "border-amber-300/50 bg-amber-50/50 text-amber-700 dark:border-amber-700/40 dark:bg-amber-950/20 dark:text-amber-400"
            : "border-border bg-card text-muted-foreground",
        className,
      )}
    >
      <span className="font-medium whitespace-nowrap">
        {label}: {current} / {max}
      </span>
      <span className="relative h-1.5 w-16 rounded-full bg-muted/60 overflow-hidden">
        <span
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all",
            atLimit ? "bg-destructive" : approaching ? "bg-amber-500" : "bg-primary/60",
          )}
          style={{ width: `${pct}%` }}
        />
      </span>
    </Link>
  );
}
