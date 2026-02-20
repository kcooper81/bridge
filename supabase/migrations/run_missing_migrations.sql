-- ═══════════════════════════════════════════════════════════
-- Safe combined script for migrations 006-008, 011-014
-- All policies use DROP IF EXISTS before CREATE
-- All RLS uses safe SECURITY DEFINER helpers (no recursion)
-- ═══════════════════════════════════════════════════════════

-- ─── 006: Security Rules & DLP ───

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

ALTER TABLE security_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_violations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS security_rules_select ON security_rules;
DROP POLICY IF EXISTS security_rules_insert ON security_rules;
DROP POLICY IF EXISTS security_rules_update ON security_rules;
DROP POLICY IF EXISTS security_rules_delete ON security_rules;
DROP POLICY IF EXISTS security_violations_select ON security_violations;
DROP POLICY IF EXISTS security_violations_insert ON security_violations;

CREATE POLICY security_rules_select ON security_rules
  FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY security_rules_insert ON security_rules
  FOR INSERT WITH CHECK (org_id = get_my_org_id() AND get_my_role() IN ('admin', 'manager'));
CREATE POLICY security_rules_update ON security_rules
  FOR UPDATE USING (org_id = get_my_org_id() AND get_my_role() IN ('admin', 'manager'))
  WITH CHECK (org_id = get_my_org_id());
CREATE POLICY security_rules_delete ON security_rules
  FOR DELETE USING (org_id = get_my_org_id() AND get_my_role() IN ('admin', 'manager'));
CREATE POLICY security_violations_select ON security_violations
  FOR SELECT USING (org_id = get_my_org_id() AND get_my_role() IN ('admin', 'manager'));
CREATE POLICY security_violations_insert ON security_violations
  FOR INSERT WITH CHECK (org_id = get_my_org_id());

DROP TRIGGER IF EXISTS set_security_rules_updated_at ON security_rules;
CREATE TRIGGER set_security_rules_updated_at
  BEFORE UPDATE ON security_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE VIEW plan_limits AS
SELECT * FROM (VALUES
  ('free',     25,    3,    3,    5,     false, false, true,  false, false),
  ('pro',      -1,    1,   -1,   14,     true,  true,  true,  true,  false),
  ('team',     -1,   50,   -1,   14,     true,  true,  true,  true,  true),
  ('business', -1,  500,   -1,   -1,     true,  true,  true,  true,  true)
) AS t(plan, max_prompts, max_members, max_ai_tools, max_standards, analytics, import_export, basic_security, custom_security, audit_log);


-- ─── 007: Increment Usage RPC ───

CREATE OR REPLACE FUNCTION increment_usage_count(prompt_id UUID)
RETURNS VOID AS $$
  UPDATE prompts
  SET usage_count = usage_count + 1,
      last_used_at = NOW()
  WHERE id = prompt_id;
$$ LANGUAGE sql SECURITY DEFINER;

ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_plan_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_plan_check
  CHECK (plan IN ('free', 'pro', 'team', 'business'));


-- ─── 008: Team Roles & Invite Team ───

ALTER TABLE team_members ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member';
ALTER TABLE invites ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;


-- ─── 011: Conversation Logs & Templates ───

CREATE TABLE IF NOT EXISTS conversation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ai_tool TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
  response_text TEXT,
  guardrail_flags JSONB DEFAULT '[]',
  action TEXT NOT NULL DEFAULT 'sent' CHECK (action IN ('sent', 'blocked', 'warned')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversation_logs_org ON conversation_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_user ON conversation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_created ON conversation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_tool ON conversation_logs(ai_tool);

ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversation_logs_select ON conversation_logs;
DROP POLICY IF EXISTS conversation_logs_insert ON conversation_logs;

CREATE POLICY conversation_logs_select ON conversation_logs
  FOR SELECT USING (
    org_id = get_my_org_id()
    AND (get_my_role() IN ('admin', 'manager') OR user_id = auth.uid())
  );
CREATE POLICY conversation_logs_insert ON conversation_logs
  FOR INSERT WITH CHECK (org_id = get_my_org_id() AND user_id = auth.uid());

ALTER TABLE prompts ADD COLUMN IF NOT EXISTS is_template BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS template_variables JSONB DEFAULT '[]';


-- ─── 012: Prompt Ratings ───

CREATE TABLE IF NOT EXISTS prompt_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (prompt_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_prompt_ratings_prompt ON prompt_ratings(prompt_id);

ALTER TABLE prompt_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read ratings for their org prompts" ON prompt_ratings;
DROP POLICY IF EXISTS "Users can rate prompts" ON prompt_ratings;
DROP POLICY IF EXISTS "Users can update their own ratings" ON prompt_ratings;

-- Fixed: uses get_my_org_id() instead of inline subquery (avoids recursion)
CREATE POLICY "Users can read ratings for their org prompts"
  ON prompt_ratings FOR SELECT
  USING (prompt_id IN (SELECT id FROM prompts WHERE org_id = get_my_org_id()));
CREATE POLICY "Users can rate prompts"
  ON prompt_ratings FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own ratings"
  ON prompt_ratings FOR UPDATE
  USING (user_id = auth.uid());


-- ─── 013: Admin Tables ───

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;
UPDATE profiles SET is_super_admin = TRUE WHERE email = 'admin@teamprompt.app';

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  org_id UUID REFERENCES organizations(id),
  type TEXT NOT NULL DEFAULT 'feedback',
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT DEFAULT 'normal',
  assigned_to UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  stack TEXT,
  user_id UUID REFERENCES profiles(id),
  org_id UUID REFERENCES organizations(id),
  url TEXT,
  user_agent TEXT,
  metadata JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_org_id ON activity_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop all admin table policies first
DROP POLICY IF EXISTS "Super admins can read all feedback" ON feedback;
DROP POLICY IF EXISTS "Super admins can update feedback" ON feedback;
DROP POLICY IF EXISTS "Users can insert own feedback" ON feedback;
DROP POLICY IF EXISTS "Super admins can read all error_logs" ON error_logs;
DROP POLICY IF EXISTS "Super admins can update error_logs" ON error_logs;
DROP POLICY IF EXISTS "Authenticated users can insert error_logs" ON error_logs;
DROP POLICY IF EXISTS "Super admins can read all activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Org members can read own activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Authenticated users can insert activity_logs" ON activity_logs;

-- Fixed: uses is_super_admin() instead of inline EXISTS (avoids recursion)
CREATE POLICY "Super admins can read all feedback" ON feedback
  FOR SELECT USING (is_super_admin());
CREATE POLICY "Super admins can update feedback" ON feedback
  FOR UPDATE USING (is_super_admin());
CREATE POLICY "Users can insert own feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can read all error_logs" ON error_logs
  FOR SELECT USING (is_super_admin());
CREATE POLICY "Super admins can update error_logs" ON error_logs
  FOR UPDATE USING (is_super_admin());
CREATE POLICY "Authenticated users can insert error_logs" ON error_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can read all activity_logs" ON activity_logs
  FOR SELECT USING (is_super_admin());
CREATE POLICY "Org members can read own activity_logs" ON activity_logs
  FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "Authenticated users can insert activity_logs" ON activity_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- ─── 014: Extension Tracking ───

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS extension_version TEXT,
  ADD COLUMN IF NOT EXISTS last_extension_active TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_extension_active
  ON profiles (org_id, last_extension_active);
