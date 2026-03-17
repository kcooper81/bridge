import { createServiceClient } from "@/lib/supabase/server";

interface SlackBlock {
  type: string;
  text?: { type: string; text: string; emoji?: boolean };
  elements?: Array<{ type: string; text: string; emoji?: boolean }>;
  fields?: Array<{ type: string; text: string }>;
}

/**
 * Send a notification to the org's configured Slack channel.
 * No-ops silently if Slack is not connected or no channel is set.
 */
export async function sendSlackNotification(
  orgId: string,
  text: string,
  blocks?: SlackBlock[]
): Promise<boolean> {
  try {
    const db = createServiceClient();

    // Load bot token and config
    const [{ data: integration }, { data: config }] = await Promise.all([
      db.from("workspace_integrations")
        .select("access_token")
        .eq("org_id", orgId)
        .eq("provider", "slack")
        .maybeSingle(),
      db.from("slack_config")
        .select("notification_channel_id")
        .eq("org_id", orgId)
        .maybeSingle(),
    ]);

    if (!integration?.access_token || !config?.notification_channel_id) {
      return false;
    }

    const payload: Record<string, unknown> = {
      channel: config.notification_channel_id,
      text, // Fallback for notifications/accessibility
    };
    if (blocks) payload.blocks = blocks;

    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${integration.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error("Slack postMessage error:", data.error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Slack notify error:", err);
    return false;
  }
}

/**
 * Send a DLP violation alert to Slack.
 */
export async function notifyDlpViolation(
  orgId: string,
  details: {
    ruleName: string;
    category: string;
    severity: string;
    userEmail?: string;
    aiTool?: string;
  }
): Promise<void> {
  // Check if DLP notifications are enabled (uses same DB call as sendSlackNotification)
  const db = createServiceClient();
  const { data: config } = await db
    .from("slack_config")
    .select("notify_dlp_violations, notification_channel_id")
    .eq("org_id", orgId)
    .maybeSingle();

  if (!config?.notify_dlp_violations || !config.notification_channel_id) return;

  const severityEmoji = details.severity === "block" ? ":no_entry:" : ":warning:";
  const action = details.severity === "block" ? "Blocked" : "Warning";

  const text = `${severityEmoji} DLP ${action}: ${details.ruleName} (${details.category})`;

  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `${severityEmoji} *DLP ${action}*\n*Rule:* ${details.ruleName}\n*Category:* ${details.category}\n*Severity:* ${details.severity}`,
      },
    },
  ];

  const contextElements: Array<{ type: string; text: string; emoji?: boolean }> = [];
  if (details.userEmail) {
    contextElements.push({ type: "mrkdwn", text: `:bust_in_silhouette: ${details.userEmail}` });
  }
  if (details.aiTool) {
    contextElements.push({ type: "mrkdwn", text: `:robot_face: ${details.aiTool}` });
  }
  contextElements.push({ type: "mrkdwn", text: `:clock1: <!date^${Math.floor(Date.now() / 1000)}^{date_short_pretty} at {time}|just now>` });

  if (contextElements.length > 0) {
    blocks.push({ type: "context", elements: contextElements });
  }

  await sendSlackNotification(orgId, text, blocks);
}

/**
 * Send a prompt submission notification to Slack.
 */
export async function notifyPromptSubmission(
  orgId: string,
  details: {
    promptTitle: string;
    submitterName?: string;
    submitterEmail?: string;
  }
): Promise<void> {
  const db = createServiceClient();
  const { data: config } = await db
    .from("slack_config")
    .select("notify_prompt_submissions, notification_channel_id")
    .eq("org_id", orgId)
    .maybeSingle();

  if (!config?.notify_prompt_submissions || !config.notification_channel_id) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";
  const text = `:memo: New prompt submitted for approval: "${details.promptTitle}"`;

  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `:memo: *New Prompt Submitted*\n*Title:* ${details.promptTitle}\n*By:* ${details.submitterName || details.submitterEmail || "Team member"}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `<${siteUrl}/approvals|Review in TeamPrompt>`,
      },
    },
  ];

  await sendSlackNotification(orgId, text, blocks);
}

/**
 * Send a weekly activity digest to Slack.
 */
export async function notifyWeeklyDigest(
  orgId: string,
  stats: {
    totalConversations: number;
    dlpViolations: number;
    newPrompts: number;
    activeUsers: number;
    topPrompt?: string;
  }
): Promise<void> {
  const db = createServiceClient();
  const { data: config } = await db
    .from("slack_config")
    .select("notify_weekly_digest")
    .eq("org_id", orgId)
    .maybeSingle();

  if (!config?.notify_weekly_digest) return;

  const text = `:bar_chart: TeamPrompt Weekly Digest — ${stats.totalConversations} AI conversations, ${stats.dlpViolations} DLP events`;

  const blocks: SlackBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: ":bar_chart: *TeamPrompt Weekly Digest*",
      },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*AI Conversations*\n${stats.totalConversations}` },
        { type: "mrkdwn", text: `*DLP Events*\n${stats.dlpViolations}` },
        { type: "mrkdwn", text: `*New Prompts*\n${stats.newPrompts}` },
        { type: "mrkdwn", text: `*Active Users*\n${stats.activeUsers}` },
      ],
    },
  ];

  if (stats.topPrompt) {
    blocks.push({
      type: "context",
      elements: [{ type: "mrkdwn", text: `:trophy: Most used prompt: *${stats.topPrompt}*` }],
    });
  }

  await sendSlackNotification(orgId, text, blocks);
}
