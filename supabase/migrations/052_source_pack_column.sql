-- Add source_pack column to security_rules to track which compliance pack a rule came from
ALTER TABLE security_rules ADD COLUMN IF NOT EXISTS source_pack TEXT;

-- Index for filtering by pack
CREATE INDEX IF NOT EXISTS idx_security_rules_source_pack ON security_rules (source_pack) WHERE source_pack IS NOT NULL;
