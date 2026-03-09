-- Enable RLS on platform-level tables that were missing it.
-- These tables are admin-only; public reads go through API routes.

-- ─── blog_posts ───
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts (public blog)
CREATE POLICY blog_posts_public_read ON blog_posts
  FOR SELECT USING (status = 'published');

-- Super admins can do everything
CREATE POLICY blog_posts_admin_all ON blog_posts
  FOR ALL USING (is_super_admin());

-- ─── content_pipeline ───
ALTER TABLE content_pipeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY content_pipeline_admin_all ON content_pipeline
  FOR ALL USING (is_super_admin());

-- ─── platform_integrations ───
ALTER TABLE platform_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY platform_integrations_admin_all ON platform_integrations
  FOR ALL USING (is_super_admin());
