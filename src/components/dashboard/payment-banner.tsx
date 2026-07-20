"use client";

import { useSubscription } from "@/components/providers/subscription-provider";
import { useOrg } from "@/components/providers/org-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export function PaymentBanner() {
  const { subscription, planLimits } = useSubscription();
  const { members, currentUserRole, org } = useOrg();
  const { isSuperAdmin } = useAuth();

  // Super admins bypass all plan restrictions
  if (isSuperAdmin) return null;

  const isAdmin = currentUserRole === "admin" || currentUserRole === "manager";

  // Over member limit warning (shown to admins only)
  const overMemberLimit =
    isAdmin &&
    planLimits.max_members !== -1 &&
    members.length > planLimits.max_members;

  // Grace window before over-limit members actually lose access. Set by the
  // Stripe webhook on downgrade (see reconcilePlanGrace); enforced by
  // src/lib/billing/seats.ts once it lapses.
  const graceAt = org?.plan_grace_until ? new Date(org.plan_grace_until) : null;
  const graceValid = graceAt !== null && !Number.isNaN(graceAt.getTime());
  const graceExpired = overMemberLimit && (!graceValid || graceAt!.getTime() <= Date.now());
  const graceDeadline =
    graceValid && !graceExpired
      ? graceAt!.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
      : null;
  const daysLeft =
    graceValid && !graceExpired
      ? Math.ceil((graceAt!.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
      : null;

  return (
    <>
      {subscription?.status === "past_due" && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive flex-1">
            {isAdmin ? (
              <>
                Your last payment failed. Please{" "}
                <Link href="/settings/billing" className="font-semibold underline">
                  update your payment method
                </Link>{" "}
                to keep your plan active.
              </>
            ) : (
              "There\u2019s a billing issue with your organization. Contact your admin to resolve it."
            )}
          </p>
        </div>
      )}

      {subscription?.status === "canceled" && !subscription.cancel_at_period_end && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-tp-yellow/30 bg-tp-yellow/10 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-tp-yellow shrink-0" />
          <p className="text-sm flex-1">
            {isAdmin ? (
              <>
                Your subscription has been canceled. You&apos;ve been moved to the Free plan.{" "}
                <Link href="/settings/billing" className="font-semibold text-primary underline">
                  Resubscribe
                </Link>
              </>
            ) : (
              "Your organization\u2019s subscription has been canceled. Contact your admin for details."
            )}
          </p>
        </div>
      )}

      {overMemberLimit && (
        <div
          className={`mb-4 flex items-center gap-3 rounded-lg border px-4 py-3 ${
            graceExpired
              ? "border-destructive/30 bg-destructive/10"
              : "border-tp-yellow/30 bg-tp-yellow/10"
          }`}
        >
          <AlertTriangle
            className={`h-4 w-4 shrink-0 ${graceExpired ? "text-destructive" : "text-tp-yellow"}`}
          />
          <p className="text-sm flex-1">
            Your organization has {members.length} members but your plan allows{" "}
            {planLimits.max_members}.{" "}
            {graceExpired ? (
              <>
                Members beyond the limit have <strong>lost access</strong>.{" "}
              </>
            ) : graceDeadline ? (
              <>
                Everyone keeps access until <strong>{graceDeadline}</strong>
                {daysLeft !== null && daysLeft >= 0 ? ` (${daysLeft} day${daysLeft === 1 ? "" : "s"} left)` : ""}
                , after which members beyond the limit lose access.{" "}
              </>
            ) : (
              <>New members cannot be added. </>
            )}
            <Link href="/settings/billing" className="font-semibold text-primary underline">
              Upgrade your plan
            </Link>{" "}
            or remove members to restore access.
          </p>
        </div>
      )}
    </>
  );
}
