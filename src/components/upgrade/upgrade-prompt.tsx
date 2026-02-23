import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LIMIT_CONFIG, type LimitAction } from "./config";

interface UpgradePromptProps {
  feature: LimitAction;
  current: number;
  max: number;
  className?: string;
}

export function UpgradePrompt({ feature, current, max, className }: UpgradePromptProps) {
  if (max === -1) return null;

  const meta = LIMIT_CONFIG[feature];
  const Icon = meta.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4",
        className,
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          You&apos;ve used {current} of {max} {meta.nounPlural}
        </p>
        <p className="text-xs text-muted-foreground">
          Upgrade to {meta.unlockPlanName} for {meta.upgradeValue}
        </p>
      </div>
      <Button asChild size="sm">
        <Link href="/settings/billing">Upgrade</Link>
      </Button>
    </div>
  );
}
