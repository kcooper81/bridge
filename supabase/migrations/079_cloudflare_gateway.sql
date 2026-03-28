-- Cloudflare Gateway integration fields are stored in organizations.settings JSONB
-- Keys: cloudflare_account_id, cloudflare_api_token, cloudflare_blocked_tools, cloudflare_connected_at
-- No schema change needed — JSONB is flexible
-- This migration is a no-op placeholder for documentation
SELECT 1;
