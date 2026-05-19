-- Phase 2 / P0-4: Audit trail for privileged admin actions.
--
-- Today the Activity log only contains conversation_logs (user prompts).
-- Role changes, admin transfers, member removals, DLP shield toggles, and
-- rule deletions/exports are invisible to a compliance reviewer. For a
-- DLP/compliance product this is the single largest credibility gap.
--
-- The events live in their own table with admin/manager read-only RLS;
-- inserts happen exclusively from server-side endpoints via the service
-- role, so no client can forge events.

CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  actor_name TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  target_label TEXT,
  before JSONB,
  after JSONB,
  metadata JSONB,
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_org_time ON audit_events (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON audit_events (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_action ON audit_events (action);

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Read: admins and managers see their org's events.
-- (After Phase 5 the new "auditor" role will also be granted SELECT here.)
DROP POLICY IF EXISTS audit_events_select ON audit_events;
CREATE POLICY audit_events_select ON audit_events
  FOR SELECT
  USING (
    org_id = get_my_org_id()
    AND get_my_role() IN ('admin', 'manager')
  );

-- No INSERT/UPDATE/DELETE policies. All writes go through the service role
-- from server-side endpoints; no client can spoof or alter audit rows.
