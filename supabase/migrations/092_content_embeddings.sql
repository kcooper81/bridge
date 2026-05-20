-- Phase F: AI-driven internal linking via embeddings.
--
-- Stores a single text-embedding-3-small vector per indexable content
-- piece (blog post, /solutions/* entry, OWASP hub, tool page). The
-- weekly cron recomputes embeddings for any content whose updated_at
-- has changed since the last run. The blog/[slug] and /solutions/[slug]
-- renderers query for top-N most similar OTHER pieces to populate a
-- "Related" section.
--
-- We use the `text` type rather than pgvector because:
-- (a) pgvector requires the extension to be enabled on the project,
-- (b) the catalog is small enough (~80 pieces) that cosine similarity
--     in app code is fast and avoids the extension dependency.

CREATE TABLE IF NOT EXISTS content_embeddings (
  slug TEXT PRIMARY KEY,
  kind TEXT NOT NULL,                  -- 'blog' | 'solutions' | 'security' | 'tool' | 'about'
  title TEXT NOT NULL,
  description TEXT,
  embedding JSONB NOT NULL,            -- array of 1536 floats from text-embedding-3-small
  source_hash TEXT NOT NULL,           -- sha256 of the source text so we know when to recompute
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_embeddings_kind ON content_embeddings (kind);

ALTER TABLE content_embeddings ENABLE ROW LEVEL SECURITY;

-- Public read: the renderers need this to show related links to any
-- visitor. The data is non-sensitive (titles, descriptions, similarity)
-- so all reads are allowed. Inserts/updates/deletes are service-role only.
DROP POLICY IF EXISTS content_embeddings_select ON content_embeddings;
CREATE POLICY content_embeddings_select ON content_embeddings
  FOR SELECT
  USING (true);
