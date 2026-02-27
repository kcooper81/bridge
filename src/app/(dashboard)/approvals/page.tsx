"use client";

import { useState, useEffect, useCallback } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  FileText,
  Lightbulb,
  Loader2,
  Eye,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getPendingPrompts, approvePrompt, rejectPrompt } from "@/lib/vault-api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { NoOrgBanner } from "@/components/dashboard/no-org-banner";
import type { Prompt } from "@/lib/types";

interface RuleSuggestion {
  id: string;
  name: string;
  description: string | null;
  category: string;
  severity: string;
  status: string;
  suggested_by: string;
  created_at: string;
  suggestor?: { name?: string; email?: string };
}

export default function ApprovalsPage() {
  const { org, currentUserRole, noOrg } = useOrg();
  const canEdit = currentUserRole === "admin" || currentUserRole === "manager";
  const [loading, setLoading] = useState(true);
  const [pendingPrompts, setPendingPrompts] = useState<
    (Prompt & { submitter_name?: string; submitter_email?: string })[]
  >([]);
  const [suggestions, setSuggestions] = useState<RuleSuggestion[]>([]);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [previewPrompt, setPreviewPrompt] = useState<Prompt | null>(null);

  const fetchData = useCallback(async () => {
    if (!org) return;
    try {
      const [prompts, suggestionsRes] = await Promise.all([
        getPendingPrompts(),
        createClient()
          .from("rule_suggestions")
          .select("*, suggestor:profiles!rule_suggestions_suggested_by_fkey(name, email)")
          .eq("org_id", org.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false }),
      ]);
      setPendingPrompts(prompts);
      setSuggestions((suggestionsRes.data as unknown as RuleSuggestion[]) || []);
    } catch (err) {
      console.error("Failed to load approvals:", err);
    } finally {
      setLoading(false);
    }
  }, [org]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleApprovePrompt(id: string) {
    setActionId(id);
    try {
      const ok = await approvePrompt(id);
      if (ok) {
        toast.success("Prompt approved");
        fetchData();
      } else {
        toast.error("Failed to approve prompt");
      }
    } finally {
      setActionId(null);
    }
  }

  function openRejectModal(id: string) {
    setRejectTargetId(id);
    setRejectReason("");
    setRejectModalOpen(true);
  }

  async function handleReject() {
    if (!rejectTargetId) return;
    setActionId(rejectTargetId);
    setRejectModalOpen(false);
    try {
      const ok = await rejectPrompt(rejectTargetId, rejectReason || undefined);
      if (ok) {
        toast.success("Prompt returned to draft");
        fetchData();
      } else {
        toast.error("Failed to reject prompt");
      }
    } finally {
      setActionId(null);
      setRejectTargetId(null);
    }
  }

  async function handleApproveSuggestion(suggestion: RuleSuggestion) {
    if (!org) return;
    setActionId(suggestion.id);
    try {
      const db = createClient();
      const { data: { user } } = await db.auth.getUser();

      // Create the security rule from the suggestion
      const { error: ruleError } = await db.from("security_rules").insert({
        org_id: org.id,
        name: suggestion.name,
        description: suggestion.description,
        pattern: suggestion.name, // Use name as keyword pattern
        pattern_type: "keywords",
        category: suggestion.category,
        severity: suggestion.severity,
        is_active: true,
        is_built_in: false,
        created_by: user?.id,
      });

      if (ruleError) {
        toast.error("Failed to create rule");
        return;
      }

      // Update suggestion status
      await db
        .from("rule_suggestions")
        .update({ status: "approved", reviewed_by: user?.id })
        .eq("id", suggestion.id);

      toast.success("Rule suggestion approved and created");
      fetchData();
    } finally {
      setActionId(null);
    }
  }

  async function handleDismissSuggestion(id: string) {
    setActionId(id);
    try {
      const db = createClient();
      const { data: { user } } = await db.auth.getUser();
      await db
        .from("rule_suggestions")
        .update({ status: "rejected", reviewed_by: user?.id })
        .eq("id", id);
      toast.success("Suggestion dismissed");
      fetchData();
    } finally {
      setActionId(null);
    }
  }

  if (noOrg) {
    return (
      <>
        <PageHeader title="Approvals" description="Review pending prompts and rule suggestions" />
        <NoOrgBanner />
      </>
    );
  }

  if (!canEdit) {
    return (
      <>
        <PageHeader title="Approvals" description="Review pending prompts and rule suggestions" />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Admin access required</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Only admins and managers can review approvals.
          </p>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Approvals" description="Review pending prompts and rule suggestions" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </>
    );
  }

  const totalPending = pendingPrompts.length + suggestions.length;

  return (
    <>
      <PageHeader
        title="Approvals"
        description={`${totalPending} item${totalPending !== 1 ? "s" : ""} pending review`}
      />

      <Tabs defaultValue="prompts">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
          <TabsTrigger value="prompts" className="gap-1.5">
            <FileText className="h-4 w-4 hidden sm:inline" />
            Prompts ({pendingPrompts.length})
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="gap-1.5">
            <Lightbulb className="h-4 w-4 hidden sm:inline" />
            Rule Suggestions ({suggestions.length})
          </TabsTrigger>
        </TabsList>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="mt-4">
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="w-[160px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPrompts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No prompts pending review.
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingPrompts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <button
                          className="text-left hover:underline"
                          onClick={() => setPreviewPrompt(p)}
                        >
                          <p className="font-medium text-sm">{p.title}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            {p.content.slice(0, 80)}
                            {p.content.length > 80 ? "..." : ""}
                          </p>
                        </button>
                      </TableCell>
                      <TableCell className="text-sm">
                        {p.submitter_name || p.submitter_email || "Unknown"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(p.updated_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {(p.tags || []).slice(0, 3).map((t) => (
                            <Badge key={t} variant="secondary" className="text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprovePrompt(p.id)}
                            disabled={actionId === p.id}
                          >
                            {actionId === p.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs gap-1"
                            onClick={() => openRejectModal(p.id)}
                            disabled={actionId === p.id}
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Rule Suggestions Tab */}
        <TabsContent value="suggestions" className="mt-4">
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Suggested By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[160px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No rule suggestions pending review.
                    </TableCell>
                  </TableRow>
                ) : (
                  suggestions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <p className="font-medium text-sm">{s.name}</p>
                        {s.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-xs">
                            {s.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {s.category.replaceAll("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={s.severity === "block" ? "destructive" : "default"}
                          className="text-xs"
                        >
                          {s.severity === "block" ? "Block" : "Warn"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {s.suggestor?.name || s.suggestor?.email || "Unknown"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveSuggestion(s)}
                            disabled={actionId === s.id}
                          >
                            {actionId === s.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => handleDismissSuggestion(s.id)}
                            disabled={actionId === s.id}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reject Reason Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reject Prompt</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide feedback for the author..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prompt Preview Modal */}
      <Dialog open={!!previewPrompt} onOpenChange={() => setPreviewPrompt(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {previewPrompt?.title}
            </DialogTitle>
          </DialogHeader>
          {previewPrompt && (
            <div className="space-y-4">
              {previewPrompt.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1">{previewPrompt.description}</p>
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground">Content</Label>
                <pre className="mt-1 text-sm whitespace-pre-wrap bg-muted rounded-lg p-3 max-h-64 overflow-y-auto">
                  {previewPrompt.content}
                </pre>
              </div>
              {previewPrompt.tags && previewPrompt.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {previewPrompt.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 gap-1"
                  onClick={() => {
                    handleApprovePrompt(previewPrompt.id);
                    setPreviewPrompt(null);
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-1"
                  onClick={() => {
                    setPreviewPrompt(null);
                    openRejectModal(previewPrompt.id);
                  }}
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
