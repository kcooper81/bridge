-- Track which email address received the inbound message
-- so admin replies can be sent FROM the same address
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS inbox_email TEXT;
