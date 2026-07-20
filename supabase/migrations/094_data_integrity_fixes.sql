-- Data-integrity + reliability fixes (2026-07-19)
--
-- Bundles several fixes surfaced by a full-codebase review. Every statement is
-- idempotent and safe to re-run.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Org-scope the prompt usage-count RPC.
--
-- The old one-arg increment_usage_count(uuid) did `UPDATE prompts ... WHERE
-- id = prompt_id` with no org predicate, so /api/extension/log could bump
-- another org's prompt usage_count/last_used_at by passing an arbitrary id.
-- Replace it with a two-arg version scoped by org and drop the old signature.
-- (Both callers — extension/log and vault-api — now pass p_org_id.)
-- ─────────────────────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS increment_usage_count(UUID);

CREATE OR REPLACE FUNCTION increment_usage_count(p_prompt_id UUID, p_org_id UUID)
RETURNS VOID AS $$
  UPDATE prompts
  SET usage_count = usage_count + 1,
      last_used_at = NOW()
  WHERE id = p_prompt_id
    AND org_id = p_org_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Atomic campaign-counter RPC.
--
-- The app calls increment_campaign_counter(campaign_id, counter_column) in two
-- places, but the function was never defined in any migration — so the atomic
-- path always failed and silently fell back to a racy read-modify-write that
-- loses events under a campaign blast. Define it with a column whitelist
-- (dynamic SQL + a fixed allowlist prevents injection via counter_column).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_campaign_counter(campaign_id UUID, counter_column TEXT)
RETURNS VOID AS $$
BEGIN
  IF counter_column NOT IN ('opens', 'clicks', 'bounces', 'complaints', 'unsubscribes') THEN
    RAISE EXCEPTION 'invalid counter_column: %', counter_column;
  END IF;
  EXECUTE format(
    'UPDATE email_campaigns SET %I = COALESCE(%I, 0) + 1, updated_at = NOW() WHERE id = $1',
    counter_column, counter_column
  ) USING campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Fix NOT NULL + ON DELETE SET NULL conflict that blocks account deletion.
--
-- Migration 062 changed these FKs to ON DELETE SET NULL so a profile could be
-- deleted without blocking — but the columns are still NOT NULL, so the SET
-- NULL cascade violates the constraint and the delete FAILS. Drop NOT NULL so
-- the intended behaviour works (this is what unblocks GDPR/erasure deletes).
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE template_packs ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE rule_suggestions ALTER COLUMN suggested_by DROP NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Guard notification triggers so a notification failure can't roll back the
--    audited event.
--
-- These AFTER-INSERT/UPDATE triggers run in the same transaction as the
-- security-violation / prompt write. An unguarded failure in the notifications
-- INSERT (e.g. a future CHECK/NOT NULL) rolls back the DLP violation or the
-- prompt write itself. Wrap each INSERT body in a nested exception block —
-- the same fix migration 064 applied to handle_new_user.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_admins_on_security_violation()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
  rule_name TEXT;
  violator_name TEXT;
BEGIN
  BEGIN
    SELECT name INTO rule_name FROM security_rules WHERE id = NEW.rule_id;
    SELECT COALESCE(name, email) INTO violator_name FROM profiles WHERE id = NEW.user_id;
    FOR admin_record IN
      SELECT id FROM profiles
      WHERE org_id = NEW.org_id
        AND role IN ('admin', 'manager')
        AND id != NEW.user_id
    LOOP
      INSERT INTO notifications (user_id, org_id, type, title, message, metadata)
      VALUES (
        admin_record.id, NEW.org_id, 'security_violation', 'Security Violation Detected',
        format('%s triggered the "%s" policy', violator_name, COALESCE(rule_name, 'Unknown')),
        jsonb_build_object(
          'violation_id', NEW.id, 'rule_id', NEW.rule_id, 'rule_name', rule_name,
          'user_id', NEW.user_id, 'user_name', violator_name,
          'action_taken', NEW.action_taken, 'matched_text', NEW.matched_text
        )
      );
    END LOOP;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'notify_admins_on_security_violation failed for %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_admins_on_prompt_pending()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
  submitter_name TEXT;
BEGIN
  IF NEW.status = 'pending' AND (OLD IS NULL OR OLD.status != 'pending') THEN
    BEGIN
      SELECT COALESCE(name, email) INTO submitter_name FROM profiles WHERE id = NEW.owner_id;
      FOR admin_record IN
        SELECT id FROM profiles
        WHERE org_id = NEW.org_id
          AND role IN ('admin', 'manager')
          AND id != NEW.owner_id
      LOOP
        INSERT INTO notifications (user_id, org_id, type, title, message, metadata)
        VALUES (
          admin_record.id, NEW.org_id, 'prompt_submitted', 'New Prompt Awaiting Approval',
          format('%s submitted "%s" for review', submitter_name, NEW.title),
          jsonb_build_object(
            'prompt_id', NEW.id, 'prompt_title', NEW.title,
            'submitter_id', NEW.owner_id, 'submitter_name', submitter_name
          )
        );
      END LOOP;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'notify_admins_on_prompt_pending failed for %: %', NEW.id, SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_owner_on_prompt_status_change()
RETURNS TRIGGER AS $$
DECLARE
  notification_type TEXT;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
    BEGIN
      IF NEW.status = 'approved' THEN
        notification_type := 'prompt_approved';
        notification_title := 'Prompt Approved';
        notification_message := format('Your prompt "%s" has been approved', NEW.title);
      ELSE
        notification_type := 'prompt_rejected';
        notification_title := 'Prompt Needs Changes';
        notification_message := format('Your prompt "%s" was not approved. Please review and resubmit.', NEW.title);
      END IF;
      INSERT INTO notifications (user_id, org_id, type, title, message, metadata)
      VALUES (
        NEW.owner_id, NEW.org_id, notification_type, notification_title, notification_message,
        jsonb_build_object('prompt_id', NEW.id, 'prompt_title', NEW.title, 'new_status', NEW.status)
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'notify_owner_on_prompt_status_change failed for %: %', NEW.id, SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Missing indexes on hot per-user/per-org filter columns of high-volume
--    tables (per-actor audit views, org analytics). All IF NOT EXISTS.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_security_violations_user ON security_violations(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_org ON chat_conversations(org_id);
CREATE INDEX IF NOT EXISTS idx_feedback_org ON feedback(org_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_org ON error_logs(org_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Prevent duplicate pending invites at the DB level (defends the
--    check-then-insert race in /api/invite/send and /bulk). A second concurrent
--    insert for the same org+email now fails cleanly instead of creating a
--    duplicate pending invite + double email.
-- ─────────────────────────────────────────────────────────────────────────────
-- First collapse any pre-existing duplicate pending invites (keep the newest),
-- otherwise the unique index below would fail to build and block the deploy.
UPDATE invites i
SET status = 'expired'
WHERE status = 'pending'
  AND EXISTS (
    SELECT 1 FROM invites j
    WHERE j.org_id = i.org_id
      AND lower(j.email) = lower(i.email)
      AND j.status = 'pending'
      AND (j.created_at > i.created_at OR (j.created_at = i.created_at AND j.id > i.id))
  );

CREATE UNIQUE INDEX IF NOT EXISTS uniq_pending_invite_per_email
  ON invites (org_id, lower(email))
  WHERE status = 'pending';
