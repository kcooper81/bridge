import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateFAQSchema } from "@/lib/seo/schemas";
import { FAQSection } from "@/components/marketing/faq-section";
import { CTASection } from "@/components/marketing/cta-section";
import { SectionLabel } from "@/components/marketing/section-label";
import {
  Rocket,
  Archive,
  BookOpen,
  Shield,
  Chrome,
  Users,
  CreditCard,
  Lock,
  ChevronDown,
} from "lucide-react";
import { SupportForm } from "./_components/support-form";

export const metadata: Metadata = generatePageMetadata({
  title: "Help & Support",
  description:
    "Get answers about TeamPrompt — from getting started to billing. Browse documentation or contact our support team.",
  path: "/help",
});

const faqs = [
  {
    question: "Is TeamPrompt free to use?",
    answer:
      "Yes. The free plan includes up to 5 team members, 50 prompts, and core features like the browser extension. Paid plans unlock higher limits and advanced features like DLP guardrails.",
  },
  {
    question: "Which AI tools does the browser extension support?",
    answer:
      "ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity. The extension lets you insert prompts directly into any of these tools with one click.",
  },
  {
    question: "Can I use TeamPrompt without the browser extension?",
    answer:
      "Absolutely. The web app works on its own for managing prompts, collections, and team settings. The extension simply adds the convenience of inserting prompts directly into AI tools.",
  },
  {
    question: "How does DLP scanning protect my data?",
    answer:
      "DLP scanning checks text before it's sent to AI tools, looking for sensitive patterns like credit card numbers, SSNs, API keys, and custom patterns you define. Depending on severity, it can warn the user or block the message entirely.",
  },
  {
    question: "How do I contact support?",
    answer:
      "Use the support form on this page, or email us directly at support@teamprompt.app. We typically respond within one business day.",
  },
  {
    question: "Can I export my prompts?",
    answer:
      "Yes. You can copy any prompt to your clipboard from the prompt vault. Bulk export is available on paid plans.",
  },
];

