-- Enable Supabase Realtime on feedback and ticket_notes tables
-- Required for: admin nav badge live updates, tickets page auto-refresh

-- Set replica identity to full so Realtime sends complete row data
ALTER TABLE feedback REPLICA IDENTITY FULL;
ALTER TABLE ticket_notes REPLICA IDENTITY FULL;
ALTER TABLE error_logs REPLICA IDENTITY FULL;

-- Add tables to the Realtime publication
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE feedback;
EXCEPTION WHEN duplicate_object THEN
  NULL; -- Already in publication
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE ticket_notes;
EXCEPTION WHEN duplicate_object THEN
  NULL; -- Already in publication
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE error_logs;
EXCEPTION WHEN duplicate_object THEN
  NULL; -- Already in publication
END $$;
