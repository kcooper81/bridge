"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";

interface ImpersonationData {
  id: string;
  name: string;
}

interface ImpersonationState {
  isImpersonating: boolean;
  impersonatedOrg: ImpersonationData | null;
  startImpersonation: (org: ImpersonationData) => void;
  stopImpersonation: () => void;
}

const ImpersonationContext = createContext<ImpersonationState>({
  isImpersonating: false,
  impersonatedOrg: null,
  startImpersonation: () => {},
  stopImpersonation: () => {},
});

const STORAGE_KEY = "admin_impersonate_org";

export function ImpersonationProvider({ children }: { children: ReactNode }) {
  const [impersonatedOrg, setImpersonatedOrg] =
    useState<ImpersonationData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setImpersonatedOrg(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        if (e.newValue) {
          try {
            setImpersonatedOrg(JSON.parse(e.newValue));
          } catch {
            setImpersonatedOrg(null);
          }
        } else {
          setImpersonatedOrg(null);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const startImpersonation = (org: ImpersonationData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(org));
    setImpersonatedOrg(org);
  };

  const stopImpersonation = () => {
    localStorage.removeItem(STORAGE_KEY);
    setImpersonatedOrg(null);
  };

  return (
    <ImpersonationContext.Provider
      value={{
        isImpersonating: !!impersonatedOrg,
        impersonatedOrg,
        startImpersonation,
        stopImpersonation,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  );
}

export function useImpersonation() {
  return useContext(ImpersonationContext);
}

export function getImpersonatedOrgId(): string | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored).id;
    } catch {
      return null;
    }
  }
  return null;
}
