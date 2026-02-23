import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FEATURE_CONFIG, type BooleanFeature } from "./config";
import type { LucideIcon } from "lucide-react";

interface UpgradeGateProps {
  feature: BooleanFeature;
  title?: string;
  icon?: LucideIcon;
  className?: string;
}

export function UpgradeGate({ feature, title, icon, className }: UpgradeGateProps) {
  const meta = FEATURE_CONFIG[feature];
  const Icon = icon ?? meta.icon;
  const heading = title ?? meta.title;

  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
        <Icon className="h-8 w-8 text-primary" />
      </div>

      <h3 className="text-lg font-semibold">{heading}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{meta.description}</p>

      <ul className="mt-4 space-y-2 text-sm text-left">
        {meta.benefits.map((b) => (
          <li key={b} className="flex items-center gap-2">
            <span className="h-1 w-1 shrink-0 rounded-full bg-primary" />
            {b}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center gap-3">
        <Button asChild>
          <Link href="/settings/billing">Upgrade to {meta.unlockPlanName}</Link>
        </Button>
        <Badge variant="secondary">{meta.unlockPlanName} plan</Badge>
      </div>
    </div>
  );
}
