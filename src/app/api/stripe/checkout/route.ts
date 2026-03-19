import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { STRIPE_PLAN_CONFIG, TRIAL_DAYS } from "@/lib/billing/plans";
import { PLAN_LIMITS } from "@/lib/constants";
import { limiters, checkRateLimit } from "@/lib/rate-limit";
import { logServiceError } from "@/lib/log-error";
import type { PlanTier } from "@/lib/types";

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

export async function POST(request: NextRequest) {
  // Early env var check before anything else
  const missingEnvs = [
    "STRIPE_SECRET_KEY",
    "STRIPE_PRICE_PRO",
    "STRIPE_PRICE_PRO_ANNUAL",
    "STRIPE_PRICE_TEAM",
    "STRIPE_PRICE_TEAM_ANNUAL",
    "STRIPE_PRICE_BUSINESS",
    "STRIPE_PRICE_BUSINESS_ANNUAL",
  ].filter((key) => !process.env[key]);

  if (missingEnvs.length > 0) {
    console.error("Missing Stripe env vars:", missingEnvs);
    return NextResponse.json(
      { error: "Billing service is not available. Please try again later." },
      { status: 503 }
    );
  }

  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const db = createServiceClient();
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = await checkRateLimit(limiters.stripeCheckout, user.id);
    if (!rl.success) return rl.response;

    const { plan, orgId, seats, interval = "monthly" } = await request.json();

    if (!["monthly", "annual"].includes(interval)) {
      return NextResponse.json({ error: "Invalid interval" }, { status: 400 });
    }

    const planConfig =
      STRIPE_PLAN_CONFIG[plan as keyof typeof STRIPE_PLAN_CONFIG];
    if (!planConfig) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Verify user belongs to org
    const { data: profile } = await db
      .from("profiles")
      .select("org_id, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.org_id !== orgId || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const priceEnvKey = interval === "annual"
      ? planConfig.priceEnv.annual
      : planConfig.priceEnv.monthly;
    const priceId = process.env[priceEnvKey];

    // Validate member count against target plan limits
    const targetLimits = PLAN_LIMITS[plan as PlanTier];
    if (targetLimits && targetLimits.max_members !== -1) {
      const { count: memberCount } = await db
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId);

      if ((memberCount || 0) > targetLimits.max_members) {
        return NextResponse.json(
          { error: `Your organization has ${memberCount} members but the ${plan} plan allows ${targetLimits.max_members}. Please choose a plan that supports your team size.` },
          { status: 400 }
        );
      }
    }

    // Check for existing active subscription — plan changes go through the portal
    const { data: existingSub } = await db
      .from("subscriptions")
      .select("stripe_customer_id, stripe_subscription_id, status")
      .eq("org_id", orgId)
      .maybeSingle();

    if (existingSub?.status === "active" || existingSub?.status === "trialing") {
      return NextResponse.json(
        { error: "You already have an active subscription. Use 'Manage Billing' to change plans." },
        { status: 409 }
      );
    }

    // Fallback: check Stripe directly for existing subscriptions (catches cases where
    // the webhook failed and the DB is out of sync with Stripe)
    const stripe = getStripe();
    const existingCustomers = await stripe.customers.list({ email: user.email!, limit: 5 });
    for (const cust of existingCustomers.data) {
      const stripeSubs = await stripe.subscriptions.list({
        customer: cust.id,
        status: "all",
        limit: 10,
      });
      const activeSub = stripeSubs.data.find(
        (s) => s.status === "active" || s.status === "trialing"
      );
      if (activeSub) {
        // Sync the subscription to DB so future checks work from DB alone
        const subPriceId = activeSub.items.data[0]?.price?.id || "";
        const subPlan = getPlanFromPriceId(subPriceId);
        await db.from("subscriptions").upsert({
          org_id: orgId,
          stripe_customer_id: cust.id,
          stripe_subscription_id: activeSub.id,
          plan: subPlan,
          status: activeSub.status,
          seats: activeSub.items.data[0]?.quantity || 1,
          current_period_end: new Date(activeSub.current_period_end * 1000).toISOString(),
          trial_ends_at: activeSub.trial_end ? new Date(activeSub.trial_end * 1000).toISOString() : null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "org_id" });
        await db.from("organizations").update({ plan: subPlan }).eq("id", orgId);

        return NextResponse.json(
          { error: "You already have an active subscription. Use 'Manage Billing' to change plans." },
          { status: 409 }
        );
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";
    const seatCount = Math.max(
      planConfig.minSeats,
      Math.min(seats || planConfig.minSeats, planConfig.maxSeats)
    );

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      price: priceId,
      quantity: seatCount,
      adjustable_quantity: {
        enabled: true,
        minimum: planConfig.minSeats,
        maximum: planConfig.maxSeats,
      },
    };

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [lineItem],
      success_url: `${siteUrl}/settings/billing?checkout=success&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/settings/billing?checkout=cancel`,
      client_reference_id: orgId,
      metadata: { orgId, userId: user.id, plan },
    };

    // Reuse existing Stripe customer if available (prevents orphaned customers)
    if (existingSub?.stripe_customer_id) {
      sessionParams.customer = existingSub.stripe_customer_id;
    } else {
      // Also check if we found a Stripe customer above to reuse
      const existingCust = existingCustomers.data[0];
      if (existingCust) {
        sessionParams.customer = existingCust.id;
      } else {
        sessionParams.customer_email = user.email;
      }
    }

    if (planConfig.trial) {
      sessionParams.subscription_data = {
        trial_period_days: TRIAL_DAYS,
        metadata: { orgId, plan },
      };
    } else {
      sessionParams.subscription_data = {
        metadata: { orgId, plan },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    logServiceError("stripe", error, { url: "/api/stripe/checkout" });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
