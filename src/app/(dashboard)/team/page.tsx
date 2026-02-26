"use client";

import { useState, useEffect, useMemo } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
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
import { ArrowLeft, ArrowUpDown, Loader2, Mail, Plus, Search, Shield, ShieldOff, UserPlus, Users, X } from "lucide-react";
import { SelectWithQuickAdd } from "@/components/ui/select-with-quick-add";
import { ExtensionStatusBadge } from "@/components/dashboard/extension-status-badge";
import { NoOrgBanner } from "@/components/dashboard/no-org-banner";
import {
  saveTeamApi,
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
import { toast } from "sonner";
import { trackInviteSent } from "@/lib/analytics";
import type { Invite, Team, UserRole } from "@/lib/types";
import { UpgradePrompt, LimitNudge } from "@/components/upgrade";

export default function TeamPage() {
  const { teams, setTeams, members, currentUserRole, loading, refresh, noOrg } = useOrg();
  const { checkLimit, planLimits } = useSubscription();

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");

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

  // Member search, filter & sort
  const [memberSearch, setMemberSearch] = useState("");
  const [memberTeamFilter, setMemberTeamFilter] = useState<string>("all");
  const [memberRoleFilter, setMemberRoleFilter] = useState<"all" | "admin" | "manager" | "member">("all");
  const [memberShieldFilter, setMemberShieldFilter] = useState<"all" | "enabled" | "disabled">("all");
  const [memberSort, setMemberSort] = useState<{ key: "name" | "email" | "role"; dir: "asc" | "desc" }>({ key: "name", dir: "asc" });

  const filteredMembers = useMemo(() => {
    let result = [...members];

    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase();
      result = result.filter(
        (m) => m.name?.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      );
    }

    if (memberTeamFilter !== "all") {
      result = result.filter((m) => m.teamIds.includes(memberTeamFilter));
    }

    if (memberRoleFilter !== "all") {
      result = result.filter((m) => m.role === memberRoleFilter);
    }

    if (memberShieldFilter !== "all") {
      result = result.filter((m) =>
        memberShieldFilter === "disabled" ? m.shield_disabled : !m.shield_disabled
      );
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
      }
      return memberSort.dir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [members, memberSearch, memberTeamFilter, memberRoleFilter, memberShieldFilter, memberSort]);

  const handleMemberSort = (key: "name" | "email" | "role") => {
    setMemberSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  };

  useEffect(() => {
    getInvites().then(setInvites).catch(() => {});
  }, []);

  const pendingInvites = invites.filter((i) => i.status === "pending");

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
    try {
      await saveTeamApi({ id: editTeam?.id, name: teamName.trim(), description: teamDesc.trim() || null });
      toast.success(editTeam ? "Team updated" : "Team created");
      setTeamModalOpen(false);
      refresh();
    } catch {
      toast.error("Failed to save team");
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
    try {
      await updateMemberRole(memberId, role);
      toast.success("Role updated");
      refresh();
    } catch {
      toast.error("Failed to update role");
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
    if (!confirm("Remove this member from the organization?")) return;
    try {
      await removeMember(memberId);
      toast.success("Member removed");
      refresh();
    } catch {
      toast.error("Failed to remove member");
    }
  }

  async function handleSendInvite() {
    if (!inviteEmail.trim()) return;
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
        refresh();
      } else {
        toast.error("Failed to add member to team");
      }
    } finally {
      setAddingMember(false);
    }
  }

  async function handleRemoveFromTeam(teamId: string, userId: string) {
    const success = await removeTeamMember(teamId, userId);
    if (success) {
      toast.success("Removed from team");
      refresh();
    } else {
      toast.error("Failed to remove from team");
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
            <Button variant="outline" onClick={() => setAddMemberToTeamOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
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
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100" onClick={() => handleRemoveFromTeam(selectedTeam.id, member.id)}>
                        <X className="h-3.5 w-3.5" />
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
            <Button variant="outline" size="sm" onClick={() => setInviteModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
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
          </div>
        </div>
        {teams.length > 0 && (
          <div className="flex gap-1.5 flex-wrap items-center">
            <Button
              variant={memberTeamFilter === "all" ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setMemberTeamFilter("all")}
            >
              All teams
            </Button>
            {teams.map((team) => (
              <Button
                key={team.id}
                variant={memberTeamFilter === team.id ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setMemberTeamFilter(memberTeamFilter === team.id ? "all" : team.id)}
                onDoubleClick={() => { if (currentUserRole === "admin") setSelectedTeam(team); }}
                title={currentUserRole === "admin" ? "Click to filter, double-click to manage" : undefined}
              >
                {team.name}
                <span className="ml-1 text-[10px] opacity-60">
                  {members.filter((m) => m.teamIds.includes(team.id)).length}
                </span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Result count */}
      <p className="text-xs text-muted-foreground mb-2">
        {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
      </p>

      {/* Members Table */}
      <Card>
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
                    <th className="text-left p-3 font-medium">
                      <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleMemberSort("name")}>
                        Name <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="text-left p-3 font-medium hidden sm:table-cell">Extension</th>
                    {currentUserRole === "admin" && (
                      <th className="text-left p-3 font-medium hidden sm:table-cell">Shield</th>
                    )}
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
                  {filteredMembers.map((member) => {
                    const initials = member.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
                    return (
                      <tr key={member.id} className="border-b hover:bg-muted/30 transition-colors group">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{member.name}</p>
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
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              title={member.shield_disabled ? "Re-enable shield" : "Disable shield"}
                              onClick={() => handleToggleShield(member.id, member.shield_disabled)}
                            >
                              {member.shield_disabled ? (
                                <ShieldOff className="h-3.5 w-3.5 text-muted-foreground" />
                              ) : (
                                <Shield className="h-3.5 w-3.5 text-green-500" />
                              )}
                            </Button>
                          </td>
                        )}
                        <td className="p-3">
                          {currentUserRole === "admin" && !member.isCurrentUser ? (
                            <Select value={member.role} onValueChange={(v) => handleChangeRole(member.id, v)}>
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
                            {!member.isCurrentUser && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100"
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-2">Pending Invites</h3>
          <div className="space-y-2">
            {pendingInvites.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{inv.email}</p>
                  <Badge variant="outline" className="text-xs mt-0.5">{inv.role}</Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive h-7" onClick={() => handleRevokeInvite(inv.id)}>
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

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
            <Button variant="outline" onClick={() => setTeamModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTeam}>{editTeam ? "Save" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" />
            </div>
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
            <div className="space-y-2">
              <Label>Add to Team (optional)</Label>
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
                noneLabel="No team"
                createLabel="team"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setInviteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSendInvite} disabled={inviting}>
              {inviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Invite
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
