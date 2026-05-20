"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "outline";
}

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  /** Optional list of "what you can do" items shown above the actions. */
  bullets?: React.ReactNode[];
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  bullets,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-12",
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {bullets && bullets.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-left text-sm text-muted-foreground">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {primaryAction && <ActionButton action={primaryAction} variant="primary" />}
          {secondaryAction && <ActionButton action={secondaryAction} variant="outline" />}
        </div>
      )}
    </div>
  );
}

function ActionButton({
  action,
  variant,
}: {
  action: EmptyStateAction;
  variant: "primary" | "outline";
}) {
  const v = action.variant || variant;
  const className = cn(
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
    v === "primary"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border border-border bg-background hover:bg-muted"
  );

  if (action.href) {
    return (
      <a href={action.href} className={className}>
        {action.label}
      </a>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={className}>
      {action.label}
    </button>
  );
}
