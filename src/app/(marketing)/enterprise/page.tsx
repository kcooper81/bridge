import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/marketing/section-label";
import { DarkSection } from "@/components/marketing/dark-section";
import { CTASection } from "@/components/marketing/cta-section";
import { FAQSection } from "@/components/marketing/faq-section";
import { StatsRow } from "@/components/marketing/stats-row";
import { BenefitsGrid } from "@/components/marketing/benefits-grid";
import { AppMockup } from "@/components/marketing/app-mockup";
import { generatePageMetadata } from "@/lib/seo/metadata";
import {
  ArrowRight,
  Shield,
  Monitor,
  Lock,
  Users,
  BarChart3,
  Key,
  Globe,
  Server,
  FileText,
} from "lucide-react";

export const metadata = generatePageMetadata({
  title: "TeamPrompt Enterprise — Managed AI for Your Organization",
  description:
    "Deploy TeamPrompt across your organization with Google Admin Console, Microsoft Intune, or any MDM. Force-install the Chrome extension, enforce guardrails, and maintain full audit trails.",
  path: "/enterprise",
  keywords: ["enterprise AI", "managed chrome extension", "MDM deployment", "AI compliance"],
});

const deploymentMethods = [
  {
    icon: Globe,
    name: "Google Admin Console",
    description:
      "Force-install the Chrome extension to every managed Chromebook and Chrome browser in your org. Users see TeamPrompt guardrails on day one — no opt-in required.",
    steps: [
      "Upload extension to Chrome Web Store (private or unlisted)",
      "Add extension ID to force-install policy in Admin Console",
      "Extension deploys silently to all managed browsers",
    ],
  },
  {
    icon: Monitor,
    name: "Microsoft Intune / MDM",
    description:
      "Push the extension via Intune, JAMF, or any MDM that manages Chrome policies. Works on Windows, macOS, and Linux endpoints.",
    steps: [
      "Configure ExtensionInstallForcelist registry key or policy",
      "Deploy via Intune configuration profile or GPO",
      "Extension installs on next policy sync",
    ],
  },
  {
    icon: Server,
    name: "Self-Managed Policy",
    description:
      "For air-gapped or restricted environments, deploy the extension via Group Policy Objects or Chrome ADMX templates.",
    steps: [
      "Download extension CRX for internal hosting",
      "Configure update_url to your internal server",
      "Push via GPO or configuration management tool",
    ],
  },
];

const platformFeatures = [
  {
    icon: Shield,
    title: "Organization-Wide Guardrails",
    description:
      "Admins set data-loss prevention rules that apply to every employee. Block sensitive data (PHI, PII, secrets, financials) from reaching any AI tool — ChatGPT, Claude, Gemini, Copilot, or Perplexity.",
  },
  {
    icon: Users,
    title: "Team-Based Access Control",
    description:
      "Create teams with separate prompt libraries and guardrail policies. Legal gets attorney-client privilege rules; engineering gets API key detection; finance gets PCI protections.",
  },
  {
    icon: BarChart3,
    title: "Full Audit Trail",
    description:
      "Every AI interaction is logged — who sent what, when, to which tool, and whether a guardrail was triggered. Export logs for compliance reviews or SIEM integration.",
  },
  {
    icon: Key,
    title: "SSO & Provisioning (Coming Soon)",
    description:
      "We're building SAML, OIDC, and SCIM provisioning so employees get the right access on day one. Contact sales to join the early access program.",
  },
  {
    icon: Lock,
    title: "Secure by Default",
    description:
      "All data encrypted at rest and in transit. Guardrail scanning happens server-side with no prompt content shared with third-party AI providers.",
  },
  {
    icon: FileText,
    title: "Activity & Violation Reports",
    description:
      "See which teams use AI most, how many violations were blocked, and your organization's risk posture at a glance. Export logs for internal compliance reviews.",
  },
];

const stats = [
  { value: "100%", label: "Browser coverage" },
  { value: "<5min", label: "MDM deployment" },
  { value: "0", label: "User setup steps" },
  { value: "6", label: "AI tools monitored" },
];

const capabilityBadges = [
  "Data Loss Prevention",
  "Audit Logging",
  "Role-Based Access",
  "MDM Deployment",
  "Real-Time Scanning",
];

