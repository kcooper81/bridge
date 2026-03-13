-- =============================================================================
-- TeamPrompt Full Database Schema (consolidated from migrations 001–043)
-- Generated: 2026-03-05
-- Tables: 35 | Views: 1 | Functions: 9 | Triggers: 16
-- =============================================================================

-- ---------------------------------------------------------------------------
-- HELPER FUNCTIONS (used by RLS policies)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_my_org_id() RETURNS UUID AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_my_role() RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()),
    false
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Generic updated_at trigger functions
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 1. organizations
-- ---------------------------------------------------------------------------
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL DEFAULT '',
  domain        TEXT DEFAULT '',
  logo          TEXT DEFAULT '',
  plan          TEXT NOT NULL DEFAULT 'free'
                  CHECK (plan IN ('free','pro','team','business')),
  settings      JSONB NOT NULL DEFAULT '{"enforceStandards":false,"requireApproval":false,"allowPersonalPrompts":true,"defaultVisibility":"team"}',
  security_settings JSONB DEFAULT '{"entropy_detection_enabled":false,"entropy_threshold":4.0,"ai_detection_enabled":false,"ai_detection_provider":null,"smart_patterns_enabled":false}',
  is_suspended  BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY "orgs_select"  ON organizations FOR SELECT USING (id = get_my_org_id());
CREATE POLICY "orgs_update"  ON organizations FOR UPDATE USING (id = get_my_org_id() AND get_my_role() = 'admin');
CREATE POLICY "orgs_insert"  ON organizations FOR INSERT WITH CHECK (true);
CREATE POLICY "Super admins can read all organizations"  ON organizations FOR SELECT USING (is_super_admin());
CREATE POLICY "Super admins can update any organization" ON organizations FOR UPDATE USING (is_super_admin());
CREATE POLICY "Super admins can delete any organization" ON organizations FOR DELETE USING (is_super_admin());

-- ---------------------------------------------------------------------------
-- 2. profiles
-- ---------------------------------------------------------------------------
CREATE TABLE profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id                UUID REFERENCES organizations(id) ON DELETE SET NULL,
  name                  TEXT NOT NULL DEFAULT '',
  email                 TEXT NOT NULL DEFAULT '',
  role                  TEXT NOT NULL DEFAULT 'member'
                          CHECK (role IN ('admin','manager','member')),
  avatar_url            TEXT DEFAULT '',
  is_super_admin        BOOLEAN NOT NULL DEFAULT false,
  extension_version     TEXT,
  last_extension_active TIMESTAMPTZ,
  extension_status      TEXT NOT NULL DEFAULT 'unknown',
  super_admin_role      TEXT,  -- 'super_admin', 'support', or NULL
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_profiles_org ON profiles(org_id);
CREATE INDEX idx_profiles_extension_active ON profiles(org_id, last_extension_active);
CREATE INDEX idx_profiles_extension_status ON profiles(extension_status);

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (id = auth.uid() OR org_id = get_my_org_id());
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Super admins can read all profiles"  ON profiles FOR SELECT USING (is_super_admin());
CREATE POLICY "Super admins can update any profile" ON profiles FOR UPDATE USING (is_super_admin());

-- ---------------------------------------------------------------------------
-- 3. teams
-- ---------------------------------------------------------------------------
CREATE TABLE teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  icon        TEXT DEFAULT 'users',
  color       TEXT DEFAULT '#8b5cf6',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX idx_teams_org ON teams(org_id);

CREATE POLICY "teams_select" ON teams FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "teams_modify" ON teams FOR ALL USING (org_id = get_my_org_id() AND get_my_role() IN ('admin','manager'));

