# DB Schema Comparison Report
Generated: 2026-03-02 18:11:57

## Summary
- **Tables in DB:** 34
- **RPC functions:** 4
- **Errors:** 0
- **Warnings:** 1

## Info
- DB tables with no mapped TS interface: workspace_integrations, collections, usage_events, template_pack_guidelines, template_pack_rules, activity_logs, feedback, template_packs, pack_install_requests, departments, collection_prompts, template_pack_prompts, ticket_notes, rule_suggestions, error_logs, team_members

## Warnings (review needed)
- **organizations.settings**: Nullable mismatch: DB "organizations.settings" is NOT NULL, but Organization.settings allows null (type: object | null)

## All Tables

### activity_logs *(no TS type)*
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | YES | — |
| user_id | uuid | YES | — |
| action | text | NO | — |
| resource_type | text | YES | — |
| resource_id | uuid | YES | — |
| metadata | jsonb | YES | — |
| ip_address | text | YES | — |
| user_agent | text | YES | — |
| created_at | timestamp with time zone | YES | now() |

### collection_prompts *(no TS type)*
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| collection_id | uuid | NO | — |
| prompt_id | uuid | NO | — |
| added_at | timestamp with time zone | NO | now() |

### collections *(no TS type)*
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | NO | — |
| team_id | uuid | YES | — |
| name | text | NO | — |
| description | text | YES | — |
| icon | text | YES | folder |
| color | text | YES | #8b5cf6 |
| visibility | text | NO | team |
| created_by | uuid | YES | — |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

### conversation_logs → `ConversationLog`
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | NO | — |
| user_id | uuid | NO | — |
| ai_tool | text | NO | — |
| prompt_text | text | NO | — |
| prompt_id | uuid | YES | — |
| response_text | text | YES | — |
| guardrail_flags | jsonb | NO | — |
| action | text | NO | sent |
| metadata | jsonb | NO | — |
| created_at | timestamp with time zone | NO | now() |

### data_imports → `DataImport`
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | NO | — |
| import_type | text | NO | — |
| source_name | text | YES | — |
| status | text | NO | pending |
| total_records | integer | NO | 0 |
| imported_records | integer | NO | 0 |
| failed_records | integer | NO | 0 |
| error_message | text | YES | — |
| metadata | jsonb | NO | — |
| created_by | uuid | YES | — |
| created_at | timestamp with time zone | NO | now() |
| completed_at | timestamp with time zone | YES | — |

### departments *(no TS type)*
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | NO | — |
| name | text | NO | — |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

### error_logs *(no TS type)*
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| message | text | NO | — |
| stack | text | YES | — |
| user_id | uuid | YES | — |
| org_id | uuid | YES | — |
| url | text | YES | — |
| user_agent | text | YES | — |
| metadata | jsonb | YES | — |
| resolved | boolean | YES | false |
| resolved_by | uuid | YES | — |
| resolved_at | timestamp with time zone | YES | — |
| created_at | timestamp with time zone | YES | now() |

### feedback *(no TS type)*
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | YES | — |
| org_id | uuid | YES | — |
| type | text | NO | feedback |
| subject | text | YES | — |
| message | text | NO | — |
| status | text | NO | new |
| priority | text | YES | normal |
| assigned_to | uuid | YES | — |
| resolved_at | timestamp with time zone | YES | — |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### folders → `Folder`
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | NO | — |
| name | text | NO | — |
| icon | text | YES | folder |
| color | text | YES | #8b5cf6 |
| created_by | uuid | YES | — |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

### invites → `Invite`
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | NO | — |
| email | text | NO | — |
| role | text | NO | member |
| token | text | NO | encode(extensions.gen_random_bytes(32), 'hex'::text) |
| invited_by | uuid | YES | — |
| status | text | NO | pending |
| expires_at | timestamp with time zone | NO | (now() + '7 days'::interval) |
| accepted_at | timestamp with time zone | YES | — |
| created_at | timestamp with time zone | NO | now() |
| team_id | uuid | YES | — |

### notifications → `Notification`
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | NO | — |
| org_id | uuid | YES | — |
| type | text | NO | — |
| title | text | NO | — |
| message | text | YES | — |
| metadata | jsonb | NO | — |
| read | boolean | NO | false |
| read_at | timestamp with time zone | YES | — |
| created_at | timestamp with time zone | NO | now() |

