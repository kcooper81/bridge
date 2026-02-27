-- Fix: handle_new_user() always created a new org, even when the profile
-- already existed with an org_id, leaving orphaned organizations.
-- Now checks for existing profile+org first; only creates if needed.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id  UUID;
  existing_org UUID;
  user_name   TEXT;
  user_email  TEXT;
BEGIN
  user_email := COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', '');
  user_name  := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'preferred_username',
    split_part(COALESCE(NEW.email, ''), '@', 1)
  );

  -- Check if a profile already exists with an org
  SELECT org_id INTO existing_org
  FROM profiles
  WHERE id = NEW.id;

  IF existing_org IS NOT NULL THEN
    -- Profile already has an org — just update metadata, don't create a new org
    UPDATE profiles SET
      email      = COALESCE(NULLIF(user_email, ''), email),
      name       = COALESCE(NULLIF(user_name, ''), name),
      avatar_url = COALESCE(
        NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
        NULLIF(NEW.raw_user_meta_data->>'picture', ''),
        avatar_url
      )
    WHERE id = NEW.id;

    RETURN NEW;
  END IF;

  -- No existing org — create a personal org for this user
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
