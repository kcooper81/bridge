import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Guardrails", href: "/security" },
    { label: "Chrome Extension", href: "/features#extension" },
  ],
  Resources: [
    { label: "Getting Started", href: "/features" },
    { label: "Security", href: "/security" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Image src="/logo.svg" alt="TeamPrompt" width={28} height={28} className="rounded-lg" />
              <span className="font-bold">TeamPrompt</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Prompt management for teams that use AI.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} TeamPrompt. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
