import { createServiceClient } from "@/lib/supabase/server";
import { BLOG_POSTS, getBlogPostBySlug, type BlogPost } from "./blog-posts";

interface BlogPostRow {
  slug: string;
  title: string;
  description: string;
  content: string;
  published_at: string | null;
  updated_at: string | null;
  created_at: string;
  author_name: string;
  author_role: string;
  category: string;
  tags: string[];
  reading_time: string;
  related_slugs: string[];
  cover_image: string | null;
  cover_image_alt: string | null;
}

function rowToPost(row: BlogPostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    content: row.content,
    publishedAt: row.published_at || row.created_at,
    updatedAt: row.updated_at || undefined,
    author: { name: row.author_name || "TeamPrompt Team", role: row.author_role || "Product" },
    category: row.category || "guide",
    tags: row.tags || [],
    readingTime: row.reading_time || "5 min read",
    relatedSlugs: row.related_slugs || [],
    coverImage: row.cover_image || "",
    coverImageAlt: row.cover_image_alt || row.title,
  };
}

/** Fetch published posts from Supabase, merge with static posts. */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const db = createServiceClient();
    const { data } = await db
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    const dbPosts = (data || []).map(rowToPost);
    const dbSlugs = new Set(dbPosts.map((p) => p.slug));
    const staticOnly = BLOG_POSTS.filter((p) => !dbSlugs.has(p.slug));

    return [...dbPosts, ...staticOnly].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
  } catch (err) {
    console.error("Failed to fetch blog posts from DB:", err);
    return BLOG_POSTS;
  }
}

/** Get a single post by slug — checks Supabase first, then static. */
export async function getBlogPostBySlugAsync(slug: string): Promise<BlogPost | undefined> {
  try {
    const db = createServiceClient();
    const { data } = await db
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (data) return rowToPost(data);
  } catch {
    // Fall through to static
  }
  return getBlogPostBySlug(slug);
}

/** Async related posts — works with both static and dynamic posts. */
export async function getRelatedPostsAsync(post: BlogPost): Promise<BlogPost[]> {
  if (!post.relatedSlugs.length) return [];
  const results = await Promise.all(
    post.relatedSlugs.map((slug) => getBlogPostBySlugAsync(slug)),
  );
  return results.filter((p): p is BlogPost => p !== undefined);
}
