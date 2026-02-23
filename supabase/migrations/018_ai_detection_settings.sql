-- ============================================
-- 018: AI Detection Settings & Custom Sensitive Data
-- ============================================

-- Add AI detection settings to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS security_settings JSONB DEFAULT '{
  "entropy_detection_enabled": false,
  "entropy_threshold": 4.0,
  "ai_detection_enabled": false,
  "ai_detection_provider": null,
  "smart_patterns_enabled": false
}'::jsonb;

-- Table for custom sensitive terms/patterns defined by org
CREATE TABLE IF NOT EXISTS sensitive_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  term_type TEXT NOT NULL CHECK (term_type IN ('exact', 'pattern', 'keyword')),
  category TEXT NOT NULL CHECK (category IN (
    'customer_data',
    'employee_data', 
    'project_names',
    'product_names',
    'internal_codes',
    'partner_data',
    'financial_data',
    'legal_data',
    'custom'
  )),
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'warn' CHECK (severity IN ('block', 'warn')),
  is_active BOOLEAN DEFAULT TRUE,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'import', 'sync', 'ai_suggested')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sensitive_terms_org_id ON sensitive_terms(org_id);
CREATE INDEX IF NOT EXISTS idx_sensitive_terms_active ON sensitive_terms(org_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_sensitive_terms_category ON sensitive_terms(org_id, category);

-- RLS
ALTER TABLE sensitive_terms ENABLE ROW LEVEL SECURITY;

-- Org members can view their org's sensitive terms
CREATE POLICY "Org members can view sensitive terms"
  ON sensitive_terms FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

-- Admins/managers can manage sensitive terms
CREATE POLICY "Admins can manage sensitive terms"
  ON sensitive_terms FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Table for AI-suggested rules that admins can review
CREATE TABLE IF NOT EXISTS suggested_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  pattern TEXT NOT NULL,
  pattern_type TEXT NOT NULL DEFAULT 'regex' CHECK (pattern_type IN ('exact', 'regex', 'glob')),
  category TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warn' CHECK (severity IN ('block', 'warn')),
  sample_matches TEXT[], -- Example matches found
  detection_count INT DEFAULT 1,
  confidence DECIMAL(3,2) DEFAULT 0.5, -- 0.00 to 1.00
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'dismissed', 'converted')),
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  converted_rule_id UUID REFERENCES security_rules(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_suggested_rules_org_id ON suggested_rules(org_id);
CREATE INDEX IF NOT EXISTS idx_suggested_rules_status ON suggested_rules(org_id, status);

-- RLS
ALTER TABLE suggested_rules ENABLE ROW LEVEL SECURITY;

-- Org members can view suggested rules
CREATE POLICY "Org members can view suggested rules"
  ON suggested_rules FOR SELECT
  USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

-- Admins can manage suggested rules
CREATE POLICY "Admins can manage suggested rules"
  ON suggested_rules FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Table for data import history
CREATE TABLE IF NOT EXISTS data_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  import_type TEXT NOT NULL CHECK (import_type IN (
    'csv_terms',
    'json_terms', 
    'crm_sync',
    'hr_sync',
    'custom_api'
  )),
  source_name TEXT, -- e.g., "Salesforce", "employee_list.csv"
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  total_records INT DEFAULT 0,
  imported_records INT DEFAULT 0,
  failed_records INT DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_data_imports_org_id ON data_imports(org_id);

-- RLS
ALTER TABLE data_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org admins can view data imports"
  ON data_imports FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Org admins can manage data imports"
  ON data_imports FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_sensitive_terms_updated_at ON sensitive_terms;
CREATE TRIGGER trigger_sensitive_terms_updated_at
  BEFORE UPDATE ON sensitive_terms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_suggested_rules_updated_at ON suggested_rules;
CREATE TRIGGER trigger_suggested_rules_updated_at
  BEFORE UPDATE ON suggested_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
