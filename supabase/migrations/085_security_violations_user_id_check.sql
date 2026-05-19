-- Phase 1 / P0-10: tighten security_violations INSERT policy so users
-- can only write rows attributed to themselves. The original policy
-- only checked `org_id = get_my_org_id()` which let any member forge
-- a "block" violation against another user — triggering admin
-- notifications and falsifying the audit log.
--
-- conversation_logs already enforces this pattern (see 011_*) — this
-- migration brings security_violations in line.

DROP POLICY IF EXISTS security_violations_insert ON security_violations;

CREATE POLICY security_violations_insert ON security_violations
  FOR INSERT
  WITH CHECK (
    org_id = get_my_org_id()
    AND user_id = auth.uid()
  );
