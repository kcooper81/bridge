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
  inviteEmail: string;
}

export default function InvitePage() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [emailMismatch, setEmailMismatch] = useState<{ signedInAs: string; invitedAs: string } | null>(null);
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

      // Fetch invite details via API (bypasses RLS so any user can read invite info)
      const detailsRes = await fetch(`/api/invite/details?token=${encodeURIComponent(token)}`);
      const invite = detailsRes.ok ? await detailsRes.json() : null;

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Pass the invited email so the login page can show an account hint
        const inviteEmail = invite?.email || "";
        const redirect = encodeURIComponent(`/invite?token=${token}`);
        const emailHint = inviteEmail ? `&email=${encodeURIComponent(inviteEmail)}` : "";
        router.push(`/login?redirect=${redirect}${emailHint}`);
        return;
      }

      if (!invite) {
        setError("This invite link is invalid.");
        setChecking(false);
        return;
      }

      if (invite.status === "accepted") {
        toast.success("You've already accepted this invite. Welcome back!");
        router.push("/home");
        return;
      }

      if (invite.status === "revoked") {
        setError("This invite has been revoked. A newer invite may have been sent — check your email for a more recent link, or ask your admin to resend.");
        setChecking(false);
        return;
      }

      if (invite.expired || invite.status === "expired") {
        setError("This invite has expired. Ask your admin to send a new invite.");
        setChecking(false);
        return;
      }

      if (invite.status === "pending") {
        // Check if signed-in email matches the invited email
        if (invite.email && user.email && invite.email.toLowerCase() !== user.email.toLowerCase()) {
          setEmailMismatch({
            signedInAs: user.email,
            invitedAs: invite.email,
          });
        }

        setInviteDetails({
          orgName: invite.orgName || "a team",
          role: invite.role || "member",
          invitedBy: invite.invitedBy || "A team member",
          inviteEmail: invite.email || "",
        });
      } else {
        setError("This invite link is invalid or has expired.");
      }

      setChecking(false);
    }
    checkAuth();
  }, [token, router]);

  async function handleSwitchAccount() {
    const supabase = createClient();
    await supabase.auth.signOut();
    const inviteEmail = inviteDetails?.inviteEmail || "";
    const redirect = encodeURIComponent(`/invite?token=${token}`);
    const emailHint = inviteEmail ? `&email=${encodeURIComponent(inviteEmail)}` : "";
    window.location.href = `/login?redirect=${redirect}${emailHint}`;
  }

  async function handleAccept() {
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        setError("Not authenticated");
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch("/api/invite/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
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

      {emailMismatch && (
        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-left space-y-3">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Wrong account
          </p>
          <p className="text-sm text-muted-foreground">
            This invite was sent to <strong>{emailMismatch.invitedAs}</strong>, but you&apos;re signed in as <strong>{emailMismatch.signedInAs}</strong>.
          </p>
          <Button onClick={handleSwitchAccount} className="w-full">
            Sign in as {emailMismatch.invitedAs}
          </Button>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!emailMismatch && (
        <div className="mt-6 flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push("/")}>
            Decline
          </Button>
          <Button onClick={handleAccept} disabled={loading || !inviteDetails}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Accept Invite
          </Button>
        </div>
      )}
    </div>
  );
}