const docCategories = [
  {
    icon: Rocket,
    title: "Getting Started",
    items: [
      {
        q: "How do I create a workspace?",
        a: "Sign up at teamprompt.app/signup. You'll be guided through creating your organization and inviting your first team members. The whole process takes under two minutes.",
      },
      {
        q: "How do I invite my team?",
        a: "Go to Settings → Members and click \"Invite Member.\" Enter their email address and choose a role (Admin, Manager, or Member). They'll receive an email invitation with a link to join.",
      },
      {
        q: "How do I install the browser extension?",
        a: "Visit the Chrome Web Store and search for \"TeamPrompt\" or click the extension link in your dashboard. After installing, sign in with your TeamPrompt account to sync your prompts.",
      },
      {
        q: "How do I create my first prompt?",
        a: "Click \"New Prompt\" from the Prompt Vault. Give it a title, write your prompt content (you can add {{variables}} for dynamic fields), and save. It's immediately available to your team.",
      },
    ],
  },
  {
    icon: Archive,
    title: "Prompt Vault",
    items: [
      {
        q: "How do I create and edit prompts?",
        a: "Click \"New Prompt\" in the vault and fill in the title, content, and optional tags. To edit, click any prompt to open it, make your changes, and save. Version history is maintained automatically.",
      },
      {
        q: "What are prompt templates?",
        a: "Templates are prompts with fill-in variables wrapped in double curly braces, like {{company_name}} or {{tone}}. When someone uses the template, they fill in the blanks to customize the prompt for their specific need.",
      },
      {
        q: "How do folders and tags work?",
        a: "Folders organize prompts hierarchically, while tags provide flexible cross-cutting labels. You can filter prompts by folder, tag, or both. Use folders for broad categories and tags for attributes like \"marketing\" or \"onboarding.\"",
      },
      {
        q: "What is the prompt approval workflow?",
        a: "Prompts can go through a draft → pending → approved workflow. Drafts are visible only to the author. When submitted for review, they move to pending status. Admins and managers can approve them to make them available to the full team.",
      },
      {
        q: "How do I share prompts with my team?",
        a: "Approved prompts are automatically shared with your team. You can also add prompts to collections for easier discovery, or share a direct link to any prompt.",
      },
    ],
  },
  {
    icon: BookOpen,
    title: "Collections & Guidelines",
    items: [
      {
        q: "How do collections work?",
        a: "Collections are curated groups of prompts for specific workflows, projects, or teams. Create a collection, add prompts to it, and share it with your team. Think of them as playlists for your prompts.",
      },
      {
        q: "What are quality guidelines?",
        a: "Quality guidelines are rules that define your team's standards for AI interactions — things like tone of voice, required disclaimers, or formatting preferences. They help ensure consistent, high-quality outputs.",
      },
      {
        q: "How do I enforce guidelines?",
        a: "Once created, guidelines are surfaced to team members when they write or use prompts. Depending on your settings, guidelines can be shown as suggestions or required before a prompt can be used.",
      },
      {
        q: "Can I install default guidelines?",
        a: "Yes. TeamPrompt includes a set of pre-built guidelines covering common needs like professional tone, data privacy reminders, and output formatting. You can install them with one click and customize them for your team.",
      },
    ],
  },
  {
    icon: Shield,
    title: "AI Guardrails",
    items: [
      {
        q: "What is DLP scanning?",
        a: "Data Loss Prevention (DLP) scanning analyzes text before it reaches AI tools, detecting sensitive information like personal data, financial details, or credentials. It's your safety net against accidentally sharing confidential data with AI.",
      },
      {
        q: "What patterns are detected by default?",
        a: "Built-in rules detect credit card numbers, Social Security numbers, API keys, email addresses, phone numbers, and common personal identifiers. These rules are active out of the box on plans that include guardrails.",
      },
      {
        q: "How do I create custom security rules?",
        a: "Go to Settings → Guardrails and click \"New Rule.\" Define a name, a regex pattern or keyword list, and choose the severity level. Custom rules run alongside the built-in detections.",
      },
      {
        q: "What's the difference between Block and Warn?",
        a: "Block severity prevents the message from being sent to the AI tool entirely. Warn severity shows an alert to the user but lets them proceed if they confirm the content is safe. All violations are logged for audit.",
      },
    ],
  },
  {
    icon: Chrome,
    title: "Browser Extension",
    items: [
      {
        q: "Which AI tools are supported?",
        a: "The extension works with ChatGPT, Claude, Gemini, Microsoft Copilot, and Perplexity. It detects these tools automatically and adds a TeamPrompt sidebar for quick prompt insertion.",
      },
      {
        q: "How do I install the extension?",
        a: "Install from the Chrome Web Store, then click the TeamPrompt icon in your browser toolbar and sign in. Your prompts and settings sync automatically from your workspace.",
      },
      {
        q: "How do I insert prompts into AI tools?",
        a: "Open any supported AI tool, click the TeamPrompt icon or use the keyboard shortcut, browse or search your prompts, and click to insert. Template variables are filled in before insertion.",
      },
      {
        q: "Does DLP scanning work in the extension?",
        a: "Yes. If your workspace has guardrails enabled, the extension scans messages in real-time before they're sent to the AI tool. Blocked content is prevented from being submitted, and warnings are shown inline.",
      },
    ],
  },
  {
    icon: Users,
    title: "Team Management",
    items: [
      {
        q: "What are the different roles?",
        a: "Admin: full access including billing, settings, and member management. Manager: can manage prompts, collections, and approve content. Member: can use prompts, create drafts, and view shared content.",
      },
      {
        q: "How do I invite and manage members?",
        a: "Navigate to Settings → Members. Click \"Invite Member\" to send email invitations. From the same page, you can change roles, assign members to teams, or remove members.",
      },
      {
        q: "How do teams work?",
        a: "Teams are sub-groups within your organization. You can assign prompts and collections to specific teams, making it easy to organize content by department or project.",
      },
      {
        q: "How do I remove a member?",
        a: "Go to Settings → Members, find the member, and click the remove button. Their account is deactivated and they lose access immediately. Content they created remains in the workspace.",
      },
    ],
  },
  {
    icon: CreditCard,
    title: "Billing & Plans",
    items: [
      {
        q: "What plans are available?",
        a: "Free (up to 5 members, 50 prompts), Team (up to 25 members with guardrails and advanced features), and Business (up to 500 members with full audit logging and priority support). See the pricing page for details.",
      },
      {
        q: "How do I upgrade or downgrade?",
        a: "Go to Settings → Billing and choose a new plan. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period. Prorated credits are applied automatically.",
      },
      {
        q: "Is there a free trial?",
        a: "Yes. All paid plans come with a 14-day free trial. No credit card is required to start. At the end of the trial, you'll be moved to the free plan unless you choose to subscribe.",
      },
      {
        q: "How do I cancel my subscription?",
        a: "Go to Settings → Billing and click \"Manage Subscription.\" You can cancel anytime. Your workspace stays active through the end of the billing period, and all your data is preserved.",
      },
    ],
  },
  {
    icon: Lock,
    title: "Account & Security",
    items: [
      {
        q: "How do I reset my password?",
        a: "Click \"Forgot Password\" on the login page and enter your email. You'll receive a link to set a new password. If you're already signed in, go to Settings → Account to change your password.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to Settings → Account and click \"Delete Account.\" This permanently removes your profile and personal data. If you're the only admin of a workspace, you'll need to transfer ownership or delete the workspace first.",
      },
      {
        q: "How is my data stored?",
        a: "All data is stored securely in Supabase (backed by PostgreSQL) with row-level security policies. Data is encrypted in transit via TLS. We do not sell or share your data with third parties.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFAQSchema(faqs)),
        }}
      />

      <div className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <div className="text-center mb-16 sm:mb-20">
            <SectionLabel className="text-center">Support</SectionLabel>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Help & Support
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about TeamPrompt. Browse the docs below
              or reach out to our team.
            </p>
          </div>

          {/* Documentation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
            {docCategories.map((cat) => (
              <details
                key={cat.title}
                className="group rounded-2xl border border-border bg-card overflow-hidden"
              >
                <summary className="flex items-center gap-4 p-6 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <cat.icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold flex-1">{cat.title}</h2>
                  <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 space-y-5">
                  {cat.items.map((item) => (
                    <div key={item.q}>
                      <h3 className="font-medium text-sm">{item.q}</h3>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>

          {/* FAQ */}
          <div className="mb-24">
            <FAQSection faqs={faqs} />
          </div>

          {/* Support Form */}
          <div className="max-w-2xl mx-auto mb-24">
            <SectionLabel className="text-center">Contact Us</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
              Send us a message
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Have a question, found a bug, or want to request a feature? Fill
              out the form below and we&apos;ll get back to you.
            </p>
            <SupportForm />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Prefer email? Reach us at{" "}
              <a
                href="mailto:support@teamprompt.app"
                className="text-primary hover:underline"
              >
                support@teamprompt.app
              </a>
            </p>
          </div>

          {/* CTA */}
          <CTASection
            headline="Ready to give your team"
            gradientText="a proper prompt system?"
            subtitle="Set up your workspace in under two minutes. No credit card needed."
          />
        </div>
      </div>
    </>
  );
}
