// Vercel Serverless Function — Stripe Webhook Handler
// POST /api/stripe/webhook
//
// Handles the FULL customer + subscription lifecycle:
//   - Checkout completion
//   - Subscription created / updated / deleted / paused / resumed
//   - Trial ending warnings
//   - Payment success / failure
//   - Disputes (chargebacks) and refunds
//   - Customer updates and deletion
//
// Env vars required (set in Vercel dashboard):
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY  — service role key (NOT anon key)

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

// Vercel needs raw body for Stripe signature verification
export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

// ─── Helpers ───────────────────────────────────────────

function ts(epoch) {
  return epoch ? new Date(epoch * 1000).toISOString() : null;
}

// Look up our subscription record by Stripe subscription ID
async function findSub(db, stripeSubId) {
  const { data } = await db.from('subscriptions')
    .select('id, org_id, plan')
    .eq('stripe_subscription_id', stripeSubId)
    .single();
  return data;
}

// Look up our subscription record by Stripe customer ID
async function findSubByCustomer(db, stripeCustomerId) {
  const { data } = await db.from('subscriptions')
    .select('id, org_id, plan')
    .eq('stripe_customer_id', stripeCustomerId)
    .maybeSingle();
  return data;
}

// Resolve which plan a Stripe subscription maps to
function resolvePlan(stripeSub) {
  // Check metadata first (set during checkout)
  if (stripeSub.metadata?.plan) return stripeSub.metadata.plan;
  // Fall back to looking at the price
  const priceId = stripeSub.items?.data?.[0]?.price?.id;
  if (priceId === process.env.STRIPE_PRICE_PRO) return 'pro';
  if (priceId === process.env.STRIPE_PRICE_TEAM) return 'team';
  if (priceId === process.env.STRIPE_PRICE_BUSINESS) return 'business';
  return 'pro'; // default
}

// Map Stripe subscription status → our status enum
function mapStatus(stripeStatus) {
  const map = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'past_due',
    incomplete: 'past_due',
    incomplete_expired: 'canceled',
    paused: 'paused',
  };
  return map[stripeStatus] || 'active';
}

// ─── Event Handlers ────────────────────────────────────

const handlers = {

  // ━━━ CHECKOUT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  'checkout.session.completed': async (db, event) => {
    const session = event.data.object;
    if (session.mode !== 'subscription') return; // only handle subscription checkouts

    const { orgId, userId, plan } = session.metadata || {};
    if (!orgId) return;

    const sub = session.subscription
      ? await stripe.subscriptions.retrieve(session.subscription)
      : null;

    await db.from('subscriptions').upsert({
      org_id: orgId,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      plan: plan || 'pro',
      status: sub ? mapStatus(sub.status) : 'active',
      seats: sub?.items?.data?.[0]?.quantity || 1,
      current_period_end: sub ? ts(sub.current_period_end) : null,
      trial_ends_at: sub?.trial_end ? ts(sub.trial_end) : null,
      cancel_at_period_end: false,
    }, { onConflict: 'org_id' });

    await db.from('organizations')
      .update({ plan: plan || 'pro' })
      .eq('id', orgId);
  },

  // ━━━ SUBSCRIPTION LIFECYCLE ━━━━━━━━━━━━━━━━━━━━━━━━━
  'customer.subscription.created': async (db, event) => {
    // Belt-and-suspenders for checkout.session.completed.
    // If checkout already created the record, this is a no-op upsert.
    const sub = event.data.object;
    const orgId = sub.metadata?.orgId;
    if (!orgId) return;

    const plan = resolvePlan(sub);
    await db.from('subscriptions').upsert({
      org_id: orgId,
      stripe_customer_id: sub.customer,
      stripe_subscription_id: sub.id,
      plan,
      status: mapStatus(sub.status),
      seats: sub.items?.data?.[0]?.quantity || 1,
      current_period_end: ts(sub.current_period_end),
      trial_ends_at: sub.trial_end ? ts(sub.trial_end) : null,
      cancel_at_period_end: sub.cancel_at_period_end || false,
    }, { onConflict: 'org_id' });

    await db.from('organizations').update({ plan }).eq('id', orgId);
  },

  'customer.subscription.updated': async (db, event) => {
    const sub = event.data.object;
    const prev = event.data.previous_attributes || {};
    const existing = await findSub(db, sub.id);
    if (!existing) return;

    const plan = resolvePlan(sub);
    const updates = {
      status: mapStatus(sub.status),
      current_period_end: ts(sub.current_period_end),
      cancel_at_period_end: sub.cancel_at_period_end || false,
      seats: sub.items?.data?.[0]?.quantity || 1,
    };

    // Plan changed (upgrade or downgrade)
    if (prev.items || prev.plan) {
      updates.plan = plan;
      await db.from('organizations')
        .update({ plan })
        .eq('id', existing.org_id);
    }

    // Trial ended
    if (prev.status === 'trialing' && sub.status === 'active') {
      updates.trial_ends_at = null;
    }

    // Cancellation scheduled
    if (sub.cancel_at_period_end && !prev.cancel_at_period_end) {
      updates.canceled_at = new Date().toISOString();
    }

    // Cancellation reversed (customer re-subscribes before period end)
    if (!sub.cancel_at_period_end && prev.cancel_at_period_end) {
      updates.canceled_at = null;
      updates.cancel_at_period_end = false;
    }

    await db.from('subscriptions')
      .update(updates)
      .eq('stripe_subscription_id', sub.id);
  },

  'customer.subscription.deleted': async (db, event) => {
    // Subscription fully terminated — downgrade org to free
    const sub = event.data.object;
    const existing = await findSub(db, sub.id);
    if (!existing) return;

    await db.from('subscriptions').update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      cancel_at_period_end: false,
    }).eq('stripe_subscription_id', sub.id);

    await db.from('organizations')
      .update({ plan: 'free' })
      .eq('id', existing.org_id);
  },

  'customer.subscription.paused': async (db, event) => {
    const sub = event.data.object;
    const existing = await findSub(db, sub.id);
    if (!existing) return;

    await db.from('subscriptions').update({
      status: 'paused',
    }).eq('stripe_subscription_id', sub.id);
  },

  'customer.subscription.resumed': async (db, event) => {
    const sub = event.data.object;
    const existing = await findSub(db, sub.id);
    if (!existing) return;

    await db.from('subscriptions').update({
      status: mapStatus(sub.status),
      current_period_end: ts(sub.current_period_end),
    }).eq('stripe_subscription_id', sub.id);
  },

  'customer.subscription.trial_will_end': async (db, event) => {
    // Fires 3 days before trial expires.
    // Record the event so the app can show an in-app banner.
    const sub = event.data.object;
    const existing = await findSub(db, sub.id);
    if (!existing) return;

    await db.from('subscriptions').update({
      trial_ends_at: ts(sub.trial_end),
    }).eq('stripe_subscription_id', sub.id);
  },

  // ━━━ INVOICES / PAYMENTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━
  'invoice.paid': async (db, event) => {
    const invoice = event.data.object;
    const subId = invoice.subscription;
    if (!subId) return;

    const sub = await stripe.subscriptions.retrieve(subId);
    const existing = await findSub(db, subId);
    if (!existing) return;

    await db.from('subscriptions').update({
      status: 'active',
      current_period_end: ts(sub.current_period_end),
      payment_failed_at: null, // clear any prior failure
    }).eq('stripe_subscription_id', subId);
  },

  'invoice.payment_failed': async (db, event) => {
    // Payment failed — Stripe will retry automatically (smart retries).
    // Mark subscription as past_due so the app can show a warning banner.
    const invoice = event.data.object;
    const subId = invoice.subscription;
    if (!subId) return;

    const existing = await findSub(db, subId);
    if (!existing) return;

    await db.from('subscriptions').update({
      status: 'past_due',
      payment_failed_at: new Date().toISOString(),
    }).eq('stripe_subscription_id', subId);
  },

  'invoice.payment_action_required': async (db, event) => {
    // 3D Secure or other customer action required.
    // Same as payment_failed from an app perspective — show a banner.
    const invoice = event.data.object;
    const subId = invoice.subscription;
    if (!subId) return;

    const existing = await findSub(db, subId);
    if (!existing) return;

    await db.from('subscriptions').update({
      status: 'past_due',
      payment_failed_at: new Date().toISOString(),
    }).eq('stripe_subscription_id', subId);
  },

  // ━━━ DISPUTES (CHARGEBACKS) ━━━━━━━━━━━━━━━━━━━━━━━━
  'charge.dispute.created': async (db, event) => {
    // A customer filed a chargeback. This is serious — restrict the account
    // until resolved. If you lose a dispute, Stripe charges you the amount + $15 fee.
    const dispute = event.data.object;
    const customerId = dispute.customer;
    if (!customerId) return;

    const existing = await findSubByCustomer(db, customerId);
    if (!existing) return;

    await db.from('subscriptions').update({
      dispute_status: 'needs_response',
    }).eq('stripe_customer_id', customerId);
  },

  'charge.dispute.updated': async (db, event) => {
    const dispute = event.data.object;
    const customerId = dispute.customer;
    if (!customerId) return;

    const existing = await findSubByCustomer(db, customerId);
    if (!existing) return;

    await db.from('subscriptions').update({
      dispute_status: dispute.status, // warning_needs_response, won, lost, etc.
    }).eq('stripe_customer_id', customerId);
  },

  'charge.dispute.closed': async (db, event) => {
    const dispute = event.data.object;
    const customerId = dispute.customer;
    if (!customerId) return;

    const existing = await findSubByCustomer(db, customerId);
    if (!existing) return;

    if (dispute.status === 'won') {
      // We won the dispute — clear the flag
      await db.from('subscriptions').update({
        dispute_status: null,
      }).eq('stripe_customer_id', customerId);
    } else {
      // We lost — keep flag, may want to cancel their subscription
      await db.from('subscriptions').update({
        dispute_status: 'lost',
      }).eq('stripe_customer_id', customerId);
    }
  },

  'charge.refunded': async (db, event) => {
    // A refund was issued (either by you in the dashboard or programmatically).
    // Log it but don't auto-cancel — partial refunds are common for prorations.
    const charge = event.data.object;
    const customerId = charge.customer;
    if (!customerId) return;

    const existing = await findSubByCustomer(db, customerId);
    if (!existing) return;

    // If fully refunded, the subscription will be canceled via
    // customer.subscription.deleted. No action needed here unless you
    // want to log refund events to a separate table.
  },

  // ━━━ CUSTOMER MANAGEMENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━
  'customer.updated': async (db, event) => {
    // Customer email or metadata changed in Stripe.
    // Sync email back if you store it.
    const customer = event.data.object;
    // No-op for now — we don't duplicate customer email in subscriptions table.
    // Add sync logic here if needed in the future.
  },

  'customer.deleted': async (db, event) => {
    // Customer deleted in Stripe dashboard. Unusual but handle it.
    const customer = event.data.object;
    const existing = await findSubByCustomer(db, customer.id);
    if (!existing) return;

    await db.from('subscriptions').update({
      status: 'canceled',
      stripe_customer_id: null, // clear stale reference
      stripe_subscription_id: null,
    }).eq('stripe_customer_id', customer.id);

    await db.from('organizations')
      .update({ plan: 'free' })
      .eq('id', existing.org_id);
  },
};

// ─── Main Handler ──────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const db = getSupabase();
  const handler_fn = handlers[event.type];

  if (handler_fn) {
    try {
      await handler_fn(db, event);
    } catch (err) {
      console.error(`Webhook handler error [${event.type}]:`, err.message);
      // Return 500 so Stripe retries (up to ~3 days with exponential backoff)
      return res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  // Always return 200 for unhandled event types so Stripe doesn't retry them
  return res.status(200).json({ received: true });
}
