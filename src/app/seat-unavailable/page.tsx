import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getSeatStatus } from "@/lib/billing/seats";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Seat unavailable",
  robots: { index: false, follow: false },
};

/**
 * Shown to members who are outside their organization's seat limit after a
 * downgrade. Deliberately lives OUTSIDE the (dashboard) route group — the
 * dashboard layout redirects here, so rendering it inside that group would
 * loop. Re-checks entitlement on load so the page self-clears the moment the
 * org upgrades or frees a seat.
 */
export default async function SeatUnavailablePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createServiceClient();
  const { data: profile } = await db
    .from("profiles")
    .select("org_id, is_super_admin")
    .eq("id", user.id)
    .maybeSingle();

  // No org, super admin, or seat restored -> send them back to the app.
  if (!profile?.org_id || profile.is_super_admin) redirect("/home");
  const seat = await getSeatStatus(user.id, profile.org_id);
  if (seat.hasSeat) redirect("/home");

  const { data: org } = await db
    .from("organizations")
    .select("name, plan")
    .eq("id", profile.org_id)
    .maybeSingle();

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-6">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          No seat available
        </h1>

        <p className="mt-4 text-muted-foreground leading-relaxed">
          {org?.name ? <strong>{org.name}</strong> : "Your workspace"} has{" "}
          {seat.memberCount} members, but its current plan
          {org?.plan ? ` (${org.plan})` : ""} includes {seat.maxMembers}. Your
          account is outside the limit, so access is paused.
        </p>

        <p className="mt-3 text-sm text-muted-foreground">
          An admin can restore your access by upgrading the plan or removing
          members. Nothing of yours has been deleted — everything comes back as
          soon as a seat is free.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/settings/billing">View plans</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/api/auth/signout">Sign out</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
