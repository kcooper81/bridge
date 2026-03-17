"use client";

import { Suspense } from "react";
import { PlanUsageTab } from "../_components/plan-usage-tab";
import dynamic from "next/dynamic";

const BillingPage = dynamic(() => import("../billing/page"), { ssr: false });

export default function PlanUsagePage() {
  return (
    <div className="max-w-4xl space-y-8">
      <PlanUsageTab />
      <div className="border-t pt-8">
        <Suspense fallback={null}>
          <BillingPage />
        </Suspense>
      </div>
    </div>
  );
}