-- ---------------------------------------------------------------------------
-- 4. team_members
-- ---------------------------------------------------------------------------
CREATE TABLE team_members (
  team_id   UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

CREATE POLICY "team_members_select" ON team_members FOR SELECT USING (team_id IN (SELECT id FROM teams WHERE org_id = get_my_org_id()));
CREATE POLICY "team_members_modify" ON team_members FOR ALL USING (team_id IN (SELECT id FROM teams WHERE org_id = get_my_org_id()) AND get_my_role() IN ('admin','manager'));

-- ---------------------------------------------------------------------------
-- 5. folders
-- ---------------------------------------------------------------------------
CREATE TABLE folders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name       TEXT NOT NULL DEFAULT '',
  icon       TEXT DEFAULT 'folder',
  color      TEXT DEFAULT '#8b5cf6',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON folders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY "folders_select" ON folders FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "folders_modify" ON folders FOR ALL USING (org_id = get_my_org_id() AND get_my_role() IN ('admin','manager'));

-- ---------------------------------------------------------------------------
-- 6. departments
-- ---------------------------------------------------------------------------
CREATE TABLE departments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name       TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE POLICY "depts_select" ON departments FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "depts_modify" ON departments FOR ALL USING (org_id = get_my_org_id() AND get_my_role() IN ('admin','manager'));

-- ---------------------------------------------------------------------------
-- 7. prompts
-- ---------------------------------------------------------------------------
CREATE TABLE prompts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id               UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id             UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title                TEXT NOT NULL DEFAULT '',
  content              TEXT NOT NULL DEFAULT '',
  description          TEXT DEFAULT '',
  intended_outcome     TEXT DEFAULT '',
  tone                 TEXT NOT NULL DEFAULT 'professional',
  model_recommendation TEXT DEFAULT '',
  example_input        TEXT DEFAULT '',
  example_output       TEXT DEFAULT '',
  tags                 TEXT[] NOT NULL DEFAULT '{}',
  folder_id            UUID REFERENCES folders(id) ON DELETE SET NULL,
  department_id        UUID REFERENCES teams(id) ON DELETE SET NULL,
  status               TEXT NOT NULL DEFAULT 'approved'
                         CHECK (status IN ('draft','pending','approved','archived')),
  version              INT NOT NULL DEFAULT 1,
  is_favorite          BOOLEAN NOT NULL DEFAULT false,
  rating_total         INT NOT NULL DEFAULT 0,
  rating_count         INT NOT NULL DEFAULT 0,
  usage_count          INT NOT NULL DEFAULT 0,
  last_used_at         TIMESTAMPTZ,
  is_template          BOOLEAN NOT NULL DEFAULT false,
  template_variables   JSONB NOT NULL DEFAULT '[]',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_prompts_org     ON prompts(org_id);
CREATE INDEX idx_prompts_owner   ON prompts(owner_id);
CREATE INDEX idx_prompts_folder  ON prompts(folder_id);
CREATE INDEX idx_prompts_dept    ON prompts(department_id);
CREATE INDEX idx_prompts_updated ON prompts(updated_at DESC);
CREATE INDEX idx_prompts_usage   ON prompts(usage_count DESC);

CREATE POLICY "prompts_select" ON prompts FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "prompts_insert" ON prompts FOR INSERT WITH CHECK (org_id = get_my_org_id());
CREATE POLICY "prompts_update" ON prompts FOR UPDATE USING (owner_id = auth.uid() OR (org_id = get_my_org_id() AND get_my_role() = 'admin'));
CREATE POLICY "prompts_delete" ON prompts FOR DELETE USING (owner_id = auth.uid() OR (org_id = get_my_org_id() AND get_my_role() = 'admin'));
CREATE POLICY "Super admins can read all prompts" ON prompts FOR SELECT USING (is_super_admin());

-- ---------------------------------------------------------------------------
-- 8. prompt_versions
-- ---------------------------------------------------------------------------
CREATE TABLE prompt_versions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id  UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  version    INT NOT NULL,
  title      TEXT NOT NULL DEFAULT '',
  content    TEXT NOT NULL DEFAULT '',
  changed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(prompt_id, version)
);
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_prompt_versions_prompt ON prompt_versions(prompt_id);

CREATE POLICY "prompt_versions_select" ON prompt_versions FOR SELECT USING (prompt_id IN (SELECT id FROM prompts WHERE org_id = get_my_org_id()));
CREATE POLICY "prompt_versions_insert" ON prompt_versions FOR INSERT WITH CHECK (prompt_id IN (SELECT id FROM prompts WHERE org_id = get_my_org_id()));

-- ---------------------------------------------------------------------------
-- 9. prompt_ratings
-- ---------------------------------------------------------------------------
CREATE TABLE prompt_ratings (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating    SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(prompt_id, user_id)
);
ALTER TABLE prompt_ratings ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_prompt_ratings_prompt ON prompt_ratings(prompt_id);

CREATE POLICY "Users can read ratings for their org prompts" ON prompt_ratings FOR SELECT
  USING (prompt_id IN (SELECT id FROM prompts WHERE org_id = get_my_org_id()));
CREATE POLICY "Users can rate prompts" ON prompt_ratings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own ratings" ON prompt_ratings FOR UPDATE USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 10. collections
-- ---------------------------------------------------------------------------
CREATE TABLE collections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id     UUID REFERENCES teams(id) ON DELETE SET NULL,
  name        TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  icon        TEXT DEFAULT 'folder',
  color       TEXT DEFAULT '#8b5cf6',
  visibility  TEXT NOT NULL DEFAULT 'team'
                CHECK (visibility IN ('personal','team','org','public')),
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX idx_collections_org ON collections(org_id);

CREATE POLICY "collections_select" ON collections FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "collections_modify" ON collections FOR ALL USING (org_id = get_my_org_id());

-- ---------------------------------------------------------------------------
-- 11. collection_prompts
-- ---------------------------------------------------------------------------
CREATE TABLE collection_prompts (
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  prompt_id     UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  added_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection_id, prompt_id)
);
ALTER TABLE collection_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "collection_prompts_select" ON collection_prompts FOR SELECT USING (collection_id IN (SELECT id FROM collections WHERE org_id = get_my_org_id()));
CREATE POLICY "collection_prompts_modify" ON collection_prompts FOR ALL USING (collection_id IN (SELECT id FROM collections WHERE org_id = get_my_org_id()));

