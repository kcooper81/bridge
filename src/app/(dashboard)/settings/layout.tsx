"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOrg } from "@/components/providers/org-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { cn } from "@/lib/utils";
import { User, Building, CreditCard, Receipt, ShieldCheck } from "lucide-react";
import type { UserRole } from "@/lib/types";

const tabs: { label: string; href: string; icon: typeof User; roles?: UserRole[] }[] = [
  { label: "Profile", href: "/settings", icon: User },
  { label: "Organization", href: "/settings/organization", icon: Building, roles: ["admin", "manager"] as UserRole[] },
  { label: "Security", href: "/settings/security", icon: ShieldCheck, roles: ["admin"] as UserRole[] },
  { label: "Plan & Usage", href: "/settings/plan", icon: CreditCard, roles: ["admin", "manager"] },
  { label: "Billing", href: "/settings/billing", icon: Receipt, roles: ["admin", "manager"] },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { currentUserRole } = useOrg();

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
          {tabs.filter((tab) => !tab.roles || tab.roles.includes(currentUserRole)).map((tab) => (
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
