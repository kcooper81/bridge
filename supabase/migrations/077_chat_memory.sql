-- Per-user persistent memory for AI chat (ChatGPT-style fact extraction)
CREATE TABLE IF NOT EXISTS chat_user_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  fact TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  source_conversation_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  dlp_status TEXT DEFAULT 'clean',
  dlp_flags JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_memory_user ON chat_user_memory(user_id, org_id);
CREATE INDEX IF NOT EXISTS idx_chat_memory_active ON chat_user_memory(user_id, is_active);
