import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { SectionLabel } from "@/components/marketing/section-label";
import { CTASection } from "@/components/marketing/cta-section";
import { SupportForm } from "../help/_components/support-form";
import { Mail, MessageSquare, Clock } from "lucide-react";

export const metadata: Metadata = generatePageMetadata({
  title: "Contact Us",
  description:
    "Get in touch with the TeamPrompt team. Send us feedback, report a bug, or request a feature — we'd love to hear from you.",
  path: "/contact",
  keywords: ["contact TeamPrompt", "support", "feedback", "bug report"],
});

export default function ContactPage() {
  return (
    <div className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center mb-16 sm:mb-20">
          <SectionLabel className="text-center">Contact</SectionLabel>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Get in touch
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Have a question, found a bug, or want to request a feature? We&apos;d
            love to hear from you.
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-16">
          {[
            {
              icon: Mail,
              title: "Email us",
              desc: "support@teamprompt.app",
              href: "mailto:support@teamprompt.app",
              bg: "bg-blue-500/10",
            },
            {
              icon: MessageSquare,
              title: "Send a message",
              desc: "Use the form below",
              bg: "bg-emerald-500/10",
            },
            {
              icon: Clock,
              title: "Response time",
              desc: "Usually within 24 hours",
              bg: "bg-amber-500/10",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-border bg-card p-5 text-center"
            >
              <div className={`flex h-10 w-10 mx-auto items-center justify-center rounded-xl ${card.bg} mb-3`}>
                <card.icon className="h-5 w-5 text-foreground/70" />
              </div>
              <h2 className="text-sm font-semibold">{card.title}</h2>
              {card.href ? (
                <a
                  href={card.href}
                  className="text-xs text-primary hover:underline mt-1 block"
                >
                  {card.desc}
                </a>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  {card.desc}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto mb-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            Send us a message
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Fill out the form below and we&apos;ll get back to you as soon as
            possible.
          </p>
          <SupportForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Prefer email? Reach us at{" "}
            <a
              href="mailto:support@teamprompt.app"
              className="text-primary hover:underline"
            >
              support@teamprompt.app
            </a>
          </p>
        </div>

        {/* CTA */}
        <CTASection
          headline="Ready to give your team"
          gradientText="a proper prompt system?"
          subtitle="Set up your workspace in under two minutes. No credit card needed."
        />
      </div>
    </div>
  );
}
