-- Phase 3 / P0-7: Domain verification for auto-join.
--
-- Previously, an admin could type any domain (including "gmail.com" or a
-- competitor's) and flip auto-join on with no DNS check. Anyone signing up
-- with that domain silently joined the org — a real account-takeover
-- surface for shared mailbox domains.
--
-- Now: auto-join requires a verified domain. Verification = a TXT record
-- containing a token we generate. Public webmail domains are rejected
-- outright at the API layer; this migration just adds the bookkeeping
-- columns.

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS domain_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS domain_verification_token TEXT;

-- When the domain text changes, the verification stops applying. A trigger
-- clears verified_at and the token; the admin then needs to re-verify.
CREATE OR REPLACE FUNCTION trigger_clear_domain_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.domain IS DISTINCT FROM OLD.domain THEN
    NEW.domain_verified_at = NULL;
    NEW.domain_verification_token = NULL;
    -- Also force auto-join off; admin must re-verify before re-enabling.
    IF NEW.settings ? 'auto_join_domain' THEN
      NEW.settings = jsonb_set(NEW.settings, '{auto_join_domain}', 'false'::jsonb, true);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS clear_domain_verification ON organizations;
CREATE TRIGGER clear_domain_verification
  BEFORE UPDATE OF domain ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_clear_domain_verification();

-- Defense-in-depth: refuse to enable auto_join_domain in the org's settings
-- JSONB unless the domain is verified. This blocks every client path
-- (including future API routes that forget the check) at the DB layer.
CREATE OR REPLACE FUNCTION trigger_block_unverified_auto_join()
RETURNS TRIGGER AS $$
DECLARE
  new_flag BOOLEAN;
  old_flag BOOLEAN;
BEGIN
  new_flag := COALESCE((NEW.settings->>'auto_join_domain')::boolean, false);
  old_flag := COALESCE((OLD.settings->>'auto_join_domain')::boolean, false);

  -- Only enforce when flipping OFF -> ON.
  IF new_flag AND NOT old_flag THEN
    IF NEW.domain IS NULL OR length(trim(NEW.domain)) = 0 THEN
      RAISE EXCEPTION 'auto_join_domain requires a domain on the organization';
    END IF;
    IF NEW.domain_verified_at IS NULL THEN
      RAISE EXCEPTION 'auto_join_domain requires the domain to be verified first';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS block_unverified_auto_join ON organizations;
CREATE TRIGGER block_unverified_auto_join
  BEFORE UPDATE OF settings, domain ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_block_unverified_auto_join();