-- ---------------------------------------------------------------------------
-- 12. standards (guidelines)
-- ---------------------------------------------------------------------------
CREATE TABLE standards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  category    TEXT NOT NULL DEFAULT 'general',
  scope       TEXT NOT NULL DEFAULT 'org' CHECK (scope IN ('personal','team','org')),
  rules       JSONB NOT NULL DEFAULT '{}',
  enforced    BOOLEAN NOT NULL DEFAULT false,
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE standards ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON standards FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE INDEX idx_standards_org ON standards(org_id);

CREATE POLICY "standards_select" ON standards FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "standards_modify" ON standards FOR ALL USING (org_id = get_my_org_id() AND get_my_role() IN ('admin','manager'));

-- ---------------------------------------------------------------------------
-- 13. usage_events
-- ---------------------------------------------------------------------------
CREATE TABLE usage_events (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id    UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
  action    TEXT NOT NULL CHECK (action IN ('use','copy','insert','rate','share','export')),
  metadata  JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_usage_events_org     ON usage_events(org_id);
CREATE INDEX idx_usage_events_prompt  ON usage_events(prompt_id);
CREATE INDEX idx_usage_events_created ON usage_events(created_at DESC);
CREATE INDEX idx_usage_events_user_id ON usage_events(user_id);

CREATE POLICY "usage_events_select" ON usage_events FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "usage_events_insert" ON usage_events FOR INSERT WITH CHECK (org_id = get_my_org_id());

-- ---------------------------------------------------------------------------
-- 14. subscriptions
-- ---------------------------------------------------------------------------
CREATE TABLE subscriptions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                 UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  plan                   TEXT NOT NULL DEFAULT 'free'
                           CHECK (plan IN ('free','pro','team','business')),
  status                 TEXT NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active','trialing','past_due','canceled','paused')),
  seats                  INTEGER NOT NULL DEFAULT 1 CHECK (seats >= 1),
  current_period_end     TIMESTAMPTZ,
  trial_ends_at          TIMESTAMPTZ,
  cancel_at_period_end   BOOLEAN NOT NULL DEFAULT false,
  canceled_at            TIMESTAMPTZ,
  payment_failed_at      TIMESTAMPTZ,
  dispute_status         TEXT CHECK (dispute_status IS NULL OR dispute_status IN ('needs_response','warning_needs_response','under_review','won','lost')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_subscriptions_org        ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_customer   ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status     ON subscriptions(status);

CREATE POLICY "subscriptions_select" ON subscriptions FOR SELECT USING (org_id = get_my_org_id());
CREATE POLICY "Super admins can read all subscriptions" ON subscriptions FOR SELECT USING (is_super_admin());

-- ---------------------------------------------------------------------------
-- 15. invites
-- ---------------------------------------------------------------------------
CREATE TABLE invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin','manager','member')),
  token       TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32),'hex'),
  invited_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  team_id     UUID REFERENCES teams(id) ON DELETE SET NULL,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','accepted','expired','revoked')),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_invites_org_id ON invites(org_id);
CREATE INDEX idx_invites_token  ON invites(token);
CREATE INDEX idx_invites_email  ON invites(email);

CREATE POLICY "invites_select" ON invites FOR SELECT USING (
  org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  AND get_my_role() IN ('admin','manager')
);
CREATE POLICY "invites_insert" ON invites FOR INSERT WITH CHECK (
  org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  AND get_my_role() IN ('admin','manager')
);
CREATE POLICY "invites_update" ON invites FOR UPDATE USING (
  org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  AND get_my_role() = 'admin'
);
CREATE POLICY "Super admins can read all invites" ON invites FOR SELECT USING (is_super_admin());

