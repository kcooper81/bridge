"use client";

import { X, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImpersonation } from "@/hooks/use-impersonation";

export function ImpersonationBanner() {
  const { isImpersonating, impersonatedOrg, stopImpersonation } =
    useImpersonation();

  const handleExit = () => {
    stopImpersonation();
    window.location.href = "/admin/organizations";
  };

  if (!isImpersonating || !impersonatedOrg) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-500 to-amber-500 text-white py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-5 w-5" />
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <span className="font-medium">
              Viewing as: <strong>{impersonatedOrg.name}</strong>
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs font-bold tracking-wider uppercase">
            Read-Only Mode
          </span>
        </div>
        <Button
          size="sm"
          onClick={handleExit}
          className="bg-white text-red-600 hover:bg-red-50 font-semibold px-4"
        >
          <X className="h-4 w-4 mr-1.5" />
          Exit Impersonation
        </Button>
      </div>
    </div>
  );
}
