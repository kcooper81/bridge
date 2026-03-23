import { Suspense } from "react";
import { MarketingHeader } from "@/components/marketing/header";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingThemeForcer } from "@/components/marketing/theme-forcer";
import { MarketingMain } from "@/components/marketing/marketing-main";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <MarketingThemeForcer />
      <MarketingHeader />
      <MarketingMain>
        <Suspense>{children}</Suspense>
      </MarketingMain>
      <MarketingFooter />
    </div>
  );
}
