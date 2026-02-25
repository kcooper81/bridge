export type UserRole = "admin" | "manager" | "member";
export type PromptStatus = "draft" | "pending" | "approved" | "archived";
export type PromptTone =
  | "professional"
  | "casual"
  | "formal"
  | "friendly"
  | "technical"
  | "creative"
  | "persuasive"
  | "empathetic"
  | "authoritative"
  | "conversational"
  | "instructional"
  | "analytical";

export type PlanTier = "free" | "pro" | "team" | "business";
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "paused";

export type CollectionVisibility = "personal" | "team" | "org" | "public";

export type SecurityPatternType = "exact" | "regex" | "glob";
export type SecurityCategory =
  | "api_keys"
  | "credentials"
  | "internal_terms"
  | "internal"
  | "pii"
  | "secrets"
  | "financial"
  | "health"
  | "custom";
export type SecuritySeverity = "block" | "warn";
export type SecurityAction = "blocked" | "overridden" | "auto_redacted";

// ─── Database Row Types ───

export interface Organization {
  id: string;
  name: string;
  domain: string | null;
  logo: string | null;
  plan: PlanTier;
  settings: {
    allow_personal_prompts?: boolean;
    default_visibility?: CollectionVisibility;
    setup_complete?: boolean;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  org_id: string | null;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  is_super_admin: boolean;
  extension_version: string | null;
  last_extension_active: string | null;
  created_at: string;
  updated_at: string;
}

export interface Prompt {
  id: string;
  org_id: string;
  owner_id: string;
  title: string;
  content: string;
  description: string | null;
  intended_outcome: string | null;
  tone: PromptTone;
  model_recommendation: string | null;
  example_input: string | null;
  example_output: string | null;
  tags: string[];
  folder_id: string | null;
  /** Stores team_id. DB column name retained. */
  department_id: string | null;
  status: PromptStatus;
  version: number;
  is_favorite: boolean;
  rating_total: number;
  rating_count: number;
  usage_count: number;
  last_used_at: string | null;
  is_template: boolean;
  template_variables: string[];
  created_at: string;
  updated_at: string;
}

export interface PromptRating {
  id: string;
  prompt_id: string;
  user_id: string;
  rating: number;
  created_at: string;
}

export interface PromptVersion {
  id: string;
  prompt_id: string;
  version: number;
  title: string;
  content: string;
  created_at: string;
}

export interface Folder {
  id: string;
  org_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/** @deprecated Departments removed — use Team instead. */
export type Department = Team;

export interface Team {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface Member extends Profile {
  teamIds: string[];
  teamRoles: Record<string, string>;
  isCurrentUser?: boolean;
}

export interface Collection {
  id: string;
  org_id: string;
  team_id: string | null;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  visibility: CollectionVisibility;
  created_by: string;
  promptIds: string[];
  created_at: string;
  updated_at: string;
}

export interface Guideline {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  category: string;
  scope: "personal" | "team" | "org";
  rules: GuidelineRules;
  enforced: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/** @deprecated Use Guideline instead */
export type Standard = Guideline;

export interface GuidelineRules {
  toneRules?: string[];
  /** @deprecated Use bestPractices instead */
  doList?: string[];
  /** @deprecated Use restrictions instead */
  dontList?: string[];
  bestPractices?: string[];
  restrictions?: string[];
  constraints?: string[];
  requiredFields?: string[];
  templateStructure?: string;
  requiredTags?: string[];
  bannedWords?: string[];
  maxLength?: number;
  minLength?: number;
}

/** @deprecated Use GuidelineRules instead */
export type StandardRules = GuidelineRules;

export interface Subscription {
  id: string;
  org_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: PlanTier;
  status: SubscriptionStatus;
  seats: number;
  current_period_end: string | null;
  trial_ends_at: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  payment_failed_at: string | null;
  dispute_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanLimits {
  plan: PlanTier;
  max_prompts: number;
  max_members: number;
  max_ai_tools: number;
  max_guidelines: number;
  analytics: boolean;
  import_export: boolean;
  basic_security: boolean;
  custom_security: boolean;
  audit_log: boolean;
}

export interface SecurityRule {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  pattern: string;
  pattern_type: SecurityPatternType;
  category: SecurityCategory;
  severity: SecuritySeverity;
  is_active: boolean;
  is_built_in: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SecurityViolation {
  id: string;
  org_id: string;
  prompt_id: string | null;
  rule_id: string;
  matched_text: string;
  user_id: string;
  action_taken: SecurityAction;
  created_at: string;
  // Joined fields
  rule?: SecurityRule;
  user?: Pick<Profile, "name" | "email">;
}

export interface Invite {
  id: string;
  org_id: string;
  email: string;
  role: UserRole;
  token: string;
  invited_by: string | null;
  team_id?: string | null;
  status: "pending" | "accepted" | "expired" | "revoked";
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

// ─── App-level Types ───

export interface OrgData {
  org: Organization | null;
  prompts: Prompt[];
  folders: Folder[];
  teams: Team[];
  members: Member[];
  collections: Collection[];
  guidelines: Guideline[];
  subscription: Subscription | null;
  planLimits: PlanLimits | null;
}

export interface ValidationResult {
  passed: boolean;
  violations: {
    guideline: string;
    rule: string;
    message: string;
  }[];
}

export interface Analytics {
  totalPrompts: number;
  totalUses: number;
  avgRating: number;
  usesThisWeek: number;
  usesLastWeek: number;
  topPrompts: Prompt[];
  teamUsage: Record<string, number>;
  dailyUsage: { date: string; count: number }[];
  userUsage: { userId: string; name: string; count: number }[];
  templateCount: number;
  guardrailBlocks: number;
}

export interface ConversationLog {
  id: string;
  org_id: string;
  user_id: string;
  ai_tool: string;
  prompt_text: string;
  prompt_id: string | null;
  response_text: string | null;
  guardrail_flags: unknown[];
  action: "sent" | "blocked" | "warned";
  metadata: Record<string, unknown>;
  created_at: string;
  // Joined
  user?: Pick<Profile, "name" | "email">;
}

export interface ExportPack {
  format: "teamprompt-pack";
  version: "1.0";
  name: string;
  exported_at: string;
  prompts: Prompt[];
  folders: Folder[];
}

// ─── Notifications ───

export type NotificationType =
  | "security_violation"
  | "prompt_submitted"
  | "prompt_approved"
  | "prompt_rejected"
  | "member_joined"
  | "member_left"
  | "system";

export interface Notification {
  id: string;
  user_id: string;
  org_id: string | null;
  type: NotificationType;
  title: string;
  message: string | null;
  metadata: Record<string, unknown>;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

// ─── Security Settings ───

export interface SecuritySettings {
  entropy_detection_enabled: boolean;
  entropy_threshold: number;
  ai_detection_enabled: boolean;
  ai_detection_provider: "presidio" | "aws_comprehend" | "openai" | null;
  smart_patterns_enabled: boolean;
}

export type SensitiveTermCategory =
  | "customer_data"
  | "employee_data"
  | "project_names"
  | "product_names"
  | "internal_codes"
  | "partner_data"
  | "financial_data"
  | "legal_data"
  | "custom";

export type SensitiveTermSource = "manual" | "import" | "sync" | "ai_suggested";

export interface SensitiveTerm {
  id: string;
  org_id: string;
  term: string;
  term_type: "exact" | "pattern" | "keyword";
  category: SensitiveTermCategory;
  description: string | null;
  severity: SecuritySeverity;
  is_active: boolean;
  source: SensitiveTermSource;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type SuggestedRuleStatus = "pending" | "approved" | "dismissed" | "converted";

export interface SuggestedRule {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  pattern: string;
  pattern_type: SecurityPatternType;
  category: SecurityCategory;
  severity: SecuritySeverity;
  sample_matches: string[];
  detection_count: number;
  confidence: number;
  status: SuggestedRuleStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  converted_rule_id: string | null;
  created_at: string;
  updated_at: string;
}

export type DataImportType = "csv_terms" | "json_terms" | "crm_sync" | "hr_sync" | "custom_api";
export type DataImportStatus = "pending" | "processing" | "completed" | "failed";

export interface DataImport {
  id: string;
  org_id: string;
  import_type: DataImportType;
  source_name: string | null;
  status: DataImportStatus;
  total_records: number;
  imported_records: number;
  failed_records: number;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  completed_at: string | null;
}
