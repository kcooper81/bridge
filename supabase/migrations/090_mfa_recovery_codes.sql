-- Phase 6 / P1: MFA recovery codes.
--
-- Before this, losing your TOTP device meant losing your account — the
-- only escape was contacting support and no admin un-enroll path exists.
-- Now: enrollment generates ~10 single-use recovery codes (stored
-- hashed, shown to the user once). /verify-mfa accepts a code in place
-- of the TOTP. Each code can only be used once and is then marked spent.

CREATE TABLE IF NOT EXISTS mfa_recovery_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, code_hash)
);

CREATE INDEX IF NOT EXISTS idx_mfa_recovery_codes_user ON mfa_recovery_codes(user_id) WHERE used_at IS NULL;

ALTER TABLE mfa_recovery_codes ENABLE ROW LEVEL SECURITY;
-- No client-side policies: service-role only. Codes are issued, verified,
-- and revoked exclusively from server endpoints.
