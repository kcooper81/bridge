import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { STRIPE_PLAN_CONFIG, TRIAL_DAYS } from "@/lib/billing/plans";

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

    const { plan, orgId, seats } = await request.json();

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

    const priceId = process.env[planConfig.priceEnv];
    if (!priceId) {
      return NextResponse.json(
        { error: "Plan not configured" },
        { status: 500 }
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
      customer_email: user.email,
      client_reference_id: orgId,
      metadata: { orgId, userId: user.id, plan },
    };

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
