// Vercel Serverless Function — Create Stripe Checkout Session
// POST /api/stripe/checkout
//
// Env vars required (set in Vercel dashboard):
//   STRIPE_SECRET_KEY
//   STRIPE_PRICE_PRO    — Stripe Price ID for Pro plan
//   STRIPE_PRICE_TEAM   — Stripe Price ID for Team plan
//   SITE_URL             — e.g. https://teamprompt.app

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_MAP = {
  pro: process.env.STRIPE_PRICE_PRO,
  team: process.env.STRIPE_PRICE_TEAM,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan, orgId, userId, email } = req.body || {};

  if (!plan || !PRICE_MAP[plan]) {
    return res.status(400).json({ error: 'Invalid plan. Use "pro" or "team".' });
  }

  if (!orgId) {
    return res.status(400).json({ error: 'orgId is required.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email || undefined,
      line_items: [{ price: PRICE_MAP[plan], quantity: 1 }],
      metadata: { orgId, userId: userId || '', plan },
      success_url: `${process.env.SITE_URL}/app?checkout=success`,
      cancel_url: `${process.env.SITE_URL}/app?checkout=cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    return res.status(500).json({ error: 'Failed to create checkout session.' });
  }
}
