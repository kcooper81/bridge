-- ============================================
-- 017: Notifications System
-- ============================================

-- Notifications table for in-app alerts
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'security_violation',
    'prompt_submitted',
    'prompt_approved',
    'prompt_rejected',
    'member_joined',
    'member_left',
    'system'
  )),
  title TEXT NOT NULL,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_org_id ON notifications(org_id);

-- RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can insert notifications (for triggers and API)
CREATE POLICY "Service can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (TRUE);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Function to create notifications for org admins/managers on security violations
CREATE OR REPLACE FUNCTION notify_admins_on_security_violation()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
  rule_name TEXT;
  violator_name TEXT;
BEGIN
  -- Get the rule name
  SELECT name INTO rule_name FROM security_rules WHERE id = NEW.rule_id;
  
  -- Get the violator's name
  SELECT COALESCE(name, email) INTO violator_name FROM profiles WHERE id = NEW.user_id;
  
  -- Create notifications for all admins and managers in the org (except the violator)
  FOR admin_record IN
    SELECT id FROM profiles 
    WHERE org_id = NEW.org_id 
    AND role IN ('admin', 'manager')
    AND id != NEW.user_id
  LOOP
    INSERT INTO notifications (user_id, org_id, type, title, message, metadata)
    VALUES (
      admin_record.id,
      NEW.org_id,
      'security_violation',
      'Security Violation Detected',
      format('%s triggered the "%s" policy', violator_name, COALESCE(rule_name, 'Unknown')),
      jsonb_build_object(
        'violation_id', NEW.id,
        'rule_id', NEW.rule_id,
        'rule_name', rule_name,
        'user_id', NEW.user_id,
        'user_name', violator_name,
        'action_taken', NEW.action_taken,
        'matched_text', NEW.matched_text
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create notifications on security violations
DROP TRIGGER IF EXISTS trigger_notify_on_security_violation ON security_violations;
CREATE TRIGGER trigger_notify_on_security_violation
  AFTER INSERT ON security_violations
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_on_security_violation();

-- Function to create notifications for admins when prompts need approval
CREATE OR REPLACE FUNCTION notify_admins_on_prompt_pending()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
  submitter_name TEXT;
BEGIN
  -- Only trigger when status changes to 'pending'
  IF NEW.status = 'pending' AND (OLD IS NULL OR OLD.status != 'pending') THEN
    -- Get the submitter's name
    SELECT COALESCE(name, email) INTO submitter_name FROM profiles WHERE id = NEW.owner_id;
    
    -- Create notifications for all admins and managers in the org
    FOR admin_record IN
      SELECT id FROM profiles 
      WHERE org_id = NEW.org_id 
      AND role IN ('admin', 'manager')
      AND id != NEW.owner_id
    LOOP
      INSERT INTO notifications (user_id, org_id, type, title, message, metadata)
      VALUES (
        admin_record.id,
        NEW.org_id,
        'prompt_submitted',
        'New Prompt Awaiting Approval',
        format('%s submitted "%s" for review', submitter_name, NEW.title),
        jsonb_build_object(
          'prompt_id', NEW.id,
          'prompt_title', NEW.title,
          'submitter_id', NEW.owner_id,
          'submitter_name', submitter_name
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for prompt submissions
DROP TRIGGER IF EXISTS trigger_notify_on_prompt_pending ON prompts;
CREATE TRIGGER trigger_notify_on_prompt_pending
  AFTER INSERT OR UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_on_prompt_pending();

-- Function to notify prompt owner when their prompt is approved/rejected
CREATE OR REPLACE FUNCTION notify_owner_on_prompt_status_change()
RETURNS TRIGGER AS $$
DECLARE
  notification_type TEXT;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  -- Only trigger when status changes from pending to approved/rejected
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    IF NEW.status = 'approved' THEN
      notification_type := 'prompt_approved';
      notification_title := 'Prompt Approved';
      notification_message := format('Your prompt "%s" has been approved', NEW.title);
    ELSE
      notification_type := 'prompt_rejected';
      notification_title := 'Prompt Needs Changes';
      notification_message := format('Your prompt "%s" was not approved. Please review and resubmit.', NEW.title);
    END IF;
    
    INSERT INTO notifications (user_id, org_id, type, title, message, metadata)
    VALUES (
      NEW.owner_id,
      NEW.org_id,
      notification_type,
      notification_title,
      notification_message,
      jsonb_build_object(
        'prompt_id', NEW.id,
        'prompt_title', NEW.title,
        'new_status', NEW.status
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for prompt status changes
DROP TRIGGER IF EXISTS trigger_notify_on_prompt_status_change ON prompts;
CREATE TRIGGER trigger_notify_on_prompt_status_change
  AFTER UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION notify_owner_on_prompt_status_change();

-- Enable realtime for notifications (ignore if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Table already in publication, ignore
END;
$$;
