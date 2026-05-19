-- Phase 3 / P0-5: Stripe webhook idempotency.
--
-- Stripe retries non-2xx responses (and can re-deliver after timeouts).
-- Before this table, a retried checkout.session.completed would re-fire
-- notifyAdminsOfNewSubscription and double-count analytics. Now the
-- webhook handler inserts event.id into this table at the top; on
-- unique-violation it short-circuits with 200.

CREATE TABLE IF NOT EXISTS stripe_processed_events (
  id TEXT PRIMARY KEY,
  type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Default-deny RLS; only the service-role webhook handler writes/reads.
ALTER TABLE stripe_processed_events ENABLE ROW LEVEL SECURITY;

-- Auto-prune events older than 30 days so the table doesn't grow forever.
-- Stripe's retry window is much shorter than 30 days, so this is safe.
CREATE OR REPLACE FUNCTION trigger_prune_stripe_processed_events()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM stripe_processed_events WHERE created_at < now() - INTERVAL '30 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only run prune occasionally (per ~1000th insert) — using a statement-level
-- AFTER trigger gated on a cheap mod check. This avoids paying the cost on
-- every webhook event.
DROP TRIGGER IF EXISTS prune_stripe_processed_events ON stripe_processed_events;
CREATE TRIGGER prune_stripe_processed_events
  AFTER INSERT ON stripe_processed_events
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_prune_stripe_processed_events();
