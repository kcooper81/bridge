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
  BarChart3,
  MousePointerClick,
  MailOpen,
  Ban,
  List,
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
  opens: number;
  clicks: number;
  bounces: number;
  complaints: number;
  unsubscribes: number;
  analytics_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Segment {
  name: string;
  label: string;
  count: number;
  type?: string;
}

interface AudienceList {
  id: string;
  name: string;
  description: string;
  contact_count: number;
  created_at: string;
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
  const [importListName, setImportListName] = useState("");
  const [importListDesc, setImportListDesc] = useState("");
  const [audienceLists, setAudienceLists] = useState<AudienceList[]>([]);
  const [editingList, setEditingList] = useState<AudienceList | null>(null);
  const [editListName, setEditListName] = useState("");
  const [editListDesc, setEditListDesc] = useState("");
  const [savingList, setSavingList] = useState(false);
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
  const [groupCounts, setGroupCounts] = useState<Record<string, number>>({});

  // Analytics
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

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

  const loadAudienceLists = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/campaigns/lists");
      const data = await res.json();
      setAudienceLists(data.lists || []);
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
    loadSegments();
    loadExternalCount();
    loadAudienceLists();
  }, [loadCampaigns, loadSegments, loadExternalCount, loadAudienceLists]);

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
    // Load analytics for sent campaigns
    if (c.status !== "draft" && c.resend_broadcast_id) {
      loadAnalytics(c.id);
    }
  }

  async function loadAnalytics(campaignId: string) {
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}/analytics`);
      const data = await res.json();
      if (res.ok && data.campaign) {
        setEditingCampaign((prev) => prev ? {
          ...prev,
          status: data.campaign.status,
          opens: data.campaign.opens,
          clicks: data.campaign.clicks,
          bounces: data.campaign.bounces,
          complaints: data.campaign.complaints,
          unsubscribes: data.campaign.unsubscribes,
          analytics_synced_at: data.campaign.analytics_synced_at,
        } : prev);
      }
    } catch {
      // Analytics are non-critical
    } finally {
      setAnalyticsLoading(false);
    }
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
    // Pre-fill defaults from template fields
    const defaults: Record<string, string> = {};
    template.fields.forEach((f) => { if (f.default) defaults[f.key] = f.default; });
    // Init repeatable group counts and seed empty values
    const counts: Record<string, number> = {};
    template.repeatableGroups?.forEach((g) => {
      counts[g.key] = g.defaultCount;
      for (let i = 0; i < g.defaultCount; i++) {
        g.fields.forEach((f) => { defaults[`${g.key}_${i}_${f.suffix}`] = ""; });
      }
    });
    setFieldValues(defaults);
    setGroupCounts(counts);
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

  function addGroupItem(groupKey: string, max: number) {
    const current = groupCounts[groupKey] || 1;
    if (current >= max) return;
    const nextCounts = { ...groupCounts, [groupKey]: current + 1 };
    setGroupCounts(nextCounts);
    // Seed empty values for the new item so repeatCount detects it
    const nextVals = { ...fieldValues };
    const group = activeTemplate?.repeatableGroups?.find((g) => g.key === groupKey);
    group?.fields.forEach((f) => { nextVals[`${groupKey}_${current}_${f.suffix}`] = ""; });
    setFieldValues(nextVals);
    if (activeTemplate) setFormBody(activeTemplate.build(nextVals));
  }

  function removeGroupItem(groupKey: string, index: number, min: number, suffixes: string[]) {
    const current = groupCounts[groupKey] || 1;
    if (current <= min) return;
    // Shift values down to fill the gap
    const next = { ...fieldValues };
    for (let i = index; i < current - 1; i++) {
      suffixes.forEach((s) => {
        next[`${groupKey}_${i}_${s}`] = next[`${groupKey}_${i + 1}_${s}`] || "";
      });
    }
    // Clear the last item
    suffixes.forEach((s) => { delete next[`${groupKey}_${current - 1}_${s}`]; });
    setFieldValues(next);
    const nextCounts = { ...groupCounts, [groupKey]: current - 1 };
    setGroupCounts(nextCounts);
    if (activeTemplate) setFormBody(activeTemplate.build(next));
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
      const companyIdx = header.findIndex((h) => h === "company" || h === "company_name" || h === "company name" || h === "organization" || h === "org");

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
          company: companyIdx >= 0 ? cols[companyIdx] || "" : "",
        };
      }).filter((c) => c.email);

      const res = await fetch("/api/admin/campaigns/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacts,
          list_name: importListName.trim() || undefined,
          list_description: importListDesc.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const listMsg = importListName.trim() ? ` → "${importListName.trim()}" list` : "";
      toast.success(`Imported ${data.imported} contacts (${data.skipped} skipped)${listMsg}`);
      setShowImport(false);
      setImportListName("");
      setImportListDesc("");
      await Promise.all([loadSegments(), loadExternalCount(), loadAudienceLists()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  async function deleteAudienceList(listId: string) {
    try {
      const res = await fetch("/api/admin/campaigns/lists", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: listId }),
      });
      if (!res.ok) throw new Error("Failed to delete list");
      toast.success("Audience list deleted");
      await Promise.all([loadSegments(), loadAudienceLists()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete list");
    }
  }

  function openEditList(list: AudienceList) {
    setEditingList(list);
    setEditListName(list.name);
    setEditListDesc(list.description || "");
  }

  async function saveListEdits() {
    if (!editingList || !editListName.trim()) return;
    setSavingList(true);
    try {
      const res = await fetch("/api/admin/campaigns/lists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingList.id,
          name: editListName.trim(),
          description: editListDesc.trim(),
        }),
      });
      if (!res.ok) throw new Error("Failed to update list");
      toast.success("List updated");
      setEditingList(null);
      await Promise.all([loadSegments(), loadAudienceLists()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update list");
    } finally {
      setSavingList(false);
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

                  {/* Repeatable groups */}
                  {activeTemplate.repeatableGroups?.map((group) => {
                    const count = groupCounts[group.key] || group.defaultCount;
                    const suffixes = group.fields.map((f) => f.suffix);
                    return (
                      <div key={group.key} className="pt-3 border-t space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {group.label} ({count})
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-6 text-[11px] px-2"
                            disabled={count >= group.max}
                            onClick={() => addGroupItem(group.key, group.max)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            {group.addLabel}
                          </Button>
                        </div>
                        {Array.from({ length: count }, (_, i) => (
                          <div key={i} className="relative bg-slate-50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                                {group.label.replace(/s$/, "")} {i + 1}
                              </span>
                              {count > group.min && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 text-muted-foreground hover:text-red-600"
                                  onClick={() => removeGroupItem(group.key, i, group.min, suffixes)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            {group.fields.map((gf) => {
                              const fieldKey = `${group.key}_${i}_${gf.suffix}`;
                              return (
                                <div key={gf.suffix}>
                                  <Label htmlFor={`field-${fieldKey}`} className="text-[11px] text-muted-foreground">
                                    {gf.label}
                                  </Label>
                                  {gf.type === "textarea" ? (
                                    <Textarea
                                      id={`field-${fieldKey}`}
                                      value={fieldValues[fieldKey] || ""}
                                      onChange={(e) => updateFieldValue(fieldKey, e.target.value)}
                                      placeholder={gf.placeholder}
                                      className="mt-0.5 text-sm min-h-[60px]"
                                    />
                                  ) : (
                                    <Input
                                      id={`field-${fieldKey}`}
                                      value={fieldValues[fieldKey] || ""}
                                      onChange={(e) => updateFieldValue(fieldKey, e.target.value)}
                                      placeholder={gf.placeholder}
                                      className="mt-0.5 text-sm"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    );
                  })}

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Variables: <code className="bg-slate-100 px-1 rounded">{"{{{FIRST_NAME|there}}}"}</code>{" "}
                      <code className="bg-slate-100 px-1 rounded">{"{{{LAST_NAME}}}"}</code>{" "}
                      <code className="bg-slate-100 px-1 rounded">{"{{{COMPANY|your team}}}"}</code>{" "}
                      — Switch to Preview to see the result, or HTML for full control.
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

              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  Variables: <code className="bg-slate-100 px-1 rounded">{`{{{FIRST_NAME|there}}}`}</code>{" "}
                  <code className="bg-slate-100 px-1 rounded">{`{{{LAST_NAME}}}`}</code>{" "}
                  <code className="bg-slate-100 px-1 rounded">{`{{{COMPANY|your team}}}`}</code>
                </p>
                <p>Unsubscribe link auto-injected if not present</p>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Analytics — shown for sent campaigns */}
            {editingCampaign && editingCampaign.status !== "draft" && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Performance
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => loadAnalytics(editingCampaign.id)}
                    disabled={analyticsLoading}
                  >
                    <RefreshCw className={`h-3 w-3 ${analyticsLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-blue-50 p-3 text-center">
                    <Send className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-blue-700">{editingCampaign.recipient_count}</p>
                    <p className="text-[10px] text-blue-600/70 uppercase font-medium">Sent</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-3 text-center">
                    <MailOpen className="h-4 w-4 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-700">{editingCampaign.opens || 0}</p>
                    <p className="text-[10px] text-green-600/70 uppercase font-medium">Opens</p>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-3 text-center">
                    <MousePointerClick className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-purple-700">{editingCampaign.clicks || 0}</p>
                    <p className="text-[10px] text-purple-600/70 uppercase font-medium">Clicks</p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-3 text-center">
                    <Ban className="h-4 w-4 text-red-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-red-600">{editingCampaign.bounces || 0}</p>
                    <p className="text-[10px] text-red-500/70 uppercase font-medium">Bounces</p>
                  </div>
                </div>
                {editingCampaign.recipient_count > 0 && (editingCampaign.opens || 0) > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Open rate</span>
                      <span className="font-medium">
                        {((editingCampaign.opens / editingCampaign.recipient_count) * 100).toFixed(1)}%
                      </span>
                    </div>
                    {(editingCampaign.clicks || 0) > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Click rate</span>
                        <span className="font-medium">
                          {((editingCampaign.clicks / editingCampaign.recipient_count) * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}
                    {(editingCampaign.unsubscribes || 0) > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Unsubscribes</span>
                        <span className="font-medium text-red-600">{editingCampaign.unsubscribes}</span>
                      </div>
                    )}
                  </div>
                )}
                {editingCampaign.analytics_synced_at && (
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Last synced {timeAgo(editingCampaign.analytics_synced_at)}
                  </p>
                )}
                {(editingCampaign.opens || 0) === 0 && (editingCampaign.clicks || 0) === 0 && (
                  <p className="text-[10px] text-muted-foreground mt-2 text-center">
                    Analytics update as Resend webhook events arrive
                  </p>
                )}
              </Card>
            )}

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
                  {segments.filter((s) => !s.type).map((seg) => (
                    <SelectItem key={seg.name} value={seg.name}>
                      {seg.label} ({seg.count})
                    </SelectItem>
                  ))}
                  {segments.some((s) => s.type === "list") && (
                    <>
                      <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Audience Lists
                      </div>
                      {segments.filter((s) => s.type === "list").map((seg) => (
                        <SelectItem key={seg.name} value={seg.name}>
                          <span className="flex items-center gap-1.5">
                            <List className="h-3 w-3" />
                            {seg.label} ({seg.count})
                          </span>
                        </SelectItem>
                      ))}
                    </>
                  )}
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

            {/* Audience Lists management */}
            {audienceLists.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Audience Lists
                </h3>
                <div className="space-y-2">
                  {audienceLists.map((list) => (
                    <div key={list.id} className="rounded-lg border p-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{list.name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => openEditList(list)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                            onClick={() => deleteAudienceList(list.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {list.description && (
                        <p className="text-[11px] text-muted-foreground">{list.description}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        {list.contact_count} contact{list.contact_count !== 1 ? "s" : ""} &middot; {timeAgo(list.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3">Tips</h3>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li>&bull; Save as draft first, then Send</li>
                <li>&bull; Contacts are synced to Resend when you send</li>
                <li>&bull; Unsubscribe link is automatically added</li>
                <li>&bull; Variables: <code className="bg-slate-100 px-1 rounded">{`{{{FIRST_NAME}}}`}</code>, <code className="bg-slate-100 px-1 rounded">{`{{{LAST_NAME}}}`}</code>, <code className="bg-slate-100 px-1 rounded">{`{{{COMPANY}}}`}</code></li>
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
        <Dialog open={showImport} onOpenChange={(open) => { setShowImport(open); if (!open) { setImportListName(""); setImportListDesc(""); } }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Import Contacts</DialogTitle>
              <DialogDescription>
                Upload a CSV with contacts. Columns: email (required), first_name, last_name, company.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="import-list-name">List Name</Label>
                <Input
                  id="import-list-name"
                  value={importListName}
                  onChange={(e) => setImportListName(e.target.value)}
                  placeholder="e.g. Partner Leads March 2026"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Creates a reusable audience list you can select when sending campaigns
                </p>
              </div>
              {importListName.trim() && (
                <div>
                  <Label htmlFor="import-list-desc">List Description (optional)</Label>
                  <Input
                    id="import-list-desc"
                    value={importListDesc}
                    onChange={(e) => setImportListDesc(e.target.value)}
                    placeholder="e.g. SaaS founders from LinkedIn outreach"
                    className="mt-1"
                  />
                </div>
              )}
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
                  email,first_name,last_name,company<br />
                  john@example.com,John,Doe,Acme Inc<br />
                  jane@example.com,Jane,Smith,TechCorp
                </code>
              </div>
              {externalCount > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  {externalCount} contacts already imported. Duplicates will be updated.
                </p>
              )}

              {/* Existing audience lists */}
              {audienceLists.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
                    <List className="h-3.5 w-3.5" />
                    Existing Audience Lists
                  </p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {audienceLists.map((list) => (
                      <div key={list.id} className="flex items-center justify-between bg-slate-50 rounded px-2.5 py-1.5">
                        <div className="min-w-0">
                          <span className="text-xs font-medium truncate block">{list.name}</span>
                          {list.description && (
                            <span className="text-[10px] text-muted-foreground truncate block">{list.description}</span>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {list.contact_count} contact{list.contact_count !== 1 ? "s" : ""} &middot; {timeAgo(list.created_at)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                          onClick={() => deleteAudienceList(list.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Audience List Dialog */}
        <Dialog open={!!editingList} onOpenChange={(open) => { if (!open) setEditingList(null); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Audience List</DialogTitle>
              <DialogDescription>
                Update the name and description for this audience list.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-list-name">List Name</Label>
                <Input
                  id="edit-list-name"
                  value={editListName}
                  onChange={(e) => setEditListName(e.target.value)}
                  placeholder="e.g. Partner Leads March 2026"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-list-desc">Description / Notes</Label>
                <Textarea
                  id="edit-list-desc"
                  value={editListDesc}
                  onChange={(e) => setEditListDesc(e.target.value)}
                  placeholder="e.g. SaaS founders from LinkedIn outreach, imported from Apollo export"
                  className="mt-1 min-h-[80px]"
                />
              </div>
              {editingList && (
                <p className="text-xs text-muted-foreground">
                  {editingList.contact_count} contact{editingList.contact_count !== 1 ? "s" : ""} &middot; Created {timeAgo(editingList.created_at)}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingList(null)}>
                Cancel
              </Button>
              <Button onClick={saveListEdits} disabled={savingList || !editListName.trim()}>
                {savingList && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                Save
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
                {c.recipient_count > 0 && (
                  <span className="flex items-center gap-1" title="Recipients">
                    <Send className="h-3 w-3" />
                    {c.recipient_count}
                  </span>
                )}
                {(c.opens || 0) > 0 && (
                  <span className="flex items-center gap-1 text-green-600" title="Opens">
                    <MailOpen className="h-3 w-3" />
                    {c.opens}
                  </span>
                )}
                {(c.clicks || 0) > 0 && (
                  <span className="flex items-center gap-1 text-purple-600" title="Clicks">
                    <MousePointerClick className="h-3 w-3" />
                    {c.clicks}
                  </span>
                )}
                {c.scheduled_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(c.scheduled_at).toLocaleDateString()}
                  </span>
                )}
                {c.sent_at ? (
                  <span>{timeAgo(c.sent_at)}</span>
                ) : (
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
