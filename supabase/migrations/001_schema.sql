-- ContextIQ Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ═══════════════════════════════════════
--  ORGANIZATIONS
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  domain TEXT DEFAULT '',
  logo TEXT DEFAULT '',
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  settings JSONB NOT NULL DEFAULT '{
    "enforceStandards": false,
    "requireApproval": false,
    "allowPersonalPrompts": true,
    "defaultVisibility": "team"
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════
--  PROFILES (extends Supabase auth.users)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════
--  TEAMS
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  icon TEXT DEFAULT 'users',
  color TEXT DEFAULT '#8b5cf6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

-- ═══════════════════════════════════════
--  FOLDERS & DEPARTMENTS
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT '#8b5cf6',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════
--  PROMPTS
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  intended_outcome TEXT DEFAULT '',
  tone TEXT DEFAULT 'professional',
  model_recommendation TEXT DEFAULT '',
  example_input TEXT DEFAULT '',
  example_output TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('draft', 'pending', 'approved', 'archived')),
  version INT NOT NULL DEFAULT 1,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  rating_total INT NOT NULL DEFAULT 0,
  rating_count INT NOT NULL DEFAULT 0,
  usage_count INT NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════
--  PROMPT VERSIONS (history)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  version INT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (prompt_id, version)
);

-- ═══════════════════════════════════════
--  COLLECTIONS
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT '#8b5cf6',
  visibility TEXT NOT NULL DEFAULT 'team' CHECK (visibility IN ('personal', 'team', 'org', 'public')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_prompts (
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection_id, prompt_id)
);

-- ═══════════════════════════════════════
--  STANDARDS
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  scope TEXT NOT NULL DEFAULT 'org' CHECK (scope IN ('personal', 'team', 'org')),
  rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  enforced BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════
--  USAGE EVENTS (analytics)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('use', 'copy', 'insert', 'rate', 'share', 'export')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════
--  INDEXES
-- ═══════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_teams_org ON teams(org_id);
CREATE INDEX IF NOT EXISTS idx_prompts_org ON prompts(org_id);
CREATE INDEX IF NOT EXISTS idx_prompts_owner ON prompts(owner_id);
CREATE INDEX IF NOT EXISTS idx_prompts_folder ON prompts(folder_id);
CREATE INDEX IF NOT EXISTS idx_prompts_dept ON prompts(department_id);
CREATE INDEX IF NOT EXISTS idx_prompts_updated ON prompts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_usage ON prompts(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_versions_prompt ON prompt_versions(prompt_id);
CREATE INDEX IF NOT EXISTS idx_collections_org ON collections(org_id);
CREATE INDEX IF NOT EXISTS idx_standards_org ON standards(org_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_org ON usage_events(org_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_prompt ON usage_events(prompt_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_created ON usage_events(created_at DESC);

-- ═══════════════════════════════════════
--  ROW LEVEL SECURITY
-- ═══════════════════════════════════════

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

-- Profiles: users can ALWAYS read their own profile + read all in their org
-- The id = auth.uid() clause is critical for new users whose org_id is still NULL,
-- since NULL = NULL evaluates to false and would lock them out of their own profile.
CREATE POLICY profiles_select ON profiles FOR SELECT USING (
  id = auth.uid() OR
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Organizations: members can read their org, admins can update
CREATE POLICY orgs_select ON organizations FOR SELECT USING (
  id = (SELECT org_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY orgs_update ON organizations FOR UPDATE USING (
  id = (SELECT org_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY orgs_insert ON organizations FOR INSERT WITH CHECK (true);

-- Teams: org members can read, admins/managers can modify
CREATE POLICY teams_select ON teams FOR SELECT USING (
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY teams_modify ON teams FOR ALL USING (
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Team members: org members can see, admins/managers can modify
CREATE POLICY team_members_select ON team_members FOR SELECT USING (
  team_id IN (SELECT id FROM teams WHERE org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY team_members_modify ON team_members FOR ALL USING (
  team_id IN (SELECT id FROM teams WHERE org_id = (SELECT org_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')))
);

-- Prompts: org members can read all org prompts, owners can modify their own, admins can modify all
CREATE POLICY prompts_select ON prompts FOR SELECT USING (
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY prompts_insert ON prompts FOR INSERT WITH CHECK (
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY prompts_update ON prompts FOR UPDATE USING (
  owner_id = auth.uid() OR
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY prompts_delete ON prompts FOR DELETE USING (
  owner_id = auth.uid() OR
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Prompt versions: same as prompts
CREATE POLICY prompt_versions_select ON prompt_versions FOR SELECT USING (
  prompt_id IN (SELECT id FROM prompts WHERE org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY prompt_versions_insert ON prompt_versions FOR INSERT WITH CHECK (
  prompt_id IN (SELECT id FROM prompts WHERE org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()))
);

-- Folders, Departments: org members can read, admins can modify
CREATE POLICY folders_select ON folders FOR SELECT USING (
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY folders_modify ON folders FOR ALL USING (
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);
CREATE POLICY depts_select ON departments FOR SELECT USING (
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY depts_modify ON departments FOR ALL USING (
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Collections: org-scoped read, team-scoped or owner write
CREATE POLICY collections_select ON collections FOR SELECT USING (
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY collections_modify ON collections FOR ALL USING (
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY collection_prompts_select ON collection_prompts FOR SELECT USING (
  collection_id IN (SELECT id FROM collections WHERE org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY collection_prompts_modify ON collection_prompts FOR ALL USING (
  collection_id IN (SELECT id FROM collections WHERE org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()))
);

-- Standards: org-scoped read, admin write
CREATE POLICY standards_select ON standards FOR SELECT USING (
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY standards_modify ON standards FOR ALL USING (
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Usage events: org-scoped read, any org member can insert
CREATE POLICY usage_events_select ON usage_events FOR SELECT USING (
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY usage_events_insert ON usage_events FOR INSERT WITH CHECK (
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
);

-- ═══════════════════════════════════════
--  AUTO-CREATE PROFILE ON SIGNUP
-- ═══════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', ''),
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'preferred_username',
      split_part(COALESCE(NEW.email, ''), '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      ''
    ),
    'admin'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════
--  UPDATED_AT TRIGGER
-- ═══════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'organizations', 'profiles', 'teams', 'folders',
    'departments', 'prompts', 'collections', 'standards'
  ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I; CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at();',
      tbl, tbl
    );
  END LOOP;
END $$;
