-- Store the raw HTML email body for proper rendering in admin inbox
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS html_body TEXT;

-- Store sender info directly instead of parsing from message body
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS sender_email TEXT;
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS sender_name TEXT;
