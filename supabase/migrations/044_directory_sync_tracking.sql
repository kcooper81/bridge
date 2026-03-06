-- Track which members were added via directory sync
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS directory_sync_source TEXT DEFAULT NULL;
-- Values: 'google_workspace', 'microsoft_entra', or NULL (manual/invite)

-- Track last directory sync email list per org for diff detection
CREATE TABLE IF NOT EXISTS directory_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google_workspace', 'microsoft_entra')),
  synced_emails TEXT[] NOT NULL DEFAULT '{}',
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_emails TEXT[] DEFAULT '{}',
  deprovisioned_count INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sync_log_org ON directory_sync_log(org_id, synced_at DESC);

-- RLS: only super admins can access
ALTER TABLE directory_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage sync logs"
  ON directory_sync_log
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

-- Also allow org admins to read their own sync logs
CREATE POLICY "Org admins can read own sync logs"
  ON directory_sync_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.org_id = directory_sync_log.org_id
      AND profiles.role = 'admin'
    )
  );
