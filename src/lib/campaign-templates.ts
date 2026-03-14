/**
 * Pre-built email campaign templates designed to avoid spam filters.
 *
 * Each template defines:
 * - `fields` — named, labeled form fields the user fills in
 * - `build(values)` — generates the final HTML from field values
 *
 * Best practices baked in:
 * - Clean HTML tables (no divs for layout)
 * - Text-to-image ratio > 80% text
 * - Unsubscribe link auto-injected by send route
 * - No ALL CAPS subjects
 * - From address matches verified domain
 * - Responsive design (mobile-friendly)
 * - No JavaScript, no forms, no attachments in HTML
 */

const BRAND_COLOR = "#2563EB";
const LIGHT_BG = "#f4f4f5";
const MUTED_TEXT = "#71717a";

export interface TemplateField {
  key: string;
  label: string;
  type: "text" | "textarea";
  placeholder: string;
  default?: string;
}

/** A repeatable group of fields (e.g. features, benefits). */
export interface RepeatableGroup {
  key: string;
  label: string;
  addLabel: string;
  min: number;
  max: number;
  defaultCount: number;
  fields: (Omit<TemplateField, "key"> & { suffix: string })[];
}

export interface CampaignTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultSubject: string;
  previewText: string;
  fields: TemplateField[];
  repeatableGroups?: RepeatableGroup[];
  /** Build final HTML from field values. Repeatable items use keys like `features_0_name`. */
  build: (values: Record<string, string>) => string;
  /** Static HTML for preview when no fields are filled */
  html: string;
}

// ─── Shared blocks ───────────────────────────────────────────

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
            <td style="background-color: #ffffff; padding: 24px 32px; border-radius: 12px 12px 0 0; border-bottom: 1px solid #e4e4e7;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 32px; height: 32px; vertical-align: middle;">
                    <img src="https://teamprompt.app/brand/social-profile-512.png" alt="TeamPrompt" width="32" height="32" style="display: block; border-radius: 8px;" />
                  </td>
                  <td style="padding-left: 12px;">
                    <span style="color: #18181b; font-size: 18px; font-weight: 700;">TeamPrompt</span>
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