-- ---------------------------------------------------------------------------
-- 16. security_rules
-- ---------------------------------------------------------------------------
CREATE TABLE security_rules (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id      UUID REFERENCES teams(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  pattern      TEXT NOT NULL,
  pattern_type TEXT NOT NULL DEFAULT 'regex'
                 CHECK (pattern_type IN ('exact','regex','glob')),
  category     TEXT NOT NULL DEFAULT 'custom'
                 CHECK (category IN ('api_keys','credentials','internal_terms','internal','pii','secrets','financial','health','custom')),
  severity     TEXT NOT NULL DEFAULT 'block'
                 CHECK (severity IN ('block','warn')),
  is_active    BOOLEAN NOT NULL DEFAULT true,
  is_built_in  BOOLEAN NOT NULL DEFAULT false,
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE security_rules ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_security_rules_updated_at BEFORE UPDATE ON security_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_security_rules_org      ON security_rules(org_id);
CREATE INDEX idx_security_rules_org_team ON security_rules(org_id, team_id);

CREATE POLICY "security_rules_select" ON security_rules FOR SELECT USING (
  org_id = get_my_org_id() AND (
    get_my_role() IN ('admin','manager')
    OR team_id IS NULL
    OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
);
CREATE POLICY "security_rules_insert" ON security_rules FOR INSERT WITH CHECK (
  org_id = get_my_org_id() AND get_my_role() IN ('admin','manager')
  AND (team_id IS NULL OR team_id IN (SELECT id FROM teams WHERE org_id = get_my_org_id()))
);
CREATE POLICY "security_rules_update" ON security_rules FOR UPDATE USING (
  org_id = get_my_org_id() AND get_my_role() IN ('admin','manager')
);
CREATE POLICY "security_rules_delete" ON security_rules FOR DELETE USING (
  org_id = get_my_org_id() AND get_my_role() IN ('admin','manager')
);

-- ---------------------------------------------------------------------------
-- 17. security_violations
-- ---------------------------------------------------------------------------
CREATE TABLE security_violations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  prompt_id      UUID REFERENCES prompts(id) ON DELETE SET NULL,
  rule_id        UUID REFERENCES security_rules(id) ON DELETE CASCADE,  -- nullable
  matched_text   TEXT NOT NULL,
  user_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_taken   TEXT NOT NULL DEFAULT 'blocked'
                   CHECK (action_taken IN ('blocked','overridden','auto_redacted')),
  detection_type TEXT NOT NULL DEFAULT 'pattern',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE security_violations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_security_violations_org            ON security_violations(org_id);
CREATE INDEX idx_security_violations_created        ON security_violations(created_at DESC);
CREATE INDEX idx_security_violations_user_id        ON security_violations(user_id);
CREATE INDEX idx_security_violations_detection_type ON security_violations(detection_type);

CREATE POLICY "security_violations_select" ON security_violations FOR SELECT USING (
  org_id = get_my_org_id() AND get_my_role() IN ('admin','manager')
);
CREATE POLICY "security_violations_insert" ON security_violations FOR INSERT WITH CHECK (
  org_id = get_my_org_id()
);

-- ---------------------------------------------------------------------------
-- 18. conversation_logs
-- ---------------------------------------------------------------------------
CREATE TABLE conversation_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ai_tool         TEXT NOT NULL,
  prompt_text     TEXT NOT NULL,
  prompt_id       UUID REFERENCES prompts(id) ON DELETE SET NULL,
  response_text   TEXT,
  guardrail_flags JSONB NOT NULL DEFAULT '[]',
  action          TEXT NOT NULL DEFAULT 'sent'
                    CHECK (action IN ('sent','blocked','warned')),
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_conversation_logs_org     ON conversation_logs(org_id);
CREATE INDEX idx_conversation_logs_user    ON conversation_logs(user_id);
CREATE INDEX idx_conversation_logs_created ON conversation_logs(created_at DESC);
CREATE INDEX idx_conversation_logs_tool    ON conversation_logs(ai_tool);

CREATE POLICY "conversation_logs_select" ON conversation_logs FOR SELECT USING (
  org_id = get_my_org_id() AND (get_my_role() IN ('admin','manager') OR user_id = auth.uid())
);
CREATE POLICY "conversation_logs_insert" ON conversation_logs FOR INSERT WITH CHECK (
  org_id = get_my_org_id() AND user_id = auth.uid()
);

-- ---------------------------------------------------------------------------
-- 19. feedback (tickets)
-- ---------------------------------------------------------------------------
CREATE TABLE feedback (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES profiles(id),
  org_id        UUID REFERENCES organizations(id),
  type          TEXT NOT NULL DEFAULT 'feedback',
  subject       TEXT,
  message       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'new',
  priority      TEXT DEFAULT 'normal',
  assigned_to   UUID REFERENCES profiles(id),
  resolved_at   TIMESTAMPTZ,
  inbox_email   TEXT,
  attachments   JSONB DEFAULT '[]',
  html_body     TEXT,
  sender_email  TEXT,
  sender_name   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback REPLICA IDENTITY FULL;

CREATE INDEX idx_feedback_status     ON feedback(status);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);

CREATE POLICY "Super admins can read all feedback" ON feedback FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
);
CREATE POLICY "Super admins can update feedback" ON feedback FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
);
CREATE POLICY "Users can insert own feedback" ON feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 20. ticket_notes
-- ---------------------------------------------------------------------------
CREATE TABLE ticket_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES profiles(id),
  content     TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true,
  email_sent  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ticket_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_notes REPLICA IDENTITY FULL;

CREATE INDEX idx_ticket_notes_ticket_id  ON ticket_notes(ticket_id);
CREATE INDEX idx_ticket_notes_created_at ON ticket_notes(created_at);

CREATE POLICY "Super admins can read all ticket_notes" ON ticket_notes FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
);
CREATE POLICY "Super admins can insert ticket_notes" ON ticket_notes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
);

-- ---------------------------------------------------------------------------
-- 21. error_logs
-- ---------------------------------------------------------------------------
CREATE TABLE error_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message     TEXT NOT NULL,
  stack       TEXT,
  user_id     UUID REFERENCES profiles(id),
  org_id      UUID REFERENCES organizations(id),
  url         TEXT,
  user_agent  TEXT,
  metadata    JSONB,
  resolved    BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs REPLICA IDENTITY FULL;

CREATE INDEX idx_error_logs_resolved   ON error_logs(resolved);
CREATE INDEX idx_error_logs_created_at ON error_logs(created_at DESC);

