-- Fix missing columns and objects found during schema audit

-- 1. profiles.shield_disabled (migration 024 was broken)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shield_disabled BOOLEAN NOT NULL DEFAULT false;

-- 2. conversation_logs.source (MCP server writes this but column was never created)
ALTER TABLE conversation_logs ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'extension';

-- 3. conversation_logs.prompt_text — relax NOT NULL to allow empty string default
-- Some code paths (chat/route, chat/upload, mcp/server) insert without prompt_text
ALTER TABLE conversation_logs ALTER COLUMN prompt_text SET DEFAULT '';
ALTER TABLE conversation_logs ALTER COLUMN prompt_text DROP NOT NULL;

-- 3b. conversation_logs.user_id — allow NULL for system/MCP inserts
ALTER TABLE conversation_logs ALTER COLUMN user_id DROP NOT NULL;

-- 4. conversation_logs.action — expand CHECK constraint to include 'used' for MCP
-- Drop the old constraint if it exists and recreate with expanded values
DO $$
BEGIN
  -- Try to drop existing check constraint (name may vary)
  ALTER TABLE conversation_logs DROP CONSTRAINT IF EXISTS conversation_logs_action_check;
  ALTER TABLE conversation_logs ADD CONSTRAINT conversation_logs_action_check
    CHECK (action IN ('sent', 'blocked', 'warned', 'used'));
EXCEPTION WHEN OTHERS THEN
  -- Constraint may not exist or have a different name, that's fine
  NULL;
END $$;

-- 5. org_members view (referenced in campaign send/audience code)
CREATE OR REPLACE VIEW org_members AS
SELECT id AS user_id, org_id, email, name, role
FROM profiles
WHERE org_id IS NOT NULL;
