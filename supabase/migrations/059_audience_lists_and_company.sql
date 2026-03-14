-- 059: Add company column to campaign_contacts and create audience lists

-- Add company column to campaign_contacts
ALTER TABLE campaign_contacts ADD COLUMN IF NOT EXISTS company TEXT DEFAULT '';

-- Audience lists — named, reusable lists of contacts for campaigns
CREATE TABLE IF NOT EXISTS audience_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  contact_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audience_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage audience_lists" ON audience_lists FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

-- Junction table linking contacts to lists (a contact can belong to multiple lists)
CREATE TABLE IF NOT EXISTS audience_list_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES audience_lists(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES campaign_contacts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, contact_id)
);

ALTER TABLE audience_list_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage audience_list_contacts" ON audience_list_contacts FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

CREATE INDEX IF NOT EXISTS idx_audience_list_contacts_list ON audience_list_contacts(list_id);
CREATE INDEX IF NOT EXISTS idx_audience_list_contacts_contact ON audience_list_contacts(contact_id);