const faqs = [
  {
    question: "How does force-install work?",
    answer:
      "When you add TeamPrompt's extension ID to your Chrome policy (via Google Admin Console, Intune, or GPO), the extension installs silently on all managed browsers. Users cannot disable or remove it. Guardrails activate immediately — no login or configuration needed on the employee's end.",
  },
  {
    question: "Does TeamPrompt see the content of our AI conversations?",
    answer:
      "When guardrails are active, the Chrome extension sends outbound prompt text to TeamPrompt's server for scanning against your organization's security policies. Sensitive content is detected and blocked before it reaches any AI tool. TeamPrompt does not share your prompt content with third-party AI providers. Conversation metadata (timestamps, tool used, action taken) is always logged. Full prompt text logging is optional and controlled by your admin.",
  },
  {
    question: "Which AI tools does the extension monitor?",
    answer:
      "ChatGPT (chat.openai.com and chatgpt.com), Claude (claude.ai), Google Gemini, GitHub Copilot, Microsoft Copilot, and Perplexity. We add new tools regularly based on customer requests.",
  },
  {
    question: "Can we set different guardrail rules per team?",
    answer:
      "Yes. Admins create guardrail policies at the organization level, then override or extend them per team. For example, the legal team might have stricter rules around privilege detection while the marketing team has lighter restrictions.",
  },
  {
    question: "What happens if an employee bypasses the extension?",
    answer:
      "With force-install via MDM, employees cannot disable or uninstall the extension. If they use an unmanaged browser, the audit log shows a gap in activity — making shadow AI usage visible. For maximum coverage, pair the extension with network-level controls that route AI tool traffic through your proxy.",
  },
  {
    question: "Do you support regulated industries like healthcare and finance?",
    answer:
      "TeamPrompt's guardrails can detect PHI, PII, financial data, and other sensitive information patterns. We're actively working toward formal compliance certifications. Contact our sales team to discuss your specific regulatory requirements.",
  },
];

export default function EnterprisePage() {
  return (
    <>
      {/* ━━━ HERO ━━━ */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(221 83% 53% / 0.25) 0%, transparent 60%)",
              "radial-gradient(ellipse 50% 40% at 20% 80%, hsl(260 60% 50% / 0.1) 0%, transparent 60%)",
            ].join(", "),
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-8">
              {capabilityBadges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 backdrop-blur-sm"
                >
                  <Shield className="h-3 w-3 text-blue-400" />
                  {badge}
                </span>
              ))}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              Deploy AI guardrails
              <br />
              across your entire org
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-xl leading-relaxed">
              Force-install TeamPrompt via MDM. Every managed browser gets
              real-time data loss prevention, prompt libraries, and audit
              logging — with zero employee setup.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="text-base px-8 h-12 rounded-full bg-white text-zinc-900 hover:bg-zinc-200 font-semibold"
                >
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="mailto:sales@teamprompt.app">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 h-12 rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white font-semibold bg-transparent"
                >
                  Talk to sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ STATS ━━━ */}
      <DarkSection className="mx-4 sm:mx-6 lg:mx-auto max-w-5xl -mt-8 relative z-10">
        <div className="py-4">
          <StatsRow stats={stats} dark className="max-w-3xl mx-auto" />
        </div>
      </DarkSection>

      {/* ━━━ HOW IT WORKS — DEPLOYMENT ━━━ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel>Deployment</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Three ways to roll out
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Push TeamPrompt to every managed browser in your organization.
              No employee action required.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
            {deploymentMethods.map((method) => (
              <div
                key={method.name}
                className="rounded-2xl border border-border bg-card p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <method.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{method.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {method.description}
                </p>
                <ol className="mt-4 space-y-2">
                  {method.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-muted-foreground leading-relaxed">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ APP MOCKUP ━━━ */}
      <section className="py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <SectionLabel>Admin Dashboard</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Visibility across every AI tool
            </h2>
          </div>
          <AppMockup
            variant="guardrails"
            items={[
              { title: "SSN detected in ChatGPT prompt", badge: "Blocked", stat: "2m ago" },
              { title: "API key found in Claude conversation", badge: "Blocked", stat: "15m ago" },
              { title: "Patient name in Gemini query", badge: "Blocked", stat: "1h ago" },
              { title: "Financial report shared safely", badge: "Warning", stat: "2h ago" },
            ]}
            sidebarUser={{ name: "IT Admin", initials: "IA" }}
            alertBanner={{
              type: "block",
              message: "3 violations blocked in the last 24 hours",
            }}
          />
        </div>
      </section>

      {/* ━━━ PLATFORM FEATURES ━━━ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel>Platform</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Enterprise-grade AI governance
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {platformFeatures.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-border bg-card p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ WHAT'S INCLUDED ━━━ */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel>Enterprise Plan</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything your IT team needs
            </h2>
          </div>

          <BenefitsGrid
            benefits={[
              "Unlimited users and teams",
              "Force-install Chrome extension via MDM",
              "Custom guardrail rules per team",
              "Full audit log with exportable reports",
              "SSO and SCIM provisioning (coming soon)",
              "Priority support",
              "Unlimited custom guidelines",
              "Import/export prompt packs",
              "Analytics dashboard",
              "Role-based access control",
            ]}
          />

          <div className="text-center mt-10">
            <Link href="mailto:sales@teamprompt.app">
              <Button
                size="lg"
                className="text-base px-8 h-12 rounded-full font-semibold"
              >
                Contact sales for pricing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━ FAQ ━━━ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FAQSection faqs={faqs} />
        </div>
      </section>

      {/* ━━━ CTA ━━━ */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <CTASection
            headline="Ready to secure AI"
            gradientText="across your organization?"
            subtitle="Start with the free plan, or talk to sales about enterprise deployment with MDM force-install."
            buttonText="Start for free"
          />
        </div>
      </section>
    </>
  );
}
