"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useOrg } from "@/components/providers/org-provider";
import { createClient } from "@/lib/supabase/client";
import { ShieldAlert } from "lucide-react";

export function MfaRequiredBanner() {
  const { org, currentUserRole } = useOrg();
  const [hasMfa, setHasMfa] = useState(true); // default hidden
  const [checked, setChecked] = useState(false);

  const isAdminOrManager = currentUserRole === "admin" || currentUserRole === "manager";
  const requireMfa = org?.settings?.require_mfa_for_admins === true;

  useEffect(() => {
    if (!isAdminOrManager || !requireMfa) return;

    async function check() {
      const supabase = createClient();
      const { data } = await supabase.auth.mfa.listFactors();
      const verified = data?.totp?.some((f) => f.status === "verified");
      setHasMfa(!!verified);
      setChecked(true);
    }
    check();
  }, [isAdminOrManager, requireMfa]);

  if (!isAdminOrManager || !requireMfa || hasMfa || !checked) return null;

  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
          Two-factor authentication required
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-300/80">
          Your organization requires admins and managers to enable 2FA.{" "}
          <Link href="/settings" className="underline hover:no-underline font-medium">
            Set it up now
          </Link>
        </p>
      </div>
    </div>
  );
}
