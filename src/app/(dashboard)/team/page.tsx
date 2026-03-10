"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, ArrowLeft, ArrowUpDown, CheckCircle2, Clock, Crown, Eye, FileSpreadsheet, LayoutList, Loader2, Mail, Network, Pencil, Plug, Plus, RefreshCw, Search, Send, Settings, Shield, ShieldOff, Trash2, UserPlus, Users, X } from "lucide-react";
import { getExtensionStatus } from "@/lib/extension-status";
import { SelectWithQuickAdd } from "@/components/ui/select-with-quick-add";
import { ExtensionStatusBadge } from "@/components/dashboard/extension-status-badge";
import { NoOrgBanner } from "@/components/dashboard/no-org-banner";
import {
  saveTeamApi,
  deleteTeamApi,
  updateMemberRole,
  removeMember,
  sendInvite,
  getInvites,
  revokeInvite,
  addTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
  toggleMemberShield,
} from "@/lib/vault-api";
import { BulkImportModal } from "@/components/dashboard/bulk-import-modal";
import { toast } from "sonner";
import { trackInviteSent } from "@/lib/analytics";
import type { BulkImportRow, Invite, Team, UserRole } from "@/lib/types";
import { UpgradePrompt, LimitNudge } from "@/components/upgrade";
import Link from "next/link";

