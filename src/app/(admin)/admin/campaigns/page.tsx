"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Loader2,
  RefreshCw,
  Trash2,
  Pencil,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Users,
  Megaphone,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ───────────────────────────────────────────────────────

interface Campaign {
  id: string;
  name: string;
  subject: string;
  from_email: string;
  body_html: string;
  segment_name: string | null;
  resend_broadcast_id: string | null;
  status: "draft" | "scheduled" | "queued" | "sending" | "sent" | "failed";
  scheduled_at: string | null;
  sent_at: string | null;
  recipient_count: number;
  created_at: string;
  updated_at: string;
}

interface Segment {
  name: string;
  label: string;
  count: number;
}

type View = "list" | "editor";

// ─── Helpers ─────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-700", icon: Pencil },
  scheduled: { label: "Scheduled", color: "bg-blue-100 text-blue-700", icon: Clock },
  queued: { label: "Queued", color: "bg-amber-100 text-amber-700", icon: Clock },
  sending: { label: "Sending", color: "bg-amber-100 text-amber-700", icon: Send },
  sent: { label: "Sent", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  failed: { label: "Failed", color: "bg-red-100 text-red-700", icon: AlertCircle },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ─── Page ────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("list");
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  // Editor form state
  const [formName, setFormName] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formFrom, setFormFrom] = useState("TeamPrompt <hello@teamprompt.app>");
  const [formBody, setFormBody] = useState("");
  const [formSegment, setFormSegment] = useState("all");

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/campaigns");
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch {
      toast.error("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSegments = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/campaigns/audiences");
      const data = await res.json();
      setSegments(data.segments || []);
    } catch {
      // Segments are non-critical
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
    loadSegments();
  }, [loadCampaigns, loadSegments]);

  // ─── Editor actions ──────────────────────────────────────────

  function openNewCampaign() {
    setEditingCampaign(null);
    setFormName("");
    setFormSubject("");
    setFormFrom("TeamPrompt <hello@teamprompt.app>");
    setFormBody("");
    setFormSegment("all");
    setView("editor");
  }

  function openEditCampaign(c: Campaign) {
    setEditingCampaign(c);
    setFormName(c.name);
    setFormSubject(c.subject);
    setFormFrom(c.from_email);
    setFormBody(c.body_html);
    setFormSegment(c.segment_name || "all");
    setView("editor");
  }

  async function saveCampaign() {
    if (!formName.trim()) {
      toast.error("Campaign name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formName,
        subject: formSubject,
        from_email: formFrom,
        body_html: formBody,
        segment_name: formSegment === "all" ? null : formSegment,
      };

      let res: Response;
      if (editingCampaign) {
        res = await fetch(`/api/admin/campaigns/${editingCampaign.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/campaigns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      toast.success(editingCampaign ? "Campaign updated" : "Campaign created");
      setEditingCampaign(data.campaign);
      await loadCampaigns();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCampaign(id: string) {
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success("Campaign deleted");
      setShowDeleteConfirm(null);
      if (editingCampaign?.id === id) setView("list");
      await loadCampaigns();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function sendCampaign() {
    if (!editingCampaign) return;
    setSending(true);
    try {
      // Save latest edits first
      await saveCampaign();

      const payload: Record<string, string> = {};
      if (scheduleDate) payload.schedule_at = new Date(scheduleDate).toISOString();

      const res = await fetch(`/api/admin/campaigns/${editingCampaign.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");

      toast.success(
        scheduleDate
          ? `Campaign scheduled for ${new Date(scheduleDate).toLocaleString()}`
          : `Campaign queued — ${data.recipient_count} recipients`
      );
      setShowSendConfirm(false);
      setView("list");
      await loadCampaigns();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  // ─── Render ──────────────────────────────────────────────────

  if (view === "editor") {
    const segmentInfo = segments.find((s) => s.name === formSegment);
    const recipientCount = segmentInfo?.count || 0;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView("list")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              {editingCampaign ? "Edit Campaign" : "New Campaign"}
            </h1>
            {editingCampaign && (
              <p className="text-sm text-muted-foreground">
                {editingCampaign.status === "draft" ? "Draft" : editingCampaign.status} &middot; Created {timeAgo(editingCampaign.created_at)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} disabled={!formBody.trim()}>
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={saveCampaign} disabled={saving}>
              {saving && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setScheduleDate("");
                setShowSendConfirm(true);
              }}
              disabled={!formSubject.trim() || !formBody.trim() || !editingCampaign}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Send
            </Button>
          </div>
        </div>

        {/* Editor Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main editor */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-4 space-y-4">
              <div>
                <Label htmlFor="campaign-name">Campaign Name</Label>
                <Input
                  id="campaign-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. March Product Update"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Internal name, not shown to recipients</p>
              </div>
              <div>
                <Label htmlFor="campaign-subject">Subject Line</Label>
                <Input
                  id="campaign-subject"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="e.g. What's new in TeamPrompt this month"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="campaign-from">From</Label>
                <Input
                  id="campaign-from"
                  value={formFrom}
                  onChange={(e) => setFormFrom(e.target.value)}
                  className="mt-1"
                />
              </div>
            </Card>

            <Card className="p-4">
              <Label htmlFor="campaign-body">Email Body (HTML)</Label>
              <Textarea
                id="campaign-body"
                value={formBody}
                onChange={(e) => setFormBody(e.target.value)}
                placeholder="Paste your email HTML here..."
                className="mt-1 font-mono text-xs min-h-[400px]"
              />
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>Personalization: <code className="bg-slate-100 px-1 rounded">{`{{{FIRST_NAME|there}}}`}</code></span>
                <span>Unsubscribe link auto-injected if not present</span>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Audience
              </h3>
              <Select value={formSegment} onValueChange={setFormSegment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  {segments.map((seg) => (
                    <SelectItem key={seg.name} value={seg.name}>
                      {seg.label} ({seg.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                {recipientCount > 0
                  ? `~${recipientCount} recipients will be synced to Resend`
                  : "Loading audience counts..."}
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3">Tips</h3>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li>&bull; Save as draft first, then Send</li>
                <li>&bull; Contacts are synced to Resend when you send</li>
                <li>&bull; Unsubscribe link is automatically added</li>
                <li>&bull; Use <code className="bg-slate-100 px-1 rounded">{`{{{FIRST_NAME|Friend}}}`}</code> for personalization</li>
                <li>&bull; Schedule sends by picking a date/time before sending</li>
              </ul>
            </Card>

            {editingCampaign && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowDeleteConfirm(editingCampaign.id)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete Campaign
              </Button>
            )}
          </div>
        </div>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Email Preview</DialogTitle>
              <DialogDescription>
                Subject: {formSubject || "(no subject)"}
              </DialogDescription>
            </DialogHeader>
            <div className="border rounded-lg p-4 bg-white">
              <div
                dangerouslySetInnerHTML={{ __html: formBody }}
                className="prose prose-sm max-w-none"
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Send Confirmation Dialog */}
        <Dialog open={showSendConfirm} onOpenChange={setShowSendConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Campaign</DialogTitle>
              <DialogDescription>
                This will sync contacts and send via Resend Broadcast.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
                <p><strong>Campaign:</strong> {formName}</p>
                <p><strong>Subject:</strong> {formSubject}</p>
                <p><strong>Audience:</strong> {segmentInfo?.label || formSegment} (~{recipientCount})</p>
              </div>
              <div>
                <Label htmlFor="schedule-date">Schedule (optional)</Label>
                <Input
                  id="schedule-date"
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to send immediately
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSendConfirm(false)}>
                Cancel
              </Button>
              <Button
                onClick={sendCampaign}
                disabled={sending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {sending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                {scheduleDate ? "Schedule" : "Send Now"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Campaign?</DialogTitle>
              <DialogDescription>
                This will permanently delete this campaign draft.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => showDeleteConfirm && deleteCampaign(showDeleteConfirm)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ─── List View ───────────────────────────────────────────────

  const drafts = campaigns.filter((c) => c.status === "draft");
  const scheduled = campaigns.filter((c) => c.status === "scheduled");
  const sent = campaigns.filter((c) =>
    ["queued", "sending", "sent", "failed"].includes(c.status)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Campaigns
          </h1>
          <p className="text-sm text-muted-foreground">
            Send bulk marketing emails via Resend Broadcasts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadCampaigns} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={openNewCampaign}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Campaign
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <Megaphone className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-1">No campaigns yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first email campaign to reach your users
          </p>
          <Button size="sm" onClick={openNewCampaign}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create Campaign
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Drafts */}
          {drafts.length > 0 && (
            <CampaignSection
              title="Drafts"
              campaigns={drafts}
              onEdit={openEditCampaign}
              onDelete={(id) => setShowDeleteConfirm(id)}
            />
          )}

          {/* Scheduled */}
          {scheduled.length > 0 && (
            <CampaignSection
              title="Scheduled"
              campaigns={scheduled}
              onEdit={openEditCampaign}
            />
          )}

          {/* Sent */}
          {sent.length > 0 && (
            <CampaignSection
              title="Sent"
              campaigns={sent}
              onEdit={openEditCampaign}
            />
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign?</DialogTitle>
            <DialogDescription>
              This will permanently delete this campaign draft.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteConfirm && deleteCampaign(showDeleteConfirm)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function CampaignSection({
  title,
  campaigns,
  onEdit,
  onDelete,
}: {
  title: string;
  campaigns: Campaign[];
  onEdit: (c: Campaign) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {title} ({campaigns.length})
      </h2>
      <div className="space-y-2">
        {campaigns.map((c) => {
          const status = STATUS_CONFIG[c.status] || STATUS_CONFIG.draft;
          const StatusIcon = status.icon;

          return (
            <Card
              key={c.id}
              className="p-4 flex items-center gap-4 hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => onEdit(c)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm truncate">{c.name}</h3>
                  <Badge variant="secondary" className={`text-[10px] ${status.color}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {c.subject || "(no subject)"}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                {c.segment_name && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {c.segment_name}
                  </span>
                )}
                {c.recipient_count > 0 && (
                  <span>{c.recipient_count} recipients</span>
                )}
                {c.scheduled_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(c.scheduled_at).toLocaleDateString()}
                  </span>
                )}
                {c.sent_at && (
                  <span>{timeAgo(c.sent_at)}</span>
                )}
                {!c.sent_at && (
                  <span>{timeAgo(c.created_at)}</span>
                )}
              </div>

              {onDelete && c.status === "draft" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(c.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
