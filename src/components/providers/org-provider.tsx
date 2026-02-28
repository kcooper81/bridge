"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { getImpersonatedOrgId } from "@/hooks/use-impersonation";
import type {
  Organization,
  Prompt,
  Folder,
  Team,
  Member,
  Guideline,
  UserRole,
} from "@/lib/types";

interface OrgContextValue {
  org: Organization | null;
  prompts: Prompt[];
  folders: Folder[];
  teams: Team[];
  members: Member[];
  guidelines: Guideline[];
  /** @deprecated Use guidelines instead */
  standards: Guideline[];
  currentUserRole: UserRole;
  loading: boolean;
  noOrg: boolean;
  refresh: () => Promise<void>;
  setPrompts: React.Dispatch<React.SetStateAction<Prompt[]>>;
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  setGuidelines: React.Dispatch<React.SetStateAction<Guideline[]>>;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [org, setOrg] = useState<Organization | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("member");
  const [loading, setLoading] = useState(true);
  const [noOrg, setNoOrg] = useState(false);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return;

    let { data: profile, error: profileError } = await supabase // eslint-disable-line prefer-const
      .from("profiles")
      .select("org_id, role, is_super_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile?.org_id) {
      // Trigger may have failed silently — try the fallback API
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (accessToken) {
        try {
          const res = await fetch("/api/org/ensure", {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (res.ok) {
            const result = await res.json();
            if (result.orgId) {
              // Org was created or already existed — re-fetch profile and continue
              const { data: retryProfile } = await supabase
                .from("profiles")
                .select("org_id, role, is_super_admin")
                .eq("id", user.id)
                .maybeSingle();
              if (retryProfile?.org_id) {
                // Fall through to normal data loading with the retry profile
                profile = retryProfile;
              } else {
                setNoOrg(true);
                return;
              }
            } else {
              setNoOrg(true);
              return;
            }
          } else {
            setNoOrg(true);
            return;
          }
        } catch {
          setNoOrg(true);
          return;
        }
      } else {
        setNoOrg(true);
        return;
      }
    }
    setNoOrg(false);

    // Fire-and-forget domain auto-join check
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (accessToken) {
        fetch("/api/auth/domain-join", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.joined) refresh();
          })
          .catch(() => {});
      }
    } catch {
      // Non-critical — ignore
    }

    // Super admins act as admin in any org
    setCurrentUserRole(
      profile.is_super_admin ? "admin" : (profile.role as UserRole) || "member"
    );

    // If super admin is impersonating, use that org instead
    const impersonatedOrgId = profile.is_super_admin ? getImpersonatedOrgId() : null;
    const targetOrgId = impersonatedOrgId || profile.org_id;

    // Batch 1: Fetch all org-scoped data in parallel
    const [
      orgRes,
      promptsRes,
      foldersRes,
      teamsRes,
      profilesRes,
      standardsRes,
    ] = await Promise.all([
      supabase.from("organizations").select("*").eq("id", targetOrgId).single(),
      supabase.from("prompts").select("*").eq("org_id", targetOrgId).order("updated_at", { ascending: false }),
      supabase.from("folders").select("*").eq("org_id", targetOrgId).order("name"),
      supabase.from("teams").select("*").eq("org_id", targetOrgId).order("name"),
      supabase.from("profiles").select("*").eq("org_id", targetOrgId).order("name"),
      supabase.from("standards").select("*").eq("org_id", targetOrgId).order("name"),
    ]);

    if (orgRes.error) {
      console.error("Failed to fetch organization:", orgRes.error);
      return;
    }

    setOrg(orgRes.data);
    setPrompts(promptsRes.data || []);
    setFolders(foldersRes.data || []);

    const orgTeams = teamsRes.data || [];
    setTeams(orgTeams);

    // Batch 2: Fetch junction tables scoped to org's teams
    const orgTeamIds = orgTeams.map((t: Team) => t.id);

    const [teamMembersRes] = await Promise.all([
      orgTeamIds.length > 0
        ? supabase.from("team_members").select("*").in("team_id", orgTeamIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    // Map team memberships
    const teamMemberMap = new Map<string, string[]>();
    const teamRolesMap = new Map<string, Record<string, string>>();
    (teamMembersRes.data || []).forEach((tm: { team_id: string; user_id: string; role?: string }) => {
      const existing = teamMemberMap.get(tm.user_id) || [];
      existing.push(tm.team_id);
      teamMemberMap.set(tm.user_id, existing);

      const roles = teamRolesMap.get(tm.user_id) || {};
      roles[tm.team_id] = tm.role || "member";
      teamRolesMap.set(tm.user_id, roles);
    });
    setMembers(
      (profilesRes.data || []).map((p: Member) => ({
        ...p,
        teamIds: teamMemberMap.get(p.id) || [],
        teamRoles: teamRolesMap.get(p.id) || {},
        isCurrentUser: p.id === user.id,
      }))
    );

    setGuidelines(
      (standardsRes.data || []).map((s: Guideline) => ({
        ...s,
        rules: s.rules || {},
      }))
    );
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  return (
    <OrgContext.Provider
      value={{
        org,
        prompts,
        folders,
        teams,
        members,
        guidelines,
        standards: guidelines,
        currentUserRole,
        loading,
        noOrg,
        refresh,
        setPrompts,
        setFolders,
        setTeams,
        setMembers,
        setGuidelines,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error("useOrg must be used within an OrgProvider");
  }
  return context;
}
