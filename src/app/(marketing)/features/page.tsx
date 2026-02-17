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
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-muted/50">
        <div className="w-2.5 h-2.5 rounded-full bg-border" />
        <div className="w-2.5 h-2.5 rounded-full bg-border" />
        <div className="w-2.5 h-2.5 rounded-full bg-border" />
        <div className="ml-3 flex-1 h-5 rounded bg-background border border-border" />
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function VaultMockup() {
  return (
    <MockBrowser>
      <div className="h-6 w-48 rounded bg-muted mb-3" />
      <div className="flex gap-2 mb-4">
        <div className="flex-1 h-8 rounded border border-border bg-background" />
        <div className="h-8 w-20 rounded bg-primary/10" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
          <div className="w-8 h-8 rounded bg-primary/10" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 rounded bg-foreground/10" style={{ width: `${70 - i * 10}%` }} />
            <div className="h-2 rounded bg-muted-foreground/10" style={{ width: `${50 - i * 5}%` }} />
          </div>
          <div className="h-5 w-12 rounded-full bg-primary/10 text-[10px] flex items-center justify-center text-primary font-medium">
            {["v3", "v7", "v2"][i - 1]}
          </div>
        </div>
      ))}
    </MockBrowser>
  );
}

function GuardrailsMockup() {
  return (
    <MockBrowser>
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-4 h-4 rounded-full bg-destructive/20" />
          <div className="h-3 w-32 rounded bg-destructive/20" />
        </div>
        <div className="h-2 w-48 rounded bg-destructive/10 ml-6" />
      </div>
      <div className="space-y-2">
        {["AWS Access Key", "GitHub Token", "Stripe Secret"].map((label) => (
          <div key={label} className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/30" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <div className="h-5 w-16 rounded bg-destructive/10 text-[10px] flex items-center justify-center text-destructive font-medium">
              Blocked
            </div>
          </div>
        ))}
      </div>
    </MockBrowser>
  );
}

