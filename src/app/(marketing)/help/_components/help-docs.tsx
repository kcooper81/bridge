"use client";

import { useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { HELP_CATEGORIES, type HelpCategory, type HelpArticle } from "@/lib/help-content";

type View =
  | { type: "index" }
  | { type: "category"; category: HelpCategory }
  | { type: "article"; category: HelpCategory; article: HelpArticle };

export function HelpDocs() {
  const [view, setView] = useState<View>({ type: "index" });

  return (
    <div>
      {/* Back button */}
      {view.type !== "index" && (
        <button
          onClick={() =>
            view.type === "article"
              ? setView({ type: "category", category: view.category })
              : setView({ type: "index" })
          }
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          {view.type === "article" ? view.category.title : "All categories"}
        </button>
      )}

      {view.type === "index" && (
        <IndexView onSelectCategory={(cat) => setView({ type: "category", category: cat })} />
      )}

      {view.type === "category" && (
        <CategoryView
          category={view.category}
          onSelectArticle={(art) =>
            setView({ type: "article", category: view.category, article: art })
          }
        />
      )}

      {view.type === "article" && (
        <ArticleView category={view.category} article={view.article} />
      )}
    </div>
  );
}

function IndexView({
  onSelectCategory,
}: {
  onSelectCategory: (cat: HelpCategory) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {HELP_CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        return (
          <button
            key={cat.id}
            id={cat.id}
            onClick={() => onSelectCategory(cat)}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-6 text-left hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 group scroll-mt-24"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-semibold group-hover:text-primary transition-colors">
                {cat.title}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {cat.description}
              </p>
              <p className="text-[11px] text-muted-foreground/60 mt-1">
                {cat.articles.length} articles
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
          </button>
        );
      })}
    </div>
  );
}

function CategoryView({
  category,
  onSelectArticle,
}: {
  category: HelpCategory;
  onSelectArticle: (article: HelpArticle) => void;
}) {
  const Icon = category.icon;
  return (
    <div>
      {/* Category header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{category.title}</h2>
          <p className="text-sm text-muted-foreground">{category.description}</p>
        </div>
      </div>

      {/* Article list */}
      <div className="space-y-2">
        {category.articles.map((article) => (
          <button
            key={article.q}
            onClick={() => onSelectArticle(article)}
            className="flex items-center gap-3 w-full rounded-xl border border-border bg-card p-4 text-left hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 group"
          >
            <span className="text-sm font-medium flex-1 group-hover:text-primary transition-colors">
              {article.q}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ArticleView({
  category,
  article,
}: {
  category: HelpCategory;
  article: HelpArticle;
}) {
  const Icon = category.icon;
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-4">
        <div className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
        )}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{category.title}</span>
      </div>

      <h2 className="text-2xl font-bold mb-4">{article.q}</h2>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
        {article.a}
      </p>
    </div>
  );
}
