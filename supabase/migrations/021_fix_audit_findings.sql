-- ============================================
-- 021: Fix audit findings
-- ============================================

-- 1. Expand security_rules.category CHECK to include all SecurityCategory values
-- Drop the existing unnamed CHECK constraint and re-add with all categories
ALTER TABLE security_rules DROP CONSTRAINT IF EXISTS security_rules_category_check;
ALTER TABLE security_rules
  ADD CONSTRAINT security_rules_category_check
  CHECK (category IN ('api_keys', 'credentials', 'internal_terms', 'internal', 'pii', 'secrets', 'financial', 'health', 'custom'));

-- 2. Fix security_rules SELECT RLS: admins/managers should see ALL rules in their org
--    (not just rules for teams they are members of)
DROP POLICY IF EXISTS security_rules_select ON security_rules;

CREATE POLICY security_rules_select ON security_rules
  FOR SELECT USING (
    org_id = get_my_org_id()
    AND (
      -- Admins/managers see all rules in their org
      get_my_role() IN ('admin', 'manager')
      -- Regular members see org-wide rules + rules for their teams
      OR team_id IS NULL
      OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    )
  );

-- 3. Fix sensitive_terms SELECT RLS: use get_my_org_id() instead of subquery,
--    and let admins/managers see all terms
DROP POLICY IF EXISTS "Org members can view sensitive terms" ON sensitive_terms;

CREATE POLICY "Org members can view sensitive terms"
  ON sensitive_terms FOR SELECT
  USING (
    org_id = get_my_org_id()
    AND (
      get_my_role() IN ('admin', 'manager')
      OR team_id IS NULL
      OR team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    )
  );

-- 4. Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_security_violations_user_id ON security_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON usage_events(user_id);

-- 5. Remove dead 'rejected' branch from notification trigger
-- (prompts.status CHECK only allows 'draft', 'pending', 'approved', 'archived')
CREATE OR REPLACE FUNCTION notify_owner_on_prompt_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    INSERT INTO notifications (org_id, user_id, type, title, message, metadata)
    VALUES (
      NEW.org_id,
      NEW.created_by,
      'prompt_approved',
      'Prompt approved',
      format('Your prompt "%s" has been approved', NEW.title),
      jsonb_build_object('prompt_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
