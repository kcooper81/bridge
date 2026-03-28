-- Add Cloudflare Gateway integration fields to org_settings
ALTER TABLE org_settings
  ADD COLUMN IF NOT EXISTS cloudflare_account_id TEXT,
  ADD COLUMN IF NOT EXISTS cloudflare_api_token TEXT,
  ADD COLUMN IF NOT EXISTS cloudflare_blocked_tools JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS cloudflare_connected_at TIMESTAMPTZ;
