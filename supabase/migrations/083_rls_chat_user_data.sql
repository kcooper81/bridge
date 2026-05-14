-- 083: Enable RLS on per-user chat tables that were created without it
-- Both tables contain per-user data keyed by user_id; restrict to row owner.
-- Idempotent: ENABLE RLS is no-op if already enabled, policies guarded by DO blocks.

ALTER TABLE chat_user_instructions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users manage own chat instructions" ON chat_user_instructions
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE chat_user_memory ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users manage own chat memory" ON chat_user_memory
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