### organizations → `Organization`
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| name | text | NO | — |
| domain | text | YES | — |
| logo | text | YES | — |
| plan | text | NO | free |
| settings | jsonb | NO | — |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |
| is_suspended | boolean | YES | false |
| security_settings | jsonb | YES | — |

### pack_install_requests *(no TS type)*
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | YES | — |
| pack_id | text | NO | — |
| pack_type | text | NO | — |
| requested_by | uuid | YES | — |
| status | text | NO | pending |
| reviewed_by | uuid | YES | — |
| created_at | timestamp with time zone | YES | now() |
| reviewed_at | timestamp with time zone | YES | — |

### plan_limits → `PlanLimits`
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| plan | text | YES | — |
| max_prompts | integer | YES | — |
| max_members | integer | YES | — |
| max_ai_tools | integer | YES | — |
| max_guidelines | integer | YES | — |
| analytics | boolean | YES | — |
| import_export | boolean | YES | — |
| basic_security | boolean | YES | — |
| custom_security | boolean | YES | — |
| audit_log | boolean | YES | — |
| bulk_import | boolean | YES | — |
| bulk_role_assignment | boolean | YES | — |
| custom_welcome_email | boolean | YES | — |
| domain_auto_join | boolean | YES | — |
| google_workspace_sync | boolean | YES | — |
| priority_support | boolean | YES | — |
| sla | boolean | YES | — |

### profiles → `Profile`
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | — |
| org_id | uuid | YES | — |
| name | text | NO | — |
| email | text | NO | — |
| role | text | NO | member |
| avatar_url | text | YES | — |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |
| is_super_admin | boolean | NO | false |
| extension_version | text | YES | — |
| last_extension_active | timestamp with time zone | YES | — |
| extension_status | text | NO | unknown |
| shield_disabled | boolean | NO | false |
| super_admin_role | text | YES | — |

### prompt_ratings → `PromptRating`
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| prompt_id | uuid | NO | — |
| user_id | uuid | NO | — |
| rating | smallint | NO | — |
| created_at | timestamp with time zone | NO | now() |

### prompt_versions → `PromptVersion`
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| prompt_id | uuid | NO | — |
| version | integer | NO | — |
| title | text | NO | — |
| content | text | NO | — |
| created_at | timestamp with time zone | NO | now() |
| changed_by | uuid | YES | — |

### prompts → `Prompt`
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | NO | — |
| owner_id | uuid | YES | — |
| title | text | NO | — |
| content | text | NO | — |
| description | text | YES | — |
| intended_outcome | text | YES | — |
| tone | text | NO | professional |
| model_recommendation | text | YES | — |
| example_input | text | YES | — |
| example_output | text | YES | — |
| tags | text[] | NO | — |
| folder_id | uuid | YES | — |
| department_id | uuid | YES | — |
| status | text | NO | approved |
| version | integer | NO | 1 |
| is_favorite | boolean | NO | false |
| rating_total | integer | NO | 0 |
| rating_count | integer | NO | 0 |
| usage_count | integer | NO | 0 |
| last_used_at | timestamp with time zone | YES | — |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |
| is_template | boolean | NO | false |
| template_variables | jsonb | NO | — |

### rule_suggestions *(no TS type)*
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | NO | — |
| team_id | uuid | YES | — |
| suggested_by | uuid | NO | — |
| name | text | NO | — |
| description | text | NO | — |
| category | text | NO | custom |
| severity | text | NO | warn |
| status | text | NO | pending |
| reviewed_by | uuid | YES | — |
| reviewed_at | timestamp with time zone | YES | — |
| admin_notes | text | YES | — |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

### security_rules → `SecurityRule`
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | NO | — |
| name | text | NO | — |
| description | text | YES | — |
| pattern | text | NO | — |
| pattern_type | text | NO | regex |
| category | text | NO | custom |
| severity | text | NO | block |
| is_active | boolean | NO | true |
| is_built_in | boolean | NO | false |
| created_by | uuid | YES | — |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |
| team_id | uuid | YES | — |

### security_violations → `SecurityViolation`
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | NO | — |
| prompt_id | uuid | YES | — |
| rule_id | uuid | YES | — |
| matched_text | text | NO | — |
| user_id | uuid | NO | — |
| action_taken | text | NO | blocked |
| created_at | timestamp with time zone | NO | now() |
| detection_type | text | NO | pattern |

