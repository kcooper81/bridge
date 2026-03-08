-- Dynamic blog posts (generated + manually created from admin panel)
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  published_at DATE,
  author_name TEXT NOT NULL DEFAULT 'TeamPrompt Team',
  author_role TEXT NOT NULL DEFAULT 'Product',
  category TEXT NOT NULL DEFAULT 'guide',
  tags TEXT[] DEFAULT '{}',
  reading_time TEXT NOT NULL DEFAULT '5 min read',
  cover_image TEXT,
  cover_image_alt TEXT DEFAULT '',
  related_slugs TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  pipeline_id UUID REFERENCES content_pipeline(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_pipeline ON blog_posts(pipeline_id);
