import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminAccess } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const auth = await verifyAdminAccess();
  if (!auth?.isSuperAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { blogPostId, action } = await request.json();
  if (!blogPostId || !action) {
    return NextResponse.json({ error: "blogPostId and action required" }, { status: 400 });
  }

  const db = createServiceClient();

  if (action === "approve") {
    const { data: post, error } = await db
      .from("blog_posts")
      .update({
        status: "published",
        published_at: new Date().toISOString().split("T")[0],
        updated_at: new Date().toISOString(),
      })
      .eq("id", blogPostId)
      .select("pipeline_id")
      .single();

    if (error) {
      console.error("Publish error:", error);
      return NextResponse.json({ error: "Failed to publish" }, { status: 500 });
    }

    if (post?.pipeline_id) {
      await db
        .from("content_pipeline")
        .update({ status: "published", updated_at: new Date().toISOString() })
        .eq("id", post.pipeline_id);
    }

    return NextResponse.json({ ok: true, action: "published" });
  }

  if (action === "reject") {
    const { data: post } = await db
      .from("blog_posts")
      .select("pipeline_id")
      .eq("id", blogPostId)
      .single();

    await db.from("blog_posts").delete().eq("id", blogPostId);

    if (post?.pipeline_id) {
      await db
        .from("content_pipeline")
        .update({ status: "draft", updated_at: new Date().toISOString() })
        .eq("id", post.pipeline_id);
    }

    return NextResponse.json({ ok: true, action: "rejected" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
