// Server-only helper for keeping Stripe subscription seat counts in sync
// with the actual number of org members in our DB. Before this helper,
// members could be added in-app without pushing seat changes to Stripe —
// an org on the "team" plan with 2 paid seats could invite 10 members and
// only get billed for 2 (under-billing).
//
// Call syncStripeSeats(orgId) AFTER any operation that changes the member
// count: invite acceptance, auto-join completion, manual member add, or
// member removal. Returns the new seat count for logging; never throws —
// the underlying operation must succeed even if seat sync fails.

import "server-only";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

export interface SeatSyncResult {
  synced: boolean;
  reason?: string;
  oldSeats?: number;
  newSeats?: number;
  memberCount?: number;
}

export async function syncStripeSeats(orgId: string): Promise<SeatSyncResult> {
  try {
    const stripe = getStripe();
    if (!stripe) return { synced: false, reason: "stripe_not_configured" };

    const db = createServiceClient();

    const { data: sub } = await db
      .from("subscriptions")
      .select("stripe_subscription_id, seats, status, plan")
      .eq("org_id", orgId)
      .maybeSingle();

    if (!sub?.stripe_subscription_id) return { synced: false, reason: "no_subscription" };

    // Only sync for active/trialing/past_due subs — don't auto-bump seats on
    // a canceled sub (the customer is on free until next checkout).
    if (!["active", "trialing", "past_due"].includes(sub.status)) {
      return { synced: false, reason: `status_${sub.status}` };
    }

    // Count actual org members (anyone with org_id = orgId).
    const { count: memberCount } = await db
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId);
    const newSeats = Math.max(1, memberCount ?? 1);

    if (newSeats === sub.seats) {
      return { synced: false, reason: "already_in_sync", oldSeats: sub.seats, newSeats, memberCount: memberCount ?? 0 };
    }

    // Look up the subscription item to update quantity on.
    const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
    const item = stripeSub.items.data[0];
    if (!item) return { synced: false, reason: "no_subscription_item" };

    await stripe.subscriptionItems.update(item.id, {
      quantity: newSeats,
      proration_behavior: "create_prorations",
    });

    // Update our mirror so the UI reflects the new seat count immediately.
    await db
      .from("subscriptions")
      .update({ seats: newSeats, updated_at: new Date().toISOString() })
      .eq("org_id", orgId);

    return { synced: true, oldSeats: sub.seats, newSeats, memberCount: memberCount ?? 0 };
  } catch (err) {
    console.error("[stripe-seats] sync failed", { orgId, err });
    return { synced: false, reason: "exception" };
  }
}
