import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";

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
  const priceId = sub.items.data[0]?.price?.id || "";
  const plan = getPlanFromPriceId(priceId);
  const seats = sub.items.data[0]?.quantity || 1;

  await db.from("subscriptions").upsert(
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

  await db.from("organizations").update({ plan }).eq("id", orgId);
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  try {
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

        await db
          .from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: sub.canceled_at
              ? new Date(sub.canceled_at * 1000).toISOString()
              : new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("org_id", orgId);

        await db
          .from("organizations")
          .update({ plan: "free" })
          .eq("id", orgId);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string;
        if (!subId) break;

        await db
          .from("subscriptions")
          .update({
            status: "active",
            payment_failed_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subId);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string;
        if (!subId) break;

        await db
          .from("subscriptions")
          .update({
            status: "past_due",
            payment_failed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subId);
        break;
      }

      case "customer.subscription.trial_will_end": {
        const sub = event.data.object as Stripe.Subscription;
        const orgId = sub.metadata?.orgId;
        if (!orgId) break;

        await db
          .from("subscriptions")
          .update({
            trial_ends_at: sub.trial_end
              ? new Date(sub.trial_end * 1000).toISOString()
              : null,
            updated_at: new Date().toISOString(),
          })
          .eq("org_id", orgId);
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

        await db
          .from("subscriptions")
          .update({
            dispute_status: dispute.status === "won" ? null : dispute.status,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subId);
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

        await db
          .from("subscriptions")
          .update({
            dispute_status: dispute.status === "won" ? null : "lost",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subId);
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
