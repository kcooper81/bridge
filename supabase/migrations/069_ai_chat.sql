-- AI Provider API keys (encrypted, per-org)
CREATE TABLE IF NOT EXISTS ai_provider_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google')),
  encrypted_api_key TEXT NOT NULL,
  model_whitelist TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, provider)
);

ALTER TABLE ai_provider_keys ENABLE ROW LEVEL SECURITY;

-- Chat conversations
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New conversation',
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id, updated_at DESC);
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model TEXT,
  tokens_used INTEGER DEFAULT 0,
  dlp_action TEXT,
  dlp_violations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id, created_at);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
