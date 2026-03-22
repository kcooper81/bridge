-- Add archived_at column to chat_conversations
ALTER TABLE chat_conversations
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- Index for efficient filtering of archived/non-archived conversations
CREATE INDEX IF NOT EXISTS idx_chat_conversations_archived
  ON chat_conversations (user_id, archived_at)
  WHERE archived_at IS NOT NULL;
