import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authDebug } from "@/lib/auth-debug"; // AUTH-DEBUG

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // AUTH-DEBUG: log cookie names found on request
  const allCookies = request.cookies.getAll();
  authDebug.log("session", "cookies on request", allCookies.map((c) => c.name));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
          // AUTH-DEBUG: log cookies being set
          authDebug.log("session", "setAll cookies", cookiesToSet.map((c) => c.name));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // AUTH-DEBUG: log getUser result
  authDebug.log("session", "getUser result", user ? { id: user.id, email: user.email } : null);

  return { supabaseResponse, user };
}
