-- ═══════════════════════════════════════════════════════════
-- Subscriptions table for Stripe billing
-- Tracks each org's subscription, plan, seats, trial, disputes.
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                  UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,

  -- Stripe references
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,

  -- Plan & status
  plan                    TEXT NOT NULL DEFAULT 'free'
                          CHECK (plan IN ('free', 'pro', 'team', 'business')),
  status                  TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'paused')),

  -- Seats (per-seat billing for team/business plans)
  seats                   INTEGER NOT NULL DEFAULT 1 CHECK (seats >= 1),

  -- Billing period
  current_period_end      TIMESTAMPTZ,

  -- Trial tracking
  trial_ends_at           TIMESTAMPTZ,

  -- Cancellation tracking
  cancel_at_period_end    BOOLEAN DEFAULT false,
  canceled_at             TIMESTAMPTZ,

  -- Payment failure tracking (so the app can show a "fix your payment" banner)
  payment_failed_at       TIMESTAMPTZ,

  -- Dispute/chargeback tracking
  -- null = no dispute, 'needs_response' = chargeback filed, 'won' = resolved, 'lost' = lost
  dispute_status          TEXT CHECK (dispute_status IS NULL OR dispute_status IN (
                            'needs_response', 'warning_needs_response',
                            'under_review', 'won', 'lost'
                          )),

  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_org        ON subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer   ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status     ON subscriptions(status);

-- ═══ RLS ═══════════════════════════════════════════════
-- Org members can READ their own subscription.
-- Only the service role (webhooks) can INSERT/UPDATE/DELETE.
-- This prevents any client-side plan manipulation.

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_select ON subscriptions FOR SELECT USING (
  org_id = get_my_org_id()
);

-- ═══ Auto-update timestamp ════════════════════════════
DROP TRIGGER IF EXISTS set_updated_at ON subscriptions;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══ Add plan column to organizations if not exists ═══
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organizations' AND column_name = 'plan'
  ) THEN
    ALTER TABLE organizations ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'
      CHECK (plan IN ('free', 'pro', 'team', 'business'));
  END IF;
END $$;

-- ═══ Plan limits view (for easy querying from the app) ═══
-- Usage: SELECT * FROM plan_limits WHERE plan = 'pro';
CREATE OR REPLACE VIEW plan_limits AS
SELECT * FROM (VALUES
  ('free',     25,    3,    3,    5,  false, false, true,  false, false),
  ('pro',      -1,    1,   -1,   14,  true,  true,  true,  true,  false),
  ('team',     -1,   50,   -1,   14,  true,  true,  true,  true,  true),
  ('business', -1,  500,   -1,   -1,  true,  true,  true,  true,  true)
) AS t(plan, max_prompts, max_members, max_ai_tools, max_guidelines, analytics, import_export, basic_security, custom_security, audit_log);

COMMENT ON VIEW plan_limits IS
  'Plan feature limits. -1 means unlimited. Join with organizations.plan to enforce limits.';
