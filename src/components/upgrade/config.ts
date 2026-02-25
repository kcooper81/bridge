import {
  FileText,
  Users,
  BookOpen,
  BarChart3,
  Import,
  Shield,
  Activity,
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
  | "audit_log";

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
    unlockPlan: "pro",
    unlockPlanName: "Pro",
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
};
