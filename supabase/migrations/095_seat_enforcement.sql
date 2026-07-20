-- Seat enforcement + org invariants (2026-07-20)
--
-- Fixes an active revenue leak and a complete bypass of the member cap:
--
--  * On cancel/downgrade the Stripe webhook only rewrote `subscriptions` and
--    `organizations.plan`. Nothing enforced max_members at runtime, so an org
--    could buy Team (50 seats), invite 50 people, cancel, and keep all 50 on
--    the Free plan (cap 3) indefinitely.
--  * handle_new_user() joins an invited org with NO member-limit check, inside
--    the auth.users transaction. That made every app-layer seat check in
--    invite/accept and org/ensure unreachable for the signup path.
--  * All join paths and last-admin guards were check-then-write over separate
--    HTTP round-trips, with no transaction or lock anywhere.
--
-- Everything below is idempotent.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Grace window for orgs that land over their plan's member cap.
--    Set by the Stripe webhook on downgrade/cancel; read by the app to decide
--    when seat enforcement starts biting.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS plan_grace_until TIMESTAMPTZ;

COMMENT ON COLUMN organizations.plan_grace_until IS
  'When an org drops to a plan whose max_members is below its headcount, this is set to now()+14d. Until it passes, over-limit members keep access. See src/lib/billing/seats.ts.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Member-cap trigger — the cap becomes unbypassable.
--
--    Runs inside the caller's transaction, so the count and the write are
--    finally atomic. This single trigger covers all six join paths AND
--    handle_new_user() AND any direct SQL / future code path.
--
--    Deliberately only fires when a row is joining or switching orgs, so
--    ordinary profile updates are untouched, and it blocks GROWTH only —
--    orgs already over their cap (post-downgrade) are grandfathered and
--    handled by the application's seat-entitlement gate instead.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION enforce_org_member_limit()
RETURNS TRIGGER AS $$
DECLARE
  org_plan        TEXT;
  cap             INT;
  current_members INT;
BEGIN
  -- Leaving an org (org_id -> NULL) is always allowed.
  IF NEW.org_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Only act when the org actually changes; ignore unrelated column updates.
  IF TG_OP = 'UPDATE' AND NEW.org_id IS NOT DISTINCT FROM OLD.org_id THEN
    RETURN NEW;
  END IF;

  SELECT o.plan INTO org_plan FROM organizations o WHERE o.id = NEW.org_id;
  IF org_plan IS NULL THEN
    RETURN NEW;  -- org row not visible/created yet; nothing to enforce against
  END IF;

  SELECT pl.max_members INTO cap FROM plan_limits pl WHERE pl.plan = org_plan;
  IF cap IS NULL OR cap = -1 THEN
    RETURN NEW;  -- unknown or unlimited plan
  END IF;

  -- Exclude this row so upserts/re-joins don't double-count themselves.
  SELECT count(*) INTO current_members
  FROM profiles p
  WHERE p.org_id = NEW.org_id
    AND p.id <> NEW.id;

  IF current_members >= cap THEN
    RAISE EXCEPTION
      'ORG_MEMBER_LIMIT: organization % is at its plan limit of % member(s)',
      NEW.org_id, cap
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_org_member_limit ON profiles;
CREATE TRIGGER trg_enforce_org_member_limit
  BEFORE INSERT OR UPDATE OF org_id ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION enforce_org_member_limit();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Last-admin trigger — an org can never be left with zero admins.
--
--    Covers org/members (PATCH + DELETE), account/leave-org, account/delete,
--    and integrations/deprovision — the last of which has no app-level guard
--    at all today and can silently orphan an org.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION enforce_last_admin()
RETURNS TRIGGER AS $$
DECLARE
  old_org           UUID;
  remaining_admins  INT;
  remaining_members INT;
