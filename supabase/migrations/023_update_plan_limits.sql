-- ═══════════════════════════════════════════════════════════
-- Update plan_limits view with corrected tier values
-- Changes:
--   - Free: max_members 3 → 1 (individual tryout)
--   - Pro: custom_security true → false (moved to Team+)
--   - All plans: added priority_support and sla columns
--   - Column rename: max_standards → max_guidelines (requires DROP+CREATE)
-- ═══════════════════════════════════════════════════════════

-- DROP required because we're adding new columns and renaming max_standards → max_guidelines.
-- CREATE OR REPLACE VIEW cannot add columns or rename existing ones.
DROP VIEW IF EXISTS plan_limits;

CREATE VIEW plan_limits AS
SELECT * FROM (VALUES
  ('free',     25,    1,    3,    5,  false, false, true,  false, false, false, false),
  ('pro',      -1,    1,   -1,   14,  true,  true,  true,  false, false, false, false),
  ('team',     -1,   50,   -1,   14,  true,  true,  true,  true,  true,  false, false),
  ('business', -1,  500,   -1,   -1,  true,  true,  true,  true,  true,  true,  true)
) AS t(plan, max_prompts, max_members, max_ai_tools, max_guidelines,
       analytics, import_export, basic_security, custom_security, audit_log,
       priority_support, sla);

COMMENT ON VIEW plan_limits IS
  'Plan feature limits. -1 means unlimited. Join with organizations.plan to enforce limits. Updated 2026-02-25: corrected free/pro member limits, added priority_support and sla.';
