-- Migration 005: Invites table for team invite flow
-- Allows admins/managers to invite users by email

CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invites_org_id ON invites(org_id);
CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);

-- RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Admin and manager can view invites for their org
CREATE POLICY "invites_select" ON invites FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND org_id = invites.org_id
        AND role IN ('admin', 'manager')
    )
  );

-- Admin and manager can insert invites for their org
CREATE POLICY "invites_insert" ON invites FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND org_id = invites.org_id
        AND role IN ('admin', 'manager')
    )
  );

-- Admin can update (revoke) invites for their org
CREATE POLICY "invites_update" ON invites FOR UPDATE
  USING (
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND org_id = invites.org_id
        AND role = 'admin'
    )
  );
