"use client";

import { useSubscription } from "@/components/providers/subscription-provider";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export function PaymentBanner() {
  const { subscription } = useSubscription();

  if (!subscription) return null;

  if (subscription.status === "past_due") {
    return (
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
    );
  }

  if (subscription.status === "canceled" && !subscription.cancel_at_period_end) {
    return (
      <div className="mb-4 flex items-center gap-3 rounded-lg border border-tp-yellow/30 bg-tp-yellow/10 px-4 py-3">
        <AlertTriangle className="h-4 w-4 text-tp-yellow shrink-0" />
        <p className="text-sm flex-1">
          Your subscription has been canceled. You&apos;ve been moved to the Free plan.{" "}
          <Link href="/settings/billing" className="font-semibold text-primary underline">
            Resubscribe
          </Link>
        </p>
      </div>
    );
  }

  return null;
}
