-- Add toggle to disable branded HTML template on per-mailbox basis
-- When false, replies are sent as plain personal-style emails (just text + signature)
ALTER TABLE mailbox_settings
  ADD COLUMN IF NOT EXISTS use_branded_template BOOLEAN DEFAULT true;
