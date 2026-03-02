-- ═══════════════════════════════════════════════════════════
-- 037: Tighten NOT NULL constraints & update plan_limits view
--
-- ~27 columns are nullable in the DB but have defaults and should
-- never be null. For each: backfill existing nulls → add NOT NULL.
-- Also recreates plan_limits view with 5 missing feature columns.
-- ═══════════════════════════════════════════════════════════

BEGIN;

-- ─── profiles ───
UPDATE profiles SET extension_status = 'unknown' WHERE extension_status IS NULL;
ALTER TABLE profiles ALTER COLUMN extension_status SET NOT NULL;

-- ─── prompts ───
UPDATE prompts SET tone = 'professional' WHERE tone IS NULL;
ALTER TABLE prompts ALTER COLUMN tone SET NOT NULL;

UPDATE prompts SET tags = '{}' WHERE tags IS NULL;
ALTER TABLE prompts ALTER COLUMN tags SET NOT NULL;

UPDATE prompts SET template_variables = '[]' WHERE template_variables IS NULL;
ALTER TABLE prompts ALTER COLUMN template_variables SET NOT NULL;

-- ─── prompt_ratings ───
-- Delete orphaned rows where FK columns are null (invalid data)
DELETE FROM prompt_ratings WHERE prompt_id IS NULL;
DELETE FROM prompt_ratings WHERE user_id IS NULL;

ALTER TABLE prompt_ratings ALTER COLUMN prompt_id SET NOT NULL;
ALTER TABLE prompt_ratings ALTER COLUMN user_id SET NOT NULL;

UPDATE prompt_ratings SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE prompt_ratings ALTER COLUMN created_at SET NOT NULL;

-- ─── subscriptions ───
UPDATE subscriptions SET cancel_at_period_end = false WHERE cancel_at_period_end IS NULL;
ALTER TABLE subscriptions ALTER COLUMN cancel_at_period_end SET NOT NULL;

UPDATE subscriptions SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE subscriptions ALTER COLUMN created_at SET NOT NULL;

UPDATE subscriptions SET updated_at = now() WHERE updated_at IS NULL;
ALTER TABLE subscriptions ALTER COLUMN updated_at SET NOT NULL;

-- ─── security_violations ───
UPDATE security_violations SET detection_type = 'pattern' WHERE detection_type IS NULL;
ALTER TABLE security_violations ALTER COLUMN detection_type SET NOT NULL;

-- ─── notifications ───
UPDATE notifications SET metadata = '{}' WHERE metadata IS NULL;
ALTER TABLE notifications ALTER COLUMN metadata SET NOT NULL;

UPDATE notifications SET read = false WHERE read IS NULL;
ALTER TABLE notifications ALTER COLUMN read SET NOT NULL;

UPDATE notifications SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE notifications ALTER COLUMN created_at SET NOT NULL;

-- ─── sensitive_terms ───
UPDATE sensitive_terms SET is_active = true WHERE is_active IS NULL;
ALTER TABLE sensitive_terms ALTER COLUMN is_active SET NOT NULL;

UPDATE sensitive_terms SET source = 'manual' WHERE source IS NULL;
ALTER TABLE sensitive_terms ALTER COLUMN source SET NOT NULL;

UPDATE sensitive_terms SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE sensitive_terms ALTER COLUMN created_at SET NOT NULL;

UPDATE sensitive_terms SET updated_at = now() WHERE updated_at IS NULL;
ALTER TABLE sensitive_terms ALTER COLUMN updated_at SET NOT NULL;

-- ─── suggested_rules ───
UPDATE suggested_rules SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE suggested_rules ALTER COLUMN created_at SET NOT NULL;

UPDATE suggested_rules SET updated_at = now() WHERE updated_at IS NULL;
ALTER TABLE suggested_rules ALTER COLUMN updated_at SET NOT NULL;

-- ─── conversation_logs ───
UPDATE conversation_logs SET guardrail_flags = '[]' WHERE guardrail_flags IS NULL;
ALTER TABLE conversation_logs ALTER COLUMN guardrail_flags SET NOT NULL;

UPDATE conversation_logs SET metadata = '{}' WHERE metadata IS NULL;
ALTER TABLE conversation_logs ALTER COLUMN metadata SET NOT NULL;

-- ─── data_imports ───
UPDATE data_imports SET total_records = 0 WHERE total_records IS NULL;
ALTER TABLE data_imports ALTER COLUMN total_records SET NOT NULL;

UPDATE data_imports SET imported_records = 0 WHERE imported_records IS NULL;
ALTER TABLE data_imports ALTER COLUMN imported_records SET NOT NULL;

UPDATE data_imports SET failed_records = 0 WHERE failed_records IS NULL;
ALTER TABLE data_imports ALTER COLUMN failed_records SET NOT NULL;

UPDATE data_imports SET metadata = '{}' WHERE metadata IS NULL;
ALTER TABLE data_imports ALTER COLUMN metadata SET NOT NULL;

UPDATE data_imports SET created_at = now() WHERE created_at IS NULL;
ALTER TABLE data_imports ALTER COLUMN created_at SET NOT NULL;

-- ═══════════════════════════════════════════════════════════
-- Recreate plan_limits view with 5 missing feature columns:
--   bulk_import, bulk_role_assignment, custom_welcome_email,
--   domain_auto_join, google_workspace_sync
-- ═══════════════════════════════════════════════════════════

DROP VIEW IF EXISTS plan_limits;

CREATE VIEW plan_limits AS
SELECT * FROM (VALUES
  ('free',     25,    1,    3,    5,  false, false, true,  false, false, false, false, false, false, false, false, false),
  ('pro',      -1,    1,   -1,   14,  true,  true,  true,  false, false, false, false, false, false, false, false, false),
  ('team',     -1,   50,   -1,   14,  true,  true,  true,  true,  true,  true,  true,  true,  true,  false, false, false),
  ('business', -1,  500,   -1,   -1,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true)
) AS t(plan, max_prompts, max_members, max_ai_tools, max_guidelines,
       analytics, import_export, basic_security, custom_security, audit_log,
       bulk_import, bulk_role_assignment, custom_welcome_email,
       domain_auto_join, google_workspace_sync,
       priority_support, sla);

COMMENT ON VIEW plan_limits IS
  'Plan feature limits. -1 means unlimited. Join with organizations.plan to enforce limits. Updated 2026-03-02: added NOT NULL constraints on ~27 columns, added 5 missing feature columns.';

COMMIT;
