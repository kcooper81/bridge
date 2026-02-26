/**
 * Shared email template for all TeamPrompt emails.
 * Used by invite emails (sent via Resend) and as reference for Supabase Auth templates.
 */

const BRAND_COLOR = "#2563EB";
const DARK_BG = "#0f1117";
const LIGHT_TEXT = "#e4e4e7";
const MUTED_TEXT = "#71717a";

interface EmailOptions {
  /** Main heading text */
  heading: string;
  /** HTML body content (paragraphs, etc.) */
  body: string;
  /** CTA button text */
  ctaText: string;
  /** CTA button URL */
  ctaUrl: string;
  /** Optional footer note (e.g. "This invite expires in 7 days.") */
  footerNote?: string;
}

interface TicketResponseEmailOptions {
  /** Original ticket subject */
  ticketSubject: string;
  /** Admin's response text */
  responseBody: string;
  /** Original message from the user */
  originalMessage: string;
}

export function buildEmail(options: EmailOptions): string {
  const { heading, body, ctaText, ctaUrl, footerNote } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${heading}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background-color: ${DARK_BG}; padding: 24px 32px; border-radius: 12px 12px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 32px; height: 32px; vertical-align: middle;">
                    <img src="https://teamprompt.app/brand/logo-icon-blue.svg" alt="TeamPrompt" width="32" height="32" style="display: block; border-radius: 8px;" />
                  </td>
                  <td style="padding-left: 12px;">
                    <span style="color: ${LIGHT_TEXT}; font-size: 18px; font-weight: 700;">TeamPrompt</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px;">
              <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #18181b;">${heading}</h1>
              <div style="font-size: 15px; line-height: 1.6; color: #3f3f46;">
                ${body}
              </div>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
                <tr>
                  <td style="background-color: ${BRAND_COLOR}; border-radius: 8px;">
                    <a href="${ctaUrl}" style="display: inline-block; padding: 12px 28px; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none;">${ctaText}</a>
                  </td>
                </tr>
              </table>

              ${footerNote ? `<p style="font-size: 13px; color: ${MUTED_TEXT}; margin: 0;">${footerNote}</p>` : ""}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 20px 32px; border-radius: 0 0 12px 12px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 4px; font-size: 13px; color: ${MUTED_TEXT};">
                TeamPrompt &mdash; Your team's AI prompt library
              </p>
              <a href="https://teamprompt.app" style="font-size: 13px; color: ${BRAND_COLOR}; text-decoration: none;">teamprompt.app</a>
            </td>
          </tr>

          <!-- Muted link -->
          <tr>
            <td style="padding: 16px 0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 4px 0 0; font-size: 12px; color: #a1a1aa; word-break: break-all;">
                <a href="${ctaUrl}" style="color: ${BRAND_COLOR}; text-decoration: none;">${ctaUrl}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

/**
 * Build an HTML email for ticket/support responses.
 * Same branded layout as invite emails but without a CTA button.
 * Includes the admin response and a quoted block of the original message.
 */
export function buildTicketResponseEmail(options: TicketResponseEmailOptions): string {
  const { ticketSubject, responseBody, originalMessage } = options;

  const escapedResponse = responseBody.replace(/\n/g, "<br />");
  const escapedOriginal = originalMessage.replace(/\n/g, "<br />");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Re: ${ticketSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background-color: ${DARK_BG}; padding: 24px 32px; border-radius: 12px 12px 0 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width: 32px; height: 32px; vertical-align: middle;">
                    <img src="https://teamprompt.app/brand/logo-icon-blue.svg" alt="TeamPrompt" width="32" height="32" style="display: block; border-radius: 8px;" />
                  </td>
                  <td style="padding-left: 12px;">
                    <span style="color: ${LIGHT_TEXT}; font-size: 18px; font-weight: 700;">TeamPrompt</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px;">
              <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: #18181b;">Re: ${ticketSubject}</h1>
              <div style="font-size: 15px; line-height: 1.6; color: #3f3f46;">
                <p style="margin: 0 0 20px;">${escapedResponse}</p>
              </div>

              <!-- Quoted original message -->
              <div style="margin-top: 24px; padding: 16px; background-color: #f4f4f5; border-left: 3px solid ${BRAND_COLOR}; border-radius: 4px;">
                <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: ${MUTED_TEXT};">Your original message:</p>
                <div style="font-size: 14px; line-height: 1.5; color: #52525b;">${escapedOriginal}</div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 20px 32px; border-radius: 0 0 12px 12px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 4px; font-size: 13px; color: ${MUTED_TEXT};">
                TeamPrompt &mdash; Your team's AI prompt library
              </p>
              <a href="https://teamprompt.app" style="font-size: 13px; color: ${BRAND_COLOR}; text-decoration: none;">teamprompt.app</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
