-- Add extension_inactive notification type
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'security_violation',
    'prompt_submitted',
    'prompt_approved',
    'prompt_rejected',
    'member_joined',
    'member_left',
    'system',
    'extension_inactive'
  ));

-- Track how members were added (manual invite, bulk import, google sync)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invite_source TEXT NOT NULL DEFAULT 'manual';

-- Track last time we sent an extension-inactive alert for this user (avoid spam)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS extension_alert_sent_at TIMESTAMPTZ;
