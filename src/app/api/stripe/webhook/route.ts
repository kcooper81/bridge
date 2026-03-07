import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { limiters, checkRateLimit } from "@/lib/rate-limit";
import { notifyAdminsOfNewSubscription } from "@/lib/notify-admins";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });
}

function getPlanFromPriceId(priceId: string): string {
  if (priceId === process.env.STRIPE_PRICE_PRO || priceId === process.env.STRIPE_PRICE_PRO_ANNUAL) return "pro";
  if (priceId === process.env.STRIPE_PRICE_TEAM || priceId === process.env.STRIPE_PRICE_TEAM_ANNUAL) return "team";
  if (priceId === process.env.STRIPE_PRICE_BUSINESS || priceId === process.env.STRIPE_PRICE_BUSINESS_ANNUAL) return "business";
  return "free";
}

async function upsertSubscription(
  db: ReturnType<typeof createServiceClient>,
  orgId: string,
  sub: Stripe.Subscription,
  customerId: string
) {
  if (!sub.items.data[0]) {
    console.warn("upsertSubscription: sub.items.data is empty, skipping plan update", { subId: sub.id, orgId });
    return;
  }

  const priceId = sub.items.data[0]?.price?.id || "";
  const plan = getPlanFromPriceId(priceId);
  const seats = sub.items.data[0]?.quantity || 1;

  const { error: upsertError } = await db.from("subscriptions").upsert(
    {
      org_id: orgId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      plan,
      status: sub.status,
      seats,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      trial_ends_at: sub.trial_end
        ? new Date(sub.trial_end * 1000).toISOString()
        : null,
      cancel_at_period_end: sub.cancel_at_period_end,
      canceled_at: sub.canceled_at
        ? new Date(sub.canceled_at * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "org_id" }
  );

  if (upsertError) {
    console.error("upsertSubscription: failed to upsert subscription", { orgId, subId: sub.id, error: upsertError });
    throw new Error(`Failed to upsert subscription: ${upsertError.message}`);
  }

  const { error: orgUpdateError } = await db.from("organizations").update({ plan }).eq("id", orgId);

  if (orgUpdateError) {
    console.error("upsertSubscription: failed to update organization plan", { orgId, plan, error: orgUpdateError });
    throw new Error(`Failed to update organization plan: ${orgUpdateError.message}`);
  }
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  try {
    // Rate limit by IP to prevent abuse before doing signature verification
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rl = await checkRateLimit(limiters.stripeWebhook, ip);
    if (!rl.success) return rl.response;

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const db = createServiceClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.orgId || session.client_reference_id;
        if (!orgId || !session.subscription) {
          console.warn("Webhook checkout.session.completed missing orgId or subscription", { sessionId: session.id });
          break;
        }

        const sub = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        await upsertSubscription(
          db,
          orgId,
          sub,
          session.customer as string
        );

        // Notify super admins of new subscription
        const plan = sub.items.data[0] ? getPlanFromPriceId(sub.items.data[0].price.id) : "unknown";
        const seats = sub.items.data[0]?.quantity || 1;
        const { data: org } = await db.from("organizations").select("name").eq("id", orgId).single();
        notifyAdminsOfNewSubscription({
          orgName: org?.name || orgId,
          plan,
          seats,
          customerEmail: session.customer_email || session.customer_details?.email || null,
          orgId,
        });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = sub.metadata?.orgId;
        if (!orgId) {
          console.warn(`Webhook ${event.type} missing orgId in subscription metadata`, { subId: sub.id });
          break;
        }

        await upsertSubscription(
          db,
          orgId,
          sub,
          sub.customer as string
        );
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = sub.metadata?.orgId;
        if (!orgId) {
          console.warn("Webhook customer.subscription.deleted missing orgId", { subId: sub.id });
          break;
        }

        const { error: cancelSubError } = await db
          .from("subscriptions")
          .update({
            status: "canceled",
            plan: "free",
            canceled_at: sub.canceled_at
              ? new Date(sub.canceled_at * 1000).toISOString()
              : new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("org_id", orgId);

        if (cancelSubError) {
          console.error("Webhook customer.subscription.deleted: failed to update subscription", { orgId, error: cancelSubError });
          return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        const { error: cancelOrgError } = await db
          .from("organizations")
          .update({ plan: "free" })
          .eq("id", orgId);

        if (cancelOrgError) {
          console.error("Webhook customer.subscription.deleted: failed to update organization", { orgId, error: cancelOrgError });
          return NextResponse.json({ error: "Database error" }, { status: 500 });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string;
        if (!subId) break;

        const { error: invoicePaidError } = await db
          .from("subscriptions")
          .update({
            status: "active",
            payment_failed_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subId);

        if (invoicePaidError) {
          console.error("Webhook invoice.paid: failed to update subscription", { subId, error: invoicePaidError });
          return NextResponse.json({ error: "Database error" }, { status: 500 });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string;
        if (!subId) break;

        const { error: paymentFailedError } = await db
          .from("subscriptions")
          .update({
            status: "past_due",
            payment_failed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subId);

        if (paymentFailedError) {
          console.error("Webhook invoice.payment_failed: failed to update subscription", { subId, error: paymentFailedError });
          return NextResponse.json({ error: "Database error" }, { status: 500 });
        }
        break;
      }

      case "customer.subscription.trial_will_end": {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = sub.metadata?.orgId;
        if (!orgId) break;

        const { error: trialEndError } = await db
          .from("subscriptions")
          .update({
            trial_ends_at: sub.trial_end
              ? new Date(sub.trial_end * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq("org_id", orgId);

        if (trialEndError) {
          console.error("Webhook customer.subscription.trial_will_end: failed to update subscription", { orgId, error: trialEndError });
          return NextResponse.json({ error: "Database error" }, { status: 500 });
        }
        break;
      }

      case "customer.subscription.paused": {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = sub.metadata?.orgId;
        if (!orgId) {
          console.warn("Webhook customer.subscription.paused missing orgId", { subId: sub.id });
          break;
        }

        const { error: pauseError } = await db
          .from("subscriptions")
          .update({
            status: "paused",
            updated_at: new Date().toISOString(),
          })
          .eq("org_id", orgId);

        if (pauseError) {
          console.error("Webhook customer.subscription.paused: failed to update subscription", { orgId, error: pauseError });
          return NextResponse.json({ error: "Database error" }, { status: 500 });
        }
        break;
      }

      case "customer.subscription.resumed": {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = sub.metadata?.orgId;
        if (!orgId) {
          console.warn("Webhook customer.subscription.resumed missing orgId", { subId: sub.id });
          break;
        }

        await upsertSubscription(
          db,
          orgId,
          sub,
          sub.customer as string
        );
        break;
      }

      case "charge.dispute.created":
      case "charge.dispute.updated": {
        const dispute = event.data.object as Stripe.Dispute;
        const charge = await stripe.charges.retrieve(
          dispute.charge as string
        );
        const invoice = charge.invoice
          ? await stripe.invoices.retrieve(charge.invoice as string)
          : null;
        const subId = invoice?.subscription as string;
        if (!subId) break;

        const { error: disputeUpdateError } = await db
          .from("subscriptions")
          .update({
            dispute_status: dispute.status === "won" ? null : dispute.status,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subId);

        if (disputeUpdateError) {
          console.error(`Webhook ${event.type}: failed to update subscription dispute status`, { subId, error: disputeUpdateError });
          return NextResponse.json({ error: "Database error" }, { status: 500 });
        }
        break;
      }

      case "charge.dispute.closed": {
        const dispute = event.data.object as Stripe.Dispute;
        const charge = await stripe.charges.retrieve(
          dispute.charge as string
        );
        const invoice = charge.invoice
          ? await stripe.invoices.retrieve(charge.invoice as string)
          : null;
        const subId = invoice?.subscription as string;
        if (!subId) break;

        const { error: disputeCloseError } = await db
          .from("subscriptions")
          .update({
            dispute_status: dispute.status === "won" ? null : "lost",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subId);

        if (disputeCloseError) {
          console.error("Webhook charge.dispute.closed: failed to update subscription dispute status", { subId, error: disputeCloseError });
          return NextResponse.json({ error: "Database error" }, { status: 500 });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
