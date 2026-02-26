"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { OrganizationsView } from "@/components/admin/organizations-view";

export default function OrganizationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <OrganizationsView />
    </Suspense>
  );
}
