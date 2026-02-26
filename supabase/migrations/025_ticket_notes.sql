-- Ticket notes / conversation thread for admin support tickets
-- Supports internal notes (admin-only) and public responses (emailed to user)

CREATE TABLE IF NOT EXISTS ticket_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true,
  email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ticket_notes_ticket_id ON ticket_notes(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_notes_created_at ON ticket_notes(created_at);

-- RLS
ALTER TABLE ticket_notes ENABLE ROW LEVEL SECURITY;

-- Super admins can read all notes
CREATE POLICY "Super admins can read all ticket_notes" ON ticket_notes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Super admins can insert notes (notes are immutable — no UPDATE/DELETE policies)
CREATE POLICY "Super admins can insert ticket_notes" ON ticket_notes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );
