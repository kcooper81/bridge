-- Fix: Super admin RLS policies on `profiles` cause infinite recursion
--
-- Migration 015 added policies like:
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
-- inside SELECT policies on the `profiles` table itself.
-- This triggers the same policies recursively → 500 errors on every profile query.
--
-- Fix: Create a SECURITY DEFINER function (bypasses RLS) for the check,
-- matching the pattern established in 002_fix_rls_recursion.sql.

-- ═══════════════════════════════════════
--  1. Create SECURITY DEFINER helper
-- ═══════════════════════════════════════

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM profiles WHERE id = auth.uid()),
    false
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ═══════════════════════════════════════
--  2. Drop the recursive super admin policies
-- ═══════════════════════════════════════

DROP POLICY IF EXISTS "Super admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Super admins can read all organizations" ON organizations;
DROP POLICY IF EXISTS "Super admins can update any organization" ON organizations;
DROP POLICY IF EXISTS "Super admins can delete any organization" ON organizations;
DROP POLICY IF EXISTS "Super admins can read all subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Super admins can read all prompts" ON prompts;
DROP POLICY IF EXISTS "Super admins can read all invites" ON invites;

-- ═══════════════════════════════════════
--  3. Recreate using the safe helper function
-- ═══════════════════════════════════════

-- Profiles
CREATE POLICY "Super admins can read all profiles" ON profiles
  FOR SELECT USING (is_super_admin());

CREATE POLICY "Super admins can update any profile" ON profiles
  FOR UPDATE USING (is_super_admin());

-- Organizations
CREATE POLICY "Super admins can read all organizations" ON organizations
  FOR SELECT USING (is_super_admin());

CREATE POLICY "Super admins can update any organization" ON organizations
  FOR UPDATE USING (is_super_admin());

CREATE POLICY "Super admins can delete any organization" ON organizations
  FOR DELETE USING (is_super_admin());

-- Subscriptions
CREATE POLICY "Super admins can read all subscriptions" ON subscriptions
  FOR SELECT USING (is_super_admin());

-- Prompts
CREATE POLICY "Super admins can read all prompts" ON prompts
  FOR SELECT USING (is_super_admin());

-- Invites
CREATE POLICY "Super admins can read all invites" ON invites
  FOR SELECT USING (is_super_admin());
