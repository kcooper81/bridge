"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { authDebug } from "@/lib/auth-debug"; // AUTH-DEBUG
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";
import type { SuperAdminRole } from "@/lib/constants";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isSuperAdmin: boolean;
  isSupportStaff: boolean;
  superAdminRole: SuperAdminRole | null;
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
  const [superAdminRole, setSuperAdminRole] = useState<SuperAdminRole | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // ── Smart token refresh ──
    // Schedules a refreshSession() call 60s before the JWT expires.
    // Re-schedules after every auth state change (login, refresh, etc.)
    // and refreshes on tab focus if the token is within 5 min of expiry.
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    function scheduleRefresh(sess: Session | null) {
      if (refreshTimer) clearTimeout(refreshTimer);
      if (!sess?.expires_at) return;

      const expiresAt = sess.expires_at * 1000; // seconds → ms
      const refreshAt = expiresAt - 60_000; // 60s before expiry
      const delay = Math.max(refreshAt - Date.now(), 0);

      authDebug.log("state", "refresh scheduled", {
        expiresIn: Math.round((expiresAt - Date.now()) / 1000) + "s",
        refreshIn: Math.round(delay / 1000) + "s",
      });

      refreshTimer = setTimeout(async () => {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          authDebug.log("state", "scheduled refresh failed", { error: error.message });
        } else {
          authDebug.log("state", "scheduled refresh ok");
          scheduleRefresh(data.session);
        }
      }, delay);
    }

    // Seed the first timer from the current session
    supabase.auth.getSession().then(({ data }) => scheduleRefresh(data.session));

    // Single auth state listener — updates React state AND re-schedules refresh
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      authDebug.log("state", `onAuthStateChange: ${_event}`, {
        hasSession: !!newSession,
        userId: newSession?.user?.id,
      });
      setSession(newSession);
      setUser(newSession?.user ?? null);
      scheduleRefresh(newSession);
    });

    // On tab focus: refresh immediately if token expires within 5 minutes
    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;
      supabase.auth.getSession().then(({ data }) => {
        const sess = data.session;
        if (!sess?.expires_at) return;
        const expiresIn = sess.expires_at * 1000 - Date.now();
        if (expiresIn < 5 * 60 * 1000) {
          authDebug.log("state", "tab visible — token expiring soon, refreshing");
          supabase.auth.refreshSession().then(({ data: refreshed }) => {
            scheduleRefresh(refreshed.session);
          });
        }
      });
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      if (refreshTimer) clearTimeout(refreshTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Fetch super admin status when user changes
  useEffect(() => {
    async function fetchSuperAdmin() {
      if (!user) {
        setIsSuperAdmin(false);
        setSuperAdminRole(null);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("is_super_admin, super_admin_role")
        .eq("id", user.id)
        .maybeSingle();

      const emailIsAdmin = SUPER_ADMIN_EMAILS.includes(user.email || "");
      const isAdmin = data?.is_super_admin === true || emailIsAdmin;
      const role: SuperAdminRole | null = isAdmin
        ? (data?.super_admin_role as SuperAdminRole) || "super_admin"
        : data?.super_admin_role === "support"
          ? "support"
          : null;

      setIsSuperAdmin(isAdmin);
      setSuperAdminRole(role);
    }
    fetchSuperAdmin();
  }, [user]);

  const isSupportStaff = superAdminRole === "support";

  async function signOut() {
    authDebug.log("state", "signOut initiated"); // AUTH-DEBUG
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, isSuperAdmin, isSupportStaff, superAdminRole, signOut }}>
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
