"use client";

import { useOrg } from "@/components/providers/org-provider";
import { Building, Mail } from "lucide-react";

export function NoOrgBanner() {
  const { noOrg, loading } = useOrg();

  if (loading || !noOrg) return null;

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
        <Building className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold">Welcome to TeamPrompt</h2>
      <p className="mt-3 text-muted-foreground max-w-md">
        You&apos;re not part of an organization yet. Ask your team admin to send
        you an invite, or check your email for a pending invitation.
      </p>
      <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Mail className="h-4 w-4" />
        <span>Check your inbox for an invite link</span>
      </div>
    </div>
  );
}
