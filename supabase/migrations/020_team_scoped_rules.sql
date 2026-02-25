-- ============================================
-- 020: Team-Scoped Security Rules & Sensitive Terms
-- ============================================
-- Allows security rules and sensitive terms to be scoped to specific teams.
-- team_id = NULL → org-wide rule (applies to everyone)
-- team_id = <uuid> → team-specific rule (applies only to team members)

-- Add team_id to security_rules
ALTER TABLE security_rules
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- Add team_id to sensitive_terms
ALTER TABLE sensitive_terms
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- Indexes for efficient team-scoped lookups
CREATE INDEX IF NOT EXISTS idx_security_rules_org_team
  ON security_rules(org_id, team_id);

CREATE INDEX IF NOT EXISTS idx_sensitive_terms_org_team
  ON sensitive_terms(org_id, team_id);

-- ─── Update RLS policies for security_rules ───
-- Drop existing policies and recreate with team awareness
DROP POLICY IF EXISTS security_rules_select ON security_rules;
DROP POLICY IF EXISTS security_rules_insert ON security_rules;
DROP POLICY IF EXISTS security_rules_update ON security_rules;
DROP POLICY IF EXISTS security_rules_delete ON security_rules;

-- SELECT: org members can see org-wide rules + rules for their teams
CREATE POLICY security_rules_select ON security_rules
  FOR SELECT USING (
    org_id = get_my_org_id()
    AND (
      team_id IS NULL
      OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    )
  );

-- INSERT: admins/managers can create rules (org-wide or for any team in their org)
CREATE POLICY security_rules_insert ON security_rules
  FOR INSERT WITH CHECK (
    org_id = get_my_org_id()
    AND get_my_role() IN ('admin', 'manager')
    AND (
      team_id IS NULL
      OR team_id IN (SELECT id FROM teams WHERE org_id = get_my_org_id())
    )
  );

-- UPDATE: admins/managers can update rules in their org
CREATE POLICY security_rules_update ON security_rules
  FOR UPDATE USING (
    org_id = get_my_org_id()
    AND get_my_role() IN ('admin', 'manager')
  )
  WITH CHECK (
    org_id = get_my_org_id()
    AND (
      team_id IS NULL
      OR team_id IN (SELECT id FROM teams WHERE org_id = get_my_org_id())
    )
  );

-- DELETE: admins/managers can delete rules in their org
CREATE POLICY security_rules_delete ON security_rules
  FOR DELETE USING (
    org_id = get_my_org_id()
    AND get_my_role() IN ('admin', 'manager')
  );

-- ─── Update RLS policies for sensitive_terms ───
DROP POLICY IF EXISTS "Org members can view sensitive terms" ON sensitive_terms;
DROP POLICY IF EXISTS "Admins can manage sensitive terms" ON sensitive_terms;

-- SELECT: org members can see org-wide terms + terms for their teams
CREATE POLICY "Org members can view sensitive terms"
  ON sensitive_terms FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    AND (
      team_id IS NULL
      OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    )
  );

-- ALL: admins/managers can manage terms (org-wide or for any team in their org)
CREATE POLICY "Admins can manage sensitive terms"
  ON sensitive_terms FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );
