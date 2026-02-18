-- Prompt ratings table: allows users to rate prompts 1-5 stars
CREATE TABLE IF NOT EXISTS prompt_ratings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id uuid REFERENCES prompts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE (prompt_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_prompt_ratings_prompt ON prompt_ratings(prompt_id);

-- RLS policies
ALTER TABLE prompt_ratings ENABLE ROW LEVEL SECURITY;

-- Users can read ratings for prompts in their org
CREATE POLICY "Users can read ratings for their org prompts"
  ON prompt_ratings FOR SELECT
  USING (
    prompt_id IN (
      SELECT id FROM prompts WHERE org_id = (
        SELECT org_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Users can insert/update their own ratings
CREATE POLICY "Users can rate prompts"
  ON prompt_ratings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own ratings"
  ON prompt_ratings FOR UPDATE
  USING (user_id = auth.uid());
