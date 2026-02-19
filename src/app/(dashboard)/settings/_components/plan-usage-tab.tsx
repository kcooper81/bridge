"use client";

import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BarChart3, CreditCard } from "lucide-react";
import { UsageBar } from "./usage-bar";
import { format } from "date-fns";
import Link from "next/link";

export function PlanUsageTab() {
  const { org, prompts, members, guidelines } = useOrg();
  const { subscription, planLimits } = useSubscription();

  const currentPlan = org?.plan || "free";
  const isFree = currentPlan === "free";

  return (
    <div className="space-y-6">
      {/* Upgrade Banner (free users only) */}
      {isFree && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Upgrade to unlock your team&apos;s potential</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Get unlimited prompts, advanced analytics, custom security rules, and more with a paid plan.
          </p>
          <Link href="/settings/billing">
            <Button>View Plans</Button>
          </Link>
        </div>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge className="text-base px-3 py-1 capitalize">{currentPlan}</Badge>
            {subscription?.status && (
              <Badge variant={subscription.status === "active" ? "default" : "destructive"}>
                {subscription.status}
              </Badge>
            )}
          </div>
          {subscription?.current_period_end && (
            <p className="text-sm text-muted-foreground">
              {subscription.cancel_at_period_end ? "Cancels" : "Renews"} on{" "}
              {format(new Date(subscription.current_period_end), "MMMM d, yyyy")}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Seats: {subscription?.seats || 1}</span>
            <span>Members: {members.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsageBar label="Prompts" current={prompts.length} max={planLimits.max_prompts} />
          <UsageBar label="Members" current={members.length} max={planLimits.max_members} />
          <UsageBar label="Guidelines" current={guidelines.length} max={planLimits.max_guidelines} />
        </CardContent>
      </Card>

      {/* Billing Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Manage your subscription, update payment methods, and view invoices.
          </p>
          <Link href="/settings/billing">
            <Button variant="outline">Manage Billing</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
