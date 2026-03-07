"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BLOG_CATEGORIES, type BlogPost } from "@/lib/blog-posts";
import { Calendar, Clock, User } from "lucide-react";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const CATEGORY_COLORS: Record<string, string> = {
  guide: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  insight: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  comparison: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  tutorial: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

export function BlogFilter({ posts }: { posts: BlogPost[] }) {
  const [active, setActive] = useState("all");

  const filtered =
    active === "all" ? posts : posts.filter((p) => p.category === active);

  return (
    <>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        <button
          onClick={() => setActive("all")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            active === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          All
        </button>
        {BLOG_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActive(cat.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              active === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Post grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
          >
            {/* Cover image */}
            {post.coverImage && (
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <Image
                  src={post.coverImage.replace("w=1200", "w=600")}
                  alt={post.coverImageAlt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            )}

            <div className="p-6 flex flex-col flex-1">
              {/* Category badge */}
              <Badge
                variant="secondary"
                className={cn(
                  "w-fit text-[11px] uppercase tracking-wider mb-3",
                  CATEGORY_COLORS[post.category]
                )}
              >
                {post.category}
              </Badge>

              {/* Title */}
              <h2 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors mb-2">
                {post.title}
              </h2>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                {post.description}
              </p>

              {/* Meta row */}
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground/70 pt-4 border-t border-border">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readingTime}
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {post.author.name}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No posts in this category yet. Check back soon.
        </p>
      )}
    </>
  );
}