CREATE POLICY "Super admins can read all error_logs" ON error_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
);
CREATE POLICY "Super admins can update error_logs" ON error_logs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
);
CREATE POLICY "Authenticated users can insert error_logs" ON error_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------------------------
-- 22. activity_logs
-- ---------------------------------------------------------------------------
CREATE TABLE activity_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id),
  user_id       UUID REFERENCES profiles(id),
  action        TEXT NOT NULL,
  resource_type TEXT,
  resource_id   UUID,
  metadata      JSONB,
  ip_address    TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_activity_logs_org_id     ON activity_logs(org_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

CREATE POLICY "Super admins can read all activity_logs" ON activity_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
);
CREATE POLICY "Org members can read own activity_logs" ON activity_logs FOR SELECT USING (
  org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Authenticated users can insert activity_logs" ON activity_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ---------------------------------------------------------------------------
-- 23. notifications
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  org_id     UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type       TEXT NOT NULL
               CHECK (type IN ('security_violation','prompt_submitted','prompt_approved','prompt_rejected','member_joined','member_left','system')),
  title      TEXT NOT NULL,
  message    TEXT,
  metadata   JSONB NOT NULL DEFAULT '{}',
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_org_id     ON notifications(org_id);

CREATE POLICY "Users can view own notifications"   ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service can insert notifications"   ON notifications FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 24. sensitive_terms
-- ---------------------------------------------------------------------------
CREATE TABLE sensitive_terms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id     UUID REFERENCES teams(id) ON DELETE CASCADE,
  term        TEXT NOT NULL,
  term_type   TEXT NOT NULL CHECK (term_type IN ('exact','pattern','keyword')),
  category    TEXT NOT NULL
                CHECK (category IN ('customer_data','employee_data','project_names','product_names','internal_codes','partner_data','financial_data','legal_data','custom')),
  description TEXT,
  severity    TEXT NOT NULL DEFAULT 'warn' CHECK (severity IN ('block','warn')),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  source      TEXT NOT NULL DEFAULT 'manual'
                CHECK (source IN ('manual','import','sync','ai_suggested')),
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE sensitive_terms ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trigger_sensitive_terms_updated_at BEFORE UPDATE ON sensitive_terms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_sensitive_terms_org_id   ON sensitive_terms(org_id);
CREATE INDEX idx_sensitive_terms_active   ON sensitive_terms(org_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_sensitive_terms_category ON sensitive_terms(org_id, category);
CREATE INDEX idx_sensitive_terms_org_team ON sensitive_terms(org_id, team_id);

CREATE POLICY "Org members can view sensitive terms" ON sensitive_terms FOR SELECT USING (
  org_id = get_my_org_id() AND (
    get_my_role() IN ('admin','manager')
    OR team_id IS NULL
    OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  )
);
CREATE POLICY "Admins can manage sensitive terms" ON sensitive_terms FOR ALL USING (
  org_id = get_my_org_id() AND get_my_role() IN ('admin','manager')
);

-- ---------------------------------------------------------------------------
-- 25. suggested_rules
-- ---------------------------------------------------------------------------
CREATE TABLE suggested_rules (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  description       TEXT,
  pattern           TEXT NOT NULL,
  pattern_type      TEXT NOT NULL DEFAULT 'regex'
                      CHECK (pattern_type IN ('exact','regex','glob')),
  category          TEXT NOT NULL,
  severity          TEXT NOT NULL DEFAULT 'warn'
                      CHECK (severity IN ('block','warn')),
  sample_matches    TEXT[] NOT NULL,
  detection_count   INT NOT NULL DEFAULT 1,
  confidence        DECIMAL(3,2) NOT NULL DEFAULT 0.5,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','approved','dismissed','converted')),
  reviewed_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at       TIMESTAMPTZ,
  converted_rule_id UUID REFERENCES security_rules(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE suggested_rules ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trigger_suggested_rules_updated_at BEFORE UPDATE ON suggested_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_suggested_rules_org_id ON suggested_rules(org_id);
CREATE INDEX idx_suggested_rules_status ON suggested_rules(org_id, status);

CREATE POLICY "Org members can view suggested rules" ON suggested_rules FOR SELECT USING (
  org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins can manage suggested rules" ON suggested_rules FOR ALL USING (
  org_id = get_my_org_id() AND get_my_role() IN ('admin','manager')
);

-- ---------------------------------------------------------------------------
-- 26. data_imports
-- ---------------------------------------------------------------------------
CREATE TABLE data_imports (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  import_type      TEXT NOT NULL CHECK (import_type IN ('csv_terms','json_terms','crm_sync','hr_sync','custom_api')),
  source_name      TEXT,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','processing','completed','failed')),
  total_records    INT NOT NULL DEFAULT 0,
  imported_records INT NOT NULL DEFAULT 0,
  failed_records   INT NOT NULL DEFAULT 0,
  error_message    TEXT,
  metadata         JSONB NOT NULL DEFAULT '{}',
  created_by       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);
ALTER TABLE data_imports ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_data_imports_org_id ON data_imports(org_id);

CREATE POLICY "Org admins can view data imports" ON data_imports FOR SELECT USING (
  org_id = get_my_org_id() AND get_my_role() IN ('admin','manager')
);
CREATE POLICY "Org admins can manage data imports" ON data_imports FOR ALL USING (
  org_id = get_my_org_id() AND get_my_role() IN ('admin','manager')
);

-- ---------------------------------------------------------------------------
-- 27. template_packs
-- ---------------------------------------------------------------------------
CREATE TABLE template_packs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  icon        TEXT DEFAULT 'FolderOpen',
  visibility  TEXT DEFAULT 'org',
  team_id     UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_by  UUID NOT NULL REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE template_packs ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_template_packs_org        ON template_packs(org_id);
CREATE INDEX idx_template_packs_created_by ON template_packs(created_by);

CREATE POLICY "template_packs_select" ON template_packs FOR SELECT USING (
  org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "template_packs_insert" ON template_packs FOR INSERT WITH CHECK (
  org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()) AND get_my_role() IN ('admin','manager')
);
CREATE POLICY "template_packs_update" ON template_packs FOR UPDATE USING (
  org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()) AND get_my_role() IN ('admin','manager')
);
CREATE POLICY "template_packs_delete" ON template_packs FOR DELETE USING (
  org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()) AND get_my_role() IN ('admin','manager')
);

-- ---------------------------------------------------------------------------
-- 28. template_pack_prompts
-- ---------------------------------------------------------------------------
CREATE TABLE template_pack_prompts (
  pack_id   UUID NOT NULL REFERENCES template_packs(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  PRIMARY KEY (pack_id, prompt_id)
);
ALTER TABLE template_pack_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "template_pack_prompts_select" ON template_pack_prompts FOR SELECT USING (
  pack_id IN (SELECT id FROM template_packs WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "template_pack_prompts_insert" ON template_pack_prompts FOR INSERT WITH CHECK (
  pack_id IN (SELECT id FROM template_packs WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()))
  AND get_my_role() IN ('admin','manager')
);
CREATE POLICY "template_pack_prompts_delete" ON template_pack_prompts FOR DELETE USING (
  pack_id IN (SELECT id FROM template_packs WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()))
  AND get_my_role() IN ('admin','manager')
);

-- ---------------------------------------------------------------------------
-- 29. template_pack_guidelines
-- ---------------------------------------------------------------------------
CREATE TABLE template_pack_guidelines (
  pack_id      UUID NOT NULL REFERENCES template_packs(id) ON DELETE CASCADE,
  guideline_id UUID NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
  PRIMARY KEY (pack_id, guideline_id)
);
ALTER TABLE template_pack_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "template_pack_guidelines_select" ON template_pack_guidelines FOR SELECT USING (
  pack_id IN (SELECT id FROM template_packs WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "template_pack_guidelines_insert" ON template_pack_guidelines FOR INSERT WITH CHECK (
  pack_id IN (SELECT id FROM template_packs WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()))
  AND get_my_role() IN ('admin','manager')
);
CREATE POLICY "template_pack_guidelines_delete" ON template_pack_guidelines FOR DELETE USING (
  pack_id IN (SELECT id FROM template_packs WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()))
  AND get_my_role() IN ('admin','manager')
);

-- ---------------------------------------------------------------------------
-- 30. template_pack_rules
-- ---------------------------------------------------------------------------
CREATE TABLE template_pack_rules (
  pack_id UUID NOT NULL REFERENCES template_packs(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES security_rules(id) ON DELETE CASCADE,
  PRIMARY KEY (pack_id, rule_id)
);
ALTER TABLE template_pack_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "template_pack_rules_select" ON template_pack_rules FOR SELECT USING (
  pack_id IN (SELECT id FROM template_packs WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "template_pack_rules_insert" ON template_pack_rules FOR INSERT WITH CHECK (
  pack_id IN (SELECT id FROM template_packs WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()))
  AND get_my_role() IN ('admin','manager')
);
CREATE POLICY "template_pack_rules_delete" ON template_pack_rules FOR DELETE USING (
  pack_id IN (SELECT id FROM template_packs WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()))
  AND get_my_role() IN ('admin','manager')
);

-- ---------------------------------------------------------------------------
-- 31. pack_install_requests
-- ---------------------------------------------------------------------------
CREATE TABLE pack_install_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID REFERENCES organizations(id) ON DELETE CASCADE,
  pack_id      TEXT NOT NULL,
  pack_type    TEXT NOT NULL CHECK (pack_type IN ('builtin','custom')),
  requested_by UUID REFERENCES auth.users(id),
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','approved','rejected')),
  reviewed_by  UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT now(),
  reviewed_at  TIMESTAMPTZ
);
ALTER TABLE pack_install_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org requests" ON pack_install_requests FOR SELECT USING (
  org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Users can insert own requests" ON pack_install_requests FOR INSERT WITH CHECK (
  requested_by = auth.uid()
  AND org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins can update requests" ON pack_install_requests FOR UPDATE USING (
  org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  AND get_my_role() IN ('admin','manager')
);

-- ---------------------------------------------------------------------------
-- 32. rule_suggestions
-- ---------------------------------------------------------------------------
CREATE TABLE rule_suggestions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id      UUID REFERENCES teams(id) ON DELETE SET NULL,
  suggested_by UUID NOT NULL REFERENCES profiles(id),
  name         TEXT NOT NULL,
  description  TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'custom',
  severity     TEXT NOT NULL DEFAULT 'warn'
                 CHECK (severity IN ('block','warn')),
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','approved','rejected')),
  reviewed_by  UUID REFERENCES profiles(id),
  reviewed_at  TIMESTAMPTZ,
  admin_notes  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE rule_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view org suggestions" ON rule_suggestions FOR SELECT USING (
  org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Members can suggest rules" ON rule_suggestions FOR INSERT WITH CHECK (
  suggested_by = auth.uid()
  AND org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins can review suggestions" ON rule_suggestions FOR UPDATE USING (
  org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  AND get_my_role() IN ('admin','manager')
);

-- ---------------------------------------------------------------------------
-- 33. workspace_integrations
-- ---------------------------------------------------------------------------
CREATE TABLE workspace_integrations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider         TEXT NOT NULL CHECK (provider IN ('google_workspace','microsoft_entra')),
  access_token     TEXT NOT NULL,
  refresh_token    TEXT,
  token_expires_at TIMESTAMPTZ,
  admin_email      TEXT,
  connected_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  connected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_synced_at   TIMESTAMPTZ,
  UNIQUE(org_id, provider)
);
ALTER TABLE workspace_integrations ENABLE ROW LEVEL SECURITY;
-- No client-side RLS policies — service role only

