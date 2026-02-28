"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { authDebug } from "@/lib/auth-debug"; // AUTH-DEBUG
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSuperAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialUser,
  initialSession,
}: {
  children: React.ReactNode;
  initialUser: User | null;
  initialSession: Session | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [session, setSession] = useState<Session | null>(initialSession);
  const [loading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      authDebug.log("state", `onAuthStateChange: ${_event}`, { hasSession: !!newSession, userId: newSession?.user?.id }); // AUTH-DEBUG
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    // Proactive token refresh to prevent idle logout.
    // getSession() only reads localStorage — it does NOT refresh the JWT.
    // getUser() makes a server call that triggers a real token refresh.
    async function refreshSession() {
      const { error } = await supabase.auth.getUser();
      if (error) {
        authDebug.log("state", "proactive refresh failed", { error: error.message });
      } else {
        authDebug.log("state", "proactive refresh ok");
      }
    }

    // Refresh every 4 minutes (well within the default 1hr JWT expiry)
    const refreshInterval = setInterval(refreshSession, 4 * 60 * 1000);

    // Refresh immediately when the tab becomes visible again
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        authDebug.log("state", "tab visible — refreshing session");
        refreshSession();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Fetch super admin status when user changes
  useEffect(() => {
    async function fetchSuperAdmin() {
      if (!user) {
        setIsSuperAdmin(false);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("is_super_admin")
        .eq("id", user.id)
        .maybeSingle();
      setIsSuperAdmin(
        data?.is_super_admin === true ||
          SUPER_ADMIN_EMAILS.includes(user.email || "")
      );
    }
    fetchSuperAdmin();
  }, [user]);

  async function signOut() {
    authDebug.log("state", "signOut initiated"); // AUTH-DEBUG
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, isSuperAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
