-- 064_fix_trigger_notification_rollback.sql
-- Fixes: If the notification INSERT in handle_new_user() fails, the entire
-- trigger's DML (profile insert, invite update, team_member insert) gets
-- rolled back by the EXCEPTION handler. The user's auth record is created
-- but no profile exists — causing them to end up in a new personal org
-- instead of the invited one.
--
-- Fix: Wrap non-critical work (notifications) in a nested BEGIN/EXCEPTION
-- block so failures there don't roll back the critical profile + invite work.

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

    -- Notify org admins (non-critical — wrapped so failures don't roll back above)
    BEGIN
      INSERT INTO notifications (user_id, org_id, type, title, message, metadata)
      SELECT p.id, new_org_id, 'member_joined', 'New member joined',
        user_name || ' accepted an invite and joined the organization.',
        jsonb_build_object('member_id', NEW.id, 'member_email', user_email)
      FROM profiles p
      WHERE p.org_id = new_org_id
        AND p.role = 'admin'
        AND p.id != NEW.id;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user notification insert failed for %: %', NEW.id, SQLERRM;
    END;

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
