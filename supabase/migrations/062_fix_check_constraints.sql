-- 062_fix_check_constraints.sql
-- Fixes CHECK constraints out of sync with TypeScript types, and
-- fixes NO ACTION foreign keys on profiles.id that block account deletion.

-- 1. subscriptions.plan: add 'business' (matches organizations.plan and PlanTier type)
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'pro', 'team', 'business'));

-- 2. subscriptions.status: add 'paused' (matches SubscriptionStatus type)
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'paused'));

-- 3. security_rules.pattern_type: add 'keywords' (matches SecurityPatternType type)
ALTER TABLE security_rules DROP CONSTRAINT IF EXISTS security_rules_pattern_type_check;
ALTER TABLE security_rules ADD CONSTRAINT security_rules_pattern_type_check
  CHECK (pattern_type IN ('exact', 'regex', 'glob', 'keywords'));

-- 4. suggested_rules.pattern_type: same fix for consistency
ALTER TABLE suggested_rules DROP CONSTRAINT IF EXISTS suggested_rules_pattern_type_check;
ALTER TABLE suggested_rules ADD CONSTRAINT suggested_rules_pattern_type_check
  CHECK (pattern_type IN ('exact', 'regex', 'glob', 'keywords'));

-- ═══════════════════════════════════════
--  FIX: NO ACTION FKs on profiles.id that block account deletion
-- ═══════════════════════════════════════
-- These FKs use NO ACTION, meaning deleting a profile row will fail if
-- any of these tables reference it. Change to SET NULL so deletion
-- succeeds and we preserve the audit trail with user_id = NULL.

-- activity_logs.user_id
ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- error_logs.user_id
ALTER TABLE error_logs DROP CONSTRAINT IF EXISTS error_logs_user_id_fkey;
ALTER TABLE error_logs ADD CONSTRAINT error_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- error_logs.resolved_by
ALTER TABLE error_logs DROP CONSTRAINT IF EXISTS error_logs_resolved_by_fkey;
ALTER TABLE error_logs ADD CONSTRAINT error_logs_resolved_by_fkey
  FOREIGN KEY (resolved_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- feedback.user_id
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_user_id_fkey;
ALTER TABLE feedback ADD CONSTRAINT feedback_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- feedback.assigned_to
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_assigned_to_fkey;
ALTER TABLE feedback ADD CONSTRAINT feedback_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES profiles(id) ON DELETE SET NULL;

-- email_campaigns.created_by
ALTER TABLE email_campaigns DROP CONSTRAINT IF EXISTS email_campaigns_created_by_fkey;
ALTER TABLE email_campaigns ADD CONSTRAINT email_campaigns_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- campaign_contacts.imported_by
ALTER TABLE campaign_contacts DROP CONSTRAINT IF EXISTS campaign_contacts_imported_by_fkey;
ALTER TABLE campaign_contacts ADD CONSTRAINT campaign_contacts_imported_by_fkey
  FOREIGN KEY (imported_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- template_packs.created_by
ALTER TABLE template_packs DROP CONSTRAINT IF EXISTS template_packs_created_by_fkey;
ALTER TABLE template_packs ADD CONSTRAINT template_packs_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- rule_suggestions.suggested_by
ALTER TABLE rule_suggestions DROP CONSTRAINT IF EXISTS rule_suggestions_suggested_by_fkey;
ALTER TABLE rule_suggestions ADD CONSTRAINT rule_suggestions_suggested_by_fkey
  FOREIGN KEY (suggested_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- rule_suggestions.reviewed_by
ALTER TABLE rule_suggestions DROP CONSTRAINT IF EXISTS rule_suggestions_reviewed_by_fkey;
ALTER TABLE rule_suggestions ADD CONSTRAINT rule_suggestions_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- prompt_versions.changed_by
ALTER TABLE prompt_versions DROP CONSTRAINT IF EXISTS prompt_versions_changed_by_fkey;
ALTER TABLE prompt_versions ADD CONSTRAINT prompt_versions_changed_by_fkey
  FOREIGN KEY (changed_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- ticket_notes.author_id
ALTER TABLE ticket_notes DROP CONSTRAINT IF EXISTS ticket_notes_author_id_fkey;
ALTER TABLE ticket_notes ADD CONSTRAINT ticket_notes_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- canned_responses.created_by
ALTER TABLE canned_responses DROP CONSTRAINT IF EXISTS canned_responses_created_by_fkey;
ALTER TABLE canned_responses ADD CONSTRAINT canned_responses_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- audience_lists.created_by
ALTER TABLE audience_lists DROP CONSTRAINT IF EXISTS audience_lists_created_by_fkey;
ALTER TABLE audience_lists ADD CONSTRAINT audience_lists_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;