-- ---------------------------------------------------------------------------
-- 34. canned_responses
-- ---------------------------------------------------------------------------
CREATE TABLE canned_responses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'general',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE canned_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage canned responses" ON canned_responses FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
);

-- Seed data
INSERT INTO canned_responses (title, content, category) VALUES
  ('Acknowledgment', 'Thank you for reaching out! We''ve received your message and will get back to you within 24 hours.', 'general'),
  ('Need More Info', 'Thanks for contacting us. Could you provide a bit more detail so we can assist you better? Specifically: [what you need]', 'general'),
  ('Bug Acknowledged', 'Thank you for reporting this issue. We''ve logged it and our engineering team will investigate. We''ll update you once we have more information.', 'bug'),
  ('Resolution', 'Great news — this issue has been resolved! Please let us know if you experience any further problems.', 'general'),
  ('Sales Intro', 'Thanks for your interest in TeamPrompt! I''d love to learn more about your team''s needs. Would you be available for a quick 15-minute call this week?', 'sales'),
  ('Thanks & Close', 'Glad we could help! If you have any other questions in the future, don''t hesitate to reach out. We''re always here to help.', 'general');

-- ---------------------------------------------------------------------------
-- 35. mailbox_settings
-- ---------------------------------------------------------------------------
CREATE TABLE mailbox_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 TEXT NOT NULL UNIQUE,
  display_name          TEXT NOT NULL,
  signature_html        TEXT,
  auto_reply_enabled    BOOLEAN DEFAULT false,
  auto_reply_subject    TEXT,
  auto_reply_body       TEXT,
  use_branded_template  BOOLEAN DEFAULT true,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE mailbox_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage mailbox settings" ON mailbox_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
);

