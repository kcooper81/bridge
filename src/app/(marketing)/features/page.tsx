import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Archive,
  ArrowRight,
  BarChart3,
  BookOpen,
  Chrome,
  FolderOpen,
  Import,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Features",
  description:
    "Explore TeamPrompt's features: prompt vault, AI Security Shield, quality standards, team management, Chrome extension, and analytics.",
  path: "/features",
});

const features = [
  {
    icon: Archive,
    title: "Prompt Vault",
    description:
      "A centralized repository for all your AI prompts. Organize with folders, departments, and tags. Search, filter, sort, and paginate through your entire library.",
    details: [
      "Full-text search across titles, content, and tags",
      "Filter by folder, department, or favorites",
      "Sort by recent, popular, alphabetical, or rating",
      "25-per-page pagination with version history",
    ],
  },
  {
    icon: Shield,
    title: "AI Security Shield",
    badge: "NEW",
    description:
      "Automatically detect and block sensitive data before it reaches AI tools. Protect API keys, credentials, PII, and company secrets.",
    details: [
      "15 built-in patterns for AWS, GitHub, Stripe, OpenAI keys",
      "Custom regex, exact match, and glob patterns",
      "Block (prevent save) or warn (allow with alert) severity",
      "Full audit log of violations for compliance",
    ],
  },
  {
    icon: BookOpen,
    title: "Quality Standards",
    description:
      "Define and enforce quality standards across your organization. 14 built-in standards covering every department from writing to legal.",
    details: [
      "Do/don't lists, banned words, length constraints",
      "Required fields and tags per standard",
      "Enforce toggle for real-time validation",
      "Custom standards for your specific needs",
    ],
  },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Invite team members, assign roles, and organize into teams. Role-based access control ensures the right people see the right things.",
    details: [
      "Admin, Manager, and Member roles with distinct permissions",
      "Email invitations with 7-day expiry",
      "Team grouping for department-level organization",
      "Last-admin protection prevents accidental lockout",
    ],
  },
  {
    icon: Chrome,
    title: "Chrome Extension",
    description:
      "One-click prompt injection into 15+ AI tools. Bridge your prompts directly into ChatGPT, Claude, Gemini, and more.",
    details: [
      "ChatGPT, Claude, Gemini, Perplexity, Copilot support",
      "DeepSeek, Grok, Mistral, HuggingChat, and more",
      "Context bridge with project awareness",
      "Usage tracking synced to your vault",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Understand how your team uses AI prompts. Track top performers, department trends, and usage patterns over time.",
    details: [
      "Total prompts, uses, and average rating overview",
      "Top 10 most-used prompts ranking",
      "Usage breakdown by department",
      "Weekly usage trend tracking",
    ],
  },
  {
    icon: FolderOpen,
    title: "Collections",
    description:
      "Group related prompts into collections for easy sharing and discovery. Set visibility to personal, team, org, or public.",
    details: [
      "Flexible visibility levels",
      "Add/remove prompts with checklist UI",
      "Team-scoped collections for departments",
      "Grid view with prompt counts",
    ],
  },
  {
    icon: Import,
    title: "Import / Export",
    description:
      "Move prompts between organizations with JSON export packs. Bulk import from files with automatic format validation.",
    details: [
      "Select specific prompts to export",
      "Named prompt packs with metadata",
      "Drag-and-drop import from JSON files",
      "Cross-organization portability",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold">Features</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything your team needs to manage, share, and secure AI prompts at scale.
          </p>
        </div>

        <div className="space-y-16">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              id={feature.title === "Chrome Extension" ? "extension" : undefined}
              className={`flex flex-col gap-8 ${
                i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
              } items-center`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">{feature.title}</h2>
                  {feature.badge && (
                    <span className="text-xs font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      {feature.badge}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-lg">
                  {feature.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {feature.details.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm">
                      <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full">
                <div className="rounded-xl border border-border bg-card/50 aspect-video flex items-center justify-center">
                  <feature.icon className="h-16 w-16 text-muted-foreground/20" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="mt-4 text-muted-foreground">
            Start for free. No credit card required.
          </p>
          <Link href="/signup" className="mt-6 inline-block">
            <Button size="lg" className="text-base px-8">
              Start Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
