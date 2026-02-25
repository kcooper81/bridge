"use client";

import { useSubscription } from "@/components/providers/subscription-provider";
import { useOrg } from "@/components/providers/org-provider";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export function PaymentBanner() {
  const { subscription, planLimits } = useSubscription();
  const { members, currentUserRole } = useOrg();

  const isAdmin = currentUserRole === "admin" || currentUserRole === "manager";

  // Over member limit warning (shown to admins only)
  const overMemberLimit =
    isAdmin &&
    planLimits.max_members !== -1 &&
    members.length > planLimits.max_members;

  return (
    <>
      {subscription?.status === "past_due" && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive flex-1">
            Your last payment failed. Please{" "}
            <Link href="/settings/billing" className="font-semibold underline">
              update your payment method
            </Link>{" "}
            to keep your plan active.
          </p>
        </div>
      )}

      {subscription?.status === "canceled" && !subscription.cancel_at_period_end && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-tp-yellow/30 bg-tp-yellow/10 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-tp-yellow shrink-0" />
          <p className="text-sm flex-1">
            Your subscription has been canceled. You&apos;ve been moved to the Free plan.{" "}
            <Link href="/settings/billing" className="font-semibold text-primary underline">
              Resubscribe
            </Link>
          </p>
        </div>
      )}

      {overMemberLimit && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-tp-yellow/30 bg-tp-yellow/10 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-tp-yellow shrink-0" />
          <p className="text-sm flex-1">
            Your organization has {members.length} members but your plan allows {planLimits.max_members}.
            New members cannot be added.{" "}
            <Link href="/settings/billing" className="font-semibold text-primary underline">
              Upgrade your plan
            </Link>{" "}
            to increase your member limit.
          </p>
        </div>
      )}
    </>
  );
}
