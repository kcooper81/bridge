"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  Organization,
  Prompt,
  Folder,
  Department,
  Team,
  Member,
  Collection,
  Guideline,
  UserRole,
} from "@/lib/types";

interface OrgContextValue {
  org: Organization | null;
  prompts: Prompt[];
  folders: Folder[];
  departments: Department[];
  teams: Team[];
  members: Member[];
  collections: Collection[];
  guidelines: Guideline[];
  /** @deprecated Use guidelines instead */
  standards: Guideline[];
  currentUserRole: UserRole;
  loading: boolean;
  refresh: () => Promise<void>;
  setPrompts: React.Dispatch<React.SetStateAction<Prompt[]>>;
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
  setGuidelines: React.Dispatch<React.SetStateAction<Guideline[]>>;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [org, setOrg] = useState<Organization | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [guidelines, setGuidelines] = useState<Guideline[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("member");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("org_id, role, is_super_admin")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.org_id) return;

    // Super admins act as admin in any org
    setCurrentUserRole(
      profile.is_super_admin ? "admin" : (profile.role as UserRole) || "member"
    );

    // Parallel fetch all org data
    const [
      orgRes,
      promptsRes,
      foldersRes,
      deptsRes,
      teamsRes,
      profilesRes,
      teamMembersRes,
      collectionsRes,
      collectionPromptsRes,
      standardsRes,
    ] = await Promise.all([
      supabase.from("organizations").select("*").eq("id", profile.org_id).single(),
      supabase.from("prompts").select("*").eq("org_id", profile.org_id).order("updated_at", { ascending: false }),
      supabase.from("folders").select("*").eq("org_id", profile.org_id).order("name"),
      supabase.from("departments").select("*").eq("org_id", profile.org_id).order("name"),
      supabase.from("teams").select("*").eq("org_id", profile.org_id).order("name"),
      supabase.from("profiles").select("*").eq("org_id", profile.org_id).order("name"),
      supabase.from("team_members").select("*"),
      supabase.from("collections").select("*").eq("org_id", profile.org_id).order("name"),
      supabase.from("collection_prompts").select("*"),
      supabase.from("standards").select("*").eq("org_id", profile.org_id).order("name"),
    ]);

    if (orgRes.error) {
      console.error("Failed to fetch organization:", orgRes.error);
      return;
    }

    setOrg(orgRes.data);
    setPrompts(promptsRes.data || []);
    setFolders(foldersRes.data || []);
    setDepartments(deptsRes.data || []);

    const orgTeams = teamsRes.data || [];
    setTeams(orgTeams);

    // Filter team_members to only include org's teams
    const orgTeamIds = new Set(orgTeams.map((t: Team) => t.id));
    const teamMemberMap = new Map<string, string[]>();
    const teamRolesMap = new Map<string, Record<string, string>>();
    (teamMembersRes.data || []).filter((tm: { team_id: string }) => orgTeamIds.has(tm.team_id)).forEach((tm: { team_id: string; user_id: string; role?: string }) => {
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

    // Filter collection_prompts to only include org's collections
    const orgCollections = collectionsRes.data || [];
    const orgCollectionIds = new Set(orgCollections.map((c: Collection) => c.id));
    const collPromptMap = new Map<string, string[]>();
    (collectionPromptsRes.data || []).filter((cp: { collection_id: string }) => orgCollectionIds.has(cp.collection_id)).forEach((cp: { collection_id: string; prompt_id: string }) => {
      const existing = collPromptMap.get(cp.collection_id) || [];
      existing.push(cp.prompt_id);
      collPromptMap.set(cp.collection_id, existing);
    });
    setCollections(
      (collectionsRes.data || []).map((c: Collection) => ({
        ...c,
        promptIds: collPromptMap.get(c.id) || [],
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
        departments,
        teams,
        members,
        collections,
        guidelines,
        standards: guidelines,
        currentUserRole,
        loading,
        refresh,
        setPrompts,
        setFolders,
        setDepartments,
        setTeams,
        setMembers,
        setCollections,
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
