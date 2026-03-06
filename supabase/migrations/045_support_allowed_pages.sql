-- Configurable page access for support staff
-- Stores which admin pages a support user can access (null = default: tickets + testing guide)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS support_allowed_pages TEXT[] DEFAULT NULL;
