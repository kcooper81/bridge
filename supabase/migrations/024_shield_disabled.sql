-- 024: Per-member shield disable
-- Allows admins to disable guardrails/shield scanning for specific members.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS shield_disabled BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN profiles.shield_disabled IS 'When true, DLP scanning is bypassed for this member (admin-controlled)';
