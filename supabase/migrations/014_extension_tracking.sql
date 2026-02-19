-- Extension tracking columns on profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS extension_version TEXT,
  ADD COLUMN IF NOT EXISTS last_extension_active TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_extension_active
  ON profiles (org_id, last_extension_active);
