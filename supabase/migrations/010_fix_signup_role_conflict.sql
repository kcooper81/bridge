-- 010_fix_signup_role_conflict.sql
-- Fixes a bug where the ON CONFLICT path in handle_new_user() did not
-- set role='admin', so users whose profile was created before migration 004
-- (which defaulted role to 'member') kept the old role on conflict.

-- ═══════════════════════════════════════
--  1. FIX THE TRIGGER
-- ═══════════════════════════════════════
-- Add role to the ON CONFLICT SET clause: if the profile had no org yet,
-- it's a fresh signup and should become admin of the new org.

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

  -- Create or update the profile WITH org_id and role set
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
    org_id     = COALESCE(profiles.org_id, new_org_id),
    -- If profile had no org, this is a fresh signup — make them admin
    role       = CASE WHEN profiles.org_id IS NULL THEN 'admin' ELSE profiles.role END;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
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
--  2. BACKFILL: promote org creators stuck as 'member'
-- ═══════════════════════════════════════
-- For each org, the earliest-created profile is the founder.
-- If they're still 'member', promote them to 'admin'.

UPDATE profiles SET role = 'admin'
WHERE id IN (
  SELECT DISTINCT ON (org_id) id
  FROM profiles
  WHERE org_id IS NOT NULL
  ORDER BY org_id, created_at ASC
)
AND role != 'admin';
