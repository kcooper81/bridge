import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  await supabase.auth.signOut();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://teamprompt.app";
  return NextResponse.redirect(`${siteUrl}/login`);
}
