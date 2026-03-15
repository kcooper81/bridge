-- 060: Add risk_score to conversation_logs for prompt risk scoring

ALTER TABLE conversation_logs ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0;

-- Index for analytics queries on risk score
CREATE INDEX IF NOT EXISTS idx_conversation_logs_risk_score ON conversation_logs(risk_score);
