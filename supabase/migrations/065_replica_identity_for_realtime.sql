-- 065_replica_identity_for_realtime.sql
-- Supabase realtime with row-level filters (e.g. filter: org_id=eq.xxx)
-- requires REPLICA IDENTITY FULL on the table. Without it, the WAL only
-- contains the primary key, so Supabase can't evaluate the filter and
-- silently drops the event. This caused the /team page to never receive
-- realtime updates for profile changes (extension installs, role changes).

ALTER TABLE profiles REPLICA IDENTITY FULL;
ALTER TABLE invites REPLICA IDENTITY FULL;
ALTER TABLE prompts REPLICA IDENTITY FULL;
ALTER TABLE teams REPLICA IDENTITY FULL;
ALTER TABLE team_members REPLICA IDENTITY FULL;
ALTER TABLE standards REPLICA IDENTITY FULL;
ALTER TABLE security_rules REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
