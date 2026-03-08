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
import {
  BLOG_POSTS,
  getBlogPostBySlugAsync,
  getRelatedPostsAsync,
} from "@/lib/blog-posts";

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
    author: {
      "@type": "Organization",
      name: post.author.name,
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
                  {formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {post.readingTime}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {post.author.name}
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

            {/* Tags */}
            <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
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
