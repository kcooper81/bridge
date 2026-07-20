-- Signup attribution (2026-07-19)
--
-- Until now nothing recorded which marketing page produced a signup. GSC shows
-- which pages earn clicks and the DB shows who signed up, but the two were
-- never joined — so "which SEO page converts?" was unanswerable and every
-- content decision was made blind.
--
-- Populated by /api/attribution/claim from a first-touch cookie set in the
-- marketing layout. Nullable by design: existing users and anyone who blocks
-- cookies simply have no attribution, which is a valid "unknown".

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS signup_attribution JSONB;

COMMENT ON COLUMN profiles.signup_attribution IS
  'First-touch marketing attribution captured at signup: landing_path, referrer, referrer_host, channel, utm, captured_at. Set once and never overwritten — see src/lib/attribution.ts.';

-- Partial index: reporting queries always filter to rows that have attribution,
-- and those are a minority of the table.
CREATE INDEX IF NOT EXISTS idx_profiles_signup_attribution_channel
  ON profiles ((signup_attribution->>'channel'))
  WHERE signup_attribution IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_signup_attribution_landing
  ON profiles ((signup_attribution->>'landing_path'))
  WHERE signup_attribution IS NOT NULL;
