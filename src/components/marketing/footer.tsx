import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Guardrails", href: "/security" },
    { label: "Chrome Extension", href: "/features#extension" },
  ],
  Industries: [
    { label: "Healthcare", href: "/industries/healthcare" },
    { label: "Legal", href: "/industries/legal" },
    { label: "Technology", href: "/industries/technology" },
    { label: "Finance", href: "/industries/finance" },
    { label: "Government", href: "/industries/government" },
  ],
  Resources: [
    { label: "Getting Started", href: "/features" },
    { label: "Security", href: "/security" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-zinc-950 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.svg" alt="TeamPrompt" width={28} height={28} className="rounded-lg" />
              <span className="font-bold text-white">TeamPrompt</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Prompt management for teams that use AI. Shared libraries,
              quality guidelines, and security guardrails.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-zinc-200 mb-4 uppercase tracking-wider">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} TeamPrompt. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="mailto:support@teamprompt.app" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              support@teamprompt.app
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