### sensitive_terms → `SensitiveTerm`
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | NO | — |
| term | text | NO | — |
| term_type | text | NO | — |
| category | text | NO | — |
| description | text | YES | — |
| severity | text | NO | warn |
| is_active | boolean | NO | true |
| source | text | NO | manual |
| created_by | uuid | YES | — |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |
| team_id | uuid | YES | — |

### standards → `Guideline`
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | NO | — |
| name | text | NO | — |
| description | text | YES | — |
| category | text | NO | general |
| scope | text | NO | org |
| rules | jsonb | NO | — |
| enforced | boolean | NO | false |
| created_by | uuid | YES | — |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

### subscriptions → `Subscription`
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | NO | — |
| stripe_customer_id | text | YES | — |
| stripe_subscription_id | text | YES | — |
| plan | text | NO | free |
| status | text | NO | active |
| cancel_at_period_end | boolean | NO | false |
| current_period_end | timestamp with time zone | YES | — |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |
| seats | integer | NO | 1 |
| trial_ends_at | timestamp with time zone | YES | — |
| canceled_at | timestamp with time zone | YES | — |
| payment_failed_at | timestamp with time zone | YES | — |
| dispute_status | text | YES | — |

### suggested_rules → `SuggestedRule`
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | NO | — |
| name | text | NO | — |
| description | text | YES | — |
| pattern | text | NO | — |
| pattern_type | text | NO | regex |
| category | text | NO | — |
| severity | text | NO | warn |
| sample_matches | text[] | NO | — |
| detection_count | integer | NO | 1 |
| confidence | numeric | NO | 0.5 |
| status | text | NO | pending |
| reviewed_by | uuid | YES | — |
| reviewed_at | timestamp with time zone | YES | — |
| converted_rule_id | uuid | YES | — |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

### team_members *(no TS type)*
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| team_id | uuid | NO | — |
| user_id | uuid | NO | — |
| joined_at | timestamp with time zone | NO | now() |
| role | text | NO | member |

### teams → `Team`
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | NO | — |
| name | text | NO | — |
| description | text | YES | — |
| icon | text | YES | users |
| color | text | YES | #8b5cf6 |
| created_at | timestamp with time zone | NO | now() |
| updated_at | timestamp with time zone | NO | now() |

### template_pack_guidelines *(no TS type)*
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| pack_id | uuid | NO | — |
| guideline_id | uuid | NO | — |

### template_pack_prompts *(no TS type)*
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| pack_id | uuid | NO | — |
| prompt_id | uuid | NO | — |

### template_pack_rules *(no TS type)*
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| pack_id | uuid | NO | — |
| rule_id | uuid | NO | — |

### template_packs *(no TS type)*
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | NO | — |
| name | text | NO | — |
| description | text | YES | — |
| icon | text | YES | FolderOpen |
| visibility | text | YES | org |
| team_id | uuid | YES | — |
| created_by | uuid | NO | — |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### ticket_notes *(no TS type)*
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| ticket_id | uuid | NO | — |
| author_id | uuid | NO | — |
| content | text | NO | — |
| is_internal | boolean | YES | true |
| email_sent | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |

### usage_events *(no TS type)*
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | NO | — |
| user_id | uuid | YES | — |
| prompt_id | uuid | YES | — |
| action | text | NO | — |
| metadata | jsonb | YES | — |
| created_at | timestamp with time zone | NO | now() |

### workspace_integrations *(no TS type)*
| Column | PG Type | Nullable | Default |
|--------|---------|----------|---------|
| id | uuid | NO | gen_random_uuid() |
| org_id | uuid | NO | — |
| provider | text | NO | — |
| access_token | text | NO | — |
| refresh_token | text | YES | — |
| token_expires_at | timestamp with time zone | YES | — |
| admin_email | text | YES | — |
| connected_by | uuid | YES | — |
| connected_at | timestamp with time zone | NO | now() |
| last_synced_at | timestamp with time zone | YES | — |

## RPC Functions

- **get_my_role**(args, )
- **is_super_admin**(args, )
- **get_my_org_id**(args, )
- **increment_usage_count**(args, )
