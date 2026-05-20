import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User, ArrowLeft } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schemas";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SectionLabel } from "@/components/marketing/section-label";
import { CTASection } from "@/components/marketing/cta-section";
import { BLOG_POSTS } from "@/lib/blog-posts";
import {
  getBlogPostBySlugAsync,
  getRelatedPostsAsync,
} from "@/lib/blog-posts.server";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";

const CATEGORY_COLORS: Record<string, string> = {
  guide: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  insight: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  comparison: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  tutorial: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function hostnameOnly(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlugAsync(slug);
  if (!post) return {};

  return generatePageMetadata({
    title: `${post.title} — TeamPrompt Blog`,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: [...post.tags, post.category, "TeamPrompt blog"],
  });
}

export const dynamicParams = true;

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlugAsync(slug);
  if (!post) notFound();

  // Related posts from the relatedSlugs array
  const related = await getRelatedPostsAsync(post);

  // Schemas
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blog` },
    { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
  ]);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    // Person (not Organization) — Google's E-E-A-T signals reward named
    // human authors with a resolvable profile + sameAs. This was anonymized
    // before; switching to Person added ~1.8x AI Overview citation rate in
    // the BrightEdge / Authoritas 2026 studies.
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
      ...(post.author.profileUrl && { url: `${SITE_URL}${post.author.profileUrl}` }),
      ...(post.author.sameAs && post.author.sameAs.length > 0 && { sameAs: post.author.sameAs }),
    },
    publisher: {
      "@type": "Organization",
      name: "TeamPrompt",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/brand/logo-icon-blue.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
  };

  // FAQPage schema — even though FAQ rich results were removed from
  // blue-link SERPs in May 2026, this schema still drives ~3.2x more
  // AI-Overview citations (Frase/Sitebulb 2026 data). It's the highest
  // ROI structured-data move for LLM citation eligibility.
  const faqSchema = post.faqs && post.faqs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: f.a,
          },
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Article */}
          <article className="max-w-3xl mx-auto">
            {/* Header */}
            <header className="mb-10">
              <Badge
                variant="secondary"
                className={cn(
                  "text-[11px] uppercase tracking-wider mb-4",
                  CATEGORY_COLORS[post.category],
                )}
              >
                {post.category}
              </Badge>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4">
                {post.title}
              </h1>

              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span title="Published">{formatDate(post.publishedAt)}</span>
                  {post.updatedAt && post.updatedAt !== post.publishedAt && (
                    <span className="text-xs">· Updated {formatDate(post.updatedAt)}</span>
                  )}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {post.readingTime}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {post.author.profileUrl ? (
                    <Link href={post.author.profileUrl} className="hover:text-primary hover:underline">
                      {post.author.name}
                    </Link>
                  ) : (
                    post.author.name
                  )}
                  <span className="text-muted-foreground/60">·</span>
                  <span>{post.author.role}</span>
                </span>
              </div>
            </header>

            {/* Cover image */}
            {post.coverImage && (
              <div className="relative aspect-[2/1] w-full rounded-2xl overflow-hidden mb-12">
                <Image
                  src={post.coverImage}
                  alt={post.coverImageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
              </div>
            )}

            {/* TL;DR / direct-answer card — the "ski-ramp" lede LLMs cite.
                Per Indig's 2026 analysis of 1.2M ChatGPT answers, 44.2% of
                citations come from the first 30% of a page. Render this
                BEFORE the narrative content so AI crawlers (and impatient
                humans) hit the direct answer first. */}
            {post.tldr && (
              <aside
                className="mb-10 rounded-2xl border-l-4 border-primary bg-primary/5 px-5 py-4 sm:px-6 sm:py-5"
                aria-label="Quick answer"
              >
                <div className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1.5">
                  Quick answer
                </div>
                <p className="text-base sm:text-lg leading-relaxed text-foreground/90 m-0">
                  {post.tldr}
                </p>
              </aside>
            )}

            {/* Content */}
            <div
              className="prose prose-lg prose-zinc dark:prose-invert max-w-none
                prose-headings:font-semibold prose-headings:tracking-tight
                prose-h2:text-2xl prose-h2:mt-14 prose-h2:mb-5
                prose-p:leading-[1.8] prose-p:text-foreground/80 prose-p:mb-6
                prose-li:text-foreground/80 prose-li:leading-[1.8]
                prose-ul:my-6 prose-ol:my-6 prose-li:my-2
                prose-strong:text-foreground prose-strong:font-semibold
                prose-a:text-primary hover:prose-a:underline
                prose-figure:my-0 prose-figcaption:text-center prose-figcaption:text-sm prose-figcaption:text-muted-foreground prose-figcaption:mt-3
                prose-img:rounded-xl prose-img:my-0"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* FAQ section — question-shaped H2/H3s are the exact structure
                LLMs extract for citations. The matching FAQPage schema is
                already emitted above. */}
            {post.faqs && post.faqs.length > 0 && (
              <section className="mt-14 pt-10 border-t border-border" aria-labelledby="post-faq-heading">
                <h2 id="post-faq-heading" className="text-2xl font-semibold tracking-tight mb-6">
                  Frequently asked questions
                </h2>
                <div className="space-y-5">
                  {post.faqs.map((f, i) => (
                    <div key={i}>
                      <h3 className="text-base sm:text-lg font-semibold mb-2">{f.q}</h3>
                      <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">{f.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Tags */}
            <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Author bio card */}
            {post.author.bio && (
              <aside className="mt-10 rounded-2xl border border-border bg-card/60 p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {post.author.name
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      {post.author.profileUrl ? (
                        <Link
                          href={post.author.profileUrl}
                          className="text-sm font-semibold hover:text-primary hover:underline"
                        >
                          {post.author.name}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold">{post.author.name}</span>
                      )}
                      <span className="text-xs text-muted-foreground">· {post.author.role}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{post.author.bio}</p>
                    {post.author.sameAs && post.author.sameAs.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        {post.author.sameAs.map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer me"
                            className="text-muted-foreground hover:text-primary hover:underline"
                          >
                            {hostnameOnly(url)}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            )}
          </article>

          {/* Related posts */}
          {related.length > 0 && (
            <div className="max-w-7xl mx-auto mt-20">
              <SectionLabel className="text-center">
                Related Articles
              </SectionLabel>
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
                Keep reading
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="group flex flex-col rounded-2xl border border-border bg-card p-6 hover:bg-muted/50 hover:border-primary/20 transition-all duration-200"
                  >
                    <Badge
                      variant="secondary"
                      className={cn(
                        "w-fit text-[11px] uppercase tracking-wider mb-4",
                        CATEGORY_COLORS[rel.category],
                      )}
                    >
                      {rel.category}
                    </Badge>
                    <h3 className="text-base font-semibold leading-snug group-hover:text-primary transition-colors mb-2">
                      {rel.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {rel.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground/70 mt-4 pt-4 border-t border-border">
                      <span>{formatDate(rel.publishedAt)}</span>
                      <span>{rel.readingTime}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Contextual links */}
          <nav className="max-w-3xl mx-auto mt-14 pt-8 border-t border-border" aria-label="Explore more">
            <p className="text-sm text-muted-foreground mb-3">Explore more</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              {[
                { href: "/features", label: "Features" },
                { href: "/solutions", label: "Solutions" },
                { href: "/help", label: "Help Center" },
                { href: "/pricing", label: "Pricing" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* CTA */}
          <div className="mt-20">
            <CTASection
              headline="Ready to secure and scale"
              gradientText="your team's AI usage?"
              subtitle="Create a free workspace in under two minutes. No credit card required."
              buttonText="Start for free"
            />
          </div>
        </div>
      </div>
    </>
  );
}
