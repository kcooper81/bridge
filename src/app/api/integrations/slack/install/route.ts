import { NextResponse } from "next/server";

/**
 * GET /api/integrations/slack/install
 * Public endpoint for Slack Marketplace "Add to Slack" / Direct Install.
 * Redirects to Slack's OAuth authorize URL.
 * Users must then complete setup in TeamPrompt's settings.
 */
export async function GET() {
  const clientId = process.env.SLACK_CLIENT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

  if (!clientId) {
    return NextResponse.redirect(`${siteUrl}/integrations`);
  }

  const redirectUri = `${siteUrl}/api/integrations/slack/callback`;
  const scopes = "chat:write,channels:read,groups:read,commands";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes,
  });

  return NextResponse.redirect(`https://slack.com/oauth/v2/authorize?${params.toString()}`);
}
