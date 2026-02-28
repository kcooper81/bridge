import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { SectionLabel } from "@/components/marketing/section-label";

export const metadata: Metadata = generatePageMetadata({
  title: "Terms of Use",
  description:
    "Terms of Use for TeamPrompt, the AI prompt management platform for teams. Read about your rights, responsibilities, and how we operate.",
  path: "/terms",
  keywords: ["terms of service", "terms of use"],
});

export default function TermsPage() {
  return (
    <div className="py-20 sm:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <SectionLabel className="text-center">Legal</SectionLabel>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Terms of Use
          </h1>
          <p className="mt-4 text-muted-foreground">
            Last updated: February 27, 2026
          </p>
        </div>

        <div className="space-y-10">
          {/* 1. Acceptance of Terms */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Welcome to TeamPrompt. By accessing or using our website at{" "}
              <a
                href="https://teamprompt.app"
                className="text-primary underline underline-offset-4"
              >
                teamprompt.app
              </a>
              , our browser extension, or any related services (collectively, the
              &ldquo;Service&rdquo;), you agree to be bound by these Terms of
              Use (&ldquo;Terms&rdquo;). If you do not agree to these Terms,
              please do not use the Service.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              These Terms apply to all visitors, users, and others who access or
              use the Service, whether on a free or paid plan. If you are using
              the Service on behalf of an organization, you represent that you
              have the authority to bind that organization to these Terms.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms from time to time. Your continued use of
              the Service after any changes constitutes acceptance of the updated
              Terms.
            </p>
          </section>

          {/* 2. Description of Service */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              2. Description of Service
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              TeamPrompt is an AI prompt management platform designed to help
              individuals and teams create, organize, share, and collaborate on
              prompts used with AI tools. The Service includes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 mb-3 pl-2">
              <li>
                A web application for managing prompts, folders, and team
                workspaces
              </li>
              <li>
                A browser extension for quick access to your prompt
                library and inserting prompts directly into AI tool interfaces
              </li>
              <li>
                Team collaboration features including shared prompt libraries,
                role-based access, and activity tracking
              </li>
              <li>
                AI Guardrails &mdash; data loss prevention (DLP) scanning that
                detects and blocks sensitive information in prompts before they
                reach AI tools
              </li>
              <li>
                Analytics and usage insights for team administrators
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              We are constantly improving TeamPrompt. We may add, change, or
              remove features at any time. We will make reasonable efforts to
              notify you of significant changes that affect your use of the
              Service.
            </p>
          </section>

          {/* 3. Account Registration */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              3. Account Registration
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              To use most features of the Service, you must create an account.
              When registering, you agree to the following:
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 mb-3 pl-2">
              <li>
                <span className="font-medium text-foreground">Age requirement:</span>{" "}
                You must be at least 13 years old to use TeamPrompt. If you are
                under the age of 18, you must have permission from a parent or
                guardian.
              </li>
              <li>
                <span className="font-medium text-foreground">Accurate information:</span>{" "}
                You agree to provide truthful, accurate, and complete
                information during registration and to keep your account
                information up to date.
              </li>
              <li>
                <span className="font-medium text-foreground">Account security:</span>{" "}
                You are responsible for safeguarding your password and any
                credentials associated with your account, including any
                two-factor authentication (2FA) devices or authenticator apps.
                If you enable 2FA and subsequently lose access to your
                authenticator device, you are responsible for contacting your
                organization administrator or our support team for account
                recovery. You agree to notify us immediately of any
                unauthorized access to or use of your account.
              </li>
              <li>
                <span className="font-medium text-foreground">Two-factor authentication:</span>{" "}
                Your organization may require admins and managers to enable
                two-factor authentication. When 2FA is required by your
                organization, you must enroll a TOTP authenticator app before
                you can fully access the Service. You are solely responsible
                for maintaining access to your authenticator device and any
                backup codes you may create.
              </li>
              <li>
                <span className="font-medium text-foreground">One person, one account:</span>{" "}
                Accounts are for individual use. Do not share your login
                credentials with others. Team features are available through
                workspace membership, not shared accounts.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              TeamPrompt is not liable for any loss or damage arising from your
              failure to maintain the security of your account.
            </p>
          </section>

          {/* 4. Acceptable Use */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              4. Acceptable Use
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You agree to use the Service only for lawful purposes and in
              accordance with these Terms. Specifically, you agree{" "}
              <span className="font-medium text-foreground">not</span> to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 mb-3 pl-2">
              <li>
                Use the Service to store, share, or distribute content that is
                illegal, harmful, threatening, abusive, harassing, defamatory,
                or otherwise objectionable
              </li>
              <li>
                Attempt to gain unauthorized access to any part of the Service,
                other users&apos; accounts, or any systems or networks connected
                to the Service
              </li>
              <li>
                Reverse engineer, decompile, disassemble, or otherwise attempt
                to discover the source code of the Service or any part thereof
              </li>
              <li>
                Use automated scripts, bots, scrapers, or other automated means
                to access or collect data from the Service without our prior
                written consent
              </li>
              <li>
                Interfere with, disrupt, or place an unreasonable burden on the
                Service or its infrastructure
              </li>
              <li>
                Resell, sublicense, or commercially exploit the Service without
                our explicit permission
              </li>
              <li>
                Impersonate any person or entity, or misrepresent your
                affiliation with a person or entity
              </li>
              <li>
                Use the Service to violate the terms of service of any
                third-party AI tool or platform
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to investigate and take appropriate action
              against anyone who violates these restrictions, including removing
              content, suspending accounts, and reporting activity to law
              enforcement.
            </p>
          </section>

          {/* 5. Content Ownership */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              5. Content Ownership
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <span className="font-medium text-foreground">Your content:</span>{" "}
              You retain full ownership of any prompts, templates, folders, and
              other content you create or upload to TeamPrompt
              (&ldquo;User Content&rdquo;). We do not claim ownership of your
              content.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <span className="font-medium text-foreground">License to us:</span>{" "}
              By submitting User Content to the Service, you grant TeamPrompt a
              limited, non-exclusive, worldwide, royalty-free license to host,
              store, display, reproduce, and transmit your User Content solely
              for the purpose of operating and providing the Service to you and
              your team. This license exists only for as long as your content
              remains on the platform and terminates when you delete your content
              or your account.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <span className="font-medium text-foreground">Shared content:</span>{" "}
              When you share prompts with your team or workspace, those team
              members will be able to view, copy, and use those prompts within
              the Service. If you leave a team or workspace, content you shared
              with the team may remain accessible to the team.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Our content:</span>{" "}
              The Service itself &mdash; including its design, logos, code,
              documentation, and any built-in prompt templates &mdash; is owned
              by TeamPrompt and protected by intellectual property laws. You may
              not copy, modify, or distribute any part of the Service without
              our permission.
            </p>
          </section>

          {/* 6. Browser Extension Terms */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              6. Browser Extension Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The TeamPrompt Browser Extension is an optional component of the
              Service that allows you to access your prompt library directly
              within supported AI tool websites. By installing and using the
              extension, you acknowledge and agree to the following:
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 mb-3 pl-2">
              <li>
                <span className="font-medium text-foreground">Page access:</span>{" "}
                The extension requests permission to access certain web pages
                (specifically, supported AI tool sites such as ChatGPT, Claude,
                Gemini, and similar platforms) in order to insert prompts into
                text fields and provide DLP scanning of outbound content. The
                extension does not access pages beyond the supported AI tool
                sites.
              </li>
              <li>
                <span className="font-medium text-foreground">Data handling:</span>{" "}
                The extension reads text you are composing in AI tool interfaces
                to provide features like prompt insertion and DLP scanning. This
                data is processed locally or transmitted to our servers only as
                needed to deliver the Service. We do not sell or share this data
                with third parties.
              </li>
              <li>
                <span className="font-medium text-foreground">Authentication:</span>{" "}
                The extension syncs your authentication session from the
                TeamPrompt web application. You must be signed in to
                teamprompt.app for the extension to function.
              </li>
              <li>
                <span className="font-medium text-foreground">Updates:</span>{" "}
                The extension may be updated automatically through the Chrome Web
                Store. Continued use after updates constitutes acceptance of any
                changes.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              You can revoke the extension&apos;s permissions or uninstall it at
              any time through your browser settings.
            </p>
          </section>

          {/* 7. Plans & Billing */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              7. Plans &amp; Billing
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              TeamPrompt offers both free and paid plans:
            </p>
            <ul className="list-disc list-inside text-muted-foreground leading-relaxed space-y-2 mb-3 pl-2">
              <li>
                <span className="font-medium text-foreground">Free tier:</span>{" "}
                Includes core prompt management features with usage limits.
                No credit card is required.
              </li>
              <li>
                <span className="font-medium text-foreground">Paid plans:</span>{" "}
                Offer additional features, higher limits, team collaboration
                tools, and advanced security capabilities. Paid plans are billed
                on a recurring basis (monthly or annually) as described on our
                pricing page.
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mb-3">
              All payments are processed securely through Stripe. TeamPrompt does
              not store your full credit card information on our servers.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <span className="font-medium text-foreground">Cancellation:</span>{" "}
              You may cancel your paid subscription at any time from your account
              settings. Upon cancellation, your subscription will remain active
              until the end of the current billing period. After that, your
              account will revert to the free tier. We do not provide prorated
              refunds for partial billing periods.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Price changes:</span>{" "}
              We may change our pricing from time to time. If we change pricing
              for your current plan, we will notify you at least 30 days in
              advance. Continued use of a paid plan after a price change takes
              effect constitutes acceptance of the new price.
            </p>
          </section>

          {/* 8. Termination */}
          <section>
            <h2 className="text-xl font-semibold mb-4">8. Termination</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <span className="font-medium text-foreground">By you:</span>{" "}
              You may stop using the Service at any time. You can delete your
              account from your account settings, which will permanently remove
              your personal data and private content from our systems, subject to
              our data retention practices and legal obligations.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <span className="font-medium text-foreground">By us:</span>{" "}
              We reserve the right to suspend or terminate your account and
              access to the Service at any time, with or without notice, for
              conduct that we determine, in our sole discretion, violates these
              Terms, is harmful to other users or the Service, or for any other
              reason we deem appropriate. In cases of serious violations, we may
              terminate your account immediately without warning.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Upon termination, your right to use the Service ceases
              immediately. Sections of these Terms that by their nature should
              survive termination (such as content ownership, disclaimers,
              limitation of liability, and governing law) will continue to apply.
            </p>
          </section>

          {/* 9. Disclaimers */}
          <section>
            <h2 className="text-xl font-semibold mb-4">9. Disclaimers</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; basis, without warranties of any kind, either
              express or implied, including but not limited to implied warranties
              of merchantability, fitness for a particular purpose, and
              non-infringement.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              TeamPrompt does not warrant that the Service will be
              uninterrupted, error-free, or completely secure. We do not
              guarantee any specific level of uptime or availability, though we
              strive to maintain reliable service.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Our AI Guardrails (DLP scanning) feature is designed to help
              detect sensitive information, but it is not a guarantee against
              data leaks. No automated scanning system is perfect. You remain
              responsible for reviewing content before sharing it with AI tools.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              TeamPrompt is a prompt management tool. We are not responsible for
              the outputs generated by third-party AI tools using prompts stored
              on or distributed through our Service.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our two-factor authentication (2FA) feature provides an
              additional layer of account security but does not guarantee
              absolute protection against unauthorized access. TeamPrompt is
              not liable for any loss or damage resulting from your failure to
              enable or properly maintain 2FA, loss of access to your
              authenticator device, or unauthorized access to your account
              regardless of whether 2FA was enabled. Organization
              administrators who enable the &ldquo;Require 2FA&rdquo; setting
              are responsible for communicating this requirement to their team
              members and assisting with account recovery when needed.
            </p>
          </section>

          {/* 10. Limitation of Liability */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              10. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              To the maximum extent permitted by applicable law, TeamPrompt and
              its officers, directors, employees, and agents shall not be liable
              for any indirect, incidental, special, consequential, or punitive
              damages, including but not limited to loss of profits, data,
              business opportunities, or goodwill, arising out of or in
              connection with your use of or inability to use the Service.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Without limiting the foregoing, TeamPrompt shall not be liable for
              any damages arising from: (a) your failure to enable or maintain
              two-factor authentication; (b) loss of access to your
              authenticator device or recovery credentials; (c) unauthorized
              access to your account, whether or not 2FA was enabled; or (d)
              any action taken or not taken by your organization administrator
              regarding 2FA enforcement policies.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              In no event shall TeamPrompt&apos;s total liability to you for all
              claims arising out of or related to the Service exceed the amount
              you have paid to TeamPrompt in the twelve (12) months preceding the
              event giving rise to the liability, or one hundred U.S. dollars
              ($100), whichever is greater.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Some jurisdictions do not allow the exclusion or limitation of
              certain damages. In those jurisdictions, our liability is limited
              to the greatest extent permitted by law.
            </p>
          </section>

          {/* 11. Changes to Terms */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              11. Changes to Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We reserve the right to modify these Terms at any time. When we
              make changes, we will update the &ldquo;Last updated&rdquo; date
              at the top of this page.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              For material changes that significantly affect your rights or
              obligations, we will make reasonable efforts to notify you in
              advance through the Service (such as a banner or email
              notification). Your continued use of the Service after changes take
              effect constitutes acceptance of the revised Terms.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              If you do not agree with the updated Terms, you should stop using
              the Service and delete your account.
            </p>
          </section>

          {/* 12. Governing Law */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              12. Governing Law
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              These Terms shall be governed by and construed in accordance with
              the laws of the United States and the State of Delaware, without
              regard to its conflict of law provisions.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Any disputes arising from or relating to these Terms or the
              Service shall be resolved in the state or federal courts located in
              Delaware. You consent to the personal jurisdiction and venue of
              such courts. Before filing any claim, you agree to attempt to
              resolve the dispute informally by contacting us at{" "}
              <a
                href="mailto:support@teamprompt.app"
                className="text-primary underline underline-offset-4"
              >
                support@teamprompt.app
              </a>
              .
            </p>
          </section>

          {/* 13. Contact */}
          <section>
            <h2 className="text-xl font-semibold mb-4">13. Contact</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              If you have any questions about these Terms, please contact us:
            </p>
            <ul className="text-muted-foreground leading-relaxed space-y-2 pl-2">
              <li>
                <span className="font-medium text-foreground">Email:</span>{" "}
                <a
                  href="mailto:support@teamprompt.app"
                  className="text-primary underline underline-offset-4"
                >
                  support@teamprompt.app
                </a>
              </li>
              <li>
                <span className="font-medium text-foreground">Website:</span>{" "}
                <a
                  href="https://teamprompt.app"
                  className="text-primary underline underline-offset-4"
                >
                  teamprompt.app
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
