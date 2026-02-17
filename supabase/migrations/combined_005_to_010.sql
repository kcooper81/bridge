-- ═══════════════════════════════════════════════════════════════
--  COMBINED MIGRATIONS 005 → 010
--  Run this in Supabase Dashboard → SQL Editor → New Query
--  All statements are idempotent (safe to re-run)
-- ═══════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════
--  005: INVITES TABLE
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invites_org_id ON invites(org_id);
CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);

ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Drop policies first if they exist (idempotent)
DROP POLICY IF EXISTS "invites_select" ON invites;
DROP POLICY IF EXISTS "invites_insert" ON invites;
DROP POLICY IF EXISTS "invites_update" ON invites;

CREATE POLICY "invites_select" ON invites FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND org_id = invites.org_id
        AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "invites_insert" ON invites FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND org_id = invites.org_id
        AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "invites_update" ON invites FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND org_id = invites.org_id
        AND role = 'admin'
    )
  );


-- ═══════════════════════════════════════
--  006: SECURITY RULES & VIOLATIONS
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS security_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  pattern TEXT NOT NULL,
  pattern_type TEXT NOT NULL DEFAULT 'regex' CHECK (pattern_type IN ('exact', 'regex', 'glob')),
  category TEXT NOT NULL DEFAULT 'custom' CHECK (category IN ('api_keys', 'credentials', 'internal_terms', 'pii', 'secrets', 'custom')),
  severity TEXT NOT NULL DEFAULT 'block' CHECK (severity IN ('block', 'warn')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_built_in BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_rules_org ON security_rules(org_id);

CREATE TABLE IF NOT EXISTS security_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
  rule_id UUID NOT NULL REFERENCES security_rules(id) ON DELETE CASCADE,
  matched_text TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_taken TEXT NOT NULL DEFAULT 'blocked' CHECK (action_taken IN ('blocked', 'overridden', 'auto_redacted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_violations_org ON security_violations(org_id);
CREATE INDEX IF NOT EXISTS idx_security_violations_created ON security_violations(created_at DESC);

-- RLS for security_rules
ALTER TABLE security_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS security_rules_select ON security_rules;
DROP POLICY IF EXISTS security_rules_insert ON security_rules;
DROP POLICY IF EXISTS security_rules_update ON security_rules;
DROP POLICY IF EXISTS security_rules_delete ON security_rules;

CREATE POLICY security_rules_select ON security_rules
  FOR SELECT USING (org_id = get_my_org_id());

CREATE POLICY security_rules_insert ON security_rules
  FOR INSERT WITH CHECK (
    org_id = get_my_org_id()
    AND get_my_role() IN ('admin', 'manager')
  );

CREATE POLICY security_rules_update ON security_rules
  FOR UPDATE USING (
    org_id = get_my_org_id()
    AND get_my_role() IN ('admin', 'manager')
  )
  WITH CHECK (org_id = get_my_org_id());

CREATE POLICY security_rules_delete ON security_rules
  FOR DELETE USING (
    org_id = get_my_org_id()
    AND get_my_role() IN ('admin', 'manager')
  );

-- RLS for security_violations
ALTER TABLE security_violations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS security_violations_select ON security_violations;
DROP POLICY IF EXISTS security_violations_insert ON security_violations;

CREATE POLICY security_violations_select ON security_violations
  FOR SELECT USING (
    org_id = get_my_org_id()
    AND get_my_role() IN ('admin', 'manager')
  );

CREATE POLICY security_violations_insert ON security_violations
  FOR INSERT WITH CHECK (org_id = get_my_org_id());

-- Auto-update updated_at
DROP TRIGGER IF EXISTS set_security_rules_updated_at ON security_rules;
CREATE TRIGGER set_security_rules_updated_at
  BEFORE UPDATE ON security_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Plan limits view (replaces any existing)
CREATE OR REPLACE VIEW plan_limits AS
SELECT * FROM (VALUES
  ('free',     25,    3,    3,    5,     false, false, true,  false, false),
  ('pro',      -1,    1,   -1,   14,     true,  true,  true,  true,  false),
  ('team',     -1,   50,   -1,   14,     true,  true,  true,  true,  true),
  ('business', -1,  500,   -1,   -1,     true,  true,  true,  true,  true)
) AS t(plan, max_prompts, max_members, max_ai_tools, max_standards, analytics, import_export, basic_security, custom_security, audit_log);


-- ═══════════════════════════════════════
--  007: INCREMENT USAGE RPC + PLAN CONSTRAINT
-- ═══════════════════════════════════════

CREATE OR REPLACE FUNCTION increment_usage_count(prompt_id UUID)
RETURNS VOID AS $$
  UPDATE prompts
  SET usage_count = usage_count + 1,
      last_used_at = NOW()
  WHERE id = prompt_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Tighten plan constraint (remove legacy 'enterprise')
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_plan_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_plan_check
  CHECK (plan IN ('free', 'pro', 'team', 'business'));


-- ═══════════════════════════════════════
--  008: TEAM ROLES + INVITE TEAM LINK
-- ═══════════════════════════════════════

ALTER TABLE team_members ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member'
  CHECK (role IN ('admin', 'member'));

ALTER TABLE invites ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;


-- ═══════════════════════════════════════
--  009: SUPER ADMIN FLAG
-- ═══════════════════════════════════════

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false;

-- Set platform owner (update email if needed)
UPDATE profiles SET is_super_admin = true
WHERE email = 'kadecooper@gmail.com';


-- ═══════════════════════════════════════
--  010: FIX SIGNUP ROLE ON CONFLICT
-- ═══════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  user_name  TEXT;
  user_email TEXT;
BEGIN
  user_email := COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', '');
  user_name  := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'preferred_username',
    split_part(COALESCE(NEW.email, ''), '@', 1)
  );

  INSERT INTO organizations (name, domain, plan)
  VALUES (
    COALESCE(NULLIF(user_name, ''), 'My Organization') || '''s Org',
    COALESCE(NULLIF(split_part(user_email, '@', 2), ''), ''),
    'free'
  )
  RETURNING id INTO new_org_id;

  INSERT INTO profiles (id, email, name, avatar_url, role, org_id)
  VALUES (
    NEW.id,
    user_email,
    user_name,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      ''
    ),
    'admin',
    new_org_id
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    name       = COALESCE(NULLIF(EXCLUDED.name, ''), profiles.name),
    avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), profiles.avatar_url),
    org_id     = COALESCE(profiles.org_id, new_org_id),
    role       = CASE WHEN profiles.org_id IS NULL THEN 'admin' ELSE profiles.role END;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Backfill: promote org founders stuck as 'member'
UPDATE profiles SET role = 'admin'
WHERE id IN (
  SELECT DISTINCT ON (org_id) id
  FROM profiles
  WHERE org_id IS NOT NULL
  ORDER BY org_id, created_at ASC
)
AND role != 'admin';


-- ═══════════════════════════════════════
--  DONE — All migrations 005-010 applied
-- ═══════════════════════════════════════
