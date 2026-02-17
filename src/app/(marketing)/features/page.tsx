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
    "Explore TeamPrompt's features: prompt vault, AI guardrails, quality guidelines, team management, Chrome extension, and analytics.",
  path: "/features",
});

/* ── CSS-only app preview mockups ────────────────────────── */

function MockBrowser({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-muted/30">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400/40" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/40" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400/40" />
        <div className="ml-3 flex-1 h-5 rounded-md bg-background border border-border" />
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function VaultMockup() {
  return (
    <MockBrowser>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-8 rounded-lg border border-border bg-background px-3 flex items-center">
          <span className="text-xs text-muted-foreground">Search prompts...</span>
        </div>
        <div className="h-8 w-20 rounded-lg bg-primary text-[10px] text-primary-foreground font-medium flex items-center justify-center">
          + New
        </div>
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 rounded bg-foreground/8" style={{ width: `${80 - i * 12}%` }} />
            <div className="h-2 rounded bg-muted-foreground/5" style={{ width: `${55 - i * 8}%` }} />
          </div>
          <div className="h-5 w-14 rounded-full bg-primary/10 text-[10px] flex items-center justify-center text-primary font-medium">
            {["142", "89", "67", "34"][i - 1]} uses
          </div>
        </div>
      ))}
    </MockBrowser>
  );
}

