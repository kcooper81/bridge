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
  Upload,
  FileText,
  LayoutTemplate,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CAMPAIGN_TEMPLATES, TEMPLATE_CATEGORIES, type CampaignTemplate } from "@/lib/campaign-templates";

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
  const [showTemplates, setShowTemplates] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [externalCount, setExternalCount] = useState(0);
  const [editorTab, setEditorTab] = useState<"fields" | "preview" | "html">("fields");

  // Editor form state
  const [formName, setFormName] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formFrom, setFormFrom] = useState("TeamPrompt <hello@teamprompt.app>");
  const [formBody, setFormBody] = useState("");
  const [formSegment, setFormSegment] = useState("all");

  // Template field editing
  const [activeTemplate, setActiveTemplate] = useState<CampaignTemplate | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

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

  const loadExternalCount = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/campaigns/contacts");
      const data = await res.json();
      setExternalCount(data.active || 0);
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
    loadSegments();
    loadExternalCount();
  }, [loadCampaigns, loadSegments, loadExternalCount]);

  // ─── Editor actions ──────────────────────────────────────────

  function openNewCampaign() {
    setEditingCampaign(null);
    setFormName("");
    setFormSubject("");
    setFormFrom("TeamPrompt <hello@teamprompt.app>");
    setFormBody("");
    setFormSegment("all");
    setActiveTemplate(null);
    setFieldValues({});
    setEditorTab("fields");
    setView("editor");
  }

  function openEditCampaign(c: Campaign) {
    setEditingCampaign(c);
    setFormName(c.name);
    setFormSubject(c.subject);
    setFormFrom(c.from_email);
    setFormBody(c.body_html);
    setFormSegment(c.segment_name || "all");
    setActiveTemplate(null);
    setFieldValues({});
    setEditorTab(c.body_html ? "preview" : "fields");
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

  function applyTemplate(template: CampaignTemplate) {
    setActiveTemplate(template);
    setFieldValues({});
    // Pre-fill defaults from template fields
    const defaults: Record<string, string> = {};
    template.fields.forEach((f) => { if (f.default) defaults[f.key] = f.default; });
    setFieldValues(defaults);
    setFormBody(template.build(defaults));
    if (!formSubject.trim()) setFormSubject(template.defaultSubject);
    if (!formName.trim()) setFormName(template.name + " — " + new Date().toLocaleDateString());
    setShowTemplates(false);
    setEditorTab("fields");
    toast.success(`Template "${template.name}" applied — fill in the fields`);
  }

  function updateFieldValue(key: string, value: string) {
    const next = { ...fieldValues, [key]: value };
    setFieldValues(next);
    if (activeTemplate) {
      setFormBody(activeTemplate.build(next));
    }
  }

  function detachTemplate() {
    setActiveTemplate(null);
    setEditorTab("html");
    toast.success("Detached from template — you can now edit the raw HTML");
  }

  async function handleCsvImport(file: File) {
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        toast.error("CSV must have a header row and at least one data row");
        return;
      }

      const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/"/g, ""));
      const emailIdx = header.findIndex((h) => h === "email" || h === "email address" || h === "e-mail");
      const firstNameIdx = header.findIndex((h) => h === "first_name" || h === "first name" || h === "firstname" || h === "name");
      const lastNameIdx = header.findIndex((h) => h === "last_name" || h === "last name" || h === "lastname" || h === "surname");

      if (emailIdx === -1) {
        toast.error("CSV must have an 'email' column");
        return;
      }

      const contacts = lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        return {
          email: cols[emailIdx] || "",
          first_name: firstNameIdx >= 0 ? cols[firstNameIdx] || "" : "",
          last_name: lastNameIdx >= 0 ? cols[lastNameIdx] || "" : "",
        };
      }).filter((c) => c.email);

      const res = await fetch("/api/admin/campaigns/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Imported ${data.imported} contacts (${data.skipped} skipped)`);
      setShowImport(false);
      await loadSegments();
      await loadExternalCount();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
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

            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>Email Body</Label>
                  {activeTemplate && (
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {activeTemplate.name}
                      <button type="button" className="ml-1 hover:text-foreground" onClick={detachTemplate}>&times;</button>
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setShowTemplates(true)}
                  >
                    <LayoutTemplate className="h-3 w-3 mr-1.5" />
                    {activeTemplate ? "Change" : "Use Template"}
                  </Button>
                  <Tabs value={editorTab} onValueChange={(val) => setEditorTab(val as "fields" | "preview" | "html")}>
                    <TabsList className="h-7">
                      {activeTemplate && (
                        <TabsTrigger value="fields" className="text-xs px-2 h-5">Edit</TabsTrigger>
                      )}
                      <TabsTrigger value="preview" className="text-xs px-2 h-5">Preview</TabsTrigger>
                      <TabsTrigger value="html" className="text-xs px-2 h-5">HTML</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {editorTab === "fields" && activeTemplate ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {activeTemplate.fields.map((field) => (
                    <div key={field.key}>
                      <Label htmlFor={`field-${field.key}`} className="text-xs font-medium">
                        {field.label}
                      </Label>
                      {field.type === "textarea" ? (
                        <Textarea
                          id={`field-${field.key}`}
                          value={fieldValues[field.key] || ""}
                          onChange={(e) => updateFieldValue(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="mt-1 text-sm min-h-[80px]"
                        />
                      ) : (
                        <Input
                          id={`field-${field.key}`}
                          value={fieldValues[field.key] || ""}
                          onChange={(e) => updateFieldValue(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="mt-1 text-sm"
                        />
                      )}
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Personalization: <code className="bg-slate-100 px-1 rounded">{"{{{FIRST_NAME|there}}}"}</code> is auto-inserted.
                      Switch to Preview to see the result, or HTML for full control.
                    </p>
                  </div>
                </div>
              ) : editorTab === "html" ? (
                <Textarea
                  id="campaign-body"
                  value={formBody}
                  onChange={(e) => { setFormBody(e.target.value); setActiveTemplate(null); }}
                  placeholder="Paste your email HTML here, or choose a template above..."
                  className="font-mono text-xs min-h-[400px]"
                />
              ) : (
                <div className="border rounded-lg bg-white min-h-[400px] overflow-auto">
                  {formBody.trim() ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: formBody }}
                      className="p-4 prose prose-sm max-w-none"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center text-muted-foreground">
                      <LayoutTemplate className="h-8 w-8 mb-2" />
                      <p className="text-sm font-medium">No content yet</p>
                      <p className="text-xs mt-1">Choose a template to get started, or switch to HTML</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => setShowTemplates(true)}
                      >
                        Browse Templates
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
              {externalCount > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {externalCount} external contacts imported
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 h-8 text-xs"
                onClick={() => setShowImport(true)}
              >
                <Upload className="h-3 w-3 mr-1.5" />
                Import Contacts (CSV)
              </Button>
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

        {/* Template Picker Dialog */}
        <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Choose a Template</DialogTitle>
              <DialogDescription>
                Pick a template, then fill in the fields. You can always switch to HTML for full control.
              </DialogDescription>
            </DialogHeader>
            {TEMPLATE_CATEGORIES.map((cat) => {
              const templates = CAMPAIGN_TEMPLATES.filter((t) => t.category === cat.id);
              if (templates.length === 0) return null;
              return (
                <div key={cat.id} className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{cat.label}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {templates.map((t) => (
                      <Card
                        key={t.id}
                        className="p-3 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                        onClick={() => applyTemplate(t)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-medium text-sm">{t.name}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {t.fields.length} fields &middot; Subject: {t.defaultSubject}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </DialogContent>
        </Dialog>

        {/* CSV Import Dialog */}
        <Dialog open={showImport} onOpenChange={setShowImport}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Contacts</DialogTitle>
              <DialogDescription>
                Upload a CSV file with email addresses. Columns: email (required), first_name, last_name.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => document.getElementById("csv-file-input")?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files[0];
                  if (file && file.name.endsWith(".csv")) handleCsvImport(file);
                  else toast.error("Please drop a .csv file");
                }}
              >
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">
                  {importing ? "Importing..." : "Click to upload or drag & drop"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">CSV files only</p>
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCsvImport(file);
                    e.target.value = "";
                  }}
                />
              </div>
              {importing && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing contacts...
                </div>
              )}
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs font-medium mb-1">CSV Format Example:</p>
                <code className="text-xs text-muted-foreground block">
                  email,first_name,last_name<br />
                  john@example.com,John,Doe<br />
                  jane@example.com,Jane,Smith
                </code>
              </div>
              {externalCount > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  {externalCount} contacts already imported. Duplicates will be skipped.
                </p>
              )}
            </div>
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
