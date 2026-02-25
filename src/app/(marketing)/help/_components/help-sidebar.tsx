"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HELP_CATEGORIES,
  searchHelpContent,
  type HelpCategory,
} from "@/lib/help-content";

export function HelpSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  // Determine current category from URL
  const segments = pathname.split("/").filter(Boolean); // ["help", categoryId?, articleSlug?]
  const currentCategoryId = segments[1] || null;
  const currentArticleSlug = segments[2] || null;

  const searchResults = useMemo(
    () => (query.trim() ? searchHelpContent(query) : []),
    [query],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="px-4 pb-4">
          {query.trim() ? (
            /* Search results */
            searchResults.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No results found
              </p>
            ) : (
              <div className="space-y-1">
                {searchResults.slice(0, 20).map(({ category, article }) => (
                  <Link
                    key={`${category.id}-${article.slug}`}
                    href={`/help/${category.id}/${article.slug}`}
                    onClick={onNavigate}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                      pathname === `/help/${category.id}/${article.slug}` &&
                        "bg-primary/10 text-primary font-medium",
                    )}
                  >
                    <span className="line-clamp-1">{article.q}</span>
                    <span className="text-xs text-muted-foreground">
                      {category.title}
                    </span>
                  </Link>
                ))}
              </div>
            )
          ) : (
            /* Category tree */
            <div className="space-y-1">
              {HELP_CATEGORIES.map((category) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  isActive={category.id === currentCategoryId}
                  currentArticleSlug={currentArticleSlug}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function CategorySection({
  category,
  isActive,
  currentArticleSlug,
  onNavigate,
}: {
  category: HelpCategory;
  isActive: boolean;
  currentArticleSlug: string | null;
  onNavigate?: () => void;
}) {
  const [expanded, setExpanded] = useState(isActive);
  const Icon = category.icon;

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
          isActive && "text-primary",
        )}
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
            expanded && "rotate-90",
          )}
        />
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{category.title}</span>
      </button>

      {expanded && (
        <div className="ml-5 border-l border-border pl-2 space-y-0.5 mt-0.5 mb-1">
          {category.articles.map((article) => {
            const isCurrentArticle =
              isActive && article.slug === currentArticleSlug;
            return (
              <Link
                key={article.slug}
                href={`/help/${category.id}/${article.slug}`}
                onClick={onNavigate}
                className={cn(
                  "block rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-muted line-clamp-1",
                  isCurrentArticle
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground",
                )}
              >
                {article.q}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
