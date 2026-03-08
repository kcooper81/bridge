import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";
import { SectionLabel } from "@/components/marketing/section-label";
import { CTASection } from "@/components/marketing/cta-section";
import { DarkSection } from "@/components/marketing/dark-section";
import { getAllBlogPosts } from "@/lib/blog-posts";
import { BlogFilter } from "./_components/blog-filter";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

export const metadata: Metadata = generatePageMetadata({
  title: "Blog — AI Prompt Management Insights & Guides",
  description:
    "Tips, guides, and insights on AI prompt management, data protection, team collaboration, and governance. Learn how to get the most from AI tools securely.",
  path: "/blog",
  keywords: [
    "AI blog",
    "prompt management blog",
    "AI data protection",
    "DLP for AI",
    "AI governance blog",
    "prompt engineering tips",
  ],
});

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blog` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <div className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <DarkSection className="mb-16 sm:mb-20 text-center py-16 sm:py-20">
            <SectionLabel dark>Blog</SectionLabel>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
              Insights for teams that
              <br />
              <span className="text-blue-400">use AI seriously</span>
            </h1>
            <p className="mt-5 text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Guides on prompt management, data protection, AI governance, and
              getting real value from AI tools across your organization.
            </p>
          </DarkSection>

          {/* Filter + Grid (client component) */}
          <BlogFilter posts={posts} />

          {/* CTA */}
          <div className="mt-20">
            <CTASection
              headline="Ready to manage your team's AI prompts?"
              gradientText="Start for free today."
              subtitle="Create a free workspace in under two minutes. No credit card required."
              buttonText="Create your workspace"
            />
          </div>
        </div>
      </div>
    </>
  );
}
