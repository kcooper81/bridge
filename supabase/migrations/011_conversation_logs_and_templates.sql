-- 011: Conversation logs for extension audit trail + template support
-- Tracks all AI interactions logged by the Chrome extension

CREATE TABLE IF NOT EXISTS conversation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ai_tool TEXT NOT NULL,               -- 'chatgpt', 'claude', 'gemini', etc.
  prompt_text TEXT NOT NULL,           -- what was sent to the AI tool
  prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,  -- if from vault
  response_text TEXT,                  -- AI response (optional capture)
  guardrail_flags JSONB DEFAULT '[]',  -- any DLP violations detected
  action TEXT NOT NULL DEFAULT 'sent' CHECK (action IN ('sent', 'blocked', 'warned')),
  metadata JSONB DEFAULT '{}',         -- extra context (URL, session info)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversation_logs_org ON conversation_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_user ON conversation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_created ON conversation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_tool ON conversation_logs(ai_tool);

-- RLS
ALTER TABLE conversation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversation_logs_select ON conversation_logs;
DROP POLICY IF EXISTS conversation_logs_insert ON conversation_logs;

-- Admins and managers can view all org logs; members can view their own
CREATE POLICY conversation_logs_select ON conversation_logs
  FOR SELECT USING (
    org_id = get_my_org_id()
    AND (
      get_my_role() IN ('admin', 'manager')
      OR user_id = auth.uid()
    )
  );

-- Any authenticated org member can insert their own logs
CREATE POLICY conversation_logs_insert ON conversation_logs
  FOR INSERT WITH CHECK (
    org_id = get_my_org_id()
    AND user_id = auth.uid()
  );

-- Add is_template flag to prompts for template support
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS is_template BOOLEAN NOT NULL DEFAULT false;

-- Add template_variables as computed hint (stored as JSON array of variable names)
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS template_variables JSONB DEFAULT '[]';