-- Seed data
INSERT INTO mailbox_settings (email, display_name, signature_html) VALUES
  ('support@teamprompt.app', 'TeamPrompt Support',
   '<div style="margin-top:16px;padding-top:12px;border-top:1px solid #e4e4e7"><p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#18181b">TeamPrompt Support</p><p style="margin:0 0 2px;font-size:13px;color:#71717a">support@teamprompt.app</p><p style="margin:4px 0 0;font-size:13px"><a href="https://teamprompt.app" style="color:#2563EB;text-decoration:none">teamprompt.app</a></p></div>'),
  ('sales@teamprompt.app', 'TeamPrompt Sales',
   '<div style="margin-top:16px;padding-top:12px;border-top:1px solid #e4e4e7"><p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#18181b">TeamPrompt Sales</p><p style="margin:0 0 2px;font-size:13px;color:#71717a">sales@teamprompt.app</p><p style="margin:4px 0 0;font-size:13px"><a href="https://teamprompt.app" style="color:#2563EB;text-decoration:none">teamprompt.app</a></p></div>'),
  ('help@teamprompt.app', 'TeamPrompt Help', NULL),
  ('contact@teamprompt.app', 'TeamPrompt', NULL),
  ('info@teamprompt.app', 'TeamPrompt Info', NULL),
  ('team@teamprompt.app', 'TeamPrompt Team', NULL),
  ('kade@teamprompt.app', 'Kade at TeamPrompt',
   '<div style="margin-top:16px;padding-top:12px;border-top:1px solid #e4e4e7"><p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#18181b">Kade</p><p style="margin:0 0 2px;font-size:13px;color:#71717a">kade@teamprompt.app</p><p style="margin:4px 0 0;font-size:13px"><a href="https://teamprompt.app" style="color:#2563EB;text-decoration:none">teamprompt.app</a></p></div>');

