-- ═══════════════════════════════════════════════════════════
-- 058: Update plan member limits
--   Free: 1 → 3 members
--   Pro:  1 → 12 members
-- ═══════════════════════════════════════════════════════════

DROP VIEW IF EXISTS plan_limits;

CREATE VIEW plan_limits
  WITH (security_invoker = true)
AS
SELECT * FROM (VALUES
  ('free',     25,    3,    3,    5,  false, false, true,  false, false, false, false, false, false, false, false, false),
  ('pro',      -1,   12,   -1,   14,  true,  true,  true,  false, false, false, false, false, false, false, false, false),
  ('team',     -1,   50,   -1,   14,  true,  true,  true,  true,  true,  true,  true,  true,  true,  false, false, false),
  ('business', -1,  500,   -1,   -1,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true)
) AS t(plan, max_prompts, max_members, max_ai_tools, max_guidelines,
       analytics, import_export, basic_security, custom_security, audit_log,
       bulk_import, bulk_role_assignment, custom_welcome_email,
       domain_auto_join, google_workspace_sync,
       priority_support, sla);

COMMENT ON VIEW plan_limits IS
  'Plan feature limits. -1 means unlimited. security_invoker = true so RLS of querying user applies.';
