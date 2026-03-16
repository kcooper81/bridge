-- Migration 063: Add missing indexes and tighten notification policy
-- Addresses: missing indexes on frequently queried columns,
-- overly permissive notification insert policy

-- ─── Missing Indexes ───────────────────────────────────────────────

-- Invite cleanup/expiry queries filter by org + status + expiry
CREATE INDEX IF NOT EXISTS idx_invites_org_status_expires
  ON invites (org_id, status, expires_at);

-- Security violations queried by rule_id for analytics
CREATE INDEX IF NOT EXISTS idx_security_violations_rule
  ON security_violations (org_id, rule_id);

-- Team member lookups by both team and user (covering index)
CREATE INDEX IF NOT EXISTS idx_team_members_team_user
  ON team_members (team_id, user_id);

-- ─── Tighten Notification Insert Policy ────────────────────────────

-- Replace the wide-open insert policy with one that only allows:
-- 1. Service role (system notifications via service client)
-- 2. Admins/managers inserting notifications for their own org
DO $$
BEGIN
  -- Drop the old permissive policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'notifications'
      AND policyname = 'Service can insert notifications'
  ) THEN
    DROP POLICY "Service can insert notifications" ON notifications;
  END IF;
END $$;

CREATE POLICY "Org admins and service can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    -- Service role bypasses RLS anyway, but this covers admin/manager inserts
    org_id = get_my_org_id()
    AND get_my_role() IN ('admin', 'manager')
  );
