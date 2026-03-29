import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/marketing/section-label";
import { GetStartedSteps } from "@/components/marketing/get-started-steps";
import { LeadCaptureForm } from "@/components/marketing/lead-capture-form";
import { FAQSection } from "@/components/marketing/faq-section";
import { StatsRow } from "@/components/marketing/stats-row";
import { BenefitsGrid } from "@/components/marketing/benefits-grid";
import { AppMockup } from "@/components/marketing/app-mockup";
import { ContactSalesModal } from "@/components/marketing/contact-sales-modal";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo/schemas";
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
  FileCheck,
} from "lucide-react";

export const metadata = generatePageMetadata({
  title: "TeamPrompt Enterprise — AI Data Loss Prevention at Scale",
  description:
    "Deploy AI DLP across your organization with managed browser extension. Detect sensitive data, enforce compliance policies, and give teams a shared prompt library — from day one.",
  path: "/enterprise",
  keywords: ["enterprise AI DLP", "managed chrome extension", "AI data protection", "AI compliance", "enterprise AI governance"],
});

const deploymentMethods = [
  {
    icon: Globe,
    name: "Google Admin Console",
    description:
      "Auto-install the Chrome extension on every managed Chromebook and browser in your org. Employees get data protection on day one — no opt-in required.",
    steps: [
      "Upload extension to Chrome Web Store (private or unlisted)",
      "Add extension ID to auto-install policy in Admin Console",
      "Extension deploys silently to all managed browsers",
    ],
  },
  {
    icon: Monitor,
    name: "Microsoft Intune / MDM",
    description:
      "Push the extension via Intune, JAMF, or any device management tool that manages Chrome policies. Works on Windows, macOS, and Linux.",
    steps: [
      "Configure Chrome extension install policy",
      "Deploy via Intune configuration profile or Group Policy",
      "Extension installs automatically on next sync",
    ],
  },
  {
    icon: Server,
    name: "Self-Managed Policy",
    description:
      "For restricted or air-gapped environments, host and deploy the extension internally using Group Policy or Chrome admin templates.",
    steps: [
      "Download extension package for internal hosting",
      "Point the update URL to your internal server",
      "Push via Group Policy or configuration management tool",
    ],
  },
];

const platformFeatures = [
  {
    icon: Globe,
    title: "Cloudflare Gateway Integration",
    description:
      "Block unapproved AI tools at the DNS level via Cloudflare Gateway. Covers all devices — browser, native apps, mobile, and CLI. Approve trusted tools, block everything else.",
  },
  {
    icon: Shield,
    title: "40+ DLP Detection Rules",
    description:
      "Real-time DLP scanning catches SSNs, credit cards, API keys, patient data, passwords, and more. Three modes: block, warn, or auto-redact with safe placeholders.",
  },
  {
    icon: Users,
    title: "Team-Based Policies",
    description:
      "Create teams with separate security policies. Legal gets privilege detection, engineering gets API key blocking, finance gets payment card protections. All managed from one dashboard.",
  },
  {
    icon: BarChart3,
    title: "Audit Dashboard",
    description:
      "Sankey flow diagrams, violation heatmaps, risk score histograms, and compliance framework coverage. Filter by date range, action, and category. Export CSV or PDF.",
  },
  {
    icon: FileCheck,
    title: "19 Compliance Packs",
    description:
      "One-click install for HIPAA, SOC 2, PCI-DSS, GDPR, CCPA, FERPA, FedRAMP, and 12 more. Pre-configured detection rules for each regulatory framework.",
  },
  {
    icon: Key,
    title: "LLM Topic Classification",
    description:
      "Define sensitive topics in plain language — 'customer financial data', 'patient records'. AI classifies prompts against your topics using OpenAI or Anthropic.",
  },
  {
    icon: Lock,
    title: "AI Tool Policy",
    description:
      "Approve 18 AI tools individually. Blocked tools are enforced at browser level (extension) and network level (Cloudflare DNS). Policy changes logged for audit.",
  },
  {
    icon: FileText,
    title: "User Education on Block",
    description:
      "When a violation is blocked, users see a contextual explanation of WHY it matters and WHAT to do instead. Per-category guidance turns blocks into learning moments.",
  },
];

const stats = [
  { value: "2", label: "Protection layers (network + browser)" },
  { value: "40+", label: "Detection rules" },
  { value: "19", label: "Compliance frameworks" },
  { value: "18", label: "AI tools managed" },
];

const capabilityBadges = [
  "Network-Level AI Tool Blocking",
  "Content-Level DLP Scanning",
  "Cloudflare Gateway Integration",
  "19 Compliance Frameworks",
  "Auto-Install on Every Browser",
];

