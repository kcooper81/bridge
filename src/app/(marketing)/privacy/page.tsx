import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { SectionLabel } from "@/components/marketing/section-label";

export const metadata: Metadata = generatePageMetadata({
  title: "Privacy Policy",
  description:
    "Learn how TeamPrompt collects, uses, and protects your data across our web app and Chrome extension.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="py-20 sm:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center mb-12">
          <SectionLabel className="text-center">Legal</SectionLabel>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: February 19, 2026
          </p>
        </div>

        {/* Intro */}
        <div className="mb-10">
          <p className="text-muted-foreground leading-relaxed">
            TeamPrompt (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;)
            operates the TeamPrompt web application at{" "}
            <a
              href="https://teamprompt.app"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              teamprompt.app
            </a>{" "}
            and the TeamPrompt Browser Extension (collectively, the
            &quot;Service&quot;). This Privacy Policy explains what data we
            collect, how we use it, and your rights regarding that data. We
            believe in being straightforward — no legalese, no surprises.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {/* 1. Information We Collect */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              1. Information We Collect
            </h2>

            <h3 className="text-base font-medium mb-2">Account Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              When you create an account, we collect your email address, display
              name, and profile avatar. You can sign up with Google OAuth, GitHub
              OAuth, or a standard email and password. For OAuth sign-ups, we
              only receive the basic profile information those providers share
              (name, email, and avatar) — we never receive your passwords from
              those services.
            </p>

            <h3 className="text-base font-medium mb-2">
              Organization Information
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              If you create or join an organization, we store the organization
              name, member list, and each member&apos;s role (owner, admin, or
              member).
            </p>

            <h3 className="text-base font-medium mb-2">Prompt Content</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We store the prompts you create, including prompt text, templates,
              collections, tags, and any associated metadata. This is the core
              data that powers TeamPrompt&apos;s prompt management features.
            </p>

            <h3 className="text-base font-medium mb-2">Usage Data</h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We record which prompts are used, when they are used, and which AI
              tool they are used with (e.g., ChatGPT, Claude, Gemini). This data
              helps surface analytics for your team, such as most-used prompts
              and adoption trends.
            </p>

            <h3 className="text-base font-medium mb-2">
              DLP &amp; Guardrails Data
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-3">
              If your organization uses our AI Guardrails feature, we log
              violation events. These logs include what type of sensitive data
              was detected, the severity level, and the action taken (blocked or
              warned). This data is used for your organization&apos;s audit
              trail.
            </p>

            <h3 className="text-base font-medium mb-2">Support Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              If you contact us through our support form, we collect whatever
              information you provide in your message, along with your email
              address so we can respond.
            </p>
          </section>

          {/* 2. How We Use Your Information */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use your information to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                Provide and operate the Service, including prompt storage,
                sharing, and team collaboration features
              </li>
              <li>
                Authenticate your identity and manage your account and
                organization memberships
              </li>
              <li>
                Generate usage analytics and insights for your team (e.g., which
                prompts are most popular, how adoption is trending)
              </li>
              <li>
                Enforce DLP/Guardrails policies your organization has configured
                and maintain audit logs of violations
              </li>
              <li>
                Send transactional emails such as organization invitations,
                password resets, and account notifications
              </li>
              <li>
                Process payments and manage your subscription through our payment
                provider
              </li>
              <li>
                Respond to support requests and communicate with you about your
                account
              </li>
              <li>
                Improve and maintain the Service, fix bugs, and develop new
                features
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We do <strong className="text-foreground">not</strong> sell your
              personal information. We do{" "}
              <strong className="text-foreground">not</strong> use your prompt
              content to train AI models. Your prompts belong to you and your
              organization.
            </p>
          </section>

          {/* 3. Chrome Extension Data Practices */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              3. Chrome Extension Data Practices
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The TeamPrompt Chrome Extension requires specific permissions to
              function. Here is exactly what it does and does not do:
            </p>

            <h3 className="text-base font-medium mb-2">What the extension does</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed mb-4">
              <li>
                Reads page content <strong className="text-foreground">only</strong> on
                supported AI tool websites — ChatGPT, Claude, Google Gemini,
                GitHub Copilot, and Perplexity — to insert prompts into the
                input field and scan outbound text for DLP policy violations
              </li>
              <li>
                Stores your authentication token in{" "}
                <code className="text-xs bg-muted/80 px-1.5 py-0.5 rounded font-mono">
                  browser.storage.local
                </code>{" "}
                so you stay logged in
              </li>
              <li>
                Communicates with the TeamPrompt API at teamprompt.app to fetch
                your prompts, log usage, and check guardrail policies
              </li>
            </ul>

            <h3 className="text-base font-medium mb-2">
              What the extension does NOT do
            </h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>Does not collect or access your browsing history</li>
              <li>Does not track you across websites</li>
              <li>
                Does not read page content on any website other than the
                supported AI tools listed above
              </li>
              <li>Does not sell or share your data with third parties for advertising</li>
              <li>
                Does not inject ads, modify search results, or alter web pages
                beyond inserting prompts into supported AI tool input fields
              </li>
            </ul>
          </section>

          {/* 4. Data Storage & Security */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              4. Data Storage &amp; Security
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Your data is stored in a PostgreSQL database managed by Supabase,
              with servers hosted in secure, SOC 2-compliant data centers. All
              data is encrypted in transit using TLS and at rest using AES-256
              encryption.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>HTTPS enforcement across all connections</li>
              <li>Row-level security policies in our database to isolate organization data</li>
              <li>Secure, HTTP-only authentication tokens</li>
              <li>Role-based access controls within organizations</li>
              <li>Regular security reviews of our codebase and infrastructure</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              While no system is 100% secure, we take reasonable and appropriate
              measures to protect your data. If we ever become aware of a
              security breach that affects your personal information, we will
              notify you promptly.
            </p>
          </section>

          {/* 5. Third-Party Services */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              5. Third-Party Services
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We use the following third-party services to operate TeamPrompt.
              Each service only receives the minimum data necessary to perform
              its function:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong className="text-foreground">Supabase</strong> —
                Database hosting and authentication. Your account data, prompts,
                and organization information are stored in Supabase-managed
                PostgreSQL.
              </li>
              <li>
                <strong className="text-foreground">Stripe</strong> — Payment
                processing. Stripe handles all credit card transactions
                directly. We do not store your credit card numbers — Stripe
                provides us only with a token reference and basic billing
                details (last four digits, expiration date).
              </li>
              <li>
                <strong className="text-foreground">Resend</strong> — Email
                delivery. Used to send transactional emails such as organization
                invitations, password resets, and account notifications. Resend
                receives recipient email addresses and email content.
              </li>
              <li>
                <strong className="text-foreground">Vercel</strong> — Application
                hosting. Our web application is deployed on Vercel&apos;s
                infrastructure. Vercel may process standard server logs
                (IP addresses, request timestamps) as part of hosting.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We do not share your data with any third parties for advertising
              or marketing purposes.
            </p>
          </section>

          {/* 6. Data Retention */}
          <section>
            <h2 className="text-xl font-semibold mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We retain your data for as long as your account is active or as
              needed to provide the Service. Specifically:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong className="text-foreground">Account data</strong> is
                retained until you delete your account
              </li>
              <li>
                <strong className="text-foreground">Prompt content</strong> is
                retained until you or your organization admin deletes it, or
                until your account is deleted
              </li>
              <li>
                <strong className="text-foreground">Usage analytics</strong> are
                retained for the lifetime of the organization
              </li>
              <li>
                <strong className="text-foreground">
                  DLP/Guardrails violation logs
                </strong>{" "}
                are retained for the lifetime of the organization for audit
                purposes
              </li>
              <li>
                <strong className="text-foreground">Support correspondence</strong>{" "}
                is retained for up to 2 years after resolution
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              When you delete your account, we remove your personal data from
              our active systems within 30 days. Some data may persist in
              encrypted backups for up to 90 days before being permanently
              deleted.
            </p>
          </section>

          {/* 7. Your Rights */}
          <section>
            <h2 className="text-xl font-semibold mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You have the following rights regarding your data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong className="text-foreground">Access</strong> — You can
                request a copy of all personal data we hold about you
              </li>
              <li>
                <strong className="text-foreground">Correction</strong> — You
                can update your account information at any time through your
                profile settings
              </li>
              <li>
                <strong className="text-foreground">Deletion</strong> — You can
                request that we delete your account and all associated personal
                data
              </li>
              <li>
                <strong className="text-foreground">Export</strong> — You can
                request an export of your prompts and data in a portable format
              </li>
              <li>
                <strong className="text-foreground">Restriction</strong> — You
                can request that we limit how we process your data in certain
                circumstances
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:support@teamprompt.app"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                support@teamprompt.app
              </a>
              . We will respond to your request within 30 days.
            </p>
          </section>

          {/* 8. Children's Privacy */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              8. Children&apos;s Privacy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              TeamPrompt is not intended for use by children under the age of
              13. We do not knowingly collect personal information from children
              under 13. If you are a parent or guardian and believe your child
              has provided us with personal information, please contact us at{" "}
              <a
                href="mailto:support@teamprompt.app"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                support@teamprompt.app
              </a>{" "}
              and we will promptly delete that information.
            </p>
          </section>

          {/* 9. Changes to This Policy */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              9. Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. When we make
              changes, we will update the &quot;Last updated&quot; date at the
              top of this page. For significant changes, we will notify you by
              email or through a notice in the app. We encourage you to review
              this policy periodically to stay informed about how we protect your
              data.
            </p>
          </section>

          {/* 10. Contact Us */}
          <section>
            <h2 className="text-xl font-semibold mb-4">10. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, your data, or
              your rights, please contact us at:
            </p>
            <div className="mt-4 rounded-xl border border-border bg-card p-6">
              <p className="font-medium">TeamPrompt</p>
              <p className="text-muted-foreground mt-1">
                Email:{" "}
                <a
                  href="mailto:support@teamprompt.app"
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  support@teamprompt.app
                </a>
              </p>
              <p className="text-muted-foreground mt-1">
                Web:{" "}
                <a
                  href="https://teamprompt.app"
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  teamprompt.app
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
