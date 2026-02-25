-- Add extension_status column to profiles for tracking protection coverage
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS extension_status text DEFAULT 'unknown';

-- Index for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_extension_status
  ON profiles(extension_status);
