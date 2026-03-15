import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/marketing/section-label";
import { DarkSection } from "@/components/marketing/dark-section";
import { CTASection } from "@/components/marketing/cta-section";
import { FAQSection } from "@/components/marketing/faq-section";
import { StatsRow } from "@/components/marketing/stats-row";
import { BenefitsGrid } from "@/components/marketing/benefits-grid";
import { AppMockup } from "@/components/marketing/app-mockup";
import { ContactSalesModal } from "@/components/marketing/contact-sales-modal";
import { HeroImage } from "@/components/marketing/hero-image";
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
  ExternalLink,
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
    icon: Shield,
    title: "Company-Wide Security Rules",
    description:
      "Admins set data protection rules that apply to every employee. Block sensitive data — patient records, financials, passwords, and secrets — from reaching any AI tool.",
  },
  {
    icon: Users,
    title: "Team-Based Access Control",
    description:
      "Create teams with separate prompt libraries and security policies. Legal gets privilege detection rules, engineering gets API key blocking, finance gets payment card protections.",
  },
  {
    icon: BarChart3,
    title: "Full Activity Log",
    description:
      "Every AI interaction is logged — who sent what, when, to which tool, and whether a security rule was triggered. Export logs for compliance reviews.",
  },
  {
    icon: Key,
    title: "Single Sign-On (Coming Soon)",
    description:
      "We're building single sign-on and automatic user provisioning so employees get the right access on day one. Contact sales to join the early access program.",
  },
  {
    icon: FileCheck,
    title: "Compliance Rule Packs",
    description:
      "Pre-built security rules for regulated industries — healthcare (HIPAA), EU privacy (GDPR), payment cards (PCI-DSS), California privacy (CCPA), and more. Install with one click.",
  },
  {
    icon: Lock,
    title: "Secure by Default",
    description:
      "All data encrypted at rest and in transit. Security scanning happens server-side — your prompt content is never shared with third-party AI providers.",
    link: { href: "/security", label: "Learn about our data protection" },
  },
  {
    icon: FileText,
    title: "Activity & Violation Reports",
    description:
      "See which teams use AI most, how many violations were blocked, and your organization's risk posture at a glance. Export reports for internal compliance reviews.",
  },
];

const stats = [
  { value: "100%", label: "Browser coverage" },
  { value: "<5min", label: "IT deployment time" },
  { value: "0", label: "User setup steps" },
  { value: "5", label: "AI tools monitored" },
];

const capabilityBadges = [
  "Block Sensitive Data",
  "Full Activity Log",
  "Team-Level Control",
  "Auto-Install on Every Browser",
  "Scans Before Sending",
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
      "With auto-install, employees cannot disable or uninstall the extension. If they use an unmanaged browser, the activity log shows a gap — making unauthorized AI usage visible. For maximum coverage, pair the extension with network-level controls that route AI tool traffic through your proxy.",
  },
  {
    question: "Do you support regulated industries like healthcare and finance?",
    answer:
      "Yes. TeamPrompt can detect patient records, personal data, financial information, and other sensitive patterns. We include one-click compliance rule packs for HIPAA, GDPR, PCI-DSS, and more. Contact our sales team to discuss your specific regulatory requirements.",
  },
  {
    question: "Which compliance frameworks are supported?",
    answer:
      "TeamPrompt includes 6 one-click compliance rule packs: HIPAA (healthcare), GDPR (EU data protection), PCI-DSS (payment cards), CCPA (California privacy), SOC 2 (service organizations), and General PII detection. Each pack installs pre-configured security rules that detect and block the specific data patterns relevant to that framework.",
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
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
                Your employees paste customer
                <br />
                data into AI every day
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-xl leading-relaxed">
                Auto-install TeamPrompt on every company browser. Employees
                get data protection, a shared prompt library, and activity
                logging from day one — with zero setup on their end.
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
                <ContactSalesModal buttonVariant="outline-dark" />
              </div>
            </div>

            <HeroImage
              src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=640&q=80&auto=format&fit=crop"
              alt="Professional working at desk"
              badge={{
                icon: <Monitor className="h-4 w-4" />,
                headline: "Zero employee setup",
                subtitle: "Auto-install on every browser",
              }}
              dark
            />
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
                {"link" in feature && feature.link && (
                  <Link
                    href={(feature.link as { href: string; label: string }).href}
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-primary hover:underline"
                  >
                    {(feature.link as { href: string; label: string }).label}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
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

      {/* ━━━ CTA ━━━ */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <CTASection
            headline="Ready to protect your team's"
            gradientText="AI usage?"
            subtitle="Start with the free plan, or talk to sales about company-wide deployment."
            buttonText="Start for free"
          />
          <div className="flex items-center justify-center gap-6 mt-8 text-sm">
            <Link
              href="/security"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
            >
              <Shield className="h-4 w-4" />
              Data protection details
            </Link>
            <span className="text-border">|</span>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              Compare plans & pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
