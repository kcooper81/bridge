-- Security Rules table
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

-- Security Violations audit log
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

CREATE POLICY security_violations_select ON security_violations
  FOR SELECT USING (
    org_id = get_my_org_id()
    AND get_my_role() IN ('admin', 'manager')
  );

CREATE POLICY security_violations_insert ON security_violations
  FOR INSERT WITH CHECK (org_id = get_my_org_id());

-- Auto-update updated_at
CREATE TRIGGER set_security_rules_updated_at
  BEFORE UPDATE ON security_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update plan_limits view to include security columns
CREATE OR REPLACE VIEW plan_limits AS
SELECT * FROM (VALUES
  ('free',     25,    3,    3,    5,     false, false, true,  false, false),
  ('pro',      -1,    1,   -1,   14,     true,  true,  true,  true,  false),
  ('team',     -1,   50,   -1,   14,     true,  true,  true,  true,  true),
  ('business', -1,  500,   -1,   -1,     true,  true,  true,  true,  true)
) AS t(plan, max_prompts, max_members, max_ai_tools, max_standards, analytics, import_export, basic_security, custom_security, audit_log);
