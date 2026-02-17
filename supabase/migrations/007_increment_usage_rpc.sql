-- RPC function to atomically increment prompt usage count
CREATE OR REPLACE FUNCTION increment_usage_count(prompt_id UUID)
RETURNS VOID AS $$
  UPDATE prompts
  SET usage_count = usage_count + 1,
      last_used_at = NOW()
  WHERE id = prompt_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Clean up legacy 'enterprise' plan from constraint
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_plan_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_plan_check
  CHECK (plan IN ('free', 'pro', 'team', 'business'));
