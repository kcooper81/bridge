"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "teamprompt-theme";

// Only apply dark theme on dashboard app routes
const DASHBOARD_ROUTES = ["/vault", "/chat", "/templates", "/approvals",
  "/guidelines", "/team", "/guardrails", "/activity", "/analytics",
  "/settings", "/home", "/import-export", "/testing-guide", "/notifications"];

function isDashboardRoute(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  return DASHBOARD_ROUTES.some((r) => path.startsWith(r));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "dark" && isDashboardRoute()) {
      setThemeState(stored);
      document.documentElement.setAttribute("data-theme", stored);
    } else {
      // Force light on non-dashboard routes
      document.documentElement.setAttribute("data-theme", "light");
    }
    setMounted(true);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    if (isDashboardRoute()) {
      document.documentElement.setAttribute("data-theme", newTheme);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
