-- 054: Email campaigns — local tracking for Resend Broadcast campaigns

CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  from_email TEXT NOT NULL DEFAULT 'TeamPrompt <hello@teamprompt.app>',
  body_html TEXT NOT NULL DEFAULT '',
  segment_name TEXT, -- human-readable label for the target segment
  resend_segment_id TEXT, -- Resend segment UUID
  resend_broadcast_id TEXT, -- Resend broadcast UUID (set after creation)
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'queued', 'sending', 'sent', 'failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage email_campaigns" ON email_campaigns FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created ON email_campaigns(created_at DESC);
