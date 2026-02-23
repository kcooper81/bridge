"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useOrg } from "@/components/providers/org-provider";

export function SetupRedirectGuard({ children }: { children: React.ReactNode }) {
  const { org, currentUserRole, loading } = useOrg();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!org) return;

    const isAdmin = currentUserRole === "admin";
    const setupComplete = org.settings?.setup_complete === true;
    const onSetupPage = pathname === "/setup";

    if (isAdmin && !setupComplete && !onSetupPage) {
      router.replace("/setup");
    }
  }, [org, currentUserRole, loading, pathname, router]);

  return <>{children}</>;
}
