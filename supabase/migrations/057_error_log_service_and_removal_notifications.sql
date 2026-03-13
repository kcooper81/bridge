-- ============================================
-- 057: Error log service tagging + cleanup notifications on member removal
-- ============================================

-- Add service column to error_logs for categorizing by integration
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS service TEXT DEFAULT 'app';

-- Index for filtering by service
CREATE INDEX IF NOT EXISTS idx_error_logs_service ON error_logs(service);

-- Delete org-scoped notifications when a member is removed (org_id set to NULL)
-- This ensures removed members don't see stale notifications from their old org
CREATE OR REPLACE FUNCTION cleanup_notifications_on_member_removal()
RETURNS TRIGGER AS $$
BEGIN
  -- When org_id changes from a value to NULL, the member was removed
  IF OLD.org_id IS NOT NULL AND NEW.org_id IS NULL THEN
    DELETE FROM notifications
    WHERE user_id = NEW.id
      AND org_id = OLD.org_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_cleanup_notifications_on_removal ON profiles;
CREATE TRIGGER trigger_cleanup_notifications_on_removal
  AFTER UPDATE OF org_id ON profiles
  FOR EACH ROW
  WHEN (OLD.org_id IS NOT NULL AND NEW.org_id IS NULL)
  EXECUTE FUNCTION cleanup_notifications_on_member_removal();
