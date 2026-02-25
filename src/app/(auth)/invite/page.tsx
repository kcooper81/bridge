"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trackInviteAccepted } from "@/lib/analytics";

interface InviteDetails {
  orgName: string;
  role: string;
  invitedBy: string;
}

export default function InvitePage() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    async function checkAuth() {
      if (!token) {
        setError("Invalid invite link — no token provided.");
        setChecking(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?redirect=${encodeURIComponent(`/invite?token=${token}`)}`);
        return;
      }

      // Fetch invite details to show before accepting
      const { data: invite } = await supabase
        .from("invites")
        .select("role, org_id, invited_by, organizations(name), profiles!invites_invited_by_fkey(name)")
        .eq("token", token)
        .eq("status", "pending")
        .single();

      if (invite) {
        // Supabase joins return single objects for FK relations
        const orgData = invite.organizations as unknown as { name: string } | null;
        const inviterData = invite.profiles as unknown as { name: string } | null;
        setInviteDetails({
          orgName: orgData?.name || "a team",
          role: invite.role || "member",
          invitedBy: inviterData?.name || "A team member",
        });
      }

      setChecking(false);
    }
    checkAuth();
  }, [token, router]);

  async function handleAccept() {
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("Not authenticated");
        return;
      }

      const res = await fetch("/api/invite/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to accept invite");
        return;
      }

      trackInviteAccepted();
      toast.success("Invite accepted! Welcome to the team.");
      router.push("/vault");
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-bold text-destructive">Invalid Invite</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This invite link is missing the required token.
        </p>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
        <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold">Team Invite</h2>
      {inviteDetails ? (
        <p className="mt-2 text-sm text-muted-foreground">
          <strong>{inviteDetails.invitedBy}</strong> has invited you to join{" "}
          <strong>{inviteDetails.orgName}</strong> as a{" "}
          <strong>{inviteDetails.role}</strong>.
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;ve been invited to join a team on TeamPrompt.
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-6 flex gap-3 justify-center">
        <Button variant="outline" onClick={() => router.push("/")}>
          Decline
        </Button>
        <Button onClick={handleAccept} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Accept Invite
        </Button>
      </div>
    </div>
  );
}