/** Standalone branded footer — can be appended to any email */
export function teamPromptFooterHtml(): string {
  return `
<!-- TeamPrompt Footer -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 0 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%;">
        <tr>
          <td style="padding: 24px 32px; text-align: center;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
              <tr>
                <td style="width: 20px; height: 20px; vertical-align: middle;">
                  <img src="https://teamprompt.app/brand/social-profile-512.png" alt="TeamPrompt" width="20" height="20" style="display: block; border-radius: 4px;" />
                </td>
                <td style="padding-left: 8px; vertical-align: middle;">
                  <span style="font-size: 13px; color: ${MUTED_TEXT};">Sent with </span>
                  <a href="https://teamprompt.app" style="font-size: 13px; color: ${BRAND_COLOR}; text-decoration: none; font-weight: 500;">TeamPrompt</a>
                </td>
              </tr>
            </table>
            <p style="margin: 8px 0 0; font-size: 11px; color: #a1a1aa;">
              Your team&rsquo;s AI prompt library &middot; <a href="https://teamprompt.app" style="color: #a1a1aa; text-decoration: underline;">teamprompt.app</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

/** Marker comment used to detect if the footer is already present */
export const FOOTER_MARKER = "<!-- TeamPrompt Footer -->";

/** Escape HTML entities in user input */
function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Get field value or placeholder fallback */
function v(values: Record<string, string>, key: string, fallback: string): string {
  const val = values[key]?.trim();
  return val ? esc(val) : fallback;
}

/** Count how many items exist in a repeatable group (checks key existence, not just non-empty values) */
function repeatCount(values: Record<string, string>, groupKey: string, suffixes: string[]): number {
  let count = 0;
  for (let i = 0; i < 20; i++) {
    const hasAny = suffixes.some((s) => `${groupKey}_${i}_${s}` in values);
    if (hasAny) count = i + 1;
    else if (i >= 3 && !hasAny) break;
  }
  return Math.max(count, 0);
}

// ─── Feature block helper ────────────────────────────────────

function featureBlock(icon: string, bgColor: string, title: string, desc: string): string {
  return `              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; width: 100%;">
                <tr>
                  <td style="width: 40px; vertical-align: top; padding-top: 2px;">
                    <div style="width: 32px; height: 32px; background-color: ${bgColor}; border-radius: 8px; text-align: center; line-height: 32px; font-size: 16px; color: ${BRAND_COLOR}; font-weight: bold;">${icon}</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #18181b;">${title}</p>
                    <p style="margin: 0; font-size: 14px; color: #3f3f46; line-height: 1.5;">${desc}</p>
                  </td>
                </tr>
              </table>`;
}

// ─── Templates ───────────────────────────────────────────────

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  // ─── Product Update ────────────────────────────────────────
  {
    id: "product-update",
    name: "Product Update",
    category: "Product",
    description: "Share new features and improvements with your users",
    defaultSubject: "What's new in TeamPrompt this month",
    previewText: "New features to help your team work smarter with AI",
    fields: [
      { key: "headline", label: "Headline", type: "text", placeholder: "What's New in TeamPrompt", default: "What's New in TeamPrompt" },
      { key: "subtitle", label: "Subtitle", type: "text", placeholder: "Here's what we've been building for you" },
      { key: "cta_text", label: "Button Text", type: "text", placeholder: "See What's New", default: "See What's New" },
      { key: "cta_url", label: "Button URL", type: "text", placeholder: "https://teamprompt.app/changelog", default: "https://teamprompt.app/changelog" },
    ],
    repeatableGroups: [
      {
        key: "features",
        label: "Features",
        addLabel: "Add Feature",
        min: 1,
        max: 10,
        defaultCount: 3,
        fields: [
          { suffix: "name", label: "Name", type: "text", placeholder: "e.g. Prompt Version History" },
          { suffix: "desc", label: "Description", type: "textarea", placeholder: "Describe the feature. 1-2 sentences." },
        ],
      },
    ],
    build(vals) {
      const count = Math.max(repeatCount(vals, "features", ["name", "desc"]), 1);
      const blocks = Array.from({ length: count }, (_, i) =>
        featureBlock(
          "&#x2713;",
          ["#EFF6FF", "#F0FDF4", "#FEF3C7", "#F0F9FF", "#ECFDF5"][i % 5],
          v(vals, `features_${i}_name`, "[Feature Name]"),
          v(vals, `features_${i}_desc`, "[Describe the feature.]"),
        )
      ).join("\n");
      return wrap(`
${headerBlock()}
          <tr>
            <td class="content-padding" style="background-color: #ffffff; padding: 32px;">
              <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #18181b;">${v(vals, "headline", "What's New in TeamPrompt")}</h1>
              <p style="margin: 0 0 24px; font-size: 14px; color: ${MUTED_TEXT};">${v(vals, "subtitle", "Here's what we've been building for you")}</p>
${blocks}
${ctaButton(v(vals, "cta_text", "See What's New"), vals.cta_url?.trim() || "https://teamprompt.app/changelog")}
              <p style="font-size: 13px; color: ${MUTED_TEXT}; margin: 0;">Questions? Just reply to this email.</p>
            </td>
          </tr>
${footerBlock()}
`, this.previewText);
    },
    get html() { return this.build({}); },
  },

  // ─── Newsletter ────────────────────────────────────────────
  {
    id: "newsletter",
    name: "Newsletter",
    category: "Product",
    description: "Monthly newsletter with tips, updates, and resources",
    defaultSubject: "The TeamPrompt Monthly",
    previewText: "Tips, updates, and resources for your AI workflow",
    fields: [
      { key: "edition", label: "Edition", type: "text", placeholder: "March 2026", default: "" },
      { key: "intro", label: "Opening Paragraph", type: "textarea", placeholder: "What's been happening, what's exciting, set the tone..." },
      { key: "tip", label: "Tip of the Month", type: "textarea", placeholder: "Share a practical tip that helps users get more value from TeamPrompt." },
      { key: "resource", label: "Worth Reading", type: "textarea", placeholder: "Link to a blog post, guide, or resource relevant to your audience." },
      { key: "cta_text", label: "Button Text", type: "text", placeholder: "Visit TeamPrompt", default: "Visit TeamPrompt" },
      { key: "cta_url", label: "Button URL", type: "text", placeholder: "https://teamprompt.app", default: "https://teamprompt.app" },
    ],
    repeatableGroups: [
      {
        key: "updates",
        label: "What's New",
        addLabel: "Add Update",
        min: 1,
        max: 10,
        defaultCount: 3,
        fields: [
          { suffix: "text", label: "Update", type: "text", placeholder: "e.g. Added team analytics dashboard" },
        ],
      },
    ],
    build(vals) {
      const count = Math.max(repeatCount(vals, "updates", ["text"]), 1);
      const items = Array.from({ length: count }, (_, i) =>
        `                <li>${v(vals, `updates_${i}_text`, "[Update]")}</li>`
      ).join("\n");
      return wrap(`
${headerBlock()}
          <tr>
            <td class="content-padding" style="background-color: #ffffff; padding: 32px;">
              <h1 style="margin: 0 0 4px; font-size: 22px; font-weight: 700; color: #18181b;">The TeamPrompt Monthly</h1>
              <p style="margin: 0 0 24px; font-size: 14px; color: ${MUTED_TEXT};">${v(vals, "edition", "[Month Year]")} Edition</p>
              <p style="margin: 0 0 20px; font-size: 15px; color: #3f3f46; line-height: 1.6;">Hi {{{FIRST_NAME|there}}},</p>
              <p style="margin: 0 0 24px; font-size: 15px; color: #3f3f46; line-height: 1.6;">${v(vals, "intro", "[Opening paragraph — set the tone.]")}</p>
              <div style="background-color: #EFF6FF; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: ${BRAND_COLOR}; text-transform: uppercase; letter-spacing: 1px;">Tip of the Month</p>
                <p style="margin: 0; font-size: 15px; color: #18181b; line-height: 1.6; font-weight: 500;">${v(vals, "tip", "[Share a practical tip.]")}</p>
              </div>
              <p style="margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #18181b;">What's New</p>
              <ul style="margin: 0 0 24px; padding-left: 20px; font-size: 14px; color: #3f3f46; line-height: 1.8;">
${items}
              </ul>
              <p style="margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #18181b;">Worth Reading</p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #3f3f46; line-height: 1.6;">${v(vals, "resource", "[Link to a blog post or resource.]")}</p>
${ctaButton(v(vals, "cta_text", "Visit TeamPrompt"), vals.cta_url?.trim() || "https://teamprompt.app")}
              <p style="margin: 0; font-size: 13px; color: ${MUTED_TEXT};">Thanks for being part of the TeamPrompt community.<br />&mdash; The TeamPrompt Team</p>
            </td>
          </tr>
${footerBlock()}
`, this.previewText);
    },
    get html() { return this.build({}); },
  },

  // ─── Announcement ──────────────────────────────────────────
  {
    id: "announcement",
    name: "Big Announcement",
    category: "Product",
    description: "Major announcement or milestone to share",
    defaultSubject: "Big news from TeamPrompt",
    previewText: "We have something exciting to share with you",
    fields: [
      { key: "headline", label: "Headline", type: "text", placeholder: "e.g. We Just Launched Teams!" },
      { key: "body", label: "Main Message", type: "textarea", placeholder: "2-3 sentences explaining the announcement and why it matters." },
      { key: "details", label: "Additional Details", type: "textarea", placeholder: "What should the reader do next? What does this mean for them?" },
      { key: "cta_text", label: "Button Text", type: "text", placeholder: "Learn More", default: "Learn More" },
      { key: "cta_url", label: "Button URL", type: "text", placeholder: "https://teamprompt.app", default: "https://teamprompt.app" },
    ],
    build(vals) {
      return wrap(`
${headerBlock()}
          <tr>
            <td class="content-padding" style="background-color: #ffffff; padding: 32px; text-align: center;">
              <div style="width: 64px; height: 64px; background-color: #EFF6FF; border-radius: 16px; margin: 0 auto 20px; text-align: center; line-height: 64px; font-size: 28px; color: ${BRAND_COLOR};">&#x2605;</div>
              <h1 style="margin: 0 0 12px; font-size: 26px; font-weight: 700; color: #18181b;">${v(vals, "headline", "[Announcement Headline]")}</h1>
              <p style="margin: 0 0 24px; font-size: 16px; color: #3f3f46; line-height: 1.6; max-width: 440px; margin-left: auto; margin-right: auto;">${v(vals, "body", "[2-3 sentences explaining the announcement.]")}</p>
${ctaButton(v(vals, "cta_text", "Learn More"), vals.cta_url?.trim() || "https://teamprompt.app")}
              <p style="font-size: 14px; color: #3f3f46; line-height: 1.6; margin: 0; text-align: left;">${v(vals, "details", "[Additional context or details.]")}</p>
            </td>
          </tr>
${footerBlock()}
`, this.previewText);
    },
    get html() { return this.build({}); },
  },

  // ─── Welcome / Onboarding ──────────────────────────────────
  {
    id: "welcome",
    name: "Welcome / Onboarding",
    category: "Product",
    description: "Welcome new users with getting-started tips",
    defaultSubject: "Welcome to TeamPrompt — here's how to get started",
    previewText: "Get the most out of TeamPrompt in 3 simple steps",
    fields: [
      { key: "step1_title", label: "Step 1 — Title", type: "text", placeholder: "Install the browser extension", default: "Install the browser extension" },
      { key: "step1_desc", label: "Step 1 — Description", type: "text", placeholder: "Works with ChatGPT, Claude, Gemini, Copilot, and Perplexity.", default: "Works with ChatGPT, Claude, Gemini, Copilot, and Perplexity." },
      { key: "step2_title", label: "Step 2 — Title", type: "text", placeholder: "Create your first prompt", default: "Create your first prompt" },
      { key: "step2_desc", label: "Step 2 — Description", type: "text", placeholder: "Use templates and variables to make it reusable.", default: "Use templates and variables to make it reusable across your team." },
      { key: "step3_title", label: "Step 3 — Title", type: "text", placeholder: "Invite your team", default: "Invite your team" },
      { key: "step3_desc", label: "Step 3 — Description", type: "text", placeholder: "Share prompts instantly. Everyone stays consistent.", default: "Share prompts instantly. Everyone stays consistent, every time." },
      { key: "cta_text", label: "Button Text", type: "text", placeholder: "Get Started", default: "Get Started" },
      { key: "cta_url", label: "Button URL", type: "text", placeholder: "https://teamprompt.app/home", default: "https://teamprompt.app/home" },
    ],
    build(vals) {
      function step(num: number, title: string, desc: string): string {
        return `              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 16px; width: 100%;">
                <tr>
                  <td style="width: 36px; vertical-align: top;">
                    <div style="width: 28px; height: 28px; background-color: ${BRAND_COLOR}; border-radius: 50%; color: #fff; text-align: center; line-height: 28px; font-size: 14px; font-weight: 700;">${num}</div>
                  </td>
                  <td style="padding-left: 12px;">
                    <p style="margin: 0 0 2px; font-size: 15px; font-weight: 600; color: #18181b;">${title}</p>
                    <p style="margin: 0; font-size: 14px; color: #3f3f46; line-height: 1.5;">${desc}</p>
                  </td>
                </tr>
              </table>`;
      }
      return wrap(`
${headerBlock()}
          <tr>
            <td class="content-padding" style="background-color: #ffffff; padding: 32px;">
              <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 700; color: #18181b;">Welcome to TeamPrompt!</h1>
              <p style="margin: 0 0 24px; font-size: 15px; color: #3f3f46; line-height: 1.6;">Hi {{{FIRST_NAME|there}}}, thanks for joining. Here's how to get started in under 2 minutes:</p>
${step(1, v(vals, "step1_title", "Install the browser extension"), v(vals, "step1_desc", "Works with ChatGPT, Claude, Gemini, Copilot, and Perplexity."))}
${step(2, v(vals, "step2_title", "Create your first prompt"), v(vals, "step2_desc", "Use templates and variables to make it reusable across your team."))}
${step(3, v(vals, "step3_title", "Invite your team"), v(vals, "step3_desc", "Share prompts instantly. Everyone stays consistent, every time."))}
${ctaButton(v(vals, "cta_text", "Get Started"), vals.cta_url?.trim() || "https://teamprompt.app/home")}
              <p style="margin: 0; font-size: 13px; color: ${MUTED_TEXT};">Need help? Reply to this email or visit our <a href="https://teamprompt.app/help" style="color: ${BRAND_COLOR};">Help Center</a>.</p>
            </td>
          </tr>
${footerBlock()}
`, this.previewText);
    },
    get html() { return this.build({}); },
  },

  // ─── Re-engagement ─────────────────────────────────────────
  {
    id: "re-engagement",
    name: "Re-engagement",
    category: "Marketing",
    description: "Win back inactive users with a friendly nudge",
    defaultSubject: "We miss you — here's what you're missing",
    previewText: "Your team's AI workflow is waiting for you",
    fields: [
      { key: "cta_text", label: "Button Text", type: "text", placeholder: "Come Back", default: "Come Back" },
      { key: "cta_url", label: "Button URL", type: "text", placeholder: "https://teamprompt.app/home", default: "https://teamprompt.app/home" },
    ],
    repeatableGroups: [
      {
        key: "highlights",
        label: "What's New",
        addLabel: "Add Highlight",
        min: 1,
        max: 10,
        defaultCount: 3,
        fields: [
          { suffix: "feature", label: "Feature", type: "text", placeholder: "e.g. Prompt version history" },
          { suffix: "benefit", label: "Benefit", type: "text", placeholder: "e.g. track every change" },
        ],
      },
    ],
    build(vals) {
      const count = Math.max(repeatCount(vals, "highlights", ["feature", "benefit"]), 1);
      const items = Array.from({ length: count }, (_, i) =>
        `                  <li><strong>${v(vals, `highlights_${i}_feature`, "[New feature]")}</strong> &mdash; ${v(vals, `highlights_${i}_benefit`, "[brief benefit]")}</li>`
      ).join("\n");
      return wrap(`
${headerBlock()}
          <tr>
            <td class="content-padding" style="background-color: #ffffff; padding: 32px;">
              <h1 style="margin: 0 0 12px; font-size: 22px; font-weight: 700; color: #18181b;">It's been a while!</h1>
              <p style="margin: 0 0 20px; font-size: 15px; color: #3f3f46; line-height: 1.6;">Hi {{{FIRST_NAME|there}}}, we noticed you haven't been around lately. A lot has changed since your last visit:</p>
              <div style="background-color: ${LIGHT_BG}; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #3f3f46; line-height: 1.8;">
${items}
                </ul>
              </div>
              <p style="margin: 0 0 24px; font-size: 15px; color: #3f3f46; line-height: 1.6;">Your prompts are still there, waiting for you. Jump back in and see what's new.</p>
${ctaButton(v(vals, "cta_text", "Come Back"), vals.cta_url?.trim() || "https://teamprompt.app/home")}
              <p style="margin: 0; font-size: 13px; color: ${MUTED_TEXT};">If you have any feedback, we'd love to hear it. Just reply to this email.</p>
            </td>
          </tr>
${footerBlock()}
`, this.previewText);
    },
    get html() { return this.build({}); },
  },

  // ─── Launch / Promo ────────────────────────────────────────
  {
    id: "launch-promo",
    name: "Launch / Promo",
    category: "Marketing",
    description: "Promote a new feature, event, or limited-time offer",
    defaultSubject: "Something new just dropped",
    previewText: "Check out what we just launched",
    fields: [
      { key: "eyebrow", label: "Eyebrow Label", type: "text", placeholder: "e.g. NEW FEATURE, LIMITED TIME, JUST LAUNCHED", default: "JUST LAUNCHED" },
      { key: "headline", label: "Headline", type: "text", placeholder: "e.g. Team Analytics is here" },
      { key: "body", label: "Main Message", type: "textarea", placeholder: "2-3 sentences about what this is and why they should care." },
      { key: "cta_text", label: "Button Text", type: "text", placeholder: "Try It Now", default: "Try It Now" },
      { key: "cta_url", label: "Button URL", type: "text", placeholder: "https://teamprompt.app/home", default: "https://teamprompt.app/home" },
    ],
    repeatableGroups: [
      {
        key: "benefits",
        label: "Benefits",
        addLabel: "Add Benefit",
        min: 1,
        max: 10,
        defaultCount: 3,
        fields: [
          { suffix: "text", label: "Benefit", type: "text", placeholder: "e.g. See prompt usage across your org" },
        ],
      },
    ],
    build(vals) {
      const count = Math.max(repeatCount(vals, "benefits", ["text"]), 1);
      const bullets = Array.from({ length: count }, (_, i) => {
        const isLast = i === count - 1;
        return `                    <p style="margin: 0${isLast ? "" : " 0 6px"}; font-size: 14px; color: #18181b; line-height: 1.6;">&#x2713;&nbsp; ${v(vals, `benefits_${i}_text`, "[Benefit]")}</p>`;
      }).join("\n");
      return wrap(`
${headerBlock()}
          <tr>
            <td class="content-padding" style="background-color: #ffffff; padding: 32px;">
              <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; color: ${BRAND_COLOR}; text-transform: uppercase; letter-spacing: 1.5px;">${v(vals, "eyebrow", "JUST LAUNCHED")}</p>
              <h1 style="margin: 0 0 16px; font-size: 26px; font-weight: 700; color: #18181b;">${v(vals, "headline", "[Headline]")}</h1>
              <p style="margin: 0 0 24px; font-size: 15px; color: #3f3f46; line-height: 1.6;">${v(vals, "body", "[What this is and why they should care.]")}</p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; width: 100%;">
                <tr>
                  <td style="padding: 12px 16px; background-color: ${LIGHT_BG}; border-radius: 8px;">
${bullets}
                  </td>
                </tr>
              </table>
${ctaButton(v(vals, "cta_text", "Try It Now"), vals.cta_url?.trim() || "https://teamprompt.app/home")}
              <p style="font-size: 13px; color: ${MUTED_TEXT}; margin: 0;">Questions? Just reply to this email.</p>
            </td>
          </tr>
${footerBlock()}
`, this.previewText);
    },
    get html() { return this.build({}); },
  },

  // ─── Case Study / Social Proof ─────────────────────────────
  {
    id: "case-study",
    name: "Case Study / Proof",
    category: "Marketing",
    description: "Share a customer win or social proof to build trust",
    defaultSubject: "How [Company] improved their AI workflow",
    previewText: "See how teams are using TeamPrompt",
    fields: [
      { key: "company", label: "Company / Team Name", type: "text", placeholder: "e.g. Acme Corp" },
      { key: "quote", label: "Customer Quote", type: "textarea", placeholder: "A direct quote from the customer about their experience." },
      { key: "author", label: "Quote Attribution", type: "text", placeholder: "e.g. Sarah Chen, VP Engineering at Acme Corp" },
      { key: "stat1_num", label: "Stat 1 — Number", type: "text", placeholder: "e.g. 3x" },
      { key: "stat1_label", label: "Stat 1 — Label", type: "text", placeholder: "e.g. faster prompt delivery" },
      { key: "stat2_num", label: "Stat 2 — Number", type: "text", placeholder: "e.g. 91%" },
      { key: "stat2_label", label: "Stat 2 — Label", type: "text", placeholder: "e.g. team adoption rate" },
      { key: "body", label: "Story Summary", type: "textarea", placeholder: "2-3 sentences summarizing how they use TeamPrompt and what changed." },
      { key: "cta_text", label: "Button Text", type: "text", placeholder: "Read the Full Story", default: "Read the Full Story" },
      { key: "cta_url", label: "Button URL", type: "text", placeholder: "https://teamprompt.app", default: "https://teamprompt.app" },
    ],
    build(vals) {
      return wrap(`
${headerBlock()}
          <tr>
            <td class="content-padding" style="background-color: #ffffff; padding: 32px;">
              <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; color: ${BRAND_COLOR}; text-transform: uppercase; letter-spacing: 1.5px;">CUSTOMER STORY</p>
              <h1 style="margin: 0 0 20px; font-size: 22px; font-weight: 700; color: #18181b;">How ${v(vals, "company", "[Company]")} improved their AI workflow</h1>
              <div style="border-left: 3px solid ${BRAND_COLOR}; padding: 16px 20px; margin-bottom: 24px; background-color: #FAFAFA; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px; font-size: 15px; color: #18181b; line-height: 1.6; font-style: italic;">&ldquo;${v(vals, "quote", "[Customer quote about their experience.]")}&rdquo;</p>
                <p style="margin: 0; font-size: 13px; color: ${MUTED_TEXT};">&mdash; ${v(vals, "author", "[Name, Title at Company]")}</p>
              </div>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; width: 100%;">
                <tr>
                  <td style="width: 50%; padding: 16px; background-color: #EFF6FF; border-radius: 8px 0 0 8px; text-align: center;">
                    <p style="margin: 0; font-size: 28px; font-weight: 700; color: ${BRAND_COLOR};">${v(vals, "stat1_num", "3x")}</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: ${MUTED_TEXT};">${v(vals, "stat1_label", "[metric]")}</p>
                  </td>
                  <td style="width: 50%; padding: 16px; background-color: #F0FDF4; border-radius: 0 8px 8px 0; text-align: center;">
                    <p style="margin: 0; font-size: 28px; font-weight: 700; color: #16a34a;">${v(vals, "stat2_num", "91%")}</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: ${MUTED_TEXT};">${v(vals, "stat2_label", "[metric]")}</p>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 24px; font-size: 15px; color: #3f3f46; line-height: 1.6;">${v(vals, "body", "[2-3 sentences summarizing how they use TeamPrompt.]")}</p>
${ctaButton(v(vals, "cta_text", "Read the Full Story"), vals.cta_url?.trim() || "https://teamprompt.app")}
            </td>
          </tr>
${footerBlock()}
`, this.previewText);
    },
    get html() { return this.build({}); },
  },

  // ─── Founder Note ──────────────────────────────────────────
  {
    id: "founder-note",
    name: "Founder Note",
    category: "Plain",
    description: "Personal email from the founder — no heavy branding, feels like a real email",
    defaultSubject: "A quick note from me",
    previewText: "",
    fields: [
      { key: "body", label: "Your Message", type: "textarea", placeholder: "Write naturally — this template looks like a personal email, not a marketing blast. Talk about what you're building, ask for feedback, share your vision." },
      { key: "signoff", label: "Sign-off Name", type: "text", placeholder: "e.g. Kade", default: "Kade" },
      { key: "title", label: "Title / Role", type: "text", placeholder: "e.g. Founder, TeamPrompt", default: "Founder, TeamPrompt" },
    ],
    build(vals) {
      const bodyText = vals.body?.trim()
        ? vals.body.trim().split(/\n\n+/).map(p =>
          `              <p style="margin: 0 0 16px; font-size: 15px; color: #3f3f46; line-height: 1.6;">${esc(p)}</p>`
        ).join("\n")
        : `              <p style="margin: 0 0 16px; font-size: 15px; color: #3f3f46; line-height: 1.6;">[Your message here. Write naturally — this template looks like a personal email.]</p>`;
      return wrap(`
          <tr>
            <td class="content-padding" style="background-color: #ffffff; padding: 32px; border-radius: 12px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #3f3f46; line-height: 1.6;">Hi {{{FIRST_NAME|there}}},</p>
${bodyText}
              <p style="margin: 0 0 4px; font-size: 15px; color: #3f3f46; line-height: 1.6;">Best,<br />${v(vals, "signoff", "Kade")}</p>
              <p style="margin: 0; font-size: 13px; color: ${MUTED_TEXT};">${v(vals, "title", "Founder, TeamPrompt")}</p>
              <p style="margin: 16px 0 0; font-size: 13px; color: ${MUTED_TEXT};">
                <a href="https://teamprompt.app" style="color: ${BRAND_COLOR};">teamprompt.app</a>
              </p>
            </td>
          </tr>
`, "");
    },
    get html() { return this.build({}); },
  },

  // ─── Quick Update ──────────────────────────────────────────
  {
    id: "quick-update",
    name: "Quick Update",
    category: "Plain",
    description: "Short, casual update — like a text message in email form",
    defaultSubject: "Quick update",
    previewText: "",
    fields: [
      { key: "message", label: "Message", type: "textarea", placeholder: "Keep it short — 2-4 sentences max. This template is designed to feel like a quick note, not a newsletter." },
      { key: "cta_text", label: "Link Text (optional)", type: "text", placeholder: "e.g. Check it out" },
      { key: "cta_url", label: "Link URL (optional)", type: "text", placeholder: "https://teamprompt.app" },
      { key: "signoff", label: "Sign-off", type: "text", placeholder: "— Kade", default: "— The TeamPrompt Team" },
    ],
    build(vals) {
      const msgText = vals.message?.trim()
        ? vals.message.trim().split(/\n\n+/).map(p =>
          `              <p style="margin: 0 0 12px; font-size: 15px; color: #3f3f46; line-height: 1.6;">${esc(p)}</p>`
        ).join("\n")
        : `              <p style="margin: 0 0 12px; font-size: 15px; color: #3f3f46; line-height: 1.6;">[Your short message here.]</p>`;
      const link = vals.cta_text?.trim() && vals.cta_url?.trim()
        ? `              <p style="margin: 0 0 16px; font-size: 15px;"><a href="${esc(vals.cta_url.trim())}" style="color: ${BRAND_COLOR}; text-decoration: underline;">${esc(vals.cta_text.trim())} &rarr;</a></p>`
        : "";
      return wrap(`
          <tr>
            <td class="content-padding" style="background-color: #ffffff; padding: 32px; border-radius: 12px;">
              <p style="margin: 0 0 12px; font-size: 15px; color: #3f3f46; line-height: 1.6;">Hi {{{FIRST_NAME|there}}},</p>
${msgText}
${link}
              <p style="margin: 0; font-size: 15px; color: #3f3f46;">${v(vals, "signoff", "&mdash; The TeamPrompt Team")}</p>
              <p style="margin: 16px 0 0; font-size: 13px; color: ${MUTED_TEXT};">
                <a href="https://teamprompt.app" style="color: ${BRAND_COLOR};">teamprompt.app</a>
              </p>
            </td>
          </tr>
`, "");
    },
    get html() { return this.build({}); },
  },

  // ─── Plain Text Style ──────────────────────────────────────
  {
    id: "plain-text",
    name: "Plain Text",
    category: "Plain",
    description: "Looks like a plain text email — maximum deliverability, zero design",
    defaultSubject: "[Subject]",
    previewText: "",
    fields: [
      { key: "body", label: "Email Body", type: "textarea", placeholder: "Write your full email here. Use blank lines between paragraphs. This will render as plain-looking text with no branding, headers, or design elements — just like typing in Gmail." },
      { key: "signoff", label: "Sign-off", type: "text", placeholder: "e.g. Best, Kade", default: "Best,\nKade" },
      { key: "title", label: "Title (optional)", type: "text", placeholder: "e.g. Founder, TeamPrompt" },
    ],
    build(vals) {
      const bodyText = vals.body?.trim()
        ? vals.body.trim().split(/\n\n+/).map(p =>
          `<p style="margin: 0 0 16px; font-size: 14px; color: #1a1a1a; line-height: 1.7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${esc(p)}</p>`
        ).join("\n")
        : `<p style="margin: 0 0 16px; font-size: 14px; color: #1a1a1a; line-height: 1.7;">[Your email body here. Write naturally — this looks like a plain text email.]</p>`;
      const sig = vals.signoff?.trim()
        ? `<p style="margin: 0 0 4px; font-size: 14px; color: #1a1a1a; line-height: 1.7;">${esc(vals.signoff.trim()).replace(/\n/g, "<br />")}</p>`
        : "";
      const titleLine = vals.title?.trim()
        ? `<p style="margin: 0; font-size: 13px; color: #71717a; line-height: 1.5;">${esc(vals.title.trim())}</p>`
        : "";
      // Minimal wrapper — no header, no footer, no background color
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%;">
          <tr>
            <td style="padding: 20px 0;">
${bodyText}
${sig}
${titleLine}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
    },
    get html() { return this.build({}); },
  },

  // ─── Minimal / Personal (legacy) ───────────────────────────
  {
    id: "minimal",
    name: "Minimal Branded",
    category: "Plain",
    description: "Clean personal email with subtle TeamPrompt branding",
    defaultSubject: "[Subject]",
    previewText: "",
    fields: [
      { key: "body", label: "Your Message", type: "textarea", placeholder: "Keep it conversational and genuine. This template has minimal branding — just your message with a small footer." },
      { key: "closing", label: "Closing / CTA", type: "textarea", placeholder: "Optional — add a question or call to action to encourage replies." },
      { key: "signoff", label: "Sign-off Name", type: "text", placeholder: "Your name", default: "Kade" },
    ],
    build(vals) {
      const bodyText = vals.body?.trim()
        ? vals.body.trim().split(/\n\n+/).map(p =>
          `              <p style="margin: 0 0 16px; font-size: 15px; color: #3f3f46; line-height: 1.6;">${esc(p)}</p>`
        ).join("\n")
        : `              <p style="margin: 0 0 16px; font-size: 15px; color: #3f3f46; line-height: 1.6;">[Your message here.]</p>`;
      const closing = vals.closing?.trim()
        ? `              <p style="margin: 0 0 16px; font-size: 15px; color: #3f3f46; line-height: 1.6;">${esc(vals.closing.trim())}</p>`
        : "";
      return wrap(`
          <tr>
            <td class="content-padding" style="background-color: #ffffff; padding: 32px; border-radius: 12px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #3f3f46; line-height: 1.6;">Hi {{{FIRST_NAME|there}}},</p>
${bodyText}
${closing}
              <p style="margin: 0 0 4px; font-size: 15px; color: #3f3f46; line-height: 1.6;">Best,<br />${v(vals, "signoff", "[Your Name]")}</p>
              <p style="margin: 16px 0 0; font-size: 13px; color: ${MUTED_TEXT};">
                TeamPrompt &middot; <a href="https://teamprompt.app" style="color: ${BRAND_COLOR};">teamprompt.app</a>
              </p>
            </td>
          </tr>
`, "");
    },
    get html() { return this.build({}); },
  },
];

