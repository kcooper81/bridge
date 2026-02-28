import {
  FileText,
  Users,
  BookOpen,
  BarChart3,
  Import,
  Shield,
  Activity,
  Headphones,
  ShieldCheck,
  FileSpreadsheet,
  UserCog,
  Mail,
  Globe,
  Building2,
  type LucideIcon,
} from "lucide-react";
import type { PlanTier } from "@/lib/types";

// ─── Count-based limits ─────────────────────────────────────────────

export type LimitAction =
  | "create_prompt"
  | "add_member"
  | "add_guideline";

export interface LimitMeta {
  icon: LucideIcon;
  noun: string;
  nounPlural: string;
  upgradeValue: string;
  unlockPlan: PlanTier;
  unlockPlanName: string;
}

export const LIMIT_CONFIG: Record<LimitAction, LimitMeta> = {
  create_prompt: {
    icon: FileText,
    noun: "prompt",
    nounPlural: "prompts",
    upgradeValue: "unlimited prompts",
    unlockPlan: "pro",
    unlockPlanName: "Pro",
  },
  add_member: {
    icon: Users,
    noun: "member",
    nounPlural: "members",
    upgradeValue: "up to 50 members",
    unlockPlan: "team",
    unlockPlanName: "Team",
  },
  add_guideline: {
    icon: BookOpen,
    noun: "guideline",
    nounPlural: "guidelines",
    upgradeValue: "up to 14 guidelines",
    unlockPlan: "pro",
    unlockPlanName: "Pro",
  },
};

// ─── Boolean feature gates ──────────────────────────────────────────

export type BooleanFeature =
  | "analytics"
  | "import_export"
  | "custom_security"
  | "audit_log"
  | "bulk_import"
  | "bulk_role_assignment"
  | "custom_welcome_email"
  | "domain_auto_join"
  | "google_workspace_sync"
  | "priority_support"
  | "sla";

export interface FeatureMeta {
  icon: LucideIcon;
  title: string;
  description: string;
  benefits: string[];
  unlockPlan: PlanTier;
  unlockPlanName: string;
}

export const FEATURE_CONFIG: Record<BooleanFeature, FeatureMeta> = {
  analytics: {
    icon: BarChart3,
    title: "Analytics",
    description: "Track usage patterns, team performance, and prompt effectiveness.",
    benefits: [
      "Daily usage charts and trend tracking",
      "Per-member and per-team breakdowns",
      "Top prompts and rating insights",
    ],
    unlockPlan: "pro",
    unlockPlanName: "Pro",
  },
  import_export: {
    icon: Import,
    title: "Import / Export",
    description: "Move prompt packs between organizations and back up your vault.",
    benefits: [
      "Export selected prompts as JSON packs",
      "Import prompts from other organizations",
      "Bulk backup and migration support",
    ],
    unlockPlan: "pro",
    unlockPlanName: "Pro",
  },
  custom_security: {
    icon: Shield,
    title: "Custom Security Policies",
    description: "Create and manage custom guardrail rules to protect sensitive data.",
    benefits: [
      "Custom regex and pattern-based rules",
      "Category-based policy management",
      "AI-powered detection capabilities",
    ],
    unlockPlan: "team",
    unlockPlanName: "Team",
  },
  audit_log: {
    icon: Activity,
    title: "Activity Log",
    description: "Monitor AI conversations and security violations across your team.",
    benefits: [
      "Full conversation audit trail",
      "Security violation tracking and analysis",
      "Filter by AI tool, action, and time range",
    ],
    unlockPlan: "team",
    unlockPlanName: "Team",
  },
  bulk_import: {
    icon: FileSpreadsheet,
    title: "Bulk CSV Import",
    description: "Import members in bulk via CSV spreadsheet upload.",
    benefits: [
      "Upload CSV with names, emails, and roles",
      "Preview and validate before sending invites",
      "Assign teams during import",
    ],
    unlockPlan: "team",
    unlockPlanName: "Team",
  },
  bulk_role_assignment: {
    icon: UserCog,
    title: "Bulk Role Assignment",
    description: "Select multiple members and change their roles at once.",
    benefits: [
      "Multi-select members with checkboxes",
      "Batch update roles in one click",
      "Streamline team management at scale",
    ],
    unlockPlan: "team",
    unlockPlanName: "Team",
  },
  custom_welcome_email: {
    icon: Mail,
    title: "Custom Welcome Email",
    description: "Add a personalized message to all invite emails from your organization.",
    benefits: [
      "Custom welcome message in invite emails",
      "Reinforce company culture and onboarding",
      "Up to 500 characters of personalized text",
    ],
    unlockPlan: "team",
    unlockPlanName: "Team",
  },
  domain_auto_join: {
    icon: Globe,
    title: "Domain Auto-Join",
    description: "New users with matching email domains automatically join your organization.",
    benefits: [
      "Zero-friction onboarding for your team",
      "No manual invites needed for domain matches",
      "Controlled via organization settings toggle",
    ],
    unlockPlan: "team",
    unlockPlanName: "Team",
  },
  google_workspace_sync: {
    icon: Building2,
    title: "Google Workspace Sync",
    description: "Connect your Google Workspace directory to import and sync employees.",
    benefits: [
      "One-click directory sync from Google Admin",
      "Automatic Google Groups to Teams mapping",
      "Keep your roster up to date effortlessly",
    ],
    unlockPlan: "business",
    unlockPlanName: "Business",
  },
  priority_support: {
    icon: Headphones,
    title: "Priority Support",
    description: "Get dedicated support with faster response times for your organization.",
    benefits: [
      "Priority ticket queue with faster response",
      "Dedicated account manager",
      "Direct escalation path for critical issues",
    ],
    unlockPlan: "business",
    unlockPlanName: "Business",
  },
  sla: {
    icon: ShieldCheck,
    title: "SLA Guarantee",
    description: "Enterprise-grade uptime guarantee with service level agreement.",
    benefits: [
      "99.9% uptime guarantee",
      "Service credits for downtime",
      "Scheduled maintenance windows",
    ],
    unlockPlan: "business",
    unlockPlanName: "Business",
  },
};
