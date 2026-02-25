import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { HELP_CATEGORIES, getCategoryById } from "@/lib/help-content";
import { HelpBreadcrumbs } from "../_components/help-breadcrumbs";

interface Props {
  params: Promise<{ categoryId: string }>;
}

export async function generateStaticParams() {
  return HELP_CATEGORIES.map((cat) => ({ categoryId: cat.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoryId } = await params;
  const category = getCategoryById(categoryId);
  if (!category) return {};

  return generatePageMetadata({
    title: `${category.title} — Help`,
    description: category.description,
    path: `/help/${category.id}`,
    keywords: [category.title, "TeamPrompt help", "documentation"],
  });
}

export default async function CategoryPage({ params }: Props) {
  const { categoryId } = await params;
  const category = getCategoryById(categoryId);
  if (!category) notFound();

  const Icon = category.icon;

  return (
    <div>
      <HelpBreadcrumbs items={[{ label: category.title }]} />

      {/* Category header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{category.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {category.description}
          </p>
        </div>
      </div>

      {/* Article list */}
      <div className="space-y-2">
        {category.articles.map((article) => (
          <Link
            key={article.slug}
            href={`/help/${category.id}/${article.slug}`}
            className="flex items-center gap-3 w-full rounded-xl border border-border bg-card p-4 text-left hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 group"
          >
            <span className="text-sm font-medium flex-1 group-hover:text-primary transition-colors">
              {article.q}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
