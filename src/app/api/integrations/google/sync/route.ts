import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/lib/constants";
import type { BulkImportRow, PlanTier, UserRole } from "@/lib/types";

const MAX_USERS = 2000;

async function refreshAccessToken(
  refreshToken: string
): Promise<{ access_token: string; expires_in: number } | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) return null;
  return res.json();
}

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

    const { data: profile } = await db
      .from("profiles")
      .select("org_id, role, is_super_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.org_id) {
      return NextResponse.json({ error: "No organization" }, { status: 400 });
    }

    const isAdmin = profile.is_super_admin || profile.role === "admin";
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    // Plan gate
    if (!profile.is_super_admin) {
      const { data: org } = await db
        .from("organizations")
        .select("plan")
        .eq("id", profile.org_id)
        .single();
      const plan = (org?.plan || "free") as PlanTier;
      if (!PLAN_LIMITS[plan]?.google_workspace_sync) {
        return NextResponse.json(
          { error: "Google Workspace sync requires a Business plan" },
          { status: 403 }
        );
      }
    }

    // Load integration
    const { data: integration } = await db
      .from("workspace_integrations")
      .select("*")
      .eq("org_id", profile.org_id)
      .eq("provider", "google_workspace")
      .maybeSingle();

    if (!integration) {
      return NextResponse.json(
        { error: "Google Workspace not connected" },
        { status: 400 }
      );
    }

    let accessToken = integration.access_token;

    // Refresh if expired
    const isExpired =
      integration.token_expires_at &&
      new Date(integration.token_expires_at) <= new Date();

    if (isExpired && integration.refresh_token) {
      const refreshed = await refreshAccessToken(integration.refresh_token);
      if (!refreshed) {
        return NextResponse.json(
          { error: "Failed to refresh token. Please reconnect Google Workspace." },
          { status: 401 }
        );
      }

      accessToken = refreshed.access_token;
      const newExpiry = new Date(
        Date.now() + refreshed.expires_in * 1000
      ).toISOString();

      await db
        .from("workspace_integrations")
        .update({
          access_token: accessToken,
          token_expires_at: newExpiry,
        })
        .eq("id", integration.id);
    }

    // Fetch users from Google Admin Directory API
    const users: { email: string; name: string }[] = [];
    let pageToken: string | undefined;

    do {
      const params = new URLSearchParams({
        customer: "my_customer",
        maxResults: "500",
        orderBy: "email",
        ...(pageToken ? { pageToken } : {}),
      });

      const res = await fetch(
        `https://admin.googleapis.com/admin/directory/v1/users?${params}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error("Google Directory API error:", res.status, errText);
        return NextResponse.json(
          { error: "Failed to fetch users from Google Workspace" },
          { status: 502 }
        );
      }

      const data = await res.json();
      for (const u of data.users || []) {
        if (u.primaryEmail && !u.suspended) {
          users.push({
            email: u.primaryEmail,
            name: u.name?.fullName || u.primaryEmail.split("@")[0],
          });
        }
      }

      pageToken = data.nextPageToken;
    } while (pageToken && users.length < MAX_USERS);

    // Fetch groups
    const groups: { name: string; email: string }[] = [];
    let groupPageToken: string | undefined;

    do {
      const params = new URLSearchParams({
        customer: "my_customer",
        maxResults: "200",
        ...(groupPageToken ? { pageToken: groupPageToken } : {}),
      });

      const res = await fetch(
        `https://admin.googleapis.com/admin/directory/v1/groups?${params}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (res.ok) {
        const data = await res.json();
        for (const g of data.groups || []) {
          groups.push({ name: g.name, email: g.email });
        }
        groupPageToken = data.nextPageToken;
      } else {
        // Groups might not be available — non-fatal
        break;
      }
    } while (groupPageToken);

    // Build user→groups map by fetching each group's members
    const userGroupsMap = new Map<string, string[]>();

    for (const group of groups) {
      let memberPageToken: string | undefined;
      do {
        const params = new URLSearchParams({
          maxResults: "200",
          ...(memberPageToken ? { pageToken: memberPageToken } : {}),
        });

        const res = await fetch(
          `https://admin.googleapis.com/admin/directory/v1/groups/${encodeURIComponent(group.email)}/members?${params}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!res.ok) break;

        const data = await res.json();
        for (const m of data.members || []) {
          if (m.email && m.status === "ACTIVE") {
            const email = m.email.toLowerCase();
            const existing = userGroupsMap.get(email) || [];
            existing.push(group.name);
            userGroupsMap.set(email, existing);
          }
        }
        memberPageToken = data.nextPageToken;
      } while (memberPageToken);
    }

    // Get existing members in the org
    const { data: existingMembers } = await db
      .from("profiles")
      .select("email")
      .eq("org_id", profile.org_id);
    const existingEmails = new Set(
      (existingMembers || []).map((m) => m.email.toLowerCase())
    );

    // Map to BulkImportRow[], filtering out existing members
    const rows: BulkImportRow[] = users
      .filter((u) => !existingEmails.has(u.email.toLowerCase()))
      .map((u) => ({
        email: u.email,
        name: u.name,
        role: "member" as UserRole,
        teams: userGroupsMap.get(u.email.toLowerCase()) || [],
        status: "valid" as const,
      }));

    // Update last_synced_at
    await db
      .from("workspace_integrations")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("id", integration.id);

    return NextResponse.json({
      users: rows,
      groups: groups.map((g) => g.name),
      totalDirectoryUsers: users.length,
      alreadyMembers: users.length - rows.length,
    });
  } catch (error) {
    console.error("Google sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
