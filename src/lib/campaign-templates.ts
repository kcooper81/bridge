/**
 * Pre-built email campaign templates designed to avoid spam filters.
 *
 * Best practices baked in:
 * - Clean HTML tables (no divs for layout)
 * - Text-to-image ratio > 80% text
 * - Unsubscribe link auto-injected by send route
 * - No ALL CAPS subjects
 * - From address matches verified domain
 * - Responsive design (mobile-friendly)
 * - Alt text on images
 * - No JavaScript, no forms, no attachments in HTML
 */

const BRAND_COLOR = "#2563EB";
const DARK_BG = "#0f1117";
const LIGHT_BG = "#f4f4f5";
const MUTED_TEXT = "#71717a";

export interface CampaignTemplate {
  id: string;
  name: string;
  category: "product-update" | "newsletter" | "announcement" | "onboarding" | "re-engagement" | "minimal";
  description: string;
  /** Suggested subject line (editable) */
  defaultSubject: string;
  /** Full HTML body */
  html: string;
  /** Preview text (shows in inbox preview) */
  previewText: string;
}

function wrap(body: string, previewText: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { color: ${BRAND_COLOR}; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; max-width: 100% !important; }
      .content-padding { padding: 24px 20px !important; }
      .mobile-full { width: 100% !important; display: block !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${LIGHT_BG}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <!-- Preview text -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${previewText}
    ${"&nbsp;&zwnj;".repeat(20)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${LIGHT_BG}; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" class="container" width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%;">
${body}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function headerBlock(): string {
  return `          <!-- Header -->
          <tr>
            <td style="background-color: ${DARK_BG}; padding: 24px 32px; border-radius: 12px 12px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 32px; height: 32px; vertical-align: middle;">
                    <img src="https://teamprompt.app/brand/social-profile-512.png" alt="TeamPrompt" width="32" height="32" style="display: block; border-radius: 8px;" />
                  </td>
                  <td style="padding-left: 12px;">
                    <span style="color: #e4e4e7; font-size: 18px; font-weight: 700;">TeamPrompt</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

function footerBlock(): string {
  return `          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 20px 32px; border-radius: 0 0 12px 12px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 4px; font-size: 13px; color: ${MUTED_TEXT};">
                TeamPrompt &mdash; Your team's AI prompt library
              </p>
              <a href="https://teamprompt.app" style="font-size: 13px; color: ${BRAND_COLOR}; text-decoration: none;">teamprompt.app</a>
            </td>
          </tr>`;
}

function ctaButton(text: string, url: string): string {
  return `              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td style="background-color: ${BRAND_COLOR}; border-radius: 8px;">
                    <a href="${url}" style="display: inline-block; padding: 12px 28px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none;">${text}</a>
                  </td>
                </tr>
              </table>`;
}

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  // ─── Product Update ────────────────────────────────────────
  {
    id: "product-update",
    name: "Product Update",
    category: "product-update",
    description: "Share new features and improvements with your users",
    defaultSubject: "What's new in TeamPrompt this month",
    previewText: "New features to help your team work smarter with AI",
    html: wrap(`
${headerBlock()}
          <!-- Body -->
          <tr>
            <td class="content-padding" style="background-color: #ffffff; padding: 32px;">
              <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #18181b;">What's New in TeamPrompt</h1>
              <p style="margin: 0 0 24px; font-size: 14px; color: ${MUTED_TEXT};">Here's what we've been building for you</p>

              <!-- Feature 1 -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; width: 100%;">
                <tr>
                  <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                    <div style="width: 32px; height: 32px; background-color: #EFF6FF; border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">&#x2728;</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #18181b;">[Feature Name]</p>
                    <p style="margin: 0; font-size: 14px; color: #3f3f46; line-height: 1.5;">[Describe the feature and how it helps users. Keep it concise — 1-2 sentences.]</p>
                  </td>
                </tr>
              </table>

              <!-- Feature 2 -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; width: 100%;">
                <tr>
                  <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                    <div style="width: 32px; height: 32px; background-color: #F0FDF4; border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">&#x1F6E1;</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #18181b;">[Feature Name]</p>
                    <p style="margin: 0; font-size: 14px; color: #3f3f46; line-height: 1.5;">[Describe the feature and how it helps users.]</p>
                  </td>
                </tr>
              </table>

              <!-- Feature 3 -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; width: 100%;">
                <tr>
                  <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                    <div style="width: 32px; height: 32px; background-color: #FEF3C7; border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px;">&#x26A1;</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #18181b;">[Feature Name]</p>
                    <p style="margin: 0; font-size: 14px; color: #3f3f46; line-height: 1.5;">[Describe the feature and how it helps users.]</p>
                  </td>
                </tr>
              </table>

${ctaButton("See What's New", "https://teamprompt.app/changelog")}

              <p style="font-size: 13px; color: ${MUTED_TEXT}; margin: 0;">Questions? Just reply to this email.</p>
            </td>
          </tr>
${footerBlock()}
`, "New features to help your team work smarter with AI"),
  },

  // ─── Newsletter ────────────────────────────────────────────
  {
    id: "newsletter",
    name: "Newsletter",
    category: "newsletter",
    description: "Monthly newsletter with tips, updates, and resources",
    defaultSubject: "The TeamPrompt Monthly — [Month] Edition",
    previewText: "Tips, updates, and resources for your AI workflow",
    html: wrap(`
${headerBlock()}
          <tr>
            <td class="content-padding" style="background-color: #ffffff; padding: 32px;">
              <h1 style="margin: 0 0 4px; font-size: 22px; font-weight: 700; color: #18181b;">The TeamPrompt Monthly</h1>
              <p style="margin: 0 0 24px; font-size: 14px; color: ${MUTED_TEXT};">[Month Year] Edition</p>

              <p style="margin: 0 0 20px; font-size: 15px; color: #3f3f46; line-height: 1.6;">
                Hi {{{FIRST_NAME|there}}},
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; color: #3f3f46; line-height: 1.6;">
                [Opening paragraph — what's been happening, what's exciting, set the tone.]
              </p>

              <!-- Section: Tip of the Month -->
              <div style="background-color: #EFF6FF; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: ${BRAND_COLOR}; text-transform: uppercase; letter-spacing: 1px;">Tip of the Month</p>
                <p style="margin: 0; font-size: 15px; color: #18181b; line-height: 1.6; font-weight: 500;">[Share a practical tip that helps users get more value from TeamPrompt.]</p>
              </div>

              <!-- Section: What's New -->
              <p style="margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #18181b;">What's New</p>
              <ul style="margin: 0 0 24px; padding-left: 20px; font-size: 14px; color: #3f3f46; line-height: 1.8;">
                <li>[Update 1]</li>
                <li>[Update 2]</li>
                <li>[Update 3]</li>
              </ul>

              <!-- Section: Resource -->
              <p style="margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #18181b;">Worth Reading</p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #3f3f46; line-height: 1.6;">
                [Link to a blog post, guide, or external resource that's relevant to your audience.]
              </p>

${ctaButton("Visit TeamPrompt", "https://teamprompt.app")}

              <p style="margin: 0; font-size: 13px; color: ${MUTED_TEXT};">
                Thanks for being part of the TeamPrompt community.<br />
                — The TeamPrompt Team
              </p>
            </td>
          </tr>
${footerBlock()}
`, "Tips, updates, and resources for your AI workflow"),
  },

  // ─── Announcement ──────────────────────────────────────────
  {
    id: "announcement",
    name: "Big Announcement",
    category: "announcement",
    description: "Major announcement or milestone to share",
    defaultSubject: "Big news from TeamPrompt",
    previewText: "We have something exciting to share with you",
    html: wrap(`
${headerBlock()}
          <tr>
            <td class="content-padding" style="background-color: #ffffff; padding: 32px; text-align: center;">
              <div style="width: 64px; height: 64px; background-color: #EFF6FF; border-radius: 16px; margin: 0 auto 20px; text-align: center; line-height: 64px; font-size: 32px;">&#x1F389;</div>
              <h1 style="margin: 0 0 12px; font-size: 26px; font-weight: 700; color: #18181b;">[Announcement Headline]</h1>
              <p style="margin: 0 0 24px; font-size: 16px; color: #3f3f46; line-height: 1.6; max-width: 440px; margin-left: auto; margin-right: auto;">
                [2-3 sentences explaining the announcement and why it matters to the reader.]
              </p>

${ctaButton("Learn More", "https://teamprompt.app")}

              <p style="font-size: 14px; color: #3f3f46; line-height: 1.6; margin: 0; text-align: left;">
                [Additional context or details. What should the reader do next? What does this mean for them?]
              </p>
            </td>
          </tr>
${footerBlock()}
`, "We have something exciting to share with you"),
  },

  // ─── Onboarding / Welcome ─────────────────────────────────
  {
    id: "welcome",
    name: "Welcome / Onboarding",
    category: "onboarding",
    description: "Welcome new users with getting-started tips",
    defaultSubject: "Welcome to TeamPrompt — here's how to get started",
    previewText: "Get the most out of TeamPrompt in 3 simple steps",
    html: wrap(`
${headerBlock()}
          <tr>
            <td class="content-padding" style="background-color: #ffffff; padding: 32px;">
              <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #18181b;">Welcome to TeamPrompt!</h1>
              <p style="margin: 0 0 24px; font-size: 15px; color: #3f3f46; line-height: 1.6;">
                Hi {{{FIRST_NAME|there}}}, thanks for joining. Here's how to get started in under 2 minutes:
              </p>

              <!-- Step 1 -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 16px; width: 100%;">
                <tr>
                  <td style="width: 36px; vertical-align: top;">
                    <div style="width: 28px; height: 28px; background-color: ${BRAND_COLOR}; border-radius: 50%; color: #fff; text-align: center; line-height: 28px; font-size: 14px; font-weight: 700;">1</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="margin: 0 0 2px; font-size: 15px; font-weight: 600; color: #18181b;">Install the browser extension</p>
                    <p style="margin: 0; font-size: 14px; color: #3f3f46; line-height: 1.5;">Works with ChatGPT, Claude, Gemini, Copilot, and Perplexity.</p>
                  </td>
                </tr>
              </table>

              <!-- Step 2 -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 16px; width: 100%;">
                <tr>
                  <td style="width: 36px; vertical-align: top;">
                    <div style="width: 28px; height: 28px; background-color: ${BRAND_COLOR}; border-radius: 50%; color: #fff; text-align: center; line-height: 28px; font-size: 14px; font-weight: 700;">2</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="margin: 0 0 2px; font-size: 15px; font-weight: 600; color: #18181b;">Create your first prompt</p>
                    <p style="margin: 0; font-size: 14px; color: #3f3f46; line-height: 1.5;">Use templates and variables to make it reusable across your team.</p>
                  </td>
                </tr>
              </table>

              <!-- Step 3 -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; width: 100%;">
                <tr>
                  <td style="width: 36px; vertical-align: top;">
                    <div style="width: 28px; height: 28px; background-color: ${BRAND_COLOR}; border-radius: 50%; color: #fff; text-align: center; line-height: 28px; font-size: 14px; font-weight: 700;">3</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="margin: 0 0 2px; font-size: 15px; font-weight: 600; color: #18181b;">Invite your team</p>
                    <p style="margin: 0; font-size: 14px; color: #3f3f46; line-height: 1.5;">Share prompts instantly. Everyone stays consistent, every time.</p>
                  </td>
                </tr>
              </table>

${ctaButton("Get Started", "https://teamprompt.app/home")}

              <p style="margin: 0; font-size: 13px; color: ${MUTED_TEXT};">Need help? Reply to this email or visit our <a href="https://teamprompt.app/help" style="color: ${BRAND_COLOR};">Help Center</a>.</p>
            </td>
          </tr>
${footerBlock()}
`, "Get the most out of TeamPrompt in 3 simple steps"),
  },

  // ─── Re-engagement ────────────────────────────────────────
  {
    id: "re-engagement",
    name: "Re-engagement",
    category: "re-engagement",
    description: "Win back inactive users with a friendly nudge",
    defaultSubject: "We miss you — here's what you're missing",
    previewText: "Your team's AI workflow is waiting for you",
    html: wrap(`
${headerBlock()}
          <tr>
            <td class="content-padding" style="background-color: #ffffff; padding: 32px;">
              <h1 style="margin: 0 0 12px; font-size: 22px; font-weight: 700; color: #18181b;">It's been a while!</h1>
              <p style="margin: 0 0 20px; font-size: 15px; color: #3f3f46; line-height: 1.6;">
                Hi {{{FIRST_NAME|there}}}, we noticed you haven't been around lately. A lot has changed since your last visit:
              </p>

              <div style="background-color: ${LIGHT_BG}; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #3f3f46; line-height: 1.8;">
                  <li><strong>[New feature 1]</strong> — [brief benefit]</li>
                  <li><strong>[New feature 2]</strong> — [brief benefit]</li>
                  <li><strong>[New feature 3]</strong> — [brief benefit]</li>
                </ul>
              </div>

              <p style="margin: 0 0 24px; font-size: 15px; color: #3f3f46; line-height: 1.6;">
                Your prompts are still there, waiting for you. Jump back in and see what's new.
              </p>

${ctaButton("Come Back", "https://teamprompt.app/home")}

              <p style="margin: 0; font-size: 13px; color: ${MUTED_TEXT};">
                If you have any feedback, we'd love to hear it. Just reply to this email.
              </p>
            </td>
          </tr>
${footerBlock()}
`, "Your team's AI workflow is waiting for you"),
  },

  // ─── Minimal / Plain ──────────────────────────────────────
  {
    id: "minimal",
    name: "Minimal / Personal",
    category: "minimal",
    description: "Clean, personal-style email — no heavy branding",
    defaultSubject: "[Subject]",
    previewText: "",
    html: wrap(`
          <tr>
            <td class="content-padding" style="background-color: #ffffff; padding: 32px; border-radius: 12px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #3f3f46; line-height: 1.6;">
                Hi {{{FIRST_NAME|there}}},
              </p>
              <p style="margin: 0 0 16px; font-size: 15px; color: #3f3f46; line-height: 1.6;">
                [Your message here. Keep it conversational and genuine. This template is designed to feel like a personal email from a real person.]
              </p>
              <p style="margin: 0 0 16px; font-size: 15px; color: #3f3f46; line-height: 1.6;">
                [Optional: Add a CTA or ask a question to encourage replies.]
              </p>
              <p style="margin: 0 0 4px; font-size: 15px; color: #3f3f46; line-height: 1.6;">
                Best,<br />
                [Your Name]
              </p>
              <p style="margin: 16px 0 0; font-size: 13px; color: ${MUTED_TEXT};">
                TeamPrompt &middot; <a href="https://teamprompt.app" style="color: ${BRAND_COLOR};">teamprompt.app</a>
              </p>
            </td>
          </tr>
`, ""),
  },
];

export const TEMPLATE_CATEGORIES = [
  { id: "product-update", label: "Product Update" },
  { id: "newsletter", label: "Newsletter" },
  { id: "announcement", label: "Announcement" },
  { id: "onboarding", label: "Onboarding" },
  { id: "re-engagement", label: "Re-engagement" },
  { id: "minimal", label: "Minimal" },
] as const;
