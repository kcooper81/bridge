"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { cn } from "@/lib/utils";
import { User, Building, CreditCard, Receipt } from "lucide-react";

const tabs = [
  { label: "Profile", href: "/settings", icon: User },
  { label: "Organization", href: "/settings/organization", icon: Building },
  { label: "Plan & Usage", href: "/settings/plan", icon: CreditCard },
  { label: "Billing", href: "/settings/billing", icon: Receipt },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/settings") return pathname === "/settings";
    return pathname.startsWith(href);
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account and organization"
      />

      <nav className="mb-6">
        <div className="inline-flex h-11 items-center justify-center rounded-xl bg-muted/50 p-1.5 text-muted-foreground backdrop-blur-sm">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold",
                "ring-offset-background transition-all duration-200",
                "hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive(tab.href)
                  ? "bg-background text-foreground shadow-md"
                  : ""
              )}
            >
              <tab.icon className="h-4 w-4 mr-1.5 hidden sm:inline" />
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>

      {children}
    </>
  );
}
