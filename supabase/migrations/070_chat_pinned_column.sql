-- Add pinned column to chat_conversations if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_conversations' AND column_name = 'pinned'
  ) THEN
    ALTER TABLE chat_conversations ADD COLUMN pinned BOOLEAN DEFAULT FALSE;
  END IF;
END $$;
