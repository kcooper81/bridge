// Vercel Serverless Function — Create Stripe Checkout Session
// POST /api/stripe/checkout
//
// Supports:
//   - Pro plan: flat $9/mo
//   - Team plan: $7/user/mo (per-seat, min 2)
//   - Business plan: $12/user/mo (per-seat, min 5)
//   - Optional free trial (14 days by default)
//
// Env vars required (set in Vercel dashboard):
//   STRIPE_SECRET_KEY
//   STRIPE_PRICE_PRO       — Stripe Price ID for Pro ($9/mo flat)
//   STRIPE_PRICE_TEAM      — Stripe Price ID for Team ($7/user/mo)
//   STRIPE_PRICE_BUSINESS  — Stripe Price ID for Business ($12/user/mo)
//   SITE_URL               — e.g. https://teamprompt.app

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  pro:      { priceEnv: 'STRIPE_PRICE_PRO',      minSeats: 1, maxSeats: 1,   trial: true },
  team:     { priceEnv: 'STRIPE_PRICE_TEAM',     minSeats: 2, maxSeats: 50,  trial: true },
  business: { priceEnv: 'STRIPE_PRICE_BUSINESS', minSeats: 5, maxSeats: 500, trial: false },
};

const TRIAL_DAYS = 14;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan, orgId, userId, email, seats } = req.body || {};

  if (!plan || !PLANS[plan]) {
    return res.status(400).json({ error: `Invalid plan. Use: ${Object.keys(PLANS).join(', ')}` });
  }

  if (!orgId) {
    return res.status(400).json({ error: 'orgId is required.' });
  }

  const config = PLANS[plan];
  const priceId = process.env[config.priceEnv];
  if (!priceId) {
    return res.status(500).json({ error: `Price not configured for ${plan} plan.` });
  }

  // Validate seat count for per-seat plans
  const quantity = plan === 'pro' ? 1 : Math.max(config.minSeats, Math.min(seats || config.minSeats, config.maxSeats));

  try {
    const sessionParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email || undefined,
      line_items: [{ price: priceId, quantity }],
      metadata: { orgId, userId: userId || '', plan },
      subscription_data: {
        metadata: { orgId, userId: userId || '', plan },
      },
      success_url: `${process.env.SITE_URL}/app?checkout=success&plan=${plan}`,
      cancel_url: `${process.env.SITE_URL}/app?checkout=cancel`,
      allow_promotion_codes: true,
    };

    // Add trial for eligible plans
    if (config.trial) {
      sessionParams.subscription_data.trial_period_days = TRIAL_DAYS;
    }

    // For per-seat plans, let customers adjust quantity at checkout
    if (plan !== 'pro') {
      sessionParams.line_items[0].adjustable_quantity = {
        enabled: true,
        minimum: config.minSeats,
        maximum: config.maxSeats,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err.message);
    return res.status(500).json({ error: 'Failed to create checkout session.' });
  }
}
