-- Super admin RLS bypass policies
-- Allows super admins to read/manage all orgs, profiles, and subscriptions

-- Organizations: super admins can read all
CREATE POLICY "Super admins can read all organizations" ON organizations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Organizations: super admins can update any (suspend/unsuspend)
CREATE POLICY "Super admins can update any organization" ON organizations
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Organizations: super admins can delete any
CREATE POLICY "Super admins can delete any organization" ON organizations
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Profiles: super admins can read all
CREATE POLICY "Super admins can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Profiles: super admins can update any (toggle super admin, etc.)
CREATE POLICY "Super admins can update any profile" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Subscriptions: super admins can read all
CREATE POLICY "Super admins can read all subscriptions" ON subscriptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Prompts: super admins can read all (for platform analytics)
CREATE POLICY "Super admins can read all prompts" ON prompts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Invites: super admins can read all
CREATE POLICY "Super admins can read all invites" ON invites
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );
