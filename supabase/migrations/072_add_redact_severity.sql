-- ============================================================
-- 072: Add 'redact' as a third severity level for DLP rules
-- Allows admins to auto-replace sensitive data instead of blocking
-- ============================================================

-- Update security_rules CHECK constraint
ALTER TABLE security_rules DROP CONSTRAINT IF EXISTS security_rules_severity_check;
ALTER TABLE security_rules ADD CONSTRAINT security_rules_severity_check CHECK (severity IN ('block', 'warn', 'redact'));

-- Update sensitive_terms CHECK constraint
ALTER TABLE sensitive_terms DROP CONSTRAINT IF EXISTS sensitive_terms_severity_check;
ALTER TABLE sensitive_terms ADD CONSTRAINT sensitive_terms_severity_check CHECK (severity IN ('block', 'warn', 'redact'));
