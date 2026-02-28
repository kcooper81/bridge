-- Workspace directory integrations (Google Workspace, Microsoft Entra, etc.)
CREATE TABLE IF NOT EXISTS workspace_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google_workspace', 'microsoft_entra')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  admin_email TEXT,
  connected_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ,
  UNIQUE(org_id, provider)
);

-- Enable RLS but no SELECT policy — all access is via service role
ALTER TABLE workspace_integrations ENABLE ROW LEVEL SECURITY;