export default function TeamPage() {
  const { teams, setTeams, members, currentUserRole, loading, refresh, noOrg } = useOrg();
  const { checkLimit, planLimits, canAccess } = useSubscription();

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");

  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("member");
  const [inviteTeamId, setInviteTeamId] = useState<string>("");
  const [inviting, setInviting] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);

  // Team detail view
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [addMemberToTeamOpen, setAddMemberToTeamOpen] = useState(false);
  const [selectedMemberToAdd, setSelectedMemberToAdd] = useState<string>("");
  const [addingMember, setAddingMember] = useState(false);
  const [savingTeam, setSavingTeam] = useState(false);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [removingFromTeamId, setRemovingFromTeamId] = useState<string | null>(null);
  const [togglingShieldId, setTogglingShieldId] = useState<string | null>(null);

  // Delete team dialog
  const [deleteTeamTarget, setDeleteTeamTarget] = useState<Team | null>(null);
  const [deleteTeamAction, setDeleteTeamAction] = useState<"unassign" | "move">("unassign");
  const [deleteTeamMoveTo, setDeleteTeamMoveTo] = useState<string>("");
  const [deletingTeam, setDeletingTeam] = useState(false);

  // View mode toggle
  const [teamViewMode, setTeamViewMode] = useState<"table" | "chart">("table");
  const [manageTeamsOpen, setManageTeamsOpen] = useState(false);
  const [manageTeamsView, setManageTeamsView] = useState<"list" | "org">("list");

  // Bulk role assignment
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [bulkRole, setBulkRole] = useState<UserRole>("member");
  const [applyingBulkRole, setApplyingBulkRole] = useState(false);

  // Change member email
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTargetId, setEmailTargetId] = useState<string | null>(null);
  const [emailTargetName, setEmailTargetName] = useState("");
  const [emailNewValue, setEmailNewValue] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  // Transfer admin
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState<string>("");
  const [transferNewRole, setTransferNewRole] = useState<UserRole>("member");
  const [transferring, setTransferring] = useState(false);

  // Google Workspace sync
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncingGoogle, setSyncingGoogle] = useState(false);
  const [syncedRows, setSyncedRows] = useState<BulkImportRow[]>([]);
  const [syncImportOpen, setSyncImportOpen] = useState(false);

  useEffect(() => {
    if (currentUserRole !== "admin") return;
    (async () => {
      try {
        const supabase = (await import("@/lib/supabase/client")).createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch("/api/integrations/google/status", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setGoogleConnected(data.connected);
          if (data.lastSyncedAt) setLastSyncedAt(data.lastSyncedAt);
        }
      } catch { /* ignore */ }
    })();
  }, [currentUserRole]);

  async function handleGoogleSync() {
    setSyncingGoogle(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch("/api/integrations/google/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Sync failed");
        return;
      }
      setLastSyncedAt(new Date().toISOString());
      if (data.users?.length > 0) {
        setSyncedRows(data.users);
        setSyncImportOpen(true);
        toast.success(`Found ${data.users.length} new user(s)`);
      } else {
        toast.info("All directory users are already members");
      }
    } catch {
      toast.error("Sync failed");
    } finally {
      setSyncingGoogle(false);
    }
  }

  // Member search, filter & sort
  const [memberSearch, setMemberSearch] = useState("");
  const [memberTeamFilter, setMemberTeamFilter] = useState<string>("all");
  const [memberRoleFilter, setMemberRoleFilter] = useState<"all" | "admin" | "manager" | "member">("all");
  const [memberShieldFilter, setMemberShieldFilter] = useState<"all" | "enabled" | "disabled">("all");
  const [memberSort, setMemberSort] = useState<{ key: "name" | "email" | "role" | "extension" | "shield" | "status"; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });

  // Members after search/role/shield filters but BEFORE team filter (for accurate chip counts)
  const membersPreTeamFilter = useMemo(() => {
    let result = [...members];

    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase();
      result = result.filter(
        (m) => m.name?.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      );
    }

    if (memberRoleFilter !== "all") {
      result = result.filter((m) => m.role === memberRoleFilter);
    }

    if (memberShieldFilter !== "all") {
      result = result.filter((m) =>
        memberShieldFilter === "disabled" ? m.shield_disabled : !m.shield_disabled
      );
    }

    return result;
  }, [members, memberSearch, memberRoleFilter, memberShieldFilter]);

  // Members with inactive extensions (for alert banner)
  const inactiveExtensionMembers = useMemo(() => {
    if (currentUserRole !== "admin" && currentUserRole !== "manager") return [];
    return members.filter((m) => getExtensionStatus(m.last_extension_active) === "inactive");
  }, [members, currentUserRole]);

  const filteredMembers = useMemo(() => {
    let result = [...membersPreTeamFilter];

    if (memberTeamFilter !== "all") {
      result = result.filter((m) => m.teamIds.includes(memberTeamFilter));
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (memberSort.key) {
        case "name":
          cmp = (a.name || "").localeCompare(b.name || "");
          break;
        case "email":
          cmp = a.email.localeCompare(b.email);
          break;
        case "role":
          cmp = a.role.localeCompare(b.role);
          break;
        case "extension": {
          const statusOrder = { active: 0, inactive: 1, not_installed: 2 };
          cmp = statusOrder[getExtensionStatus(a.last_extension_active)] - statusOrder[getExtensionStatus(b.last_extension_active)];
          break;
        }
        case "shield":
          cmp = (a.shield_disabled ? 1 : 0) - (b.shield_disabled ? 1 : 0);
          break;
      }
      return memberSort.dir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [membersPreTeamFilter, memberTeamFilter, memberSort]);

  const handleMemberSort = (key: "name" | "email" | "role" | "extension" | "shield" | "status") => {
    setMemberSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  };

  useEffect(() => {
    getInvites().then(setInvites).catch(() => {});
  }, []);

  const pendingInvites = invites.filter((i) => i.status === "pending");

  // Filtered pending invites (match search, role, and team filters)
  const filteredInvites = useMemo(() => {
    let result = pendingInvites;

    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase();
      result = result.filter((inv) => inv.email.toLowerCase().includes(q));
    }

    if (memberRoleFilter !== "all") {
      result = result.filter((inv) => inv.role === memberRoleFilter);
    }

    if (memberTeamFilter !== "all") {
      result = result.filter((inv) => inv.team_id === memberTeamFilter);
    }

    return result;
  }, [pendingInvites, memberSearch, memberRoleFilter, memberTeamFilter]);

  // Unified sorted list: members + pending invites together (for status sort)
  type TableRow = { type: "member"; data: typeof filteredMembers[0] } | { type: "invite"; data: typeof filteredInvites[0] };
  const unifiedRows = useMemo((): TableRow[] => {
    const memberRows: TableRow[] = filteredMembers.map((m) => ({ type: "member", data: m }));
    const inviteRows: TableRow[] = filteredInvites.map((inv) => ({ type: "invite", data: inv }));
    const all = [...memberRows, ...inviteRows];

    if (memberSort.key === "status") {
      all.sort((a, b) => {
        const aStatus = a.type === "member" ? 0 : 1; // active=0, pending=1
        const bStatus = b.type === "member" ? 0 : 1;
        const cmp = aStatus - bStatus;
        return memberSort.dir === "asc" ? cmp : -cmp;
      });
    } else if (memberSort.key === "name") {
      all.sort((a, b) => {
        const aName = a.type === "member" ? (a.data as typeof filteredMembers[0]).name || "" : (a.data as typeof filteredInvites[0]).email;
        const bName = b.type === "member" ? (b.data as typeof filteredMembers[0]).name || "" : (b.data as typeof filteredInvites[0]).email;
        const cmp = aName.localeCompare(bName);
        return memberSort.dir === "asc" ? cmp : -cmp;
      });
    }
    // For other sort keys, members are already sorted and invites append at end

    return all;
  }, [filteredMembers, filteredInvites, memberSort]);

  // Check if typed email matches an existing org member
  const existingMemberMatch = useMemo(() => {
    const trimmed = inviteEmail.trim().toLowerCase();
    if (!trimmed) return null;
    return members.find((m) => m.email.toLowerCase() === trimmed) || null;
  }, [inviteEmail, members]);

  const adminMembers = useMemo(() => members.filter((m) => m.role === "admin"), [members]);
  const isLastAdmin = currentUserRole === "admin" && adminMembers.length <= 1;
  const nonAdminMembers = useMemo(() => members.filter((m) => m.role !== "admin" && !m.isCurrentUser), [members]);

  if (loading) {
    return (
      <>
        <PageHeader title="Team" description="Manage members, teams, and invitations" />
        <div className="space-y-3">
          <div className="h-10 rounded-lg bg-muted animate-pulse" />
          <div className="h-8 w-64 rounded-lg bg-muted animate-pulse" />
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </>
    );
  }

  if (noOrg) {
    return (
      <>
        <PageHeader title="Team" description="Manage members, teams, and invitations" />
        <NoOrgBanner />
      </>
    );
  }

  function openTeamModal(team: Team | null) {
    setEditTeam(team);
    setTeamName(team?.name || "");
    setTeamDesc(team?.description || "");
    setTeamModalOpen(true);
  }

  async function handleSaveTeam() {
    if (!teamName.trim()) return;
    setSavingTeam(true);
    try {
      await saveTeamApi({ id: editTeam?.id, name: teamName.trim(), description: teamDesc.trim() || null });
      toast.success(editTeam ? "Team updated" : "Team created");
      setTeamModalOpen(false);
      refresh();
    } catch {
      toast.error("Failed to save team");
    } finally {
      setSavingTeam(false);
    }
  }

  async function handleChangeRole(memberId: string, role: string) {
    if (role !== "admin") {
      const admins = members.filter((m) => m.role === "admin");
      const changingMember = members.find((m) => m.id === memberId);
      if (changingMember?.role === "admin" && admins.length <= 1) {
        toast.error("Cannot remove the last admin. Promote another member first.");
        return;
      }
    }
    setChangingRoleId(memberId);
    try {
      await updateMemberRole(memberId, role);
      toast.success("Role updated");
      setSelectedMemberIds(new Set());
      refresh();
    } catch {
      toast.error("Failed to update role");
    } finally {
      setChangingRoleId(null);
    }
  }

  async function handleBulkRoleChange() {
    if (selectedMemberIds.size === 0) return;

    // Guard last-admin: if any selected admin is being demoted, check count
    if (bulkRole !== "admin") {
      const admins = members.filter((m) => m.role === "admin");
      const selectedAdmins = admins.filter((a) => selectedMemberIds.has(a.id));
      if (selectedAdmins.length > 0 && admins.length - selectedAdmins.length < 1) {
        toast.error("Cannot demote the last admin. Promote another member first.");
        return;
      }
    }

    setApplyingBulkRole(true);
    try {
      await Promise.all(
        Array.from(selectedMemberIds).map((id) => updateMemberRole(id, bulkRole))
      );
      toast.success(`Updated ${selectedMemberIds.size} member(s) to ${bulkRole}`);
      setSelectedMemberIds(new Set());
      refresh();
    } catch {
      toast.error("Failed to update some roles");
    } finally {
      setApplyingBulkRole(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    const member = members.find((m) => m.id === memberId);
    if (member?.role === "admin") {
      const admins = members.filter((m) => m.role === "admin");
      if (admins.length <= 1) {
        toast.error("Cannot remove the last admin.");
        return;
      }
    }
    if (!confirm(`Remove ${member?.name || member?.email || "this member"} from the organization? This cannot be undone.`)) return;
    setRemovingMemberId(memberId);
    try {
      await removeMember(memberId);
      toast.success("Member removed");
      setSelectedMemberIds(new Set());
      refresh();
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setRemovingMemberId(null);
    }
  }

  async function handleTransferAdmin() {
    if (!transferTargetId) {
      toast.error("Please select a member to transfer admin to");
      return;
    }
    setTransferring(true);
    try {
      const res = await fetch("/api/org/transfer-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_user_id: transferTargetId,
          new_role: transferNewRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transfer failed");
      toast.success(`Admin transferred to ${data.new_admin?.name || data.new_admin?.email}. Your role is now ${data.your_new_role}.`);
      setTransferDialogOpen(false);
      setTransferTargetId("");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to transfer admin");
    } finally {
      setTransferring(false);
    }
  }

  async function handleSendInvite() {
    if (!inviteEmail.trim()) return;

    // If the email belongs to an existing member, add them to the selected team instead
    if (existingMemberMatch) {
      if (!inviteTeamId) {
        toast.error("Please select a team to add this member to");
        return;
      }
      if (existingMemberMatch.teamIds.includes(inviteTeamId)) {
        toast.error("This member is already on that team");
        return;
      }
      setInviting(true);
      try {
        const success = await addTeamMember(inviteTeamId, existingMemberMatch.id);
        if (success) {
          toast.success("Member added to team");
          setInviteEmail("");
          setInviteTeamId("");
          setInviteModalOpen(false);
          await refresh();
        } else {
          toast.error("Failed to add member to team");
        }
      } catch {
        toast.error("Failed to add member to team");
      } finally {
        setInviting(false);
      }
      return;
    }

    if (!checkLimit("add_member", members.length)) return;
    setInviting(true);
    try {
      const result = await sendInvite(inviteEmail.trim(), inviteRole, inviteTeamId || undefined);
      if (result.success) {
        trackInviteSent();
        toast.success("Invite sent");
        setInviteEmail("");
        setInviteTeamId("");
        const newInvites = await getInvites();
        setInvites(newInvites);
      } else {
        toast.error(result.error || "Failed to send invite");
      }
    } catch {
      toast.error("Failed to send invite");
    } finally {
      setInviting(false);
    }
  }

  async function handleRevokeInvite(id: string) {
    try {
      const success = await revokeInvite(id);
      if (success) {
        toast.success("Invite revoked");
      } else {
        toast.error("Failed to revoke invite");
      }
      const newInvites = await getInvites();
      setInvites(newInvites);
    } catch {
      toast.error("Failed to revoke invite");
    }
  }

  async function handleAddMemberToTeam() {
    if (!selectedTeam || !selectedMemberToAdd || addingMember) return;
    setAddingMember(true);
    try {
      const success = await addTeamMember(selectedTeam.id, selectedMemberToAdd);
      if (success) {
        toast.success("Member added to team");
        setAddMemberToTeamOpen(false);
        setSelectedMemberToAdd("");
        await refresh();
      } else {
        toast.error("Failed to add member to team");
      }
    } finally {
      setAddingMember(false);
    }
  }

  async function handleRemoveFromTeam(teamId: string, userId: string) {
    if (!confirm("Remove this member from the team?")) return;
    setRemovingFromTeamId(userId);
    try {
      const success = await removeTeamMember(teamId, userId);
      if (success) {
        toast.success("Removed from team");
        await refresh();
      } else {
        toast.error("Failed to remove from team");
      }
    } finally {
      setRemovingFromTeamId(null);
    }
  }

  async function handleChangeTeamRole(teamId: string, userId: string, role: string) {
    const success = await updateTeamMemberRole(teamId, userId, role);
    if (success) {
      toast.success("Team role updated");
      refresh();
    } else {
      toast.error("Failed to update team role");
    }
  }

  async function handleToggleShield(memberId: string, currentlyDisabled: boolean) {
    setTogglingShieldId(memberId);
    try {
      const success = await toggleMemberShield(memberId, !currentlyDisabled);
      if (success) {
        toast.success(currentlyDisabled ? "Shield re-enabled" : "Shield disabled for member");
        refresh();
      } else {
        toast.error("Failed to toggle shield");
      }
    } catch {
      toast.error("Failed to toggle shield");
    } finally {
      setTogglingShieldId(null);
    }
  }

  function openEmailModal(memberId: string, memberName: string, memberEmail: string) {
    setEmailTargetId(memberId);
    setEmailTargetName(memberName || memberEmail);
    setEmailNewValue(memberEmail);
    setEmailModalOpen(true);
  }

  async function handleChangeEmail() {
    if (!emailTargetId || !emailNewValue.trim()) return;
    setSavingEmail(true);
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/profile/email", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailNewValue.trim(),
          targetUserId: emailTargetId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Email updated");
        setEmailModalOpen(false);
        refresh();
      } else {
        toast.error(data.error || "Failed to update email");
      }
    } catch {
      toast.error("Failed to update email");
    } finally {
      setSavingEmail(false);
    }
  }

  function handleDeleteTeam(team: Team) {
    const teamMembers = members.filter((m) => m.teamIds.includes(team.id));
    if (teamMembers.length === 0) {
      // No members — just confirm and delete
      if (!confirm(`Delete "${team.name}"? This cannot be undone.`)) return;
      (async () => {
        const ok = await deleteTeamApi(team.id);
        if (ok) { toast.success("Team deleted"); setSelectedTeam(null); await refresh(); }
        else toast.error("Failed to delete team");
      })();
    } else {
      // Has members — show dialog with reassignment options
      setDeleteTeamTarget(team);
      setDeleteTeamAction("unassign");
      setDeleteTeamMoveTo("");
    }
  }

  async function confirmDeleteTeam() {
    if (!deleteTeamTarget) return;
    setDeletingTeam(true);
    try {
      const affectedMembers = members.filter((m) => m.teamIds.includes(deleteTeamTarget.id));

      // Move members to another team if requested
      if (deleteTeamAction === "move" && deleteTeamMoveTo) {
        for (const m of affectedMembers) {
          await addTeamMember(deleteTeamMoveTo, m.id);
        }
      }

      // Delete the team (removes all team_members rows via cascade)
      const ok = await deleteTeamApi(deleteTeamTarget.id);
      if (ok) {
        toast.success(
          deleteTeamAction === "move" && deleteTeamMoveTo
            ? `Team deleted. ${affectedMembers.length} member(s) moved.`
            : `Team deleted. ${affectedMembers.length} member(s) unassigned.`
        );
        setSelectedTeam(null);
        await refresh();
      } else {
        toast.error("Failed to delete team");
      }
    } catch {
      toast.error("Failed to delete team");
    } finally {
      setDeletingTeam(false);
      setDeleteTeamTarget(null);
    }
  }

  // Team detail view
  if (selectedTeam) {
    const teamMembers = members.filter((m) => m.teamIds.includes(selectedTeam.id));
    const nonTeamMembers = members.filter((m) => !m.teamIds.includes(selectedTeam.id));

    return (
      <>
        <PageHeader title="Team" description="Manage members, teams, and invitations" />
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => setSelectedTeam(null)} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{selectedTeam.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedTeam.description || `${teamMembers.length} members`}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openTeamModal(selectedTeam)} title="Edit team">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteTeam(selectedTeam)} title="Delete team">
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setAddMemberToTeamOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {teamMembers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-8">
                <Users className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No members in this team yet</p>
              </CardContent>
            </Card>
          ) : (
            teamMembers.map((member) => {
              const initials = member.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
              const teamRole = member.teamRoles[selectedTeam.id] || "member";
              return (
                <div key={member.id} className="flex items-center gap-3 rounded-lg border border-border p-3 group">
                  <Avatar className="h-9 w-9">
                    {member.avatar_url && <AvatarImage src={member.avatar_url} alt={member.name || "Avatar"} />}
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <Badge variant={teamRole === "admin" ? "default" : "outline"} className="text-xs capitalize">
                    {teamRole}
                  </Badge>
                  {currentUserRole === "admin" && (
                    <div className="flex items-center gap-2">
                      <Select value={teamRole} onValueChange={(v) => handleChangeTeamRole(selectedTeam.id, member.id, v)}>
                        <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100" onClick={() => handleRemoveFromTeam(selectedTeam.id, member.id)} disabled={removingFromTeamId === member.id}>
                        {removingFromTeamId === member.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Add member to team modal */}
        <Dialog open={addMemberToTeamOpen} onOpenChange={setAddMemberToTeamOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Member to {selectedTeam.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Member</Label>
                <Select value={selectedMemberToAdd} onValueChange={setSelectedMemberToAdd}>
                  <SelectTrigger><SelectValue placeholder="Choose a member..." /></SelectTrigger>
                  <SelectContent>
                    {nonTeamMembers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name} ({m.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddMemberToTeamOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMemberToTeam} disabled={!selectedMemberToAdd || addingMember}>
                {addingMember && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add to Team
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Team edit modal (needed here since this is an early return) */}
        <Dialog open={teamModalOpen} onOpenChange={setTeamModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editTeam ? "Edit Team" : "New Team"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={teamDesc} onChange={(e) => setTeamDesc(e.target.value)} />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTeamModalOpen(false)} disabled={savingTeam}>Cancel</Button>
              <Button onClick={handleSaveTeam} disabled={savingTeam || !teamName.trim()}>
                {savingTeam && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {savingTeam ? "Saving..." : editTeam ? "Save" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete team dialog (needed here since this is an early return) */}
        <Dialog open={!!deleteTeamTarget} onOpenChange={(open) => { if (!open) setDeleteTeamTarget(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete &ldquo;{deleteTeamTarget?.name}&rdquo;</DialogTitle>
            </DialogHeader>
            {deleteTeamTarget && (() => {
              const affected = members.filter((m) => m.teamIds.includes(deleteTeamTarget.id));
              const otherTeams = teams.filter((t) => t.id !== deleteTeamTarget.id);
              return (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This team has <span className="font-medium text-foreground">{affected.length} member{affected.length !== 1 ? "s" : ""}</span>. What should happen to them?
                  </p>
                  <div className="space-y-2">
                    <label className={cn("flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors", deleteTeamAction === "unassign" ? "border-primary bg-primary/5" : "hover:bg-muted/50")}>
                      <input type="radio" name="deleteAction2" checked={deleteTeamAction === "unassign"} onChange={() => setDeleteTeamAction("unassign")} className="mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Leave unassigned</p>
                        <p className="text-xs text-muted-foreground">Members will remain in the org but won&apos;t belong to any team</p>
                      </div>
                    </label>
                    {otherTeams.length > 0 && (
                      <label className={cn("flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors", deleteTeamAction === "move" ? "border-primary bg-primary/5" : "hover:bg-muted/50")}>
                        <input type="radio" name="deleteAction2" checked={deleteTeamAction === "move"} onChange={() => setDeleteTeamAction("move")} className="mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Move to another team</p>
                          {deleteTeamAction === "move" && (
                            <Select value={deleteTeamMoveTo} onValueChange={setDeleteTeamMoveTo}>
                              <SelectTrigger className="mt-2 h-8 text-xs"><SelectValue placeholder="Select team..." /></SelectTrigger>
                              <SelectContent>
                                {otherTeams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </label>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setDeleteTeamTarget(null)} disabled={deletingTeam}>Cancel</Button>
                    <Button variant="destructive" onClick={confirmDeleteTeam} disabled={deletingTeam || (deleteTeamAction === "move" && !deleteTeamMoveTo)}>
                      {deletingTeam && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Delete Team
                    </Button>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Team"
        description="Manage members, teams, and invitations"
        actions={
          <div className="flex gap-2">
            {canAccess("bulk_import") && (
              <Button variant="outline" size="sm" onClick={() => setBulkImportOpen(true)}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Import Members
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setInviteModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
            {currentUserRole === "admin" && teams.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setManageTeamsOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Manage Teams
              </Button>
            )}
            <Button size="sm" onClick={() => openTeamModal(null)}>
              <Plus className="mr-2 h-4 w-4" />
              New Team
            </Button>
          </div>
        }
      />

      {!checkLimit("add_member", members.length) && (
        <UpgradePrompt feature="add_member" current={members.length} max={planLimits.max_members} className="mb-6" />
      )}
      <LimitNudge feature="add_member" current={members.length} max={planLimits.max_members} className="mb-4" />

      {/* Status pills row */}
      {(currentUserRole === "admin" || inactiveExtensionMembers.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <TooltipProvider>
          {/* Google Workspace status */}
          {currentUserRole === "admin" && canAccess("google_workspace_sync") && googleConnected !== null && (
            googleConnected ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1.5 border-green-200 text-green-700 bg-green-50/50 hover:bg-green-100 dark:border-green-800 dark:text-green-400 dark:bg-green-950/20"
                    onClick={handleGoogleSync}
                    disabled={syncingGoogle}
                  >
                    {syncingGoogle ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                    Google Workspace
                    {lastSyncedAt && <span className="text-green-600/60 dark:text-green-400/60">· synced {new Date(lastSyncedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Click to sync your Google Workspace directory. Imports new users and maps groups to teams.</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" asChild>
                    <Link href="/settings/integrations">
                      <Plug className="h-3 w-3" />
                      Connect Google Workspace
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Connect to import users from your company directory automatically.</p>
                </TooltipContent>
              </Tooltip>
            )
          )}
          {currentUserRole === "admin" && !canAccess("google_workspace_sync") && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5 text-muted-foreground" asChild>
                  <Link href="/settings/billing">
                    <Plug className="h-3 w-3" />
                    Google Workspace
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-0.5">Business</Badge>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Upgrade to Business to sync your Google Workspace directory.</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Inactive extensions */}
          {inactiveExtensionMembers.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/20 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 cursor-default">
                  <AlertTriangle className="h-3 w-3" />
                  {inactiveExtensionMembers.length} inactive extension{inactiveExtensionMembers.length > 1 ? "s" : ""}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs font-medium mb-1">No extension activity in 24+ hours:</p>
                <p className="text-xs text-muted-foreground">
                  {inactiveExtensionMembers.map((m) => m.name || m.email.split("@")[0]).join(", ")}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
          </TooltipProvider>
        </div>
      )}

      {/* Search & Filters */}
      <div className="space-y-2 mb-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={memberRoleFilter} onValueChange={(v) => setMemberRoleFilter(v as typeof memberRoleFilter)}>
              <SelectTrigger className="w-[130px] h-10">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
            {currentUserRole === "admin" && (
              <Select value={memberShieldFilter} onValueChange={(v) => setMemberShieldFilter(v as typeof memberShieldFilter)}>
                <SelectTrigger className="w-[140px] h-10">
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{memberShieldFilter === "all" ? "All shields" : memberShieldFilter === "enabled" ? "Enabled" : "Disabled"}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All shields</SelectItem>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            )}
            <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
              <Button
                variant={teamViewMode === "table" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setTeamViewMode("table")}
                title="Table view"
              >
                <LayoutList className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={teamViewMode === "chart" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setTeamViewMode("chart")}
                title="Org chart view"
              >
                <Network className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
        {teams.length > 0 && (
          <div className="flex gap-1.5 flex-wrap items-center">
            <Button
              variant={memberTeamFilter === "all" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs hover:scale-100 active:scale-100"
              onClick={() => setMemberTeamFilter("all")}
            >
              All teams
            </Button>
            {teams.map((team) => (
              <Button
                key={team.id}
                variant={memberTeamFilter === team.id ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs !transition-colors !duration-150 hover:scale-100 active:scale-100"
                onClick={() => setMemberTeamFilter(memberTeamFilter === team.id ? "all" : team.id)}
              >
                {team.name}
                <span className="ml-1 text-[10px] opacity-60">
                  {membersPreTeamFilter.filter((m) => m.teamIds.includes(team.id)).length}
                </span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Bulk action bar */}
      {currentUserRole === "admin" && selectedMemberIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2 mb-2">
          <span className="text-sm font-medium">{selectedMemberIds.size} selected</span>
          <div className="h-4 w-px bg-border" />
          {canAccess("bulk_role_assignment") && (
            <>
              <Select value={bulkRole} onValueChange={(v) => setBulkRole(v as UserRole)}>
                <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" className="h-7 text-xs" onClick={handleBulkRoleChange} disabled={applyingBulkRole}>
                {applyingBulkRole && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                Set Role
              </Button>
              <div className="h-4 w-px bg-border" />
            </>
          )}
          <SelectWithQuickAdd
            value=""
            onValueChange={async (teamId: string) => {
              const selected = members.filter((m) => selectedMemberIds.has(m.id));
              let moved = 0;
              for (const m of selected) {
                if (!m.teamIds.includes(teamId)) {
                  await addTeamMember(teamId, m.id);
                  moved++;
                }
              }
              if (moved > 0) { toast.success(`${moved} member(s) moved to team`); await refresh(); }
              setSelectedMemberIds(new Set());
            }}
            items={teams.map((t) => ({ id: t.id, name: t.name }))}
            onQuickCreate={async (name: string) => {
              const newTeam = await saveTeamApi({ name, description: null });
              if (newTeam) { await refresh(); return newTeam; }
              return null;
            }}
            placeholder="Move to team..."
            createLabel="Create team"
            triggerClassName="h-7 w-36 text-xs"
          />
          <div className="h-4 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive"
            onClick={async () => {
              const selected = members.filter((m) => selectedMemberIds.has(m.id) && !m.isCurrentUser && m.role !== "admin");
              if (selected.length === 0) { toast.error("No removable members selected (admins excluded)"); return; }
              if (!confirm(`Remove ${selected.length} member(s) from the organization? This cannot be undone.`)) return;
              for (const m of selected) { await removeMember(m.id); }
              toast.success(`${selected.length} member(s) removed`);
              setSelectedMemberIds(new Set());
              await refresh();
            }}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Remove
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedMemberIds(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Org Chart View — Tree layout */}
      {teamViewMode === "chart" && (
        <div className="overflow-x-auto pb-4">
          {(() => {
            const unassigned = filteredMembers.filter((m) => m.teamIds.length === 0);
            const assigned = teams.map((team) => ({
              team,
              members: filteredMembers.filter((m) => m.teamIds.includes(team.id)),
            }));
            const totalNodes = assigned.length + (unassigned.length > 0 ? 1 : 0);

            return (
              <div className="flex flex-col items-center min-w-fit">
                {/* ─── Root: Organization node ─── */}
                <div
                  className="rounded-xl border-2 border-primary/30 bg-gradient-to-b from-primary/10 to-primary/5 px-8 py-4 shadow-sm cursor-default select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">Organization</p>
                      <p className="text-xs text-muted-foreground">{members.length} members &middot; {teams.length} teams</p>
                    </div>
                  </div>
                </div>

                {/* ─── Vertical line from root ─── */}
                {totalNodes > 0 && <div className="w-px h-8 bg-border" />}

                {/* ─── Horizontal branch bar ─── */}
                {totalNodes > 1 && (
                  <div className="relative w-full flex justify-center">
                    <div
                      className="h-px bg-border absolute top-0"
                      style={{
                        left: `calc(${100 / totalNodes / 2}% + 0px)`,
                        right: `calc(${100 / totalNodes / 2}% + 0px)`,
                      }}
                    />
                  </div>
                )}

                {/* ─── Team nodes ─── */}
                <div
                  className="grid gap-6 w-full"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(totalNodes, 4)}, minmax(220px, 1fr))`,
                  }}
                >
                  {assigned.map(({ team, members: teamMembers }) => {
                    const leads = teamMembers.filter((m) => m.role === "admin" || m.teamRoles[team.id] === "admin");
                    const rest = teamMembers.filter((m) => m.role !== "admin" && m.teamRoles[team.id] !== "admin");
                    return (
                      <div key={team.id} className="flex flex-col items-center">
                        {/* Vertical connector to branch */}
                        {totalNodes > 1 && <div className="w-px h-6 bg-border" />}

                        {/* Team card */}
                        <div className="w-full rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 group">
                          {/* Team header */}
                          <div
                            className="flex items-center justify-between border-b border-border/50 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-xl"
                            onClick={() => setSelectedTeam(team)}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <Network className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-sm truncate">{team.name}</h3>
                                  {team.description && (
                                    <p className="text-[10px] text-muted-foreground truncate">{team.description}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-[10px] shrink-0 ml-2">
                              {teamMembers.length}
                            </Badge>
                          </div>

                          {/* Members list */}
                          <div className="p-2 space-y-0.5 max-h-[300px] overflow-y-auto">
                            {teamMembers.length === 0 ? (
                              <p className="text-xs text-muted-foreground text-center py-6">No members</p>
                            ) : (
                              <>
                                {leads.map((m) => {
                                  const initials = m.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
                                  const extStatus = getExtensionStatus(m.last_extension_active);
                                  return (
                                    <div key={m.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors">
                                      <div className="relative shrink-0">
                                        <Avatar className="h-7 w-7">
                                          {m.avatar_url && <AvatarImage src={m.avatar_url} />}
                                          <AvatarFallback className="bg-primary/20 text-primary text-[9px]">{initials}</AvatarFallback>
                                        </Avatar>
                                        <Crown className="absolute -top-1 -right-1 h-3 w-3 text-amber-500" />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium truncate">{m.name || m.email}</p>
                                        <div className="flex items-center gap-1">
                                          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", extStatus === "active" ? "bg-green-500" : extStatus === "inactive" ? "bg-yellow-500" : "bg-gray-400")} />
                                          {!m.shield_disabled ? <Shield className="h-2.5 w-2.5 text-green-500 shrink-0" /> : <ShieldOff className="h-2.5 w-2.5 text-muted-foreground/40 shrink-0" />}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                                {rest.map((m) => {
                                  const initials = m.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
                                  const extStatus = getExtensionStatus(m.last_extension_active);
                                  return (
                                    <div key={m.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors">
                                      <Avatar className="h-7 w-7 shrink-0">
                                        {m.avatar_url && <AvatarImage src={m.avatar_url} />}
                                        <AvatarFallback className="bg-muted text-muted-foreground text-[9px]">{initials}</AvatarFallback>
                                      </Avatar>
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium truncate">{m.name || m.email}</p>
                                        <div className="flex items-center gap-1">
                                          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", extStatus === "active" ? "bg-green-500" : extStatus === "inactive" ? "bg-yellow-500" : "bg-gray-400")} />
                                          {!m.shield_disabled ? <Shield className="h-2.5 w-2.5 text-green-500 shrink-0" /> : <ShieldOff className="h-2.5 w-2.5 text-muted-foreground/40 shrink-0" />}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                                {filteredInvites.filter((inv) => inv.team_id === team.id).map((inv) => (
                                  <div key={`inv-${inv.id}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 opacity-50">
                                    <Avatar className="h-7 w-7 shrink-0">
                                      <AvatarFallback className="bg-muted text-muted-foreground text-[9px]">
                                        <Mail className="h-3 w-3" />
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[10px] text-muted-foreground truncate">{inv.email}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[8px] px-1 py-0 border-amber-300 text-amber-600">
                                      Pending
                                    </Badge>
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Unassigned node */}
                  {unassigned.length > 0 && (
                    <div className="flex flex-col items-center">
                      {totalNodes > 1 && <div className="w-px h-6 bg-border" />}
                      <div className="w-full rounded-xl border border-dashed border-border bg-muted/20">
                        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm text-muted-foreground">Unassigned</h3>
                              <p className="text-[10px] text-muted-foreground/70">Not on any team</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px]">{unassigned.length}</Badge>
                        </div>
                        <div className="p-2 space-y-0.5 max-h-[300px] overflow-y-auto">
                          {unassigned.map((m) => {
                            const initials = m.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
                            const extStatus = getExtensionStatus(m.last_extension_active);
                            return (
                              <div key={m.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors">
                                <Avatar className="h-7 w-7 shrink-0">
                                  {m.avatar_url && <AvatarImage src={m.avatar_url} />}
                                  <AvatarFallback className="bg-muted text-muted-foreground text-[9px]">{initials}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium truncate">{m.name || m.email}</p>
                                  <div className="flex items-center gap-1">
                                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", extStatus === "active" ? "bg-green-500" : extStatus === "inactive" ? "bg-yellow-500" : "bg-gray-400")} />
                                    {!m.shield_disabled ? <Shield className="h-2.5 w-2.5 text-green-500 shrink-0" /> : <ShieldOff className="h-2.5 w-2.5 text-muted-foreground/40 shrink-0" />}
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 capitalize shrink-0">{m.role}</Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Result count */}
      {teamViewMode === "table" && (
        <p className="text-xs text-muted-foreground mb-2">
          {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
          {filteredInvites.length > 0 && ` · ${filteredInvites.length} pending`}
        </p>
      )}

      {/* Members Table */}
      {teamViewMode === "table" && <Card>
        <CardContent className="p-0">
          {filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No members found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {currentUserRole === "admin" && canAccess("bulk_role_assignment") && (
                      <th className="p-3 w-10">
                        <Checkbox
                          checked={
                            filteredMembers.filter((m) => !m.isCurrentUser).length > 0 &&
                            filteredMembers.filter((m) => !m.isCurrentUser).every((m) => selectedMemberIds.has(m.id))
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedMemberIds(new Set(filteredMembers.filter((m) => !m.isCurrentUser).map((m) => m.id)));
                            } else {
                              setSelectedMemberIds(new Set());
                            }
                          }}
                        />
                      </th>
                    )}
                    <th className="text-left p-3 font-medium">
                      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleMemberSort("name")}>
                        Name <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left p-3 font-medium hidden sm:table-cell">
                      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleMemberSort("extension")}>
                        Extension <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    {currentUserRole === "admin" && (
                      <th className="text-left p-3 font-medium hidden sm:table-cell">
                        <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleMemberSort("shield")}>
                          Shield <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                    )}
                    <th className="text-left p-3 font-medium hidden sm:table-cell">
                      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleMemberSort("status")}>
                        Status <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left p-3 font-medium">
                      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleMemberSort("role")}>
                        Role <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    {currentUserRole === "admin" && (
                      <th className="text-left p-3 font-medium w-10">
                        <span className="sr-only">Actions</span>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {unifiedRows.map((row) => {
                    if (row.type === "member") {
                      const member = row.data as typeof filteredMembers[0];
                    const initials = member.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
                    return (
                      <tr key={member.id} className={cn("border-b hover:bg-muted/30 transition-colors group", selectedMemberIds.has(member.id) && "bg-primary/5")}>
                        {currentUserRole === "admin" && canAccess("bulk_role_assignment") && (
                          <td className="p-3 w-10">
                            {!member.isCurrentUser ? (
                              <Checkbox
                                checked={selectedMemberIds.has(member.id)}
                                onCheckedChange={(checked) => {
                                  setSelectedMemberIds((prev) => {
                                    const next = new Set(prev);
                                    if (checked) next.add(member.id);
                                    else next.delete(member.id);
                                    return next;
                                  });
                                }}
                              />
                            ) : null}
                          </td>
                        )}
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              {member.avatar_url && <AvatarImage src={member.avatar_url} alt={member.name || "Avatar"} />}
                              <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium truncate">{member.name}</p>
                                {member.invite_source === "google" && (
                                  <span className="shrink-0" title="Synced from Google Workspace">
                                    <RefreshCw className="h-3 w-3 text-muted-foreground/60" />
                                  </span>
                                )}
                                {member.invite_source === "bulk" && (
                                  <span className="shrink-0" title="Bulk imported">
                                    <FileSpreadsheet className="h-3 w-3 text-muted-foreground/60" />
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 hidden sm:table-cell">
                          <ExtensionStatusBadge
                            lastActive={member.last_extension_active}
                            version={member.extension_version}
                          />
                        </td>
                        {currentUserRole === "admin" && (
                          <td className="p-3 hidden sm:table-cell">
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                "h-7 text-xs gap-1.5",
                                member.shield_disabled
                                  ? "text-muted-foreground"
                                  : "text-green-600 border-green-200 bg-green-50 hover:bg-green-100 dark:text-green-400 dark:border-green-800 dark:bg-green-950/30 dark:hover:bg-green-950/50"
                              )}
                              onClick={() => handleToggleShield(member.id, member.shield_disabled)}
                              disabled={togglingShieldId === member.id}
                            >
                              {togglingShieldId === member.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : member.shield_disabled ? (
                                <>
                                  <ShieldOff className="h-3.5 w-3.5" />
                                  Off
                                </>
                              ) : (
                                <>
                                  <Shield className="h-3.5 w-3.5" />
                                  On
                                </>
                              )}
                            </Button>
                          </td>
                        )}
                        <td className="p-3 hidden sm:table-cell">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-green-300 text-green-600 dark:border-green-700 dark:text-green-400">
                            <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" />
                            Active
                          </Badge>
                        </td>
                        <td className="p-3">
                          {currentUserRole === "admin" && !member.isCurrentUser ? (
                            <Select value={member.role} onValueChange={(v) => handleChangeRole(member.id, v)} disabled={changingRoleId === member.id}>
                              <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline" className="text-xs capitalize">{member.role}</Badge>
                          )}
                        </td>
                        {currentUserRole === "admin" && (
                          <td className="p-3">
                            {member.isCurrentUser ? (
                              isLastAdmin && members.length > 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs gap-1 opacity-0 group-hover:opacity-100"
                                  onClick={() => {
                                    setTransferTargetId("");
                                    setTransferNewRole("member");
                                    setTransferDialogOpen(true);
                                  }}
                                >
                                  <Crown className="h-3 w-3" />
                                  Transfer
                                </Button>
                              )
                            ) : (
                              <div className="flex items-center gap-0.5">
                                {member.role !== "admin" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                    title="Change email"
                                    onClick={() => openEmailModal(member.id, member.name, member.email)}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100"
                                  onClick={() => handleRemoveMember(member.id)}
                                  disabled={removingMemberId === member.id}
                                >
                                  {removingMemberId === member.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                </Button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                    } else {
                      const inv = row.data as typeof filteredInvites[0];
                      const invTeam = inv.team_id ? teams.find((t) => t.id === inv.team_id) : null;
                      return (
                        <tr key={`inv-${inv.id}`} className="border-b bg-muted/10 group">
                          {currentUserRole === "admin" && canAccess("bulk_role_assignment") && (
                            <td className="p-3 w-10" />
                          )}
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 opacity-50">
                                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                                  <Mail className="h-3.5 w-3.5" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm text-muted-foreground truncate">{inv.email}</p>
                                {invTeam && (
                                  <p className="text-[11px] text-muted-foreground/70">{invTeam.name}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 hidden sm:table-cell">
                            <span className="text-xs text-muted-foreground">—</span>
                          </td>
                          {currentUserRole === "admin" && (
                            <td className="p-3 hidden sm:table-cell">
                              <span className="text-xs text-muted-foreground">—</span>
                            </td>
                          )}
                          <td className="p-3 hidden sm:table-cell">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400">
                              <Clock className="mr-0.5 h-2.5 w-2.5" />
                              Pending
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs capitalize">{inv.role}</Badge>
                          </td>
                          {currentUserRole === "admin" && (
                            <td className="p-3">
                              <div className="flex items-center gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                  title="Resend invite"
                                  onClick={() => {
                                    handleRevokeInvite(inv.id).then(() => {
                                      setInviteEmail(inv.email);
                                      setInviteRole(inv.role);
                                      setInviteTeamId(inv.team_id || "");
                                      setInviteModalOpen(true);
                                    });
                                  }}
                                >
                                  <Send className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100"
                                  title="Revoke invite"
                                  onClick={() => handleRevokeInvite(inv.id)}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>}

      {/* Manage Teams Modal */}
      <Dialog open={manageTeamsOpen} onOpenChange={setManageTeamsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Manage Teams
            </DialogTitle>
            <DialogDescription>
              {teams.length} team{teams.length !== 1 ? "s" : ""} &middot; {members.length} members
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
              <Button
                variant={manageTeamsView === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs px-3 gap-1.5"
                onClick={() => setManageTeamsView("list")}
              >
                <LayoutList className="h-3.5 w-3.5" />
                List
              </Button>
              <Button
                variant={manageTeamsView === "org" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs px-3 gap-1.5"
                onClick={() => setManageTeamsView("org")}
              >
                <Network className="h-3.5 w-3.5" />
                Org Chart
              </Button>
            </div>
            <Button size="sm" onClick={() => { setManageTeamsOpen(false); openTeamModal(null); }}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Team
            </Button>
          </div>

          {teams.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No teams yet. Create your first team below.</p>
          ) : manageTeamsView === "list" ? (
            <div className="space-y-2 mt-2">
              {teams.map((team) => {
                const teamMemberCount = members.filter((m) => m.teamIds.includes(team.id)).length;
                const teamLeads = members.filter((m) => m.teamIds.includes(team.id) && (m.role === "admin" || m.teamRoles[team.id] === "admin"));
                return (
                  <div key={team.id} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 group hover:bg-muted/30 transition-colors">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Network className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{team.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {team.description || (teamLeads.length > 0
                          ? `Led by ${teamLeads.map((l) => l.name || l.email.split("@")[0]).join(", ")}`
                          : `${teamMemberCount} member${teamMemberCount !== 1 ? "s" : ""}`)}
                      </p>
                    </div>
                    <div className="flex -space-x-1.5 shrink-0">
                      {members.filter((m) => m.teamIds.includes(team.id)).slice(0, 4).map((m) => {
                        const initials = m.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
                        return (
                          <Avatar key={m.id} className="h-6 w-6 border-2 border-card">
                            {m.avatar_url && <AvatarImage src={m.avatar_url} />}
                            <AvatarFallback className="bg-muted text-[8px]">{initials}</AvatarFallback>
                          </Avatar>
                        );
                      })}
                      {teamMemberCount > 4 && (
                        <div className="h-6 w-6 rounded-full border-2 border-card bg-muted flex items-center justify-center">
                          <span className="text-[8px] text-muted-foreground">+{teamMemberCount - 4}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {teamMemberCount}
                    </Badge>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => { setManageTeamsOpen(false); setSelectedTeam(team); }}
                        title="View team"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => { setManageTeamsOpen(false); openTeamModal(team); }}
                        title="Edit team"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => { setManageTeamsOpen(false); handleDeleteTeam(team); }}
                        title="Delete team"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {/* Unassigned members summary */}
              {(() => {
                const unassigned = members.filter((m) => m.teamIds.length === 0);
                return unassigned.length > 0 ? (
                  <div className="flex items-center gap-3 rounded-lg border border-dashed border-border px-4 py-3 bg-muted/20">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground">Unassigned</p>
                      <p className="text-xs text-muted-foreground/70">Not on any team</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{unassigned.length}</Badge>
                  </div>
                ) : null;
              })()}
            </div>
          ) : (
            /* Org tree view inside modal */
            <div className="mt-2 flex flex-col items-center">
              {/* Root */}
              <div className="rounded-xl border-2 border-primary/30 bg-primary/5 px-6 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-bold text-primary">Organization</p>
                    <p className="text-[10px] text-muted-foreground">{members.length} members &middot; {teams.length} teams</p>
                  </div>
                </div>
              </div>
              <div className="w-px h-5 bg-border" />
              {/* Branches */}
              <div className="grid gap-3 w-full" style={{ gridTemplateColumns: `repeat(${Math.min(teams.length + (members.some((m) => m.teamIds.length === 0) ? 1 : 0), 3)}, 1fr)` }}>
                {teams.map((team) => {
                  const teamMembers = members.filter((m) => m.teamIds.includes(team.id));
                  return (
                    <div key={team.id} className="flex flex-col items-center">
                      <div className="w-px h-4 bg-border" />
                      <div className="w-full rounded-lg border border-border bg-card p-3 hover:border-primary/20 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Network className="h-3 w-3 text-primary shrink-0" />
                            <p className="text-xs font-semibold truncate">{team.name}</p>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => { setManageTeamsOpen(false); openTeamModal(team); }}>
                              <Pencil className="h-2.5 w-2.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => { setManageTeamsOpen(false); handleDeleteTeam(team); }}>
                              <Trash2 className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-0.5 max-h-[180px] overflow-y-auto">
                          {teamMembers.length === 0 ? (
                            <p className="text-[10px] text-muted-foreground text-center py-3">No members</p>
                          ) : teamMembers.map((m) => {
                            const initials = m.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
                            const isLead = m.role === "admin" || m.teamRoles[team.id] === "admin";
                            return (
                              <div key={m.id} className="flex items-center gap-1.5 rounded px-1.5 py-1 hover:bg-muted/50">
                                <div className="relative shrink-0">
                                  <Avatar className="h-5 w-5">
                                    {m.avatar_url && <AvatarImage src={m.avatar_url} />}
                                    <AvatarFallback className="bg-muted text-[7px]">{initials}</AvatarFallback>
                                  </Avatar>
                                  {isLead && <Crown className="absolute -top-0.5 -right-0.5 h-2 w-2 text-amber-500" />}
                                </div>
                                <p className="text-[10px] truncate">{m.name || m.email.split("@")[0]}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* Unassigned */}
                {members.some((m) => m.teamIds.length === 0) && (
                  <div className="flex flex-col items-center">
                    <div className="w-px h-4 bg-border" />
                    <div className="w-full rounded-lg border border-dashed border-border bg-muted/20 p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Unassigned</p>
                      <div className="space-y-0.5 max-h-[180px] overflow-y-auto">
                        {members.filter((m) => m.teamIds.length === 0).map((m) => {
                          const initials = m.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
                          return (
                            <div key={m.id} className="flex items-center gap-1.5 rounded px-1.5 py-1 hover:bg-muted/50">
                              <Avatar className="h-5 w-5 shrink-0">
                                {m.avatar_url && <AvatarImage src={m.avatar_url} />}
                                <AvatarFallback className="bg-muted text-[7px]">{initials}</AvatarFallback>
                              </Avatar>
                              <p className="text-[10px] truncate">{m.name || m.email.split("@")[0]}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Team Modal */}
      <Dialog open={teamModalOpen} onOpenChange={setTeamModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editTeam ? "Edit Team" : "New Team"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={teamDesc} onChange={(e) => setTeamDesc(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setTeamModalOpen(false)} disabled={savingTeam}>Cancel</Button>
            <Button onClick={handleSaveTeam} disabled={savingTeam || !teamName.trim()}>
              {savingTeam && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {savingTeam ? "Saving..." : editTeam ? "Save" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Team Dialog */}
      <Dialog open={!!deleteTeamTarget} onOpenChange={(open) => { if (!open) setDeleteTeamTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{deleteTeamTarget?.name}&rdquo;</DialogTitle>
          </DialogHeader>
          {deleteTeamTarget && (() => {
            const affected = members.filter((m) => m.teamIds.includes(deleteTeamTarget.id));
            const otherTeams = teams.filter((t) => t.id !== deleteTeamTarget.id);
            return (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This team has <span className="font-medium text-foreground">{affected.length} member{affected.length !== 1 ? "s" : ""}</span>. What should happen to them?
                </p>
                <div className="space-y-2">
                  <label className={cn("flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors", deleteTeamAction === "unassign" ? "border-primary bg-primary/5" : "hover:bg-muted/50")}>
                    <input type="radio" name="deleteAction" checked={deleteTeamAction === "unassign"} onChange={() => setDeleteTeamAction("unassign")} className="mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Leave unassigned</p>
                      <p className="text-xs text-muted-foreground">Members will remain in the org but won&apos;t belong to any team</p>
                    </div>
                  </label>
                  {otherTeams.length > 0 && (
                    <label className={cn("flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors", deleteTeamAction === "move" ? "border-primary bg-primary/5" : "hover:bg-muted/50")}>
                      <input type="radio" name="deleteAction" checked={deleteTeamAction === "move"} onChange={() => setDeleteTeamAction("move")} className="mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="text-sm font-medium">Move to another team</p>
                          <p className="text-xs text-muted-foreground">All members will be added to the selected team</p>
                        </div>
                        {deleteTeamAction === "move" && (
                          <Select value={deleteTeamMoveTo} onValueChange={setDeleteTeamMoveTo}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select team..." /></SelectTrigger>
                            <SelectContent>
                              {otherTeams.map((t) => (
                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </label>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDeleteTeamTarget(null)} disabled={deletingTeam}>Cancel</Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDeleteTeam}
                    disabled={deletingTeam || (deleteTeamAction === "move" && !deleteTeamMoveTo)}
                  >
                    {deletingTeam && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Delete Team
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Invite Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{existingMemberMatch ? "Add to Team" : "Invite Member"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" />
            </div>

            {/* Existing member detected banner */}
            {existingMemberMatch && (
              <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={existingMemberMatch.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {(existingMemberMatch.name || existingMemberMatch.email).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{existingMemberMatch.name || existingMemberMatch.email}</p>
                  <p className="text-xs text-muted-foreground">Already a member &middot; {existingMemberMatch.role}</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              </div>
            )}

            {/* Only show role picker for new invites */}
            {!existingMemberMatch && (
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>{existingMemberMatch ? "Add to Team" : "Add to Team (optional)"}</Label>
              <SelectWithQuickAdd
                value={inviteTeamId}
                onValueChange={setInviteTeamId}
                items={teams.map((t) => ({ id: t.id, name: t.name }))}
                onQuickCreate={async (name) => {
                  const team = await saveTeamApi({ name });
                  if (team) {
                    setTeams((prev) => [team, ...prev]);
                    return { id: team.id, name: team.name };
                  }
                  return null;
                }}
                noneLabel={existingMemberMatch ? "Select a team" : "No team"}
                createLabel="team"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setInviteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSendInvite} disabled={inviting || (!!existingMemberMatch && !inviteTeamId)}>
              {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {existingMemberMatch ? "Add to Team" : "Send Invite"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Email for {emailTargetName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Email Address</Label>
              <Input
                type="email"
                value={emailNewValue}
                onChange={(e) => setEmailNewValue(e.target.value)}
                placeholder="new@company.com"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEmailModalOpen(false)} disabled={savingEmail}>Cancel</Button>
            <Button onClick={handleChangeEmail} disabled={savingEmail || !emailNewValue.trim()}>
              {savingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Modal */}
      <BulkImportModal
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        teams={teams}
        members={members}
        pendingInvites={invites}
        onComplete={() => {
          refresh();
          getInvites().then(setInvites).catch(() => {});
        }}
      />

      {/* Google Sync Import Modal */}
      <BulkImportModal
        open={syncImportOpen}
        onOpenChange={setSyncImportOpen}
        teams={teams}
        members={members}
        pendingInvites={invites}
        initialRows={syncedRows}
        onComplete={() => {
          refresh();
          setSyncedRows([]);
          getInvites().then(setInvites).catch(() => {});
        }}
      />

      {/* Transfer Admin Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Transfer Admin Role
            </DialogTitle>
            <DialogDescription>
              Choose a member to become the new admin. You will be demoted to the role you select below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Admin</Label>
              <Select value={transferTargetId} onValueChange={setTransferTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a member..." />
                </SelectTrigger>
                <SelectContent>
                  {nonAdminMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex items-center gap-2">
                        <span>{m.name || m.email}</span>
                        <span className="text-muted-foreground text-xs capitalize">({m.role})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Your New Role</Label>
              <Select value={transferNewRole} onValueChange={(v) => setTransferNewRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-sm">
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-amber-800 dark:text-amber-300">
                  <p className="font-medium">This action cannot be easily undone.</p>
                  <p className="text-xs mt-1">Once transferred, only the new admin can change roles. Make sure you trust the person you&apos;re transferring to.</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)} disabled={transferring}>
              Cancel
            </Button>
            <Button
              onClick={handleTransferAdmin}
              disabled={transferring || !transferTargetId}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {transferring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Transfer Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
