-- Platform-level integrations (super admin, not org-scoped)
CREATE TABLE IF NOT EXISTS platform_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at BIGINT,
  site_url TEXT,
  connected_by UUID REFERENCES auth.users(id),
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  extra JSONB DEFAULT '{}'
);

-- Content pipeline for tracking content ideas and drafts
CREATE TABLE IF NOT EXISTS content_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'blog' CHECK (type IN ('blog', 'linkedin', 'twitter', 'reddit', 'other')),
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'draft', 'review', 'published', 'archived')),
  content TEXT,
  target_keywords TEXT[] DEFAULT '{}',
  source_query TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_pipeline_status ON content_pipeline(status);
CREATE INDEX IF NOT EXISTS idx_content_pipeline_type ON content_pipeline(type);
