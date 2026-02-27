-- Rule suggestions: members submit policy/rule ideas, admins/managers review
-- NOTE: This is separate from `suggested_rules` (AI-detected patterns).
-- This table is for human-submitted suggestions.

CREATE TABLE rule_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  suggested_by UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'custom',
  severity TEXT NOT NULL DEFAULT 'warn' CHECK (severity IN ('block', 'warn')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE rule_suggestions ENABLE ROW LEVEL SECURITY;

-- All org members can view suggestions
CREATE POLICY "Members can view org suggestions"
  ON rule_suggestions FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Any authenticated member can insert a suggestion for their org
CREATE POLICY "Members can suggest rules"
  ON rule_suggestions FOR INSERT
  WITH CHECK (
    suggested_by = auth.uid()
    AND org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Admin/manager can update (approve/reject)
CREATE POLICY "Admins can review suggestions"
  ON rule_suggestions FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'manager')
    )
  );
