-- Add Slack as a supported integration provider
ALTER TABLE workspace_integrations DROP CONSTRAINT IF EXISTS workspace_integrations_provider_check;
ALTER TABLE workspace_integrations ADD CONSTRAINT workspace_integrations_provider_check
  CHECK (provider IN ('google_workspace', 'microsoft_entra', 'slack'));

-- Slack notification configuration per org
CREATE TABLE IF NOT EXISTS slack_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  notification_channel_id TEXT,
  notification_channel_name TEXT,
  slack_team_id TEXT,
  slack_team_name TEXT,
  notify_dlp_violations BOOLEAN NOT NULL DEFAULT TRUE,
  notify_prompt_submissions BOOLEAN NOT NULL DEFAULT TRUE,
  notify_weekly_digest BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE slack_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on slack_config"
  ON slack_config FOR ALL
  USING (true)
  WITH CHECK (true);
