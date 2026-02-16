// Vercel Serverless Function — Stripe Webhook Handler
// POST /api/stripe/webhook
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

// Vercel needs raw body for signature verification
export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

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

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { orgId, plan } = session.metadata || {};
        if (orgId && session.subscription) {
          await db.from('subscriptions').upsert({
            org_id: orgId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            plan: plan || 'pro',
            status: 'active',
            current_period_end: null, // will be set by invoice.paid
          }, { onConflict: 'org_id' });
          await db.from('organizations').update({ plan: plan || 'pro' }).eq('id', orgId);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const subId = invoice.subscription;
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          const { data: existing } = await db.from('subscriptions')
            .select('org_id')
            .eq('stripe_subscription_id', subId)
            .single();
          if (existing) {
            await db.from('subscriptions').update({
              status: 'active',
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            }).eq('stripe_subscription_id', subId);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const { data: existing } = await db.from('subscriptions')
          .select('org_id')
          .eq('stripe_subscription_id', sub.id)
          .single();
        if (existing) {
          await db.from('subscriptions').update({
            status: sub.status === 'active' ? 'active' : sub.status === 'past_due' ? 'past_due' : 'canceled',
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          }).eq('stripe_subscription_id', sub.id);
          // Downgrade org plan if canceled
          if (sub.status === 'canceled' || sub.cancel_at_period_end) {
            // Keep plan active until period end, just mark it
            await db.from('subscriptions').update({ cancel_at_period_end: true })
              .eq('stripe_subscription_id', sub.id);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const { data: existing } = await db.from('subscriptions')
          .select('org_id')
          .eq('stripe_subscription_id', sub.id)
          .single();
        if (existing) {
          await db.from('subscriptions').update({ status: 'canceled' })
            .eq('stripe_subscription_id', sub.id);
          await db.from('organizations').update({ plan: 'free' })
            .eq('id', existing.org_id);
        }
        break;
      }

      default:
        // Unhandled event type — ignore silently
        break;
    }
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err.message);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }

  return res.status(200).json({ received: true });
}