function GuidelinesMockup() {
  return (
    <MockBrowser>
      <div className="h-5 w-36 rounded bg-muted mb-3" />
      <div className="space-y-2.5">
        {["Include a clear objective", "Specify output format", "Set tone and audience", "Add example output"].map((text, i) => (
          <div key={text} className="flex items-center gap-2.5">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${i < 2 ? "border-primary bg-primary/10" : "border-border"}`}>
              {i < 2 && <div className="w-2 h-2 rounded-sm bg-primary" />}
            </div>
            <span className="text-xs text-muted-foreground">{text}</span>
          </div>
        ))}
      </div>
    </MockBrowser>
  );
}

function TeamsMockup() {
  return (
    <MockBrowser>
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-24 rounded bg-muted" />
        <div className="h-6 w-20 rounded bg-primary/10 text-[10px] flex items-center justify-center text-primary font-medium">
          Invite
        </div>
      </div>
      {["Admin", "Manager", "Member"].map((role) => (
        <div key={role} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
          <div className="w-7 h-7 rounded-full bg-muted" />
          <div className="flex-1">
            <div className="h-3 w-24 rounded bg-foreground/10" />
          </div>
          <div className="h-5 px-2 rounded-full bg-muted text-[10px] flex items-center justify-center text-muted-foreground font-medium">
            {role}
          </div>
        </div>
      ))}
    </MockBrowser>
  );
}

function ExtensionMockup() {
  return (
    <MockBrowser>
      <div className="flex gap-2 mb-3">
        {["ChatGPT", "Claude", "Gemini"].map((tool) => (
          <div key={tool} className="h-6 px-2.5 rounded-full bg-primary/10 text-[10px] flex items-center justify-center text-primary font-medium">
            {tool}
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border p-3 bg-background">
        <div className="h-3 w-full rounded bg-muted mb-2" />
        <div className="h-3 w-3/4 rounded bg-muted mb-3" />
        <div className="flex justify-end">
          <div className="h-6 w-16 rounded bg-primary text-[10px] flex items-center justify-center text-primary-foreground font-medium">
            Inject
          </div>
        </div>
      </div>
    </MockBrowser>
  );
}

function AnalyticsMockup() {
  return (
    <MockBrowser>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {["142", "89%", "4.2"].map((val, i) => (
          <div key={i} className="rounded border border-border p-2 text-center">
            <div className="text-sm font-bold text-foreground">{val}</div>
            <div className="h-2 w-12 rounded bg-muted mx-auto mt-1" />
          </div>
        ))}
      </div>
      <div className="flex items-end gap-1 h-16">
        {[40, 55, 35, 65, 80, 60, 75].map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-primary/20" style={{ height: `${h}%` }} />
        ))}
      </div>
    </MockBrowser>
  );
}

function CollectionsMockup() {
  return (
    <MockBrowser>
      <div className="grid grid-cols-2 gap-2">
        {["Marketing", "Engineering", "Support", "Legal"].map((name) => (
          <div key={name} className="rounded-lg border border-border p-2.5">
            <div className="text-xs font-medium text-foreground mb-1">{name}</div>
            <div className="h-2 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>
    </MockBrowser>
  );
}

function ImportMockup() {
  return (
    <MockBrowser>
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
        <div className="w-8 h-8 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-muted-foreground/30 border-t-transparent rounded-full" />
        </div>
        <div className="h-3 w-32 rounded bg-muted mx-auto mb-1" />
        <div className="h-2 w-24 rounded bg-muted/60 mx-auto" />
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
      "Sort by recent, popular, alphabetical, or rating",
      "Version history so nothing gets lost",
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
      "Blocked (prevent save) or Warning (allow with alert) severity",
      "Full audit log of violations for compliance",
    ],
  },
  {
    icon: BookOpen,
    title: "Quality Guidelines",
    description:
      "Without structure, prompts vary wildly in quality. Guidelines enforce the basics — clear objectives, proper formatting, appropriate tone — so every prompt meets a bar.",
    details: [
      "Do/don't lists, banned words, length constraints",
      "Required fields and tags per guideline",
      "Enforce toggle for real-time validation",
      "Custom guidelines for your specific needs",
    ],
  },
  {
    icon: Users,
    title: "Team Management",
    description:
      "Different people need different access. Admins manage policies, managers curate libraries, members use what's there. Roles make that clean.",
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
      "Your prompts live in TeamPrompt. Your team works in ChatGPT, Claude, Gemini, and a dozen other tools. The extension puts the right prompt in the right tool with one click.",
    details: [
      "ChatGPT, Claude, Gemini, Perplexity, Copilot support",
      "DeepSeek, Grok, Mistral, HuggingChat, and more",
      "Project context awareness",
      "Usage tracking synced to your vault",
    ],
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "You can't improve what you can't see. Analytics show which prompts get reused, which teams are most active, and where your library has gaps.",
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
      "Group related prompts into themed collections — by project, campaign, or workflow. Share them with your team or keep them personal.",
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
      "Moving between orgs or onboarding a new team? Export prompt packs as JSON and import them anywhere — no copy-pasting required.",
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
          <h1 className="text-4xl sm:text-5xl font-bold">
            Everything your team needs to manage prompts
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From shared libraries to security guardrails, TeamPrompt replaces
            scattered docs and Slack threads with a proper system.
          </p>
        </div>

        <div className="space-y-16">
          {features.map((feature, i) => {
            const Mockup = mockups[feature.title];
            return (
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
                  <p className="text-muted-foreground text-lg leading-relaxed">
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
                  {Mockup ? <Mockup /> : (
                    <div className="rounded-xl border border-border bg-card/50 aspect-video flex items-center justify-center">
                      <feature.icon className="h-16 w-16 text-muted-foreground/20" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold">See it for yourself</h2>
          <p className="mt-4 text-muted-foreground">
            Create a free workspace in under two minutes. No credit card
            required.
          </p>
          <Link href="/signup" className="mt-6 inline-block">
            <Button size="lg" className="text-base px-8">
              Start for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
