-- Phase E: LLM citation tracking — measure whether TeamPrompt appears in
-- AI Overview / ChatGPT / Perplexity / Gemini answers for our top target
-- queries. Required to instrument every other SEO move we're making
-- (ski-ramp tldr, FAQ schema, internal linking, etc.).
--
-- This is platform-level infra, not per-tenant — the table exists in the
-- public schema but reads are gated to super_admins via RLS. Inserts come
-- exclusively from the Monday cron via service role.

CREATE TABLE IF NOT EXISTS llm_citation_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  provider TEXT NOT NULL,                -- 'perplexity' | 'openai' | 'anthropic' | 'gemini'
  cited BOOLEAN NOT NULL,                -- did teamprompt.app appear in citations?
  citation_url TEXT,                     -- canonical URL of our cited page if any
  citation_rank INTEGER,                 -- 1-based position among citations
  mentioned_in_answer BOOLEAN DEFAULT false,  -- "TeamPrompt" mentioned in answer text even if not formally cited
  answer_snippet TEXT,                   -- first ~400 chars of the model's answer for context
  source_urls TEXT[],                    -- all citation URLs returned (for trend analysis)
  raw_response JSONB,                    -- full provider response — diagnostics only
  error TEXT,                            -- non-null when the check failed
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_llm_citation_checks_query_time
  ON llm_citation_checks (query, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_llm_citation_checks_provider_time
  ON llm_citation_checks (provider, checked_at DESC);

ALTER TABLE llm_citation_checks ENABLE ROW LEVEL SECURITY;

-- Read access: super admins only (this is platform-internal SEO data).
DROP POLICY IF EXISTS llm_citation_checks_select ON llm_citation_checks;
CREATE POLICY llm_citation_checks_select ON llm_citation_checks
  FOR SELECT
  USING (is_super_admin());

-- No insert/update/delete policies — service-role only via the cron.
