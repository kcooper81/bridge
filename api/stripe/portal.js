// Vercel Serverless Function — Create Stripe Customer Portal Session
// POST /api/stripe/portal
//
// Lets existing subscribers manage their billing, update payment method, or cancel.
//
// Env vars required:
//   STRIPE_SECRET_KEY
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   SITE_URL

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orgId } = req.body || {};
  if (!orgId) {
    return res.status(400).json({ error: 'orgId is required.' });
  }

  const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: sub } = await db.from('subscriptions')
    .select('stripe_customer_id')
    .eq('org_id', orgId)
    .single();

  if (!sub?.stripe_customer_id) {
    return res.status(404).json({ error: 'No active subscription found.' });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.SITE_URL}/app`,
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe portal error:', err.message);
    return res.status(500).json({ error: 'Failed to create portal session.' });
  }
}
