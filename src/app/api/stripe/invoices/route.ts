import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
function getStripe() {
  if (!STRIPE_KEY) return null;
  return new Stripe(STRIPE_KEY, { apiVersion: "2025-02-24.acacia" });
}

/**
 * GET /api/stripe/invoices
 *
 * Returns the most recent invoices for the caller's org. Used by the
 * /settings/billing page to render an in-app invoice list — finance
 * teams asked for this constantly because the only path previously was
 * Stripe portal → Invoices (3 clicks, off-site).
 *
 * Returns 200 with an empty list when Stripe isn't configured or when
 * the org has no Stripe customer record — callers render "No invoices yet".
 */
export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ invoices: [] });

  const db = createServiceClient();
  const { data: profile } = await db
    .from("profiles")
    .select("org_id, role")
    .eq("id", user.id)
    .single();
  if (!profile?.org_id) return NextResponse.json({ invoices: [] });
  if (!["admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { data: sub } = await db
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("org_id", profile.org_id)
    .maybeSingle();
  if (!sub?.stripe_customer_id) return NextResponse.json({ invoices: [] });

  try {
    const list = await stripe.invoices.list({
      customer: sub.stripe_customer_id,
      limit: 12,
    });
    const invoices = list.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      amount_paid: inv.amount_paid,
      amount_due: inv.amount_due,
      currency: inv.currency,
      status: inv.status,
      hosted_invoice_url: inv.hosted_invoice_url,
      invoice_pdf: inv.invoice_pdf,
      created: inv.created,
      period_start: inv.period_start,
      period_end: inv.period_end,
    }));
    return NextResponse.json({ invoices });
  } catch (err) {
    console.error("Stripe invoices list failed", err);
    return NextResponse.json({ invoices: [], error: (err as Error).message });
  }
}
