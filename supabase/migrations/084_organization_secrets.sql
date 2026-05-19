-- Phase 1 / P0-1: Move org-level secrets out of organizations.settings
-- (which is SELECT-able by every org member via the orgs_select RLS
-- policy) into a dedicated table with no SELECT/INSERT/UPDATE/DELETE
-- policies. Default-deny RLS means only the service-role client can
-- touch it; all reads happen via server-side API routes.
--
-- Today the only secret kept in organizations.settings is the Cloudflare
-- Gateway API token, but the table is designed to be the home for any
-- future org-level credentials (S3 keys, SIEM bearer tokens, etc.).

CREATE TABLE IF NOT EXISTS organization_secrets (
  org_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  cloudflare_account_id TEXT,
  cloudflare_api_token TEXT,
  cloudflare_connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE organization_secrets ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: default-deny. Only service_role bypasses RLS.

-- Migrate existing Cloudflare credentials out of organizations.settings.
INSERT INTO organization_secrets (org_id, cloudflare_account_id, cloudflare_api_token, cloudflare_connected_at)
SELECT
  id,
  NULLIF(settings->>'cloudflare_account_id', ''),
  NULLIF(settings->>'cloudflare_api_token', ''),
  CASE
    WHEN settings->>'cloudflare_connected_at' ~ '^\d{4}-\d{2}-\d{2}'
    THEN (settings->>'cloudflare_connected_at')::timestamptz
    ELSE NULL
  END
FROM organizations
WHERE settings ? 'cloudflare_account_id' OR settings ? 'cloudflare_api_token'
ON CONFLICT (org_id) DO NOTHING;

-- Strip the secret keys from organizations.settings now that they're
-- safely in the locked-down table.
UPDATE organizations
SET settings = settings - 'cloudflare_account_id' - 'cloudflare_api_token' - 'cloudflare_connected_at'
WHERE settings ? 'cloudflare_account_id'
   OR settings ? 'cloudflare_api_token'
   OR settings ? 'cloudflare_connected_at';

-- updated_at trigger
CREATE OR REPLACE FUNCTION trigger_set_updated_at_organization_secrets()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_organization_secrets ON organization_secrets;
CREATE TRIGGER set_updated_at_organization_secrets
  BEFORE UPDATE ON organization_secrets
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at_organization_secrets();
