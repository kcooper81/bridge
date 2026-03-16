import Stripe from "stripe";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cancel any active Stripe subscription for an org before deleting it.
 * Fire-and-forget safe — logs errors but never throws.
 */
export async function cancelOrgSubscription(
  db: SupabaseClient,
  orgId: string
): Promise<void> {
  if (!process.env.STRIPE_SECRET_KEY) return;

  try {
    const { data: subscription } = await db
      .from("subscriptions")
      .select("stripe_subscription_id, status")
      .eq("org_id", orgId)
      .single();

    if (
      subscription?.stripe_subscription_id &&
      subscription.status !== "canceled"
    ) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2025-02-24.acacia",
      });
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    }
  } catch (err) {
    console.error("Failed to cancel Stripe subscription for org", orgId, err);
  }
}