const faqs = [
  {
    question: "How does auto-install work?",
    answer:
      "When you add TeamPrompt's extension ID to your Chrome policy (via Google Admin Console, Intune, or Group Policy), the extension installs silently on all managed browsers. Users cannot disable or remove it. Data protection activates immediately — no login or configuration needed on the employee's end.",
  },
  {
    question: "Does TeamPrompt see the content of our AI conversations?",
    answer:
      "When data protection is active, the Chrome extension sends outbound text to TeamPrompt's server for scanning against your organization's security rules. Sensitive content is detected and blocked before it reaches any AI tool. TeamPrompt does not share your content with third-party AI providers. Activity metadata (timestamps, tool used, action taken) is always logged. Full text logging is optional and controlled by your admin.",
  },
  {
    question: "Which AI tools does the extension work with?",
    answer:
      "ChatGPT, Claude, Google Gemini, GitHub Copilot, Microsoft Copilot, and Perplexity. We add new tools regularly based on customer requests.",
  },
  {
    question: "Can we set different security rules per team?",
    answer:
      "Yes. Admins create security policies at the organization level, then customize them per team. For example, the legal team might have stricter rules around privilege detection while the marketing team has lighter restrictions.",
  },
  {
    question: "What happens if an employee bypasses the extension?",
    answer:
      "With auto-install, employees cannot disable or uninstall the extension. For maximum coverage, connect Cloudflare Gateway to block unapproved AI tools at the DNS level — this covers all devices including native apps, mobile, and CLI tools. Even if someone uses an unmanaged browser, the network-level blocking prevents access to unapproved tools.",
  },
  {
    question: "How does the Cloudflare Gateway integration work?",
    answer:
      "TeamPrompt integrates with Cloudflare Zero Trust Gateway to block unapproved AI tools at the DNS level. When you approve or block a tool in TeamPrompt, the change syncs to Cloudflare automatically. Any device on your corporate network (using Cloudflare WARP) can't access blocked AI tools. The free Cloudflare tier supports up to 50 users.",
  },
  {
    question: "Do you support regulated industries like healthcare and finance?",
    answer:
      "Yes. TeamPrompt can detect patient records, personal data, financial information, and other sensitive patterns. We include one-click compliance rule packs for HIPAA, GDPR, PCI-DSS, and more. Contact our sales team to discuss your specific regulatory requirements.",
  },
  {
    question: "Which compliance frameworks are supported?",
    answer:
      "TeamPrompt includes 19 one-click compliance packs covering HIPAA, HITECH, GDPR, PCI-DSS, CCPA, SOC 2, SOX, FERPA, GLBA, NIST 800-171, FedRAMP, ITAR, CJIS, COPPA, NAIC, FTC, RESPA/TILA, Legal Privilege, and General PII. Each pack installs pre-configured DLP rules that detect and block the specific data patterns relevant to that framework.",
  },
];

const breadcrumbs = generateBreadcrumbSchema([
  { name: "Home", url: "https://teamprompt.app" },
  { name: "Enterprise", url: "https://teamprompt.app/enterprise" },
]);
const faqSchema = generateFAQSchema(faqs);

export default function EnterprisePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* ━━━ HERO ━━━ Light, Lumia-inspired */}
      <section className="border-b border-border" style={{ background: "linear-gradient(180deg, #fff 0%, #F6F2FF 50%, #fff 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-20 sm:pt-40 sm:pb-28 text-center">
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {capabilityBadges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                <Shield className="h-3 w-3 text-primary" />
                {badge}
              </span>
            ))}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Your employees paste customer data into AI every day
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Two layers of AI protection: block unapproved tools at the network level with Cloudflare Gateway, and scan every prompt for sensitive data with the browser extension. Auto-install across your organization.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="text-base px-8 h-12 rounded-full font-semibold"
              >
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <ContactSalesModal />
          </div>
        </div>
      </section>

      {/* ━━━ STATS ━━━ */}
      <section className="py-10 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <StatsRow stats={stats} className="max-w-3xl mx-auto" />
        </div>
      </section>

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
              {
                title: "SSN detected in ChatGPT prompt",
                badge: "Blocked",
                stat: "2m ago",
                iconColor: "red",
                highlight: "block",
                subtitle: "HIPAA policy · ChatGPT",
              },
              {
                title: "API key found in Claude conversation",
                badge: "Blocked",
                stat: "15m ago",
                iconColor: "red",
                highlight: "block",
                subtitle: "Credentials policy · Claude",
              },
              {
                title: "Patient name in Gemini query",
                badge: "Blocked",
                stat: "1h ago",
                iconColor: "red",
                highlight: "block",
                subtitle: "PHI policy · Gemini",
              },
              {
                title: "Financial report shared safely",
                badge: "Warning",
                stat: "2h ago",
                iconColor: "amber",
                highlight: "warn",
                subtitle: "PCI-DSS policy · Copilot",
              },
            ]}
            sidebarUser={{ name: "IT Admin", initials: "IA" }}
            navBadges={{ Security: 4 }}
            alertBanner={{
              type: "block",
              message: "3 violations blocked in the last 24 hours",
            }}
            toasts={[
              {
                message: "SSN auto-redacted in outbound prompt",
                type: "success",
                position: "bottom-right",
              },
            ]}
          />
        </div>
      </section>

      {/* ━━━ PLATFORM FEATURES ━━━ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <SectionLabel>Platform</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Everything IT needs to manage AI usage
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
              "Auto-install browser extension on every company browser",
              "Different security rules for each team",
              "One-click compliance rules for healthcare, finance, and privacy regulations",
              "Automatically replace sensitive data with safe placeholders",
              "Full activity log with exportable reports",
              "Single sign-on and automatic user management (coming soon)",
              "Priority support",
              "Unlimited quality guidelines",
              "Import/export prompt packs between teams",
              "Analytics dashboard",
              "Role-based access control",
            ]}
          />

          <div className="text-center mt-10">
            <ContactSalesModal>
              <Button
                size="lg"
                className="text-base px-8 h-12 rounded-full font-semibold"
              >
                Contact sales for pricing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </ContactSalesModal>
          </div>
        </div>
      </section>

      {/* ━━━ FAQ ━━━ */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FAQSection faqs={faqs} includeSchema={false} />
        </div>
      </section>

      {/* ━━━ GET STARTED + LEAD CAPTURE ━━━ */}
      <div className="border-t border-border">
        <GetStartedSteps />
      </div>
      <LeadCaptureForm />
    </>
  );
}
