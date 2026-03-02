-- Add super_admin_role column to profiles table
-- Values: 'super_admin', 'support', or NULL (regular user)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS super_admin_role TEXT DEFAULT NULL;
