-- Phase 5 / P1 governance: auditor role, notification preferences,
-- activity-log retention, SIEM webhook destinations.

-- 1. Auditor role
-- ─────────────────────────────────────────────────────────────────────────
-- Auditors can SELECT everything an admin sees on the security side
-- (rules, violations, conversation_logs, audit_events) but cannot mutate
-- anything. Compliance buyers ask for this specifically because granting
-- "manager" to give activity-log access also unlocks role changes and
-- member removal.

-- Loosen the role CHECK constraint if any exists so we can add 'auditor'.
DO $$
BEGIN
  -- Drop any existing role check constraint on profiles
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'profiles'
      AND constraint_name = 'profiles_role_check'
  ) THEN
    EXECUTE 'ALTER TABLE profiles DROP CONSTRAINT profiles_role_check';
  END IF;
END $$;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'manager', 'member', 'auditor'));

-- audit_events: extend SELECT to auditors as well.
DROP POLICY IF EXISTS audit_events_select ON audit_events;
CREATE POLICY audit_events_select ON audit_events
  FOR SELECT
  USING (
    org_id = get_my_org_id()
    AND get_my_role() IN ('admin', 'manager', 'auditor')
  );

-- 2. Notification preferences
-- ─────────────────────────────────────────────────────────────────────────
-- Per-user prefs. JSONB so we can extend without migrations. Default shape:
-- {
--   "email": { "violation_block": true, "violation_warn": false, "member_changes": true, "billing": true },
--   "in_app": { "violation_block": true, "violation_warn": true, "member_changes": true, "billing": true },
--   "weekly_digest": true
-- }
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB
    DEFAULT '{"email":{"violation_block":true,"violation_warn":false,"member_changes":true,"billing":true},"in_app":{"violation_block":true,"violation_warn":true,"member_changes":true,"billing":true},"weekly_digest":true}'::jsonb;

-- 3. Activity-log retention
-- ─────────────────────────────────────────────────────────────────────────
-- Per-org retention window. Default 365 days; can be lowered to 30/90/180.
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS activity_log_retention_days INTEGER DEFAULT 365
    CHECK (activity_log_retention_days IN (30, 90, 180, 365, 730, 1095));

-- 4. SIEM webhook destinations
-- ─────────────────────────────────────────────────────────────────────────
-- A separate table (not a setting) because secrets live here. Default-deny
-- RLS — admins can configure via API only.
CREATE TABLE IF NOT EXISTS webhook_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT ARRAY['violation', 'audit'],  -- subscribe set
  secret TEXT,  -- shared HMAC secret for X-TeamPrompt-Signature
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_delivery_at TIMESTAMPTZ,
  last_delivery_status TEXT,
  last_delivery_error TEXT
);

CREATE INDEX IF NOT EXISTS idx_webhook_destinations_org ON webhook_destinations (org_id);
ALTER TABLE webhook_destinations ENABLE ROW LEVEL SECURITY;
-- No policies — service-role only. Admins manage via /api/integrations/webhooks.