// ─── Outreach templates ──────────────────────────────────────────

CAMPAIGN_TEMPLATES.push({
  id: "partner-outreach",
  name: "Partner Outreach",
  category: "Outreach",
  description: "Clean cold email for potential partners — conversational, not salesy",
  defaultSubject: "Quick question about {{{COMPANY|your team}}}",
  previewText: "Saw what you're building and thought there might be a fit",
  fields: [
    { key: "opener", label: "Opening Line", type: "textarea", placeholder: "What caught your attention about them? Be specific. e.g. 'I saw your recent post about scaling prompt workflows...'" },
    { key: "pitch", label: "What You Offer (1-2 sentences)", type: "textarea", placeholder: "Brief, honest description of what you do and why it's relevant. No buzzwords." },
    { key: "ask", label: "The Ask", type: "textarea", placeholder: "What would you like from them? Keep it low-friction. e.g. 'Would you be open to a 15-minute call next week?'", default: "Would you be open to a quick chat sometime this week?" },
    { key: "signoff", label: "Sign-off Name", type: "text", placeholder: "Your name", default: "Kade" },
    { key: "title", label: "Your Title", type: "text", placeholder: "e.g. Founder, TeamPrompt", default: "Founder, TeamPrompt" },
  ],
  build(vals) {
    const opener = vals.opener?.trim()
      ? vals.opener.trim().split(/\n\n+/).map(p =>
        `              <p style="margin: 0 0 14px; font-size: 15px; color: #3f3f46; line-height: 1.65;">${esc(p)}</p>`
      ).join("\n")
      : `              <p style="margin: 0 0 14px; font-size: 15px; color: #3f3f46; line-height: 1.65;">[Your opening line — what caught your eye about them.]</p>`;

    const pitch = vals.pitch?.trim()
      ? vals.pitch.trim().split(/\n\n+/).map(p =>
        `              <p style="margin: 0 0 14px; font-size: 15px; color: #3f3f46; line-height: 1.65;">${esc(p)}</p>`
      ).join("\n")
      : `              <p style="margin: 0 0 14px; font-size: 15px; color: #3f3f46; line-height: 1.65;">[Brief pitch — what you do, why it matters to them.]</p>`;

    return wrap(`
          <tr>
            <td class="content-padding" style="background-color: #ffffff; padding: 32px; border-radius: 12px;">
              <p style="margin: 0 0 14px; font-size: 15px; color: #3f3f46; line-height: 1.65;">Hi {{{FIRST_NAME|there}}},</p>
${opener}
${pitch}
              <p style="margin: 0 0 14px; font-size: 15px; color: #3f3f46; line-height: 1.65;">${v(vals, "ask", "Would you be open to a quick chat sometime this week?")}</p>
              <p style="margin: 0; font-size: 15px; color: #3f3f46; line-height: 1.65;">
                Best,<br />
                ${v(vals, "signoff", "[Your Name]")}
                ${vals.title?.trim() ? `<br /><span style="font-size: 13px; color: ${MUTED_TEXT};">${esc(vals.title.trim())}</span>` : ""}
              </p>
            </td>
          </tr>
`, "");
  },
  get html() { return this.build({}); },
});

export const TEMPLATE_CATEGORIES = [
  { id: "Product", label: "Product" },
  { id: "Marketing", label: "Marketing" },
  { id: "Outreach", label: "Outreach" },
  { id: "Plain", label: "Plain / Natural" },
] as const;
