-- Add detection_type column to track which detection method caught a violation
ALTER TABLE security_violations
  ADD COLUMN detection_type TEXT DEFAULT 'pattern';

-- Backfill: existing violations with rule_id are pattern-based, null rule_id are sensitive terms
UPDATE security_violations SET detection_type = 'term' WHERE rule_id IS NULL;
UPDATE security_violations SET detection_type = 'pattern' WHERE rule_id IS NOT NULL;

CREATE INDEX idx_security_violations_detection_type ON security_violations(detection_type);
