-- 061_invite_aware_signup.sql
-- Fixes: OAuth signup always created a new personal org even when a pending
-- invite existed, causing invited users to land in the wrong org.
--
-- Now handle_new_user() checks for a pending, non-expired invite matching the
-- new user's email. If exactly ONE is found, the user joins the invited org
-- directly and the invite is marked accepted — all inside the trigger, so it
-- works for every auth method (email, Google, GitHub, etc.).
--
-- If multiple pending invites exist (different orgs), creates a personal org
-- and lets the user choose manually via invite links to avoid ambiguity.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  user_name  TEXT;
  user_email TEXT;
  invite_rec RECORD;
  invite_count INT;
BEGIN
  user_email := COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', '');
  user_name  := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'preferred_username',
    split_part(COALESCE(NEW.email, ''), '@', 1)
  );

  -- ── Count pending invites for this email ──
  SELECT count(*) INTO invite_count
  FROM invites
  WHERE lower(email) = lower(user_email)
    AND status = 'pending'
    AND expires_at > now();

  -- Only auto-accept if exactly ONE pending invite (avoids ambiguity)
  IF invite_count = 1 THEN
    SELECT id, org_id, role, team_id INTO invite_rec
    FROM invites
    WHERE lower(email) = lower(user_email)
      AND status = 'pending'
      AND expires_at > now()
    LIMIT 1;

    -- ── Join the invited org ──
    new_org_id := invite_rec.org_id;

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
      invite_rec.role,
      new_org_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email      = EXCLUDED.email,
      name       = COALESCE(NULLIF(EXCLUDED.name, ''), profiles.name),
      avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), profiles.avatar_url),
      org_id     = new_org_id,
      role       = invite_rec.role;

    -- Mark the invite as accepted
    UPDATE invites
    SET status = 'accepted', accepted_at = now()
    WHERE id = invite_rec.id;

    -- If invite targets a specific team, add the user to it
    IF invite_rec.team_id IS NOT NULL THEN
      INSERT INTO team_members (team_id, user_id, role)
      VALUES (invite_rec.team_id, NEW.id, 'member')
      ON CONFLICT DO NOTHING;
    END IF;

    -- Notify org admins about the new member
    INSERT INTO notifications (user_id, org_id, type, title, message, metadata)
    SELECT p.id, new_org_id, 'member_joined', 'New member joined',
      user_name || ' accepted an invite and joined the organization.',
      jsonb_build_object('member_id', NEW.id, 'member_email', user_email)
    FROM profiles p
    WHERE p.org_id = new_org_id
      AND p.role = 'admin'
      AND p.id != NEW.id;

  ELSE
    -- ── No invite (or multiple ambiguous) — create a personal org ──
    INSERT INTO organizations (name, domain, plan)
    VALUES (
      COALESCE(NULLIF(user_name, ''), 'My Organization') || '''s Org',
      COALESCE(NULLIF(split_part(user_email, '@', 2), ''), ''),
      'free'
    )
    RETURNING id INTO new_org_id;

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
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block auth signup; profile will be created client-side as fallback
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
