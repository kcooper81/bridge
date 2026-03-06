-- Platform-wide key-value settings (super admin only)
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only super admins can read/write
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage platform settings"
  ON platform_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );
