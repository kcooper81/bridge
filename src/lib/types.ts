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
  | "pii"
  | "secrets"
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

export interface Department {
  id: string;
  org_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

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
  doList?: string[];
  dontList?: string[];
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
  departments: Department[];
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
  departmentUsage: Record<string, number>;
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
  departments: Department[];
}
