-- ============================================================
-- 071: Chat Features - Folders, Tags, Presets, Ratings, System Prompts
-- Idempotent — safe to re-run if partially applied
-- ============================================================

-- 1. Conversation Folders
CREATE TABLE IF NOT EXISTS chat_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_folders_user ON chat_folders(user_id, sort_order);
ALTER TABLE chat_folders ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users manage own folders" ON chat_folders FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add folder_id to conversations
ALTER TABLE chat_conversations ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES chat_folders(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_chat_conversations_folder ON chat_conversations(folder_id);

-- 2. Conversation Tags
CREATE TABLE IF NOT EXISTS chat_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_tags_user ON chat_tags(user_id);
ALTER TABLE chat_tags ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users manage own tags" ON chat_tags FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS chat_conversation_tags (
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES chat_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, tag_id)
);
ALTER TABLE chat_conversation_tags ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users manage own conv tags" ON chat_conversation_tags
    FOR ALL USING (
      EXISTS (SELECT 1 FROM chat_conversations WHERE id = conversation_id AND user_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Conversation Presets
CREATE TABLE IF NOT EXISTS chat_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT,
  first_message TEXT,
  model TEXT,
  provider TEXT,
  icon TEXT DEFAULT 'bot',
  color TEXT DEFAULT '#6366f1',
  is_shared BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_chat_presets_org ON chat_presets(org_id);
ALTER TABLE chat_presets ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users see own + shared presets" ON chat_presets
    FOR SELECT USING (
      created_by = auth.uid() OR
      (is_shared AND org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()))
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Users manage own presets" ON chat_presets
    FOR ALL USING (created_by = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 4. Message Ratings
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS rating SMALLINT CHECK (rating IN (-1, 0, 1)) DEFAULT 0;

-- 5. System prompt stored in org settings (no migration needed — uses organizations.settings JSONB)

-- 6. Full-text search index on chat_messages content
CREATE INDEX IF NOT EXISTS idx_chat_messages_fts ON chat_messages USING gin(to_tsvector('english', content));
