import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";

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

    const { orgId } = await request.json();

    // Verify user belongs to org
    const { data: profile } = await db
      .from("profiles")
      .select("org_id, role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.org_id !== orgId || profile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get Stripe customer ID
    const { data: subscription } = await db
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("org_id", orgId)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 404 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";
    const session = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${siteUrl}/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
