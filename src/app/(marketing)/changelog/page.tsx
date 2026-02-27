import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { SectionLabel } from "@/components/marketing/section-label";
import { CTASection } from "@/components/marketing/cta-section";
import { RELEASE_NOTES, APP_VERSION } from "@/lib/release-notes";

export const metadata: Metadata = generatePageMetadata({
  title: "Changelog — What's New in TeamPrompt",
  description:
    "See what's new in TeamPrompt. Release notes, new features, improvements, and bug fixes — all in one place.",
  path: "/changelog",
  keywords: ["changelog", "release notes", "what's new", "TeamPrompt updates"],
});

export default function ChangelogPage() {
  return (
    <div className="py-20 sm:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="mb-16">
          <SectionLabel>Changelog</SectionLabel>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            What&apos;s new in TeamPrompt
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Release notes, new features, and improvements. Current version:{" "}
            <span className="font-mono font-medium text-foreground">v{APP_VERSION}</span>
          </p>
        </div>

        {/* Releases */}
        <div className="space-y-12">
          {RELEASE_NOTES.map((release) => (
            <article
              key={release.version}
              className="relative pl-6 border-l-2 border-border"
            >
              <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-border bg-background" />

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className="font-mono text-xs">
                  v{release.version}
                </Badge>
                {release.badge && (
                  <Badge
                    variant={release.badge === "new" ? "default" : "secondary"}
                    className="text-[10px] uppercase tracking-wider"
                  >
                    {release.badge}
                  </Badge>
                )}
                <time className="text-sm text-muted-foreground">
                  {release.date}
                </time>
              </div>

              <h2 className="text-xl font-semibold mb-3">{release.title}</h2>

              <ul className="space-y-2">
                {release.highlights.map((highlight, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed"
                  >
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>

              {release.details && (
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {release.details}
                </p>
              )}
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20">
          <CTASection
            headline="Try the latest features."
            gradientText="Start for free."
            subtitle="Create a free workspace in under two minutes. No credit card required."
            buttonText="Start for free"
          />
        </div>
      </div>
    </div>
  );
}
