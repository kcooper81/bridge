-- ============================================================
-- 073: Saved Items — save AI outputs, files, links from chat
-- ============================================================

CREATE TABLE IF NOT EXISTS saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text', -- text, code, link, file, product, note
  board TEXT DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  source_message_id TEXT, -- the message ID it was saved from
  metadata JSONB DEFAULT '{}', -- language (for code), url (for links), file info, etc
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_items_user ON saved_items(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_items_org ON saved_items(org_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_board ON saved_items(user_id, board);
CREATE INDEX IF NOT EXISTS idx_saved_items_fts ON saved_items USING gin(to_tsvector('english', title || ' ' || content));

ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users manage own saved items" ON saved_items
    FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
