import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { STRIPE_PLAN_CONFIG, TRIAL_DAYS } from "@/lib/billing/plans";
import { PLAN_LIMITS } from "@/lib/constants";
import { limiters, checkRateLimit } from "@/lib/rate-limit";
import type { PlanTier } from "@/lib/types";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });
}

export async function POST(request: NextRequest) {
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
    if (!priceId) {
      return NextResponse.json(
        { error: "Plan not configured" },
        { status: 500 }
      );
    }

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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";
    const seatCount = Math.max(
      planConfig.minSeats,
      Math.min(seats || planConfig.minSeats, planConfig.maxSeats)
    );

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem =
      planConfig.maxSeats === 1
        ? { price: priceId, quantity: 1 }
        : {
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
      success_url: `${siteUrl}/vault?checkout=success&plan=${plan}`,
      cancel_url: `${siteUrl}/vault?checkout=cancel`,
      client_reference_id: orgId,
      metadata: { orgId, userId: user.id, plan },
    };

    // Reuse existing Stripe customer if available (prevents orphaned customers)
    if (existingSub?.stripe_customer_id) {
      sessionParams.customer = existingSub.stripe_customer_id;
    } else {
      sessionParams.customer_email = user.email;
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

    const session = await getStripe().checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
