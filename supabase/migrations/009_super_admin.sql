-- Add super_admin flag to profiles (platform-level, not org-level)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT false;

-- Set the platform owner
UPDATE profiles SET is_super_admin = true
WHERE email = 'admin@teamprompt.app';
