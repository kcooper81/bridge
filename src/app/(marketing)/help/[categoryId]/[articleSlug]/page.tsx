import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import {
  HELP_CATEGORIES,
  getArticleBySlug,
} from "@/lib/help-content";
import { HelpBreadcrumbs } from "../../_components/help-breadcrumbs";

interface Props {
  params: Promise<{ categoryId: string; articleSlug: string }>;
}

export async function generateStaticParams() {
  return HELP_CATEGORIES.flatMap((cat) =>
    cat.articles.map((article) => ({
      categoryId: cat.id,
      articleSlug: article.slug,
    })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoryId, articleSlug } = await params;
  const result = getArticleBySlug(categoryId, articleSlug);
  if (!result) return {};

  return generatePageMetadata({
    title: `${result.article.q} — ${result.category.title} — Help`,
    description: result.article.a.slice(0, 160),
    path: `/help/${categoryId}/${articleSlug}`,
    keywords: [
      result.category.title,
      ...(result.article.keywords || []),
      "TeamPrompt help",
    ],
  });
}

export default async function ArticlePage({ params }: Props) {
  const { categoryId, articleSlug } = await params;
  const result = getArticleBySlug(categoryId, articleSlug);
  if (!result) notFound();

  const { category, article } = result;
  const Icon = category.icon;

  // Prev / Next navigation
  const articleIndex = category.articles.findIndex(
    (a) => a.slug === article.slug,
  );
  const prevArticle =
    articleIndex > 0 ? category.articles[articleIndex - 1] : null;
  const nextArticle =
    articleIndex < category.articles.length - 1
      ? category.articles[articleIndex + 1]
      : null;

  return (
    <div>
      <HelpBreadcrumbs
        items={[
          { label: category.title, href: `/help/${category.id}` },
          { label: article.q },
        ]}
      />

      {/* Category badge */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {category.title}
        </span>
      </div>

      {/* Article content */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">{article.q}</h1>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line max-w-3xl">
        {article.a}
      </p>

      {/* Prev / Next */}
      {(prevArticle || nextArticle) && (
        <div className="mt-12 pt-8 border-t border-border flex items-stretch gap-4">
          {prevArticle ? (
            <Link
              href={`/help/${category.id}/${prevArticle.slug}`}
              className="flex-1 flex items-center gap-2 rounded-xl border border-border p-4 hover:bg-muted/50 hover:border-primary/20 transition-all group"
            >
              <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="min-w-0">
                <span className="text-xs text-muted-foreground">Previous</span>
                <span className="block text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                  {prevArticle.q}
                </span>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {nextArticle ? (
            <Link
              href={`/help/${category.id}/${nextArticle.slug}`}
              className="flex-1 flex items-center justify-end gap-2 rounded-xl border border-border p-4 hover:bg-muted/50 hover:border-primary/20 transition-all group text-right"
            >
              <div className="min-w-0">
                <span className="text-xs text-muted-foreground">Next</span>
                <span className="block text-sm font-medium group-hover:text-primary transition-colors line-clamp-1">
                  {nextArticle.q}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>
      )}
    </div>
  );
}
