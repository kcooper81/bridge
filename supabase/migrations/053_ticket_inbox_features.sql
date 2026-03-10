-- 053: Ticket inbox enhancements — star, snooze, folders, CC, per-admin read tracking

-- Star/pin support (per-admin stars stored as UUID array)
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS starred_by UUID[] DEFAULT '{}';

-- Snooze support (hide ticket until this timestamp)
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMPTZ DEFAULT NULL;

-- Soft delete: inbox/spam/trash folders (replaces hard delete)
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS folder TEXT NOT NULL DEFAULT 'inbox';

-- CC emails on inbound tickets
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS cc_emails TEXT[] DEFAULT '{}';

-- CC emails on individual notes/replies
ALTER TABLE ticket_notes ADD COLUMN IF NOT EXISTS cc_emails TEXT[] DEFAULT '{}';

-- Per-admin read tracking (separates read/unread from ticket status)
CREATE TABLE IF NOT EXISTS ticket_reads (
  ticket_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  admin_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at   TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (ticket_id, admin_id)
);
ALTER TABLE ticket_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins manage ticket_reads" ON ticket_reads FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_starred ON feedback USING GIN (starred_by);
CREATE INDEX IF NOT EXISTS idx_feedback_snoozed ON feedback(snoozed_until) WHERE snoozed_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feedback_folder ON feedback(folder);
CREATE INDEX IF NOT EXISTS idx_ticket_reads_admin ON ticket_reads(admin_id);
