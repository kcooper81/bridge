-- Per-mailbox settings: signatures, auto-responder, display name
CREATE TABLE IF NOT EXISTS mailbox_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  signature_html TEXT,
  auto_reply_enabled BOOLEAN DEFAULT false,
  auto_reply_subject TEXT,
  auto_reply_body TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE mailbox_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage mailbox settings"
  ON mailbox_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true
    )
  );

-- Seed known mailboxes with default signatures
INSERT INTO mailbox_settings (email, display_name, signature_html) VALUES
  ('support@teamprompt.app', 'TeamPrompt Support',
   '<div style="margin-top:16px;padding-top:12px;border-top:1px solid #e4e4e7"><p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#18181b">TeamPrompt Support</p><p style="margin:0 0 2px;font-size:13px;color:#71717a">support@teamprompt.app</p><p style="margin:4px 0 0;font-size:13px"><a href="https://teamprompt.app" style="color:#2563EB;text-decoration:none">teamprompt.app</a></p></div>'),
  ('sales@teamprompt.app', 'TeamPrompt Sales',
   '<div style="margin-top:16px;padding-top:12px;border-top:1px solid #e4e4e7"><p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#18181b">TeamPrompt Sales</p><p style="margin:0 0 2px;font-size:13px;color:#71717a">sales@teamprompt.app</p><p style="margin:4px 0 0;font-size:13px"><a href="https://teamprompt.app" style="color:#2563EB;text-decoration:none">teamprompt.app</a></p></div>'),
  ('help@teamprompt.app', 'TeamPrompt Help', NULL),
  ('contact@teamprompt.app', 'TeamPrompt', NULL),
  ('info@teamprompt.app', 'TeamPrompt Info', NULL),
  ('team@teamprompt.app', 'TeamPrompt Team', NULL),
  ('kade@teamprompt.app', 'Kade at TeamPrompt',
   '<div style="margin-top:16px;padding-top:12px;border-top:1px solid #e4e4e7"><p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#18181b">Kade</p><p style="margin:0 0 2px;font-size:13px;color:#71717a">kade@teamprompt.app</p><p style="margin:4px 0 0;font-size:13px"><a href="https://teamprompt.app" style="color:#2563EB;text-decoration:none">teamprompt.app</a></p></div>');
