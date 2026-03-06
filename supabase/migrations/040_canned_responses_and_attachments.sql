-- Canned responses for quick ticket replies
CREATE TABLE IF NOT EXISTS canned_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE canned_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage canned responses"
  ON canned_responses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true
    )
  );

-- Seed useful defaults
INSERT INTO canned_responses (title, content, category) VALUES
  ('Acknowledgment', 'Thank you for reaching out! We''ve received your message and are looking into it. We''ll get back to you as soon as possible.', 'general'),
  ('Need More Info', E'Could you provide some more details about this issue? Specifically:\n\n- What steps led to the problem?\n- What browser/device are you using?\n- Any error messages or screenshots you can share?\n\nThis will help us investigate more effectively.', 'support'),
  ('Bug Acknowledged', E'Thank you for reporting this bug. We''ve been able to reproduce the issue and our team is working on a fix. We''ll update you once it''s resolved.', 'support'),
  ('Resolution', E'Great news — we''ve resolved the issue you reported. The fix is now live.\n\nPlease let us know if you experience any further problems. We''re happy to help!', 'support'),
  ('Sales Intro', E'Thank you for your interest in TeamPrompt! I''d love to tell you more about how we can help your team work more effectively with AI.\n\nWould you be available for a quick 15-minute call this week? Feel free to let me know a time that works for you.', 'sales'),
  ('Thanks & Close', E'Glad we could help! If you have any other questions in the future, don''t hesitate to reach out.\n\nHave a great day!', 'general');

-- Attachment metadata on tickets (JSONB array of {filename, content_type, size})
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
