-- Custom email templates saved by admins from campaign editor
CREATE TABLE IF NOT EXISTS custom_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT DEFAULT '',
  body_html TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE custom_email_templates ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage templates (enforced via API route)
CREATE POLICY "Service role full access on custom_email_templates"
  ON custom_email_templates FOR ALL
  USING (true)
  WITH CHECK (true);
