-- Fix: "infinite recursion detected in policy for relation profiles"
--
-- The original RLS policies on `profiles` used a subquery like:
--   (SELECT org_id FROM profiles WHERE id = auth.uid())
-- This subquery triggers the same SELECT policy, causing infinite recursion.
--
-- Solution: SECURITY DEFINER helper functions that bypass RLS.
-- Run this in your Supabase SQL Editor to fix the live database.

-- ═══════════════════════════════════════
--  1. Create helper functions
-- ═══════════════════════════════════════

CREATE OR REPLACE FUNCTION get_my_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ═══════════════════════════════════════
--  2. Drop all old policies
-- ═══════════════════════════════════════

DROP POLICY IF EXISTS profiles_select ON profiles;
DROP POLICY IF EXISTS profiles_update ON profiles;
DROP POLICY IF EXISTS profiles_insert ON profiles;

DROP POLICY IF EXISTS orgs_select ON organizations;
DROP POLICY IF EXISTS orgs_update ON organizations;
DROP POLICY IF EXISTS orgs_insert ON organizations;

DROP POLICY IF EXISTS teams_select ON teams;
DROP POLICY IF EXISTS teams_modify ON teams;

DROP POLICY IF EXISTS team_members_select ON team_members;
DROP POLICY IF EXISTS team_members_modify ON team_members;

DROP POLICY IF EXISTS prompts_select ON prompts;
DROP POLICY IF EXISTS prompts_insert ON prompts;
DROP POLICY IF EXISTS prompts_update ON prompts;
DROP POLICY IF EXISTS prompts_delete ON prompts;

DROP POLICY IF EXISTS prompt_versions_select ON prompt_versions;
DROP POLICY IF EXISTS prompt_versions_insert ON prompt_versions;

DROP POLICY IF EXISTS folders_select ON folders;
DROP POLICY IF EXISTS folders_modify ON folders;

DROP POLICY IF EXISTS depts_select ON departments;
DROP POLICY IF EXISTS depts_modify ON departments;

DROP POLICY IF EXISTS collections_select ON collections;
DROP POLICY IF EXISTS collections_modify ON collections;

DROP POLICY IF EXISTS collection_prompts_select ON collection_prompts;
DROP POLICY IF EXISTS collection_prompts_modify ON collection_prompts;

DROP POLICY IF EXISTS standards_select ON standards;
DROP POLICY IF EXISTS standards_modify ON standards;

DROP POLICY IF EXISTS usage_events_select ON usage_events;
DROP POLICY IF EXISTS usage_events_insert ON usage_events;

-- ═══════════════════════════════════════
--  3. Recreate policies using helper functions
-- ═══════════════════════════════════════

-- Profiles
CREATE POLICY profiles_select ON profiles FOR SELECT USING (
  id = auth.uid() OR org_id = get_my_org_id()
);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Organizations
CREATE POLICY orgs_select ON organizations FOR SELECT USING (
  id = get_my_org_id()
);
CREATE POLICY orgs_update ON organizations FOR UPDATE USING (
  id = get_my_org_id() AND get_my_role() = 'admin'
);
CREATE POLICY orgs_insert ON organizations FOR INSERT WITH CHECK (true);

-- Teams
CREATE POLICY teams_select ON teams FOR SELECT USING (
  org_id = get_my_org_id()
);
CREATE POLICY teams_modify ON teams FOR ALL USING (
  org_id = get_my_org_id() AND get_my_role() IN ('admin', 'manager')
);

-- Team members
CREATE POLICY team_members_select ON team_members FOR SELECT USING (
  team_id IN (SELECT id FROM teams WHERE org_id = get_my_org_id())
);
CREATE POLICY team_members_modify ON team_members FOR ALL USING (
  team_id IN (SELECT id FROM teams WHERE org_id = get_my_org_id()) AND get_my_role() IN ('admin', 'manager')
);

-- Prompts
CREATE POLICY prompts_select ON prompts FOR SELECT USING (
  org_id = get_my_org_id()
);
CREATE POLICY prompts_insert ON prompts FOR INSERT WITH CHECK (
  org_id = get_my_org_id()
);
CREATE POLICY prompts_update ON prompts FOR UPDATE USING (
  owner_id = auth.uid() OR
  (org_id = get_my_org_id() AND get_my_role() = 'admin')
);
CREATE POLICY prompts_delete ON prompts FOR DELETE USING (
  owner_id = auth.uid() OR
  (org_id = get_my_org_id() AND get_my_role() = 'admin')
);

-- Prompt versions
CREATE POLICY prompt_versions_select ON prompt_versions FOR SELECT USING (
  prompt_id IN (SELECT id FROM prompts WHERE org_id = get_my_org_id())
);
CREATE POLICY prompt_versions_insert ON prompt_versions FOR INSERT WITH CHECK (
  prompt_id IN (SELECT id FROM prompts WHERE org_id = get_my_org_id())
);

-- Folders
CREATE POLICY folders_select ON folders FOR SELECT USING (
  org_id = get_my_org_id()
);
CREATE POLICY folders_modify ON folders FOR ALL USING (
  org_id = get_my_org_id() AND get_my_role() IN ('admin', 'manager')
);

-- Departments
CREATE POLICY depts_select ON departments FOR SELECT USING (
  org_id = get_my_org_id()
);
CREATE POLICY depts_modify ON departments FOR ALL USING (
  org_id = get_my_org_id() AND get_my_role() IN ('admin', 'manager')
);

-- Collections
CREATE POLICY collections_select ON collections FOR SELECT USING (
  org_id = get_my_org_id()
);
CREATE POLICY collections_modify ON collections FOR ALL USING (
  org_id = get_my_org_id()
);
CREATE POLICY collection_prompts_select ON collection_prompts FOR SELECT USING (
  collection_id IN (SELECT id FROM collections WHERE org_id = get_my_org_id())
);
CREATE POLICY collection_prompts_modify ON collection_prompts FOR ALL USING (
  collection_id IN (SELECT id FROM collections WHERE org_id = get_my_org_id())
);

-- Standards
CREATE POLICY standards_select ON standards FOR SELECT USING (
  org_id = get_my_org_id()
);
CREATE POLICY standards_modify ON standards FOR ALL USING (
  org_id = get_my_org_id() AND get_my_role() IN ('admin', 'manager')
);

-- Usage events
CREATE POLICY usage_events_select ON usage_events FOR SELECT USING (
  org_id = get_my_org_id()
);
CREATE POLICY usage_events_insert ON usage_events FOR INSERT WITH CHECK (
  org_id = get_my_org_id()
);
