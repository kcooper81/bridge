-- Add missing columns to subscriptions table
-- These are referenced by the Stripe webhook handler, admin pages, and billing UI

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS seats INTEGER NOT NULL DEFAULT 1;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_failed_at TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS dispute_status TEXT;
