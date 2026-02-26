-- Add guidelines and security rules to template packs

CREATE TABLE template_pack_guidelines (
  pack_id UUID NOT NULL REFERENCES template_packs(id) ON DELETE CASCADE,
  guideline_id UUID NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
  PRIMARY KEY (pack_id, guideline_id)
);

CREATE TABLE template_pack_rules (
  pack_id UUID NOT NULL REFERENCES template_packs(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES security_rules(id) ON DELETE CASCADE,
  PRIMARY KEY (pack_id, rule_id)
);

-- RLS
ALTER TABLE template_pack_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_pack_rules ENABLE ROW LEVEL SECURITY;

-- Pack guidelines inherit pack access
CREATE POLICY "template_pack_guidelines_select" ON template_pack_guidelines
  FOR SELECT USING (
    pack_id IN (
      SELECT id FROM template_packs
      WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "template_pack_guidelines_insert" ON template_pack_guidelines
  FOR INSERT WITH CHECK (
    pack_id IN (
      SELECT id FROM template_packs
      WHERE org_id IN (
        SELECT org_id FROM profiles
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "template_pack_guidelines_delete" ON template_pack_guidelines
  FOR DELETE USING (
    pack_id IN (
      SELECT id FROM template_packs
      WHERE org_id IN (
        SELECT org_id FROM profiles
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    )
  );

-- Pack rules inherit pack access
CREATE POLICY "template_pack_rules_select" ON template_pack_rules
  FOR SELECT USING (
    pack_id IN (
      SELECT id FROM template_packs
      WHERE org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "template_pack_rules_insert" ON template_pack_rules
  FOR INSERT WITH CHECK (
    pack_id IN (
      SELECT id FROM template_packs
      WHERE org_id IN (
        SELECT org_id FROM profiles
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "template_pack_rules_delete" ON template_pack_rules
  FOR DELETE USING (
    pack_id IN (
      SELECT id FROM template_packs
      WHERE org_id IN (
        SELECT org_id FROM profiles
        WHERE id = auth.uid() AND role IN ('admin', 'manager')
      )
    )
  );
