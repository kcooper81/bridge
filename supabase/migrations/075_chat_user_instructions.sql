-- Per-user custom instructions for AI chat
CREATE TABLE IF NOT EXISTS chat_user_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role_description TEXT DEFAULT '',
  tone TEXT DEFAULT '',
  expertise_level TEXT DEFAULT '',
  custom_context TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, org_id)
);
CREATE INDEX IF NOT EXISTS idx_chat_user_instructions_user ON chat_user_instructions(user_id);