BEGIN
  old_org := OLD.org_id;

  -- Not in an org, or wasn't an admin -> nothing to protect.
  IF old_org IS NULL OR OLD.role <> 'admin' THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;

  -- Still an admin of the same org afterwards -> no-op.
  IF TG_OP = 'UPDATE'
     AND NEW.org_id IS NOT DISTINCT FROM OLD.org_id
     AND NEW.role = 'admin' THEN
    RETURN NEW;
  END IF;

  -- If the organization itself is being deleted, its profiles cascade away;
  -- don't block that teardown.
  IF NOT EXISTS (SELECT 1 FROM organizations WHERE id = old_org) THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;

  SELECT count(*) INTO remaining_admins
  FROM profiles WHERE org_id = old_org AND role = 'admin' AND id <> OLD.id;

  SELECT count(*) INTO remaining_members
  FROM profiles WHERE org_id = old_org AND id <> OLD.id;

  IF remaining_admins = 0 AND remaining_members > 0 THEN
    RAISE EXCEPTION
      'LAST_ADMIN: cannot remove or demote the last admin of organization % while % member(s) remain',
      old_org, remaining_members
      USING ERRCODE = 'check_violation';
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_last_admin ON profiles;
CREATE TRIGGER trg_enforce_last_admin
  BEFORE UPDATE OR DELETE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION enforce_last_admin();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Make handle_new_user() capacity-aware.
--
--    Without this, a signup against an invite to a FULL org would hit the new
--    member-cap trigger, and the function's outer `EXCEPTION WHEN OTHERS`
--    would swallow it — creating an auth user with no profile (an orphan that
--    /api/org/ensure then also can't fix, because it hits the same cap).
--
--    Instead: check capacity up front. If the invited org is full, fall
--    through to creating a personal org and LEAVE THE INVITE PENDING, so the
--    admin can free a seat and the user can accept it later. The user always
--    ends up with a working account.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id   UUID;
  user_name    TEXT;
  user_email   TEXT;
  invite_rec   RECORD;
  invite_count INT;
  invite_plan  TEXT;
  invite_cap   INT;
  invite_members INT;
  can_join     BOOLEAN := FALSE;
BEGIN
  user_email := COALESCE(NEW.email, NEW.raw_user_meta_data->>'email', '');
  user_name  := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'preferred_username',
    split_part(COALESCE(NEW.email, ''), '@', 1)
  );

  SELECT count(*) INTO invite_count
  FROM invites
  WHERE lower(email) = lower(user_email)
    AND status = 'pending'
    AND expires_at > now();

  IF invite_count = 1 THEN
    SELECT id, org_id, role, team_id INTO invite_rec
    FROM invites
    WHERE lower(email) = lower(user_email)
      AND status = 'pending'
      AND expires_at > now()
    LIMIT 1;

    -- ── Capacity check before joining ──
    SELECT o.plan INTO invite_plan FROM organizations o WHERE o.id = invite_rec.org_id;
    SELECT pl.max_members INTO invite_cap FROM plan_limits pl WHERE pl.plan = invite_plan;
    SELECT count(*) INTO invite_members FROM profiles WHERE org_id = invite_rec.org_id;

    can_join := (invite_cap IS NULL) OR (invite_cap = -1) OR (invite_members < invite_cap);

    IF NOT can_join THEN
      RAISE WARNING 'handle_new_user: org % is full (% / %), leaving invite pending for %',
        invite_rec.org_id, invite_members, invite_cap, user_email;
    END IF;
  END IF;

  IF invite_count = 1 AND can_join THEN
    new_org_id := invite_rec.org_id;

    INSERT INTO profiles (id, email, name, avatar_url, role, org_id)
    VALUES (
      NEW.id,
      user_email,
      user_name,
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
      invite_rec.role,
      new_org_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email      = EXCLUDED.email,
      name       = COALESCE(NULLIF(EXCLUDED.name, ''), profiles.name),
      avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), profiles.avatar_url),
      org_id     = new_org_id,
      role       = invite_rec.role;

    UPDATE invites
    SET status = 'accepted', accepted_at = now()
    WHERE id = invite_rec.id;

    IF invite_rec.team_id IS NOT NULL THEN
      INSERT INTO team_members (team_id, user_id, role)
      VALUES (invite_rec.team_id, NEW.id, 'member')
      ON CONFLICT DO NOTHING;
    END IF;

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
    -- No invite, ambiguous invites, or the invited org is full -> personal org.
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
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
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
