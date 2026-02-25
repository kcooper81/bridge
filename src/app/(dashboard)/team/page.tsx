"use client";

import { useState, useEffect } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { useSubscription } from "@/components/providers/subscription-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Loader2, Mail, Pencil, Plus, Trash2, UserPlus, Users, X } from "lucide-react";
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

  useEffect(() => {
    getInvites().then(setInvites).catch(() => {});
  }, []);

  const pendingInvites = invites.filter((i) => i.status === "pending");

  if (loading) {
    return (
      <>
        <PageHeader title="Team" description="Manage members, teams, and invitations" />
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-20 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
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

  async function handleDeleteTeam(id: string) {
    if (!confirm("Delete this team?")) return;
    try {
      await deleteTeamApi(id);
      toast.success("Team deleted");
      if (selectedTeam?.id === id) setSelectedTeam(null);
      refresh();
    } catch {
      toast.error("Failed to delete team");
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
    setInviting(false);
  }

  async function handleRevokeInvite(id: string) {
    const success = await revokeInvite(id);
    if (success) {
      toast.success("Invite revoked");
    } else {
      toast.error("Failed to revoke invite");
    }
    const newInvites = await getInvites();
    setInvites(newInvites);
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Teams */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Teams</h2>
          {teams.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center py-8">
                <Users className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No teams yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {teams.map((team) => {
                const teamMembers = members.filter((m) => m.teamIds.includes(team.id));
                return (
                  <Card
                    key={team.id}
                    className="group cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => setSelectedTeam(team)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base">{team.name}</CardTitle>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openTeamModal(team); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteTeam(team.id); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {team.description && <p className="text-sm text-muted-foreground mb-2">{team.description}</p>}
                      <span className="text-xs text-muted-foreground">{teamMembers.length} members</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Members */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Members ({members.length})
          </h2>
          <div className="space-y-2">
            {members.map((member) => {
              const initials = member.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
              return (
                <div key={member.id} className="flex items-center gap-3 rounded-lg border border-border p-3 group">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <ExtensionStatusBadge
                    lastActive={member.last_extension_active}
                    version={member.extension_version}
                  />
                  {currentUserRole === "admin" && !member.isCurrentUser ? (
                    <div className="flex items-center gap-2">
                      <Select value={member.role} onValueChange={(v) => handleChangeRole(member.id, v)}>
                        <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100" onClick={() => handleRemoveMember(member.id)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">{member.role}</Badge>
                  )}
                </div>
              );
            })}
          </div>

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
        </div>
      </div>

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
