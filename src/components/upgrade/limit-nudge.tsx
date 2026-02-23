"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LIMIT_CONFIG, type LimitAction } from "./config";

interface LimitNudgeProps {
  feature: LimitAction;
  current: number;
  max: number;
  className?: string;
}

export function LimitNudge({ feature, current, max, className }: LimitNudgeProps) {
  const [dismissed, setDismissed] = useState(false);

  if (max === -1 || dismissed) return null;

  const threshold = max <= 5 ? max - 1 : Math.ceil(max * 0.8);

  // Below threshold or already at/over limit (UpgradePrompt handles that)
  if (current < threshold || current >= max) return null;

  const meta = LIMIT_CONFIG[feature];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border/50 bg-muted/50 px-4 py-2.5",
        className,
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <p className="flex-1 text-sm text-muted-foreground">
        You&apos;re using <strong className="text-foreground">{current}</strong> of{" "}
        <strong className="text-foreground">{max}</strong> {meta.nounPlural}.
      </p>
      <Link
        href="/settings/billing"
        className="shrink-0 text-sm font-medium text-primary hover:underline"
      >
        View plans
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
