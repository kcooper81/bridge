-- Add direction column to feedback for distinguishing inbound vs outbound messages
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS direction TEXT NOT NULL DEFAULT 'inbound';

-- Index for fast filtering
CREATE INDEX IF NOT EXISTS idx_feedback_direction ON feedback(direction);

-- Comment
COMMENT ON COLUMN feedback.direction IS 'inbound = received from user/external, outbound = sent by admin via compose';
