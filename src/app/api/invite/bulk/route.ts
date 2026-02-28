import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/lib/constants";
import { limiters, checkRateLimit } from "@/lib/rate-limit";
import { buildEmail } from "@/lib/email-template";
import type { BulkImportRow, BulkImportResult, UserRole } from "@/lib/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_ROLES: UserRole[] = ["admin", "manager", "member"];
const BATCH_SIZE = 50; // Max emails per Resend batch call

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const db = createServiceClient();
    const {
      data: { user },
      error: authError,
    } = await db.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get sender's profile
    const { data: profile } = await db
      .from("profiles")
      .select("org_id, role, name")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id || !["admin", "manager"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rl = await checkRateLimit(limiters.invite, profile.org_id);
    if (!rl.success) return rl.response;

    const { rows } = (await request.json()) as { rows: BulkImportRow[] };

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "No rows provided" },
        { status: 400 }
      );
    }

    if (rows.length > 500) {
      return NextResponse.json(
        { error: "Maximum 500 rows per import" },
        { status: 400 }
      );
    }

    // Managers cannot invite admins
    if (
      profile.role === "manager" &&
      rows.some((r) => r.role === "admin")
    ) {
      return NextResponse.json(
        { error: "Managers cannot invite admins" },
        { status: 403 }
      );
    }

    // Get org data
    const { data: orgData } = await db
      .from("organizations")
      .select("name, plan")
      .eq("id", profile.org_id)
      .single();

    const currentPlan = (orgData?.plan || "free") as keyof typeof PLAN_LIMITS;
    const planLimits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.free;

    // Count existing members + pending invites
    const [{ count: memberCount }, { count: pendingCount }] =
      await Promise.all([
        db
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("org_id", profile.org_id),
        db
          .from("invites")
          .select("id", { count: "exact", head: true })
          .eq("org_id", profile.org_id)
          .eq("status", "pending"),
      ]);

    const currentTotal = (memberCount || 0) + (pendingCount || 0);

    // Get existing members' emails
    const { data: existingMembers } = await db
      .from("profiles")
      .select("email")
      .eq("org_id", profile.org_id);
    const existingEmails = new Set(
      (existingMembers || []).map((m) => m.email.toLowerCase())
    );

    // Get existing pending invite emails
    const { data: existingInvites } = await db
      .from("invites")
      .select("email")
      .eq("org_id", profile.org_id)
      .eq("status", "pending");
    const pendingEmails = new Set(
      (existingInvites || []).map((i) => i.email.toLowerCase())
    );

    // Get existing teams
    const { data: existingTeams } = await db
      .from("teams")
      .select("id, name")
      .eq("org_id", profile.org_id);
    const teamNameMap = new Map(
      (existingTeams || []).map((t) => [t.name.toLowerCase(), t.id])
    );

    const result: BulkImportResult = {
      invited: [],
      skipped: [],
      errors: [],
      teamsCreated: [],
    };

    // Deduplicate rows by email (keep first occurrence)
    const seenEmails = new Set<string>();
    const validRows: (BulkImportRow & { resolvedTeamIds: string[] })[] = [];
    let newInviteCount = 0;

    for (const row of rows) {
      const email = row.email?.trim().toLowerCase();

      if (!email || !EMAIL_REGEX.test(email)) {
        result.errors.push({
          email: row.email || "",
          reason: "Invalid email format",
        });
        continue;
      }

      if (seenEmails.has(email)) {
        result.skipped.push({ email, reason: "Duplicate in import" });
        continue;
      }
      seenEmails.add(email);

      if (existingEmails.has(email)) {
        result.skipped.push({ email, reason: "Already a member" });
        continue;
      }

      if (pendingEmails.has(email)) {
        result.skipped.push({ email, reason: "Invite already pending" });
        continue;
      }

      const role =
        row.role && VALID_ROLES.includes(row.role) ? row.role : "member";

      // Check plan limit
      if (
        planLimits.max_members !== -1 &&
        currentTotal + newInviteCount >= planLimits.max_members
      ) {
        result.errors.push({
          email,
          reason: "Plan member limit reached",
        });
        continue;
      }

      // Resolve teams
      const resolvedTeamIds: string[] = [];
      for (const teamName of row.teams || []) {
        const trimmed = teamName.trim();
        if (!trimmed) continue;

        const existing = teamNameMap.get(trimmed.toLowerCase());
        if (existing) {
          resolvedTeamIds.push(existing);
        } else {
          // Auto-create team
          const { data: newTeam, error: teamError } = await db
            .from("teams")
            .insert({
              org_id: profile.org_id,
              name: trimmed,
            })
            .select("id, name")
            .single();

          if (teamError || !newTeam) {
            // Non-fatal — skip this team
            continue;
          }

          teamNameMap.set(trimmed.toLowerCase(), newTeam.id);
          resolvedTeamIds.push(newTeam.id);
          result.teamsCreated.push(newTeam.name);
        }
      }

      validRows.push({ ...row, email, role, resolvedTeamIds });
      newInviteCount++;
    }

    // Deduplicate teamsCreated
    result.teamsCreated = Array.from(new Set(result.teamsCreated));

    // Create invite records
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";
    const orgName = orgData?.name || "their team";
    const senderName = profile.name || "A team member";

    const inviteRecords: {
      email: string;
      name?: string;
      token: string;
      teamIds: string[];
    }[] = [];

    for (const row of validRows) {
      const { data: invite, error: insertError } = await db
        .from("invites")
        .insert({
          org_id: profile.org_id,
          email: row.email,
          role: row.role,
          invited_by: user.id,
          ...(row.resolvedTeamIds[0] && { team_id: row.resolvedTeamIds[0] }),
        })
        .select("token")
        .single();

      if (insertError || !invite) {
        result.errors.push({
          email: row.email,
          reason: "Failed to create invite",
        });
        continue;
      }

      inviteRecords.push({
        email: row.email,
        name: row.name,
        token: invite.token,
        teamIds: row.resolvedTeamIds,
      });

      result.invited.push({ email: row.email, name: row.name });
    }

    // Send emails in batches via Resend
    if (process.env.RESEND_API_KEY && inviteRecords.length > 0) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail =
        process.env.RESEND_FROM_EMAIL ||
        "TeamPrompt <noreply@teamprompt.app>";

      for (let i = 0; i < inviteRecords.length; i += BATCH_SIZE) {
        const batch = inviteRecords.slice(i, i + BATCH_SIZE);

        const emailPayloads = batch.map((rec) => {
          const inviteUrl = `${siteUrl}/invite?token=${rec.token}`;
          return {
            from: fromEmail,
            to: rec.email,
            subject: `You're invited to join ${orgName} on TeamPrompt`,
            html: buildEmail({
              heading: "You've been invited!",
              body: `
                <p><strong>${senderName}</strong> has invited you to join <strong>${orgName}</strong> on TeamPrompt.</p>
                <p>TeamPrompt helps teams manage, share, and secure their AI prompts across ChatGPT, Claude, Gemini, and more.</p>
              `,
              ctaText: "Accept Invite",
              ctaUrl: inviteUrl,
              footerNote: "This invite expires in 7 days.",
            }),
          };
        });

        try {
          await resend.batch.send(emailPayloads);
        } catch (emailError) {
          console.error("Bulk email batch error:", emailError);
          // Non-fatal — invites are already created, emails just failed
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Bulk invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