-- ---------------------------------------------------------------------------
-- VIEW: plan_limits
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW plan_limits WITH (security_invoker = true) AS
SELECT * FROM (VALUES
  ('free',     25, 3,   3,  5,  false, false, true,  false, false, false, false, false, false, false, false, false),
  ('pro',      -1, 12, -1, 14,  true,  true,  true,  false, false, false, false, false, false, false, false, false),
  ('team',     -1, 50, -1, 14,  true,  true,  true,  true,  true,  true,  true,  true,  false, false, false, false),
  ('business', -1, 500,-1, -1,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true,  true)
) AS t(
  plan, max_prompts, max_members, max_ai_tools, max_guidelines,
  analytics, import_export, basic_security, custom_security,
  audit_log, bulk_import, bulk_role_assignment, custom_welcome_email,
  domain_auto_join, google_workspace_sync, priority_support, sla
);

-- ---------------------------------------------------------------------------
-- RPC: increment_usage_count
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_usage_count(p_prompt_id UUID) RETURNS VOID AS $$
BEGIN
  UPDATE prompts
  SET usage_count = usage_count + 1,
      last_used_at = NOW()
  WHERE id = p_prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------------------
-- TRIGGER FUNCTION: handle_new_user (auth.users -> profile + org creation)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_domain TEXT;
  v_existing_profile UUID;
BEGIN
  SELECT id INTO v_existing_profile FROM profiles WHERE id = NEW.id;
  IF v_existing_profile IS NOT NULL THEN RETURN NEW; END IF;

  v_domain := split_part(COALESCE(NEW.email, ''), '@', 2);

  IF v_domain <> '' AND v_domain NOT IN ('gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','protonmail.com','aol.com','mail.com','zoho.com') THEN
    SELECT id INTO v_org_id FROM organizations WHERE domain = v_domain LIMIT 1;
  END IF;

  IF v_org_id IS NULL THEN
    INSERT INTO organizations (name, domain)
    VALUES (COALESCE(split_part(NEW.email, '@', 1), 'My Workspace'), COALESCE(v_domain, ''))
    RETURNING id INTO v_org_id;

    INSERT INTO subscriptions (org_id, plan, status) VALUES (v_org_id, 'free', 'active');
  END IF;

  INSERT INTO profiles (id, org_id, email, name, role)
  VALUES (
    NEW.id,
    v_org_id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email,''), '@', 1)),
    CASE
      WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE org_id = v_org_id) THEN 'admin'
      ELSE 'member'
    END
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------------------
-- TRIGGER FUNCTIONS: notifications
-- ---------------------------------------------------------------------------

-- Notify admins/managers on security violations
CREATE OR REPLACE FUNCTION notify_admins_on_security_violation() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, org_id, type, title, message, metadata)
  SELECT p.id, NEW.org_id, 'security_violation',
    'Security violation detected',
    'A security rule was triggered: ' || COALESCE(
      (SELECT name FROM security_rules WHERE id = NEW.rule_id), 'Unknown rule'
    ),
    jsonb_build_object('violation_id', NEW.id, 'rule_id', NEW.rule_id, 'user_id', NEW.user_id)
  FROM profiles p
  WHERE p.org_id = NEW.org_id AND p.role IN ('admin','manager');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_on_security_violation
  AFTER INSERT ON security_violations
  FOR EACH ROW EXECUTE FUNCTION notify_admins_on_security_violation();

-- Notify admins when prompt is submitted for approval
CREATE OR REPLACE FUNCTION notify_admins_on_prompt_pending() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' AND (TG_OP = 'INSERT' OR OLD.status <> 'pending') THEN
    INSERT INTO notifications (user_id, org_id, type, title, message, metadata)
    SELECT p.id, NEW.org_id, 'prompt_submitted',
      'Prompt submitted for review',
      'A new prompt "' || NEW.title || '" needs approval.',
      jsonb_build_object('prompt_id', NEW.id, 'prompt_title', NEW.title)
    FROM profiles p
    WHERE p.org_id = NEW.org_id AND p.role IN ('admin','manager');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_on_prompt_pending
  AFTER INSERT OR UPDATE ON prompts
  FOR EACH ROW EXECUTE FUNCTION notify_admins_on_prompt_pending();

-- Notify owner when prompt is approved
CREATE OR REPLACE FUNCTION notify_owner_on_prompt_status_change() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'approved' AND NEW.owner_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, org_id, type, title, message, metadata)
    VALUES (
      NEW.owner_id, NEW.org_id, 'prompt_approved',
      'Prompt approved',
      'Your prompt "' || NEW.title || '" has been approved and is now available to the team.',
      jsonb_build_object('prompt_id', NEW.id, 'prompt_title', NEW.title)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_on_prompt_status_change
  AFTER UPDATE ON prompts
  FOR EACH ROW EXECUTE FUNCTION notify_owner_on_prompt_status_change();

-- ---------------------------------------------------------------------------
-- REALTIME PUBLICATIONS
-- ---------------------------------------------------------------------------
-- Tables added to supabase_realtime publication:
--   notifications, feedback, ticket_notes, error_logs
-- (Run in production via: ALTER PUBLICATION supabase_realtime ADD TABLE <table>)

-- ---------------------------------------------------------------------------
-- END OF SCHEMA
-- ---------------------------------------------------------------------------
