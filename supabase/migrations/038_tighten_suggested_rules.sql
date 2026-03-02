-- ═══════════════════════════════════════════════════════════
-- 038: Tighten NOT NULL on suggested_rules columns missed in 037
-- ═══════════════════════════════════════════════════════════

BEGIN;

UPDATE suggested_rules SET sample_matches = '{}' WHERE sample_matches IS NULL;
ALTER TABLE suggested_rules ALTER COLUMN sample_matches SET NOT NULL;

UPDATE suggested_rules SET detection_count = 0 WHERE detection_count IS NULL;
ALTER TABLE suggested_rules ALTER COLUMN detection_count SET NOT NULL;

UPDATE suggested_rules SET confidence = 0 WHERE confidence IS NULL;
ALTER TABLE suggested_rules ALTER COLUMN confidence SET NOT NULL;

COMMIT;
