-- 004_fix_signup_and_roles.sql
-- Fixes the signup-to-org flow so new users get an org atomically,
-- backfills orphaned profiles, and aligns the plan CHECK constraint.

-- ═══════════════════════════════════════
--  1. REWRITE handle_new_user() TRIGGER
-- ═══════════════════════════════════════
-- The old trigger created a profile WITHOUT an org_id, causing 403s on
-- every RLS-gated query (get_my_org_id() returned NULL).
-- This version atomically: creates an org → creates/updates the profile
-- with that org_id → assigns role='admin' (first user is always admin).

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  user_name  TEXT;
  user_email TEXT;
BEGIN
  user_email := COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', '');
  user_name  := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'preferred_username',
    split_part(COALESCE(NEW.email, ''), '@', 1)
  );

  -- Create a personal org for this user
  INSERT INTO organizations (name, domain, plan)
  VALUES (
    COALESCE(NULLIF(user_name, ''), 'My Organization') || '''s Org',
    COALESCE(NULLIF(split_part(user_email, '@', 2), ''), ''),
    'free'
  )
  RETURNING id INTO new_org_id;

  -- Create or update the profile WITH org_id set
  INSERT INTO profiles (id, email, name, avatar_url, role, org_id)
  VALUES (
    NEW.id,
    user_email,
    user_name,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      ''
    ),
    'admin',
    new_org_id
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    name       = COALESCE(NULLIF(EXCLUDED.name, ''), profiles.name),
    avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), profiles.avatar_url),
    org_id     = COALESCE(profiles.org_id, new_org_id);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block auth signup; profile will be created client-side as fallback
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ═══════════════════════════════════════
--  2. BACKFILL ORPHANED PROFILES
-- ═══════════════════════════════════════
-- Any existing profiles with org_id = NULL get a new org created and linked.

DO $$
DECLARE
  rec RECORD;
  new_org_id UUID;
BEGIN
  FOR rec IN SELECT id, email, name FROM profiles WHERE org_id IS NULL
  LOOP
    INSERT INTO organizations (name, domain, plan)
    VALUES (
      COALESCE(NULLIF(rec.name, ''), 'My Organization') || '''s Org',
      COALESCE(NULLIF(split_part(rec.email, '@', 2), ''), ''),
      'free'
    )
    RETURNING id INTO new_org_id;

    UPDATE profiles SET org_id = new_org_id, role = 'admin' WHERE id = rec.id;
  END LOOP;
END $$;


-- ═══════════════════════════════════════
--  3. ALIGN PLAN CHECK CONSTRAINT
-- ═══════════════════════════════════════
-- The subscriptions table and Stripe pricing use 'team' and 'business',
-- but the organizations table only allowed 'free','pro','enterprise'.

ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_plan_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_plan_check
  CHECK (plan IN ('free', 'pro', 'team', 'business', 'enterprise'));
