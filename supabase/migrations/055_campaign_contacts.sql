-- 055: External campaign contacts for email marketing

CREATE TABLE IF NOT EXISTS campaign_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  source TEXT DEFAULT 'csv_import', -- csv_import, manual, api
  unsubscribed BOOLEAN DEFAULT FALSE,
  imported_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE campaign_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage campaign_contacts" ON campaign_contacts FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

CREATE INDEX IF NOT EXISTS idx_campaign_contacts_email ON campaign_contacts(email);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_unsubscribed ON campaign_contacts(unsubscribed);
