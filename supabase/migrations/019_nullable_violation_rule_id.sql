-- Allow security_violations.rule_id to be NULL so sensitive term violations can be logged
-- without a corresponding security_rules row.

ALTER TABLE security_violations ALTER COLUMN rule_id DROP NOT NULL;
