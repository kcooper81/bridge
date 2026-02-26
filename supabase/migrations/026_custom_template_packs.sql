-- Custom template packs
CREATE TABLE template_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'FolderOpen',
  visibility TEXT DEFAULT 'org',  -- 'org' | 'team' | 'personal'
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE template_pack_prompts (
  pack_id UUID NOT NULL REFERENCES template_packs(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  PRIMARY KEY (pack_id, prompt_id)
);

CREATE INDEX idx_template_packs_org ON template_packs(org_id);
CREATE INDEX idx_template_packs_created_by ON template_packs(created_by);

-- RLS
ALTER TABLE template_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_pack_prompts ENABLE ROW LEVEL SECURITY;

-- Org members can read template packs in their org
CREATE POLICY "template_packs_select" ON template_packs
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

-- Admins and managers can insert/update/delete
CREATE POLICY "template_packs_insert" ON template_packs
  FOR INSERT WITH CHECK (
    org_id IN (
      SELECT org_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "template_packs_update" ON template_packs
  FOR UPDATE USING (
    org_id IN (
      SELECT org_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "template_packs_delete" ON template_packs
  FOR DELETE USING (
    org_id IN (
      SELECT org_id FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Pack prompts inherit pack access
CREATE POLICY "template_pack_prompts_select" ON template_pack_prompts
  FOR SELECT USING (
    pack_id IN (
      SELECT id FROM template_packs
      WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "template_pack_prompts_insert" ON template_pack_prompts
  FOR INSERT WITH CHECK (
    pack_id IN (
      SELECT id FROM template_packs
      WHERE org_id IN (
        SELECT org_id FROM profiles
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "template_pack_prompts_delete" ON template_pack_prompts
  FOR DELETE USING (
    pack_id IN (
      SELECT id FROM template_packs
      WHERE org_id IN (
        SELECT org_id FROM profiles
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    )
  );