function GuardrailsMockup() {
  return (
    <MockBrowser>
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 rounded-full bg-destructive/30 flex items-center justify-center">
            <span className="text-[8px] text-destructive font-bold">!</span>
          </div>
          <span className="text-xs font-semibold text-destructive">Sensitive content detected</span>
        </div>
        <p className="text-[10px] text-destructive/70 ml-6">2 security policies triggered</p>
      </div>
      <div className="space-y-2">
        {[
          { label: "AWS Access Key", status: "Blocked", color: "destructive" },
          { label: "GitHub Token", status: "Blocked", color: "destructive" },
          { label: "Internal Project Name", status: "Warning", color: "yellow-500" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-${item.color}`} />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
            <span className={`text-[10px] font-semibold ${item.status === "Blocked" ? "text-destructive" : "text-yellow-600"}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </MockBrowser>
  );
}

function GuidelinesMockup() {
  return (
    <MockBrowser>
      <div className="space-y-3">
        {[
          { text: "Include a clear objective", done: true },
          { text: "Specify output format", done: true },
          { text: "Set tone and audience", done: true },
          { text: "Add example output", done: false },
          { text: "Keep under 500 words", done: false },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
              item.done ? "border-primary bg-primary/10" : "border-border"
            }`}>
              {item.done && (
                <svg className="w-3 h-3 text-primary" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span className={`text-xs ${item.done ? "text-foreground" : "text-muted-foreground"}`}>{item.text}</span>
          </div>
        ))}
      </div>
    </MockBrowser>
  );
}

function TeamsMockup() {
  return (
    <MockBrowser>
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-20 rounded bg-muted" />
        <div className="h-7 w-24 rounded-lg bg-primary/10 text-[10px] flex items-center justify-center text-primary font-medium gap-1">
          <span>+</span> Invite
        </div>
      </div>
      {["Admin", "Manager", "Member", "Member"].map((role, i) => (
        <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
            {["AJ", "KP", "SR", "ML"][i]}
          </div>
          <div className="flex-1">
            <div className="h-3 w-24 rounded bg-foreground/8" />
          </div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            role === "Admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}>
            {role}
          </span>
        </div>
      ))}
    </MockBrowser>
  );
}

function ExtensionMockup() {
  return (
    <MockBrowser>
      <div className="flex gap-2 mb-4">
        {["ChatGPT", "Claude", "Gemini", "Copilot"].map((tool) => (
          <div key={tool} className="h-6 px-2.5 rounded-full bg-primary/10 text-[10px] flex items-center justify-center text-primary font-medium">
            {tool}
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border p-4 bg-background">
        <div className="h-3 w-full rounded bg-muted mb-2" />
        <div className="h-3 w-3/4 rounded bg-muted mb-4" />
        <div className="flex justify-end gap-2">
          <div className="h-7 w-16 rounded-lg bg-muted text-[10px] flex items-center justify-center text-muted-foreground font-medium">
            Copy
          </div>
          <div className="h-7 w-20 rounded-lg bg-primary text-[10px] flex items-center justify-center text-primary-foreground font-medium">
            Insert
          </div>
        </div>
      </div>
    </MockBrowser>
  );
}

function AnalyticsMockup() {
  return (
    <MockBrowser>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { val: "142", label: "Prompts" },
          { val: "89%", label: "Reuse rate" },
          { val: "4.2", label: "Avg rating" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border p-2.5 text-center">
            <div className="text-sm font-bold text-foreground">{item.val}</div>
            <div className="text-[9px] text-muted-foreground mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-[3px] h-20">
        {[30, 45, 35, 55, 70, 50, 65, 80, 60, 75, 45, 85].map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-primary/25 hover:bg-primary/40 transition-colors" style={{ height: `${h}%` }} />
        ))}
      </div>
    </MockBrowser>
  );
}

function CollectionsMockup() {
  return (
    <MockBrowser>
      <div className="grid grid-cols-2 gap-2">
        {[
          { name: "Marketing", count: 24 },
          { name: "Engineering", count: 18 },
          { name: "Support", count: 12 },
          { name: "Legal", count: 8 },
        ].map((item) => (
          <div key={item.name} className="rounded-lg border border-border p-3 hover:border-primary/20 transition-colors">
            <div className="text-xs font-semibold text-foreground">{item.name}</div>
            <div className="text-[10px] text-muted-foreground mt-1">{item.count} prompts</div>
          </div>
        ))}
      </div>
    </MockBrowser>
  );
}

function ImportMockup() {
  return (
    <MockBrowser>
      <div className="border-2 border-dashed border-primary/20 rounded-xl p-8 text-center bg-primary/[0.02]">
        <div className="w-10 h-10 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center">
          <Import className="w-4 h-4 text-primary" />
        </div>
        <p className="text-xs font-medium text-foreground">Drop a prompt pack here</p>
        <p className="text-[10px] text-muted-foreground mt-1">or click to browse (.json)</p>
      </div>
    </MockBrowser>
  );
}

const mockups: Record<string, () => React.JSX.Element> = {
  "Prompt Vault": VaultMockup,
  "AI Guardrails": GuardrailsMockup,
  "Quality Guidelines": GuidelinesMockup,
  "Team Management": TeamsMockup,
  "Chrome Extension": ExtensionMockup,
  "Analytics & Insights": AnalyticsMockup,
  "Collections": CollectionsMockup,
  "Import / Export": ImportMockup,
};

/* ── Feature data ────────────────────────────────────────── */

const features = [
  {
    icon: Archive,
    title: "Prompt Vault",
    description:
      "Stop digging through docs, Slack threads, and bookmarks. Your vault is a single searchable home for every prompt your org writes.",
    details: [
      "Full-text search across titles, content, and tags",
      "Filter by folder, department, or favorites",
      "Version history so nothing gets lost",
      "Usage tracking and rating system",
    ],
  },
  {
    icon: Shield,
    title: "AI Guardrails",
    badge: "NEW",
    description:
      "Your team copies code, config files, and internal context into AI tools every day. Guardrails catch sensitive data before it leaves.",
    details: [
      "15 built-in policies for AWS, GitHub, Stripe, OpenAI keys",
      "Custom regex, exact match, and glob patterns",
      "Block or warn severity levels",
      "Full audit log of violations for compliance",
    ],
  },
  {
    icon: BookOpen,
    title: "Quality Guidelines",
    description:
      "Without structure, prompts vary wildly in quality. Guidelines enforce the basics so every prompt meets a bar.",
    details: [
      "Do/don't lists, banned words, length constraints",
      "Required fields and tags per guideline",
      "Enforce toggle for real-time validation",
      "14 built-in guidelines to start with",
    ],
  },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Different people need different access. Admins manage policies, managers curate libraries, members use what's there.",
    details: [
      "Admin, Manager, and Member roles",
      "Email invitations with 7-day expiry",
      "Team grouping for department-level organization",
      "Last-admin protection prevents lockout",
    ],
  },
  {
    icon: Chrome,
    title: "Chrome Extension",
    description:
      "Your prompts live in TeamPrompt. Your team works in ChatGPT, Claude, Gemini, and a dozen other tools. The extension bridges the gap.",
    details: [
      "ChatGPT, Claude, Gemini, Perplexity, Copilot support",
      "One-click prompt injection into AI tools",
      "Template variable fill-in before sending",
      "DLP scanning on outbound text",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "You can't improve what you can't see. Analytics show which prompts get reused, which teams are active, and where gaps exist.",
    details: [
      "30-day daily usage chart",
      "Top prompts ranking by usage",
      "Per-user and per-department breakdowns",
      "Week-over-week trend tracking",
    ],
  },
  {
    icon: FolderOpen,
    title: "Collections",
    description:
      "Group related prompts into themed collections — by project, campaign, or workflow. Share them or keep them personal.",
    details: [
      "Personal, team, org, or public visibility",
      "Add/remove prompts with checklist UI",
      "Team-scoped collections for departments",
      "Grid view with prompt counts",
    ],
  },
  {
    icon: Import,
    title: "Import / Export",
    description:
      "Moving between orgs or onboarding a new team? Export prompt packs as JSON and import them anywhere.",
    details: [
      "Select specific prompts to export",
      "Named prompt packs with metadata",
      "Drag-and-drop import from JSON",
      "Cross-organization portability",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="max-w-3xl mb-20">
          <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
            Features
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Everything your team needs to manage prompts
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
            From shared libraries to security guardrails, TeamPrompt replaces
            scattered docs and Slack threads with a proper system.
          </p>
        </div>

        {/* Feature blocks */}
        <div className="space-y-24">
          {features.map((feature, i) => {
            const Mockup = mockups[feature.title];
            return (
              <div
                key={feature.title}
                id={feature.title === "Chrome Extension" ? "extension" : undefined}
                className={`flex flex-col gap-10 lg:gap-16 ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
                } items-center`}
              >
                <div className="flex-1 max-w-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-2xl font-bold">{feature.title}</h2>
                    {feature.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full">
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {feature.details.map((d) => (
                      <li key={d} className="flex items-start gap-3 text-sm">
                        <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 w-full max-w-lg">
                  {Mockup ? <Mockup /> : (
                    <div className="rounded-2xl border border-border bg-card/50 aspect-video flex items-center justify-center">
                      <feature.icon className="h-16 w-16 text-muted-foreground/10" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-28 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            See it for yourself
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto">
            Create a free workspace in under two minutes. No credit card
            required.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button size="lg" className="text-base px-8 h-12 rounded-full font-semibold">
              Start for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
