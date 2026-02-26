"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronRight, ArrowLeft, ExternalLink } from "lucide-react";
import {
  HELP_CATEGORIES,
  HELP_OVERVIEW,
  searchHelpContent,
  type HelpCategory,
  type HelpArticle,
} from "@/lib/help-content";

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type View =
  | { type: "home" }
  | { type: "category"; category: HelpCategory }
  | { type: "article"; category: HelpCategory; article: HelpArticle };

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>({ type: "home" });

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery("");
      setView({ type: "home" });
    }
  }, [open]);

  const searchResults = useMemo(
    () => (query.length >= 2 ? searchHelpContent(query) : []),
    [query]
  );

  const handleBack = useCallback(() => {
    if (view.type === "article") {
      setView({ type: "category", category: view.category });
    } else {
      setView({ type: "home" });
      setQuery("");
    }
  }, [view]);

  const isSearching = query.length >= 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b space-y-3">
          <div className="flex items-center gap-3 pr-8">
            {view.type !== "home" && !isSearching && (
              <button
                onClick={handleBack}
                className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted transition-colors shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <DialogTitle className="flex-1 text-lg">
              {view.type === "home" || isSearching
                ? "Help & Docs"
                : view.type === "category"
                  ? view.category.title
                  : view.category.title}
            </DialogTitle>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search help articles..."
              className="pl-9"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6">
            {isSearching ? (
              <SearchResultsView
                results={searchResults}
                onSelectArticle={(cat, art) =>
                  setView({ type: "article", category: cat, article: art })
                }
              />
            ) : view.type === "home" ? (
              <HomeView
                onSelectCategory={(cat) => setView({ type: "category", category: cat })}
              />
            ) : view.type === "category" ? (
              <CategoryView
                category={view.category}
                onSelectArticle={(art) =>
                  setView({ type: "article", category: view.category, article: art })
                }
              />
            ) : (
              <ArticleView category={view.category} article={view.article} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 flex items-center justify-between">
          <a
            href="/help"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View full documentation
            <ExternalLink className="h-3 w-3" />
          </a>
          <p className="text-[10px] text-muted-foreground">
            {HELP_CATEGORIES.reduce((sum, c) => sum + c.articles.length, 0)} articles
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sub-views ───

function HomeView({ onSelectCategory }: { onSelectCategory: (cat: HelpCategory) => void }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        {HELP_OVERVIEW.subtitle}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {HELP_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat)}
              className="flex items-start gap-3 rounded-xl border p-4 text-left hover:bg-muted/50 hover:border-primary/20 transition-colors group"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium group-hover:text-primary transition-colors">
                  {cat.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {cat.description}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
            </button>
          );
        })}
      </div>
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
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{category.title}</p>
          <p className="text-xs text-muted-foreground">{category.description}</p>
        </div>
      </div>

      <div className="space-y-1">
        {category.articles.map((article) => (
          <button
            key={article.q}
            onClick={() => onSelectArticle(article)}
            className="flex items-center gap-3 w-full rounded-lg p-3 text-left hover:bg-muted/50 transition-colors group"
          >
            <span className="text-sm flex-1">{article.q}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 group-hover:text-primary transition-colors" />
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <Badge variant="secondary" className="text-xs">
          {category.title}
        </Badge>
      </div>
      <h3 className="text-base font-semibold">{article.q}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
        {article.a}
      </p>
    </div>
  );
}

function SearchResultsView({
  results,
  onSelectArticle,
}: {
  results: { category: HelpCategory; article: HelpArticle }[];
  onSelectArticle: (cat: HelpCategory, art: HelpArticle) => void;
}) {
  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No articles found. Try different keywords.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground mb-3">
        {results.length} result{results.length !== 1 ? "s" : ""}
      </p>
      {results.map(({ category, article }, i) => {
        const Icon = category.icon;
        return (
          <button
            key={`${category.id}-${i}`}
            onClick={() => onSelectArticle(category, article)}
            className="flex items-start gap-3 w-full rounded-lg p-3 text-left hover:bg-muted/50 transition-colors group"
          >
            <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium group-hover:text-primary transition-colors">
                {article.q}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {article.a}
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">
              {category.title}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
