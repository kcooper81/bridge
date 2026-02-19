-- Admin panel tables: feedback, error_logs, activity_logs
-- Also adds is_suspended to organizations

-- Ensure profiles table has is_super_admin (should already exist from 009)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Set admin@teamprompt.app as super admin
UPDATE profiles SET is_super_admin = TRUE WHERE email = 'admin@teamprompt.app';

-- Add is_suspended to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;

-- Feedback/Tickets table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  org_id UUID REFERENCES organizations(id),
  type TEXT NOT NULL DEFAULT 'feedback',  -- 'feedback', 'bug', 'feature'
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',  -- 'new', 'in_progress', 'resolved', 'closed'
  priority TEXT DEFAULT 'normal',  -- 'low', 'normal', 'high', 'urgent'
  assigned_to UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Error logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  stack TEXT,
  user_id UUID REFERENCES profiles(id),
  org_id UUID REFERENCES organizations(id),
  url TEXT,
  user_agent TEXT,
  metadata JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity/Audit logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_org_id ON activity_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- RLS policies
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Super admins can read all feedback
CREATE POLICY "Super admins can read all feedback" ON feedback
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Super admins can update feedback
CREATE POLICY "Super admins can update feedback" ON feedback
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Users can insert their own feedback
CREATE POLICY "Users can insert own feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Super admins can read all error_logs
CREATE POLICY "Super admins can read all error_logs" ON error_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Super admins can update error_logs
CREATE POLICY "Super admins can update error_logs" ON error_logs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Anyone can insert error_logs (for client-side error reporting)
CREATE POLICY "Authenticated users can insert error_logs" ON error_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Super admins can read all activity_logs
CREATE POLICY "Super admins can read all activity_logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_super_admin = true)
  );

-- Org admins can read their own org's activity_logs
CREATE POLICY "Org members can read own activity_logs" ON activity_logs
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid())
  );

-- Authenticated users can insert activity_logs
CREATE POLICY "Authenticated users can insert activity_logs" ON activity_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
