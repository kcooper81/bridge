import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Github, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

const footerLinks = {
  Platform: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Integrations", href: "/integrations" },
    { label: "Extensions", href: "/extensions" },
    { label: "Data Protection", href: "/security" },
    { label: "Enterprise", href: "/enterprise" },
  ],
  "Use Cases": [
    { label: "Healthcare", href: "/industries/healthcare" },
    { label: "Legal", href: "/industries/legal" },
    { label: "Technology", href: "/industries/technology" },
    { label: "Finance", href: "/industries/finance" },
    { label: "Government", href: "/industries/government" },
    { label: "Education", href: "/industries/education" },
    { label: "Insurance", href: "/industries/insurance" },
  ],
  Solutions: [
    { label: "All Solutions", href: "/solutions" },
    { label: "Shadow AI Analysis", href: "/security" },
    { label: "Leakage Prevention", href: "/security" },
    { label: "Compliance", href: "/features#compliance-policy-packs" },
    { label: "Prompt Library", href: "/features#prompt-library" },
  ],
  Resources: [
    { label: "Blog", href: "/blog" },
    { label: "Help & Support", href: "/help" },
    { label: "Contact", href: "/contact" },
    { label: "Changelog", href: "/changelog" },
    { label: "Media Kit", href: "/media" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-zinc-950 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Tagline + CTA row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12 pb-12 border-b border-white/10">
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Your team uses AI. Make sure it&apos;s secure.
            </p>
            <p className="mt-2 text-sm text-zinc-500 max-w-md">
              See and control how your team uses AI across ChatGPT, Claude, Gemini, Copilot, and Perplexity.
            </p>
          </div>
          <Link href="/signup" className="shrink-0">
            <Button className="rounded-full px-8 font-semibold bg-white text-zinc-900 hover:bg-zinc-200">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/logo-dark.svg" alt="TeamPrompt" width={28} height={28} className="rounded-lg" />
              <span className="font-bold text-white">TeamPrompt</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              AI data loss prevention and prompt governance for teams. Protect sensitive data, share prompts securely, and maintain compliance.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="https://x.com/teampromptapp" target="_blank" rel="noopener noreferrer" aria-label="TeamPrompt on X" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://www.linkedin.com/company/teamprompt" target="_blank" rel="noopener noreferrer" aria-label="TeamPrompt on LinkedIn" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="https://github.com/kcooper81" target="_blank" rel="noopener noreferrer" aria-label="TeamPrompt on GitHub" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <Github className="h-4 w-4" />
              </a>
            </div>
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
            <Link href="/privacy" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              Terms of Service
            </Link>
            <Link href="mailto:support@teamprompt.app" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
              support@teamprompt.app
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
