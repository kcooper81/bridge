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
  Search,
  Download,
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
  Copy,
  Save,
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
type ListTab = "campaigns" | "audiences" | "analytics" | "prospecting";

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
  const [listTab, setListTab] = useState<ListTab>("campaigns");
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
  const [listSearch, setListSearch] = useState("");
  const [listSort, setListSort] = useState<"newest" | "oldest" | "name_asc" | "name_desc" | "contacts_desc" | "contacts_asc">("newest");
  const [editListName, setEditListName] = useState("");
  const [editListDesc, setEditListDesc] = useState("");
  const [savingList, setSavingList] = useState(false);
  const [deleteListConfirm, setDeleteListConfirm] = useState<string | null>(null);
  const [showCreateList, setShowCreateList] = useState(false);
  const [createListName, setCreateListName] = useState("");
  const [createListDesc, setCreateListDesc] = useState("");
  const [createListAddAll, setCreateListAddAll] = useState(true);
  const [creatingList, setCreatingList] = useState(false);
  const [contactsList, setContactsList] = useState<Array<{ id: string; email: string; first_name: string; last_name: string; company: string; unsubscribed: boolean; created_at: string }>>([]);
  const [contactsTotal, setContactsTotal] = useState(0);
  const [contactsSearch, setContactsSearch] = useState("");
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsPage, setContactsPage] = useState(0);
  const [viewingListId, setViewingListId] = useState<string | null>(null);
  const [addToListId, setAddToListId] = useState<string | null>(null);
  const [addToListEmails, setAddToListEmails] = useState("");
  const [addingToList, setAddingToList] = useState(false);
  const [addContactMode, setAddContactMode] = useState<"paste" | "manual">("paste");
  const [manualContacts, setManualContacts] = useState<Array<{ email: string; first_name: string; last_name: string; company: string }>>([{ email: "", first_name: "", last_name: "", company: "" }]);
  const [editorTab, setEditorTab] = useState<"fields" | "visual" | "preview" | "html">("fields");
  const [customTemplates, setCustomTemplates] = useState<Array<{ id: string; name: string; subject: string; body_html: string; created_at: string }>>([]);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

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

  // Apollo Prospecting
  interface ApolloProspect { apollo_id: string; first_name: string; last_name: string; title: string; headline: string; seniority: string; city: string; state: string; country: string; linkedin_url: string; photo_url: string; organization_name: string; organization_website: string; organization_industry: string; organization_size: number | null; }
  const [apolloConfigured, setApolloConfigured] = useState<boolean | null>(null);
  const [apolloResults, setApolloResults] = useState<ApolloProspect[]>([]);
  const [apolloPagination, setApolloPagination] = useState({ page: 1, per_page: 25, total_entries: 0, total_pages: 0 });
  const [apolloSearching, setApolloSearching] = useState(false);
  const [apolloImporting, setApolloImporting] = useState(false);
  const [apolloTitles, setApolloTitles] = useState("IT Director, CISO, IT Consultant, MSP Owner, Head of IT");
  const [apolloSeniorities, setApolloSeniorities] = useState<string[]>(["director", "vp", "c_suite", "owner"]);
  const [apolloEmployeeRanges, setApolloEmployeeRanges] = useState<string[]>(["11-50", "51-200", "201-500"]);
  const [apolloKeywords, setApolloKeywords] = useState("");
  const [apolloLocations, setApolloLocations] = useState("United States");
  const [apolloSelected, setApolloSelected] = useState<Set<string>>(new Set());
  const [apolloListName, setApolloListName] = useState("");

  async function checkApolloStatus() {
    try {
      const res = await fetch("/api/admin/campaigns/apollo");
      const data = await res.json();
      setApolloConfigured(data.configured && data.valid);
    } catch { setApolloConfigured(false); }
  }

  async function searchApollo(page = 1) {
    setApolloSearching(true);
    try {
      const titles = apolloTitles.split(",").map((t) => t.trim()).filter(Boolean);
      const locations = apolloLocations.split(",").map((l) => l.trim()).filter(Boolean);
      const res = await fetch("/api/admin/campaigns/apollo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "search",
          person_titles: titles,
          person_seniorities: apolloSeniorities,
          organization_num_employees_ranges: apolloEmployeeRanges,
          organization_locations: locations,
          q_keywords: apolloKeywords || undefined,
          per_page: 25,
          page,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setApolloResults(data.people || []);
        setApolloPagination(data.pagination || { page: 1, per_page: 25, total_entries: 0, total_pages: 0 });
        setApolloSelected(new Set());
      } else {
        toast.error(data.error || "Search failed");
      }
    } catch { toast.error("Search failed"); }
    finally { setApolloSearching(false); }
  }

  async function importApolloSelected() {
    const selected = apolloResults.filter((p) => apolloSelected.has(p.apollo_id));
    if (selected.length === 0) { toast.error("Select prospects to import"); return; }
    setApolloImporting(true);
    try {
      const res = await fetch("/api/admin/campaigns/apollo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enrich_and_import",
          prospects: selected.map((p) => ({
            first_name: p.first_name,
            last_name: p.last_name,
            organization_name: p.organization_name,
            linkedin_url: p.linkedin_url || undefined,
          })),
          list_name: apolloListName.trim() || `Apollo Import ${new Date().toLocaleDateString()}`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Imported ${data.imported} contacts${data.failed > 0 ? `, ${data.failed} failed` : ""}`);
        setApolloSelected(new Set());
        loadAudienceLists();
      } else {
        toast.error(data.error || "Import failed");
      }
    } catch { toast.error("Import failed"); }
    finally { setApolloImporting(false); }
  }

  // Hunter.io Prospecting (free tier: 50 credits/month)
  interface HunterResult { email: string; type: string; confidence: number; first_name: string; last_name: string; position: string; seniority: string; department: string; linkedin: string; verified: boolean; }
  const [hunterConfigured, setHunterConfigured] = useState<boolean | null>(null);
  const [hunterCredits, setHunterCredits] = useState<{ used: number; available: number } | null>(null);
  const [hunterResults, setHunterResults] = useState<HunterResult[]>([]);
  const [hunterSearching, setHunterSearching] = useState(false);
  const [hunterImporting, setHunterImporting] = useState(false);
  const [hunterDomain, setHunterDomain] = useState("");
  const [hunterCompany, setHunterCompany] = useState("");
  const [hunterDepartment, setHunterDepartment] = useState("executive");
  const [hunterSeniority, setHunterSeniority] = useState("all");
  const [hunterSelected, setHunterSelected] = useState<Set<string>>(new Set());
  const [hunterListName, setHunterListName] = useState("");
  const [hunterTotalResults, setHunterTotalResults] = useState(0);
  const [prospectProvider, setProspectProvider] = useState<"pdl" | "hunter" | "apollo">("pdl");

  // PDL (People Data Labs) — person discovery
  interface PdlPerson { id: string; full_name: string; first_name: string; last_name: string; job_title: string; job_title_role: string; job_title_levels: string[]; company_name: string; company_domain: string; company_size: string; company_industry: string; company_employee_count: number | null; location_country: string; location_region: string; location_locality: string; linkedin_url: string; has_email: boolean; }
  const [pdlConfigured, setPdlConfigured] = useState<boolean | null>(null);
  const [pdlResults, setPdlResults] = useState<PdlPerson[]>([]);
  const [pdlTotal, setPdlTotal] = useState(0);
  const [pdlScrollToken, setPdlScrollToken] = useState<string | null>(null);
  const [pdlSearching, setPdlSearching] = useState(false);
  const [pdlImporting, setPdlImporting] = useState(false);
  const [pdlSelected, setPdlSelected] = useState<Set<string>>(new Set());
  const [pdlListName, setPdlListName] = useState("");
  const [pdlTitleRole, setPdlTitleRole] = useState("information technology");
  const [pdlTitleLevels, setPdlTitleLevels] = useState<string[]>(["director", "vp", "c_suite"]);
  const [pdlCountry, setPdlCountry] = useState("united states");
  const [pdlSizeMin, setPdlSizeMin] = useState("50");
  const [pdlSizeMax, setPdlSizeMax] = useState("500");
  const [pdlIndustry, setPdlIndustry] = useState("");
  const [pdlHunterConfigured, setPdlHunterConfigured] = useState<boolean | null>(null);

  async function checkPdlStatus() {
    try {
      const res = await fetch("/api/admin/campaigns/pdl");
      const data = await res.json();
      setPdlConfigured(data.pdl_configured && data.pdl_valid);
      setPdlHunterConfigured(data.hunter_configured);
    } catch { setPdlConfigured(false); }
  }

  async function searchPdl(scrollToken?: string) {
    setPdlSearching(true);
    try {
      const res = await fetch("/api/admin/campaigns/pdl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "search",
          job_title_role: pdlTitleRole || undefined,
          job_title_levels: pdlTitleLevels.length > 0 ? pdlTitleLevels : undefined,
          location_country: pdlCountry || undefined,
          company_size_min: pdlSizeMin ? Number(pdlSizeMin) : undefined,
          company_size_max: pdlSizeMax ? Number(pdlSizeMax) : undefined,
          industry: pdlIndustry || undefined,
          size: 10,
          scroll_token: scrollToken || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPdlResults(scrollToken ? [...pdlResults, ...(data.people || [])] : data.people || []);
        setPdlTotal(data.total || 0);
        setPdlScrollToken(data.scroll_token || null);
        if (!scrollToken) setPdlSelected(new Set());
      } else {
        toast.error(data.error || "Search failed");
      }
    } catch { toast.error("Search failed"); }
    finally { setPdlSearching(false); }
  }

  async function enrichAndImportPdl() {
    const selected = pdlResults.filter((p) => pdlSelected.has(p.id));
    if (selected.length === 0) { toast.error("Select leads to import"); return; }
    setPdlImporting(true);
    try {
      const res = await fetch("/api/admin/campaigns/pdl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enrich_and_import",
          prospects: selected.map((p) => ({
            first_name: p.first_name,
            last_name: p.last_name,
            company_domain: p.company_domain,
            company_name: p.company_name,
            job_title: p.job_title,
          })),
          list_name: pdlListName.trim() || `IT Leads ${new Date().toLocaleDateString()}`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.imported > 0) {
          toast.success(`Imported ${data.imported} contacts with emails${data.failed > 0 ? `. ${data.failed} had no email.` : ""}`);
        } else if (data.failed > 0) {
          toast.warning(`No emails found for ${data.failed} prospects. Hunter.io couldn't match their emails. List "${pdlListName.trim() || `IT Leads ${new Date().toLocaleDateString()}`}" was not created.`);
        } else {
          toast.info("No contacts to import");
        }
        setPdlSelected(new Set());
        loadAudienceLists();
      } else {
        toast.error(data.error || "Import failed");
      }
    } catch (err) { console.error("PDL import error:", err); toast.error("Import failed — check console"); }
    finally { setPdlImporting(false); }
  }

  async function checkHunterStatus() {
    try {
      const res = await fetch("/api/admin/campaigns/hunter");
      const data = await res.json();
      setHunterConfigured(data.configured && data.valid);
      if (data.credits_used !== undefined) setHunterCredits({ used: data.credits_used, available: data.credits_available });
    } catch { setHunterConfigured(false); }
  }

  async function searchHunter() {
    if (!hunterDomain && !hunterCompany) { toast.error("Enter a domain or company name"); return; }
    setHunterSearching(true);
    try {
      const res = await fetch("/api/admin/campaigns/hunter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "domain_search",
          domain: hunterDomain || undefined,
          company: hunterCompany || undefined,
          department: hunterDepartment !== "all" ? hunterDepartment : undefined,
          seniority: hunterSeniority !== "all" ? hunterSeniority : undefined,
          limit: 20,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setHunterResults(data.emails || []);
        setHunterTotalResults(data.total_results || 0);
        setHunterSelected(new Set());
      } else {
        toast.error(data.error || "Search failed");
      }
    } catch { toast.error("Search failed"); }
    finally { setHunterSearching(false); }
  }

  async function importHunterSelected() {
    const selected = hunterResults.filter((r) => hunterSelected.has(r.email));
    if (selected.length === 0) { toast.error("Select contacts to import"); return; }
    setHunterImporting(true);
    try {
      const res = await fetch("/api/admin/campaigns/hunter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import_results",
          contacts: selected.map((r) => ({
            email: r.email,
            first_name: r.first_name,
            last_name: r.last_name,
            company: hunterCompany || hunterDomain,
          })),
          list_name: hunterListName.trim() || `Hunter Import ${new Date().toLocaleDateString()}`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Imported ${data.imported} contacts`);
        setHunterSelected(new Set());
        loadAudienceLists();
      } else {
        toast.error(data.error || "Import failed");
      }
    } catch { toast.error("Import failed"); }
    finally { setHunterImporting(false); }
  }

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
    loadCustomTemplates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadCampaigns, loadSegments, loadExternalCount, loadAudienceLists]);

  // Poll for status updates when campaigns are in transitional states
  useEffect(() => {
    const transitional = campaigns.filter((c) =>
      (c.status === "queued" || c.status === "sending" || c.status === "scheduled") && c.resend_broadcast_id
    );
    if (transitional.length === 0) return;

    const interval = setInterval(async () => {
      try {
        // Sync each transitional campaign's status from Resend via analytics endpoint
        await Promise.all(
          transitional.map((c) =>
            fetch(`/api/admin/campaigns/${c.id}/analytics`).catch(() => null)
          )
        );
        // Then reload the full list to pick up any status changes
        const res = await fetch("/api/admin/campaigns");
        const data = await res.json();
        if (data.campaigns) {
          setCampaigns(data.campaigns);
          setEditingCampaign((prev) => {
            if (!prev) return prev;
            const updated = data.campaigns.find((c: Campaign) => c.id === prev.id);
            return updated ? { ...prev, ...updated } : prev;
          });
        }
      } catch { /* Polling failure is non-critical */ }
    }, 5000);

    return () => clearInterval(interval);
  }, [campaigns]);

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

  async function duplicateCampaign(c: Campaign) {
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${c.name} (copy)`,
          subject: c.subject,
          from_email: c.from_email,
          body_html: c.body_html,
          segment_name: c.segment_name,
        }),
      });
      if (!res.ok) throw new Error("Failed to duplicate");
      const data = await res.json();
      toast.success("Campaign duplicated");
      await loadCampaigns();
      openEditCampaign(data.campaign);
    } catch {
      toast.error("Failed to duplicate campaign");
    }
  }

  async function saveAsCustomTemplate() {
    const name = prompt("Template name:");
    if (!name?.trim()) return;
    try {
      const res = await fetch("/api/admin/campaigns/custom-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          subject: formSubject,
          body_html: formBody,
        }),
      });
      if (!res.ok) throw new Error("Failed to save template");
      toast.success(`Template "${name.trim()}" saved`);
      await loadCustomTemplates();
    } catch {
      toast.error("Failed to save template");
    }
  }

  async function loadCustomTemplates() {
    try {
      const res = await fetch("/api/admin/campaigns/custom-templates");
      if (res.ok) {
        const data = await res.json();
        setCustomTemplates(data.templates || []);
      }
    } catch { /* Non-critical */ }
  }

  async function deleteCustomTemplate(id: string) {
    try {
      await fetch("/api/admin/campaigns/custom-templates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
      toast.success("Template deleted");
    } catch {
      toast.error("Failed to delete template");
    }
  }

  async function sendTestEmail() {
    if (!testEmail.trim() || !formSubject.trim() || !formBody.trim()) {
      toast.error("Enter a test email and make sure subject and body are filled in");
      return;
    }
    setSendingTest(true);
    try {
      const res = await fetch("/api/admin/campaigns/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail.trim(),
          subject: formSubject,
          html: formBody,
          from: formFrom,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send test");
      }
      toast.success(`Test email sent to ${testEmail}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send test email");
    } finally {
      setSendingTest(false);
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
      setDeleteListConfirm(null);
      // If the deleted list was selected as the audience, reset to "all"
      if (formSegment === `list:${listId}`) setFormSegment("all");
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

  async function loadContacts(search?: string, listId?: string | null, page = 0) {
    setContactsLoading(true);
    try {
      const params = new URLSearchParams({ detail: "true", limit: "50", offset: String(page * 50) });
      if (search?.trim()) params.set("search", search.trim());
      if (listId) params.set("list_id", listId);
      const res = await fetch(`/api/admin/campaigns/contacts?${params}`);
      const data = await res.json();
      setContactsList(data.contacts || []);
      setContactsTotal(data.total || 0);
    } catch {
      toast.error("Failed to load contacts");
    } finally {
      setContactsLoading(false);
    }
  }

  async function createNewList() {
    if (!createListName.trim()) return;
    setCreatingList(true);
    try {
      const res = await fetch("/api/admin/campaigns/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createListName.trim(),
          description: createListDesc.trim(),
          add_all_contacts: createListAddAll,
        }),
      });
      if (!res.ok) throw new Error("Failed to create list");
      const data = await res.json();
      toast.success(`List "${data.list.name}" created with ${data.list.contact_count} contacts`);
      setShowCreateList(false);
      setCreateListName("");
      setCreateListDesc("");
      setCreateListAddAll(true);
      await Promise.all([loadSegments(), loadAudienceLists()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create list");
    } finally {
      setCreatingList(false);
    }
  }

  async function addContactsToList() {
    if (!addToListId) return;
    setAddingToList(true);
    try {
      if (addContactMode === "manual") {
        // Manual mode: create contacts first via the contacts import endpoint, then add to list
        const validContacts = manualContacts.filter((c) => c.email.trim());
        if (validContacts.length === 0) {
          toast.error("Enter at least one email address");
          setAddingToList(false);
          return;
        }
        // Import contacts (upserts by email)
        const importRes = await fetch("/api/admin/campaigns/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contacts: validContacts }),
        });
        const importData = await importRes.json();
        if (!importRes.ok) throw new Error(importData.error);
        // Now add those emails to the list
        const res = await fetch("/api/admin/campaigns/lists", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ list_id: addToListId, emails: validContacts.map((c) => c.email.trim()) }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        toast.success(`Added ${data.added} contacts (${data.total} total in list)`);
      } else {
        // Paste mode (existing behavior)
        const payload: Record<string, unknown> = { list_id: addToListId };
        if (addToListEmails.trim()) {
          // Check if pasted data has CSV-like structure (commas with names)
          const lines = addToListEmails.split(/\n/).map((l) => l.trim()).filter(Boolean);
          const hasStructure = lines.some((l) => l.includes(",") || l.includes("\t"));
          if (hasStructure) {
            // Parse as structured data: email, first_name, last_name, company
            const contacts = lines.map((line) => {
              const parts = line.split(/[,\t]+/).map((p) => p.trim());
              return {
                email: parts[0] || "",
                first_name: parts[1] || "",
                last_name: parts[2] || "",
                company: parts[3] || "",
              };
            }).filter((c) => c.email);
            if (contacts.some((c) => c.first_name || c.last_name || c.company)) {
              // Has extra fields — import as full contacts first
              const importRes = await fetch("/api/admin/campaigns/contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contacts }),
              });
              if (!importRes.ok) {
                const err = await importRes.json();
                throw new Error(err.error);
              }
            }
            payload.emails = contacts.map((c) => c.email);
          } else {
            payload.emails = lines.filter((e) => e.includes("@"));
          }
        } else {
          payload.add_all = true;
        }
        const res = await fetch("/api/admin/campaigns/lists", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        toast.success(`Added ${data.added} contacts (${data.total} total in list)`);
      }
      const addedListId = addToListId;
      setAddToListId(null);
      setAddToListEmails("");
      setManualContacts([{ email: "", first_name: "", last_name: "", company: "" }]);
      setAddContactMode("paste");
      await Promise.all([loadSegments(), loadAudienceLists()]);
      // Refresh contacts list if we're viewing the list we just added to (or any list)
      if (viewingListId === addedListId || viewingListId) {
        setContactsPage(0);
        loadContacts("", viewingListId, 0);
      } else if (contactsList.length > 0) {
        // Also refresh if contacts table is visible
        setContactsPage(0);
        loadContacts("", null, 0);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add contacts");
    } finally {
      setAddingToList(false);
    }
  }

  function exportContactsCsv() {
    if (contactsList.length === 0) return;
    const header = "email,first_name,last_name,company,unsubscribed";
    const rows = contactsList.map((c) =>
      [c.email, c.first_name, c.last_name, c.company, c.unsubscribed].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
            <Button variant="outline" size="sm" onClick={saveAsCustomTemplate} disabled={!formBody.trim()} title="Save as reusable template">
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save Template
            </Button>
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
                  <Tabs value={editorTab} onValueChange={(val) => setEditorTab(val as "fields" | "visual" | "preview" | "html")}>
                    <TabsList className="h-7">
                      {activeTemplate && (
                        <TabsTrigger value="fields" className="text-xs px-2 h-5">Fields</TabsTrigger>
                      )}
                      <TabsTrigger value="visual" className="text-xs px-2 h-5">Visual</TabsTrigger>
                      <TabsTrigger value="preview" className="text-xs px-2 h-5">Preview</TabsTrigger>
                      <TabsTrigger value="html" className="text-xs px-2 h-5">HTML</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              {editorTab === "fields" && activeTemplate ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {/* Variable insert buttons for single-field templates */}
                  {activeTemplate.fields.length === 1 && activeTemplate.fields[0].type === "textarea" && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-muted-foreground uppercase font-medium">Insert:</span>
                      {[
                        { label: "First Name", value: "{{{FIRST_NAME|there}}}" },
                        { label: "Last Name", value: "{{{LAST_NAME}}}" },
                        { label: "Company", value: "{{{COMPANY|your team}}}" },
                      ].map((variable) => (
                        <Button
                          key={variable.label}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-[11px] px-2"
                          onClick={() => {
                            const field = activeTemplate.fields[0];
                            const el = document.getElementById(`field-${field.key}`) as HTMLTextAreaElement | null;
                            if (el) {
                              const start = el.selectionStart;
                              const end = el.selectionEnd;
                              const current = fieldValues[field.key] || "";
                              const updated = current.slice(0, start) + variable.value + current.slice(end);
                              updateFieldValue(field.key, updated);
                              setTimeout(() => { el.focus(); el.selectionStart = el.selectionEnd = start + variable.value.length; }, 0);
                            } else {
                              updateFieldValue(field.key, (fieldValues[field.key] || "") + variable.value);
                            }
                          }}
                        >
                          {variable.label}
                        </Button>
                      ))}
                    </div>
                  )}
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
                          className={`mt-1 text-sm ${activeTemplate.fields.length === 1 ? "min-h-[350px] font-mono text-xs leading-relaxed" : "min-h-[80px]"}`}
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
              ) : editorTab === "visual" ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1 border rounded-md p-1 bg-muted/30">
                    {[
                      { cmd: "bold", icon: "B", title: "Bold", cls: "font-bold" },
                      { cmd: "italic", icon: "I", title: "Italic", cls: "italic" },
                      { cmd: "underline", icon: "U", title: "Underline", cls: "underline" },
                      { cmd: "insertUnorderedList", icon: "\u2022", title: "Bullet list", cls: "" },
                      { cmd: "insertOrderedList", icon: "1.", title: "Numbered list", cls: "" },
                    ].map((btn) => (
                      <button
                        key={btn.cmd}
                        type="button"
                        title={btn.title}
                        className={`h-7 w-7 rounded text-xs hover:bg-accent flex items-center justify-center ${btn.cls}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          document.execCommand(btn.cmd, false);
                        }}
                      >
                        {btn.icon}
                      </button>
                    ))}
                    <div className="h-5 w-px bg-border mx-1" />
                    <button
                      type="button"
                      title="Add link"
                      className="h-7 px-2 rounded text-xs hover:bg-accent flex items-center justify-center"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const url = prompt("Enter URL:");
                        if (url) document.execCommand("createLink", false, url);
                      }}
                    >
                      Link
                    </button>
                    <button
                      type="button"
                      title="Remove formatting"
                      className="h-7 px-2 rounded text-xs hover:bg-accent flex items-center justify-center text-muted-foreground"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        document.execCommand("removeFormat", false);
                      }}
                    >
                      Clear
                    </button>
                  </div>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="border rounded-lg bg-white min-h-[400px] p-4 prose prose-sm max-w-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                    dangerouslySetInnerHTML={{ __html: formBody }}
                    onBlur={(e) => setFormBody(e.currentTarget.innerHTML)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Edit text directly. Changes save when you click away. Switch to HTML for full control.
                  </p>
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

              <div className="text-xs text-muted-foreground space-y-1">
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
                            onClick={() => setDeleteListConfirm(list.id)}
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
            <div className="border-t pt-4 mt-2">
              <p className="text-sm font-medium mb-2">Send a test email</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={sendTestEmail}
                  disabled={sendingTest || !testEmail.trim() || !formBody.trim()}
                  size="sm"
                >
                  {sendingTest && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Send Test
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Subject will be prefixed with [TEST]
              </p>
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
            {/* Saved custom templates */}
            {customTemplates.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Saved Templates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {customTemplates.map((ct) => (
                    <Card
                      key={ct.id}
                      className="p-3 cursor-pointer hover:ring-2 hover:ring-green-500 transition-all group relative"
                      onClick={() => {
                        setFormSubject(ct.subject || "");
                        setFormBody(ct.body_html);
                        setActiveTemplate(null);
                        setFieldValues({});
                        setEditorTab(ct.body_html ? "preview" : "html");
                        setShowTemplates(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                          <Save className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm">{ct.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{ct.subject || "(no subject)"}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">Saved {timeAgo(ct.created_at)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 absolute top-2 right-2"
                          onClick={(e) => { e.stopPropagation(); deleteCustomTemplate(ct.id); }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Built-in templates */}
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
                          onClick={() => setDeleteListConfirm(list.id)}
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

        {/* Delete Audience List Confirmation */}
        <Dialog open={!!deleteListConfirm} onOpenChange={() => setDeleteListConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Audience List?</DialogTitle>
              <DialogDescription>
                This will remove the list. The contacts themselves will not be deleted.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteListConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteListConfirm && deleteAudienceList(deleteListConfirm)}
              >
                Delete List
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
          <Button variant="outline" size="sm" onClick={() => { loadCampaigns(); loadAudienceLists(); }} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {listTab === "campaigns" && (
            <Button size="sm" onClick={openNewCampaign}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Campaign
            </Button>
          )}
          {listTab === "audiences" && (
            <Button size="sm" onClick={() => setShowImport(true)}>
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Import Contacts
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={listTab} onValueChange={(v) => { setListTab(v as ListTab); if (v === "audiences" && contactsList.length === 0 && externalCount > 0) loadContacts(); }}>
        <TabsList>
          <TabsTrigger value="campaigns" className="gap-1.5">
            <Megaphone className="h-3.5 w-3.5" />
            Campaigns
            {campaigns.length > 0 && (
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-none">
                {campaigns.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="audiences" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Audiences
            {(audienceLists.length + segments.length) > 0 && (
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium leading-none">
                {audienceLists.length + segments.filter((s) => !s.type).length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="prospecting" className="gap-1.5" onClick={() => { if (pdlConfigured === null) checkPdlStatus(); }}>
            <Search className="h-3.5 w-3.5" />
            Prospecting
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {listTab === "campaigns" ? (
        <>
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
              {/* Analytics Overview */}
              {sent.length > 0 && (() => {
                const totalSent = sent.reduce((s, c) => s + c.recipient_count, 0);
                const totalOpens = sent.reduce((s, c) => s + (c.opens || 0), 0);
                const totalClicks = sent.reduce((s, c) => s + (c.clicks || 0), 0);
                const totalBounces = sent.reduce((s, c) => s + (c.bounces || 0), 0);
                const totalUnsubs = sent.reduce((s, c) => s + (c.unsubscribes || 0), 0);
                const openRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : "0";
                const clickRate = totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(1) : "0";
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <Card className="p-3 text-center">
                      <Send className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                      <p className="text-lg font-bold">{totalSent.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">Total Sent</p>
                    </Card>
                    <Card className="p-3 text-center">
                      <MailOpen className="h-4 w-4 text-green-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-green-700">{openRate}%</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">Open Rate</p>
                      <p className="text-[10px] text-muted-foreground">{totalOpens.toLocaleString()} opens</p>
                    </Card>
                    <Card className="p-3 text-center">
                      <MousePointerClick className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-purple-700">{clickRate}%</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">Click Rate</p>
                      <p className="text-[10px] text-muted-foreground">{totalClicks.toLocaleString()} clicks</p>
                    </Card>
                    <Card className="p-3 text-center">
                      <AlertCircle className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-amber-600">{totalBounces}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">Bounces</p>
                    </Card>
                    <Card className="p-3 text-center">
                      <Ban className="h-4 w-4 text-red-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-red-600">{totalUnsubs}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">Unsubscribes</p>
                    </Card>
                  </div>
                );
              })()}

              {/* Drafts */}
              {drafts.length > 0 && (
                <CampaignSection
                  title="Drafts"
                  campaigns={drafts}
                  onEdit={openEditCampaign}
                  onDelete={(id) => setShowDeleteConfirm(id)}
                  onDuplicate={duplicateCampaign}
                />
              )}

              {/* Scheduled */}
              {scheduled.length > 0 && (
                <CampaignSection
                  title="Scheduled"
                  campaigns={scheduled}
                  onEdit={openEditCampaign}
                  onDuplicate={duplicateCampaign}
                />
              )}

              {/* Sent */}
              {sent.length > 0 && (
                <CampaignSection
                  title="Sent"
                  campaigns={sent}
                  onEdit={openEditCampaign}
                  onDuplicate={duplicateCampaign}
                />
              )}
            </div>
          )}
        </>
      ) : listTab === "audiences" ? (
        /* ─── Audiences Tab ─── */
        <div className="space-y-6">
          {/* Built-in segments */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {segments.filter((s) => !s.type).map((seg) => (
              <Card key={seg.name} className="p-3 text-center">
                <p className="text-lg font-bold">{seg.count.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-medium">{seg.label.replace(/ \(.*\)/, "")}</p>
              </Card>
            ))}
            <Card className="p-3 text-center">
              <p className="text-lg font-bold">{audienceLists.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-medium">Custom Lists</p>
            </Card>
          </div>

          {/* Audience lists */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Audience Lists ({audienceLists.length})
              </h2>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowCreateList(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Create List
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowImport(true)}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Import CSV
                </Button>
              </div>
            </div>
            {audienceLists.length > 3 && (
              <div className="flex items-center gap-2 mb-3">
                <Input
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                  placeholder="Search lists..."
                  className="h-8 text-xs max-w-xs"
                />
                <Select value={listSort} onValueChange={(v) => setListSort(v as typeof listSort)}>
                  <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest first</SelectItem>
                    <SelectItem value="oldest">Oldest first</SelectItem>
                    <SelectItem value="name_asc">Name A-Z</SelectItem>
                    <SelectItem value="name_desc">Name Z-A</SelectItem>
                    <SelectItem value="contacts_desc">Most contacts</SelectItem>
                    <SelectItem value="contacts_asc">Fewest contacts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {audienceLists.length === 0 ? (
              <Card className="flex flex-col items-center justify-center py-10 text-center">
                <List className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="font-semibold text-sm mb-1">No audience lists yet</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {externalCount > 0
                    ? `You have ${externalCount} contacts — create a list to organize them`
                    : "Import contacts or create an empty list to get started"}
                </p>
                {externalCount > 0 && (
                  <Button size="sm" onClick={() => { setCreateListAddAll(true); setShowCreateList(true); }}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Create List from {externalCount} Contacts
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-2">
                {audienceLists
                  .filter((l) => !listSearch || l.name.toLowerCase().includes(listSearch.toLowerCase()) || (l.description && l.description.toLowerCase().includes(listSearch.toLowerCase())))
                  .sort((a, b) => {
                    switch (listSort) {
                      case "newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                      case "oldest": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                      case "name_asc": return a.name.localeCompare(b.name);
                      case "name_desc": return b.name.localeCompare(a.name);
                      case "contacts_desc": return b.contact_count - a.contact_count;
                      case "contacts_asc": return a.contact_count - b.contact_count;
                      default: return 0;
                    }
                  })
                  .map((list) => (
                  <Card
                    key={list.id}
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${viewingListId === list.id ? "ring-2 ring-primary/50" : ""}`}
                    onClick={() => {
                      if (viewingListId === list.id) { setViewingListId(null); setContactsList([]); }
                      else { setViewingListId(list.id); setContactsSearch(""); setContactsPage(0); loadContacts("", list.id); }
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <List className="h-4 w-4 text-muted-foreground shrink-0" />
                          <h3 className="font-medium text-sm truncate">{list.name}</h3>
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            {list.contact_count} contact{list.contact_count !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        {list.description && (
                          <p className="text-xs text-muted-foreground mt-1 ml-6">{list.description}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1 ml-6">
                          Created {timeAgo(list.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setAddToListId(list.id)} title="Add contacts to list">
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditList(list)} title="Edit list">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => setDeleteListConfirm(list.id)} title="Delete list">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Contacts Browser */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {viewingListId
                  ? `Contacts in "${audienceLists.find((l) => l.id === viewingListId)?.name || "List"}"`
                  : "All External Contacts"}
              </h2>
              <div className="flex items-center gap-2">
                {viewingListId && (
                  <Button size="sm" variant="ghost" onClick={() => { setViewingListId(null); setContactsList([]); }}>
                    View All
                  </Button>
                )}
                {!contactsLoading && contactsList.length === 0 && !contactsSearch && !viewingListId && (
                  <Button size="sm" variant="outline" onClick={() => { setContactsPage(0); loadContacts(); }}>
                    Load Contacts
                  </Button>
                )}
                {contactsList.length > 0 && (
                  <Button size="sm" variant="outline" onClick={exportContactsCsv}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Export
                  </Button>
                )}
              </div>
            </div>

            {(contactsList.length > 0 || contactsSearch || viewingListId) && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search by email, name, or company..."
                      value={contactsSearch}
                      onChange={(e) => setContactsSearch(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { setContactsPage(0); loadContacts(contactsSearch, viewingListId); } }}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                  <Button size="sm" variant="outline" className="h-8" onClick={() => { setContactsPage(0); loadContacts(contactsSearch, viewingListId); }}>
                    Search
                  </Button>
                </div>

                {contactsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : contactsList.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {contactsSearch ? "No contacts match your search" : "No contacts found"}
                  </p>
                ) : (
                  <>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50 border-b">
                            <th className="text-left p-2.5 font-medium text-muted-foreground">Email</th>
                            <th className="text-left p-2.5 font-medium text-muted-foreground">Name</th>
                            <th className="text-left p-2.5 font-medium text-muted-foreground">Company</th>
                            <th className="text-left p-2.5 font-medium text-muted-foreground">Status</th>
                            <th className="text-left p-2.5 font-medium text-muted-foreground">Added</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contactsList.map((c) => (
                            <tr key={c.id} className="border-b last:border-b-0">
                              <td className="p-2.5 font-mono text-xs">{c.email}</td>
                              <td className="p-2.5">{[c.first_name, c.last_name].filter(Boolean).join(" ") || <span className="text-muted-foreground">&mdash;</span>}</td>
                              <td className="p-2.5">{c.company || <span className="text-muted-foreground">&mdash;</span>}</td>
                              <td className="p-2.5">
                                {c.unsubscribed
                                  ? <Badge variant="outline" className="text-[10px] text-red-600">Unsubscribed</Badge>
                                  : <Badge variant="outline" className="text-[10px] text-green-600">Active</Badge>}
                              </td>
                              <td className="p-2.5 text-muted-foreground text-xs">{timeAgo(c.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {contactsPage * 50 + 1}&ndash;{Math.min((contactsPage + 1) * 50, contactsTotal)} of {contactsTotal.toLocaleString()}
                      </p>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="h-7" disabled={contactsPage === 0} onClick={() => { setContactsPage(contactsPage - 1); loadContacts(contactsSearch, viewingListId, contactsPage - 1); }}>
                          Prev
                        </Button>
                        <Button variant="outline" size="sm" className="h-7" disabled={(contactsPage + 1) * 50 >= contactsTotal} onClick={() => { setContactsPage(contactsPage + 1); loadContacts(contactsSearch, viewingListId, contactsPage + 1); }}>
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      ) : listTab === "prospecting" ? (
        /* ─── Prospecting Tab ─── */
        <div className="space-y-4">
          {/* Provider Switcher */}
          <div className="flex items-center gap-2">
            <Badge
              variant={prospectProvider === "pdl" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => { setProspectProvider("pdl"); if (pdlConfigured === null) checkPdlStatus(); }}
            >
              Find Leads (PDL)
            </Badge>
            <Badge
              variant={prospectProvider === "hunter" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => { setProspectProvider("hunter"); if (hunterConfigured === null) checkHunterStatus(); }}
            >
              Company Emails (Hunter)
            </Badge>
            <Badge
              variant={prospectProvider === "apollo" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => { setProspectProvider("apollo"); if (apolloConfigured === null) checkApolloStatus(); }}
            >
              Apollo.io
            </Badge>
            {prospectProvider === "hunter" && hunterCredits && (
              <span className="text-xs text-muted-foreground ml-2">
                {hunterCredits.available - hunterCredits.used} credits remaining
              </span>
            )}
          </div>

          {/* ── PDL Panel — Find IT Leads ── */}
          {prospectProvider === "pdl" && (
            <>
              {pdlConfigured === false ? (
                <Card className="flex flex-col items-center justify-center py-16 text-center p-6">
                  <Users className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="font-semibold mb-1">People Data Labs Not Configured</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Add <code className="bg-muted px-1.5 py-0.5 rounded text-xs">PDL_API_KEY</code> to your environment variables.
                  </p>
                  <p className="text-xs text-muted-foreground">Free: 100 leads/month. Sign up at peopledatalabs.com</p>
                  {!pdlHunterConfigured && (
                    <p className="text-xs text-amber-600 mt-2">Also add <code className="bg-muted px-1.5 py-0.5 rounded text-xs">HUNTER_API_KEY</code> for email enrichment (50 free/month)</p>
                  )}
                </Card>
              ) : (
                <>
                  <Card className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold">Find IT Leads</h3>
                        <p className="text-xs text-muted-foreground">PDL finds people → Hunter.io gets their emails → imported to your campaign list</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">1 credit per lead found</Badge>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs">Department / Role</Label>
                        <Select value={pdlTitleRole} onValueChange={setPdlTitleRole}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="information technology">Information Technology</SelectItem>
                            <SelectItem value="engineering">Engineering</SelectItem>
                            <SelectItem value="operations">Operations</SelectItem>
                            <SelectItem value="executive">Executive</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="human resources">Human Resources</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Country</Label>
                        <Select value={pdlCountry} onValueChange={setPdlCountry}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="united states">United States</SelectItem>
                            <SelectItem value="united kingdom">United Kingdom</SelectItem>
                            <SelectItem value="canada">Canada</SelectItem>
                            <SelectItem value="australia">Australia</SelectItem>
                            <SelectItem value="germany">Germany</SelectItem>
                            <SelectItem value="france">France</SelectItem>
                            <SelectItem value="india">India</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Company Size (employees)</Label>
                        <div className="flex gap-2 mt-1">
                          <Input value={pdlSizeMin} onChange={(e) => setPdlSizeMin(e.target.value)} placeholder="Min" className="w-20" />
                          <span className="self-center text-xs text-muted-foreground">to</span>
                          <Input value={pdlSizeMax} onChange={(e) => setPdlSizeMax(e.target.value)} placeholder="Max" className="w-20" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Industry (optional)</Label>
                        <Input value={pdlIndustry} onChange={(e) => setPdlIndustry(e.target.value)} placeholder="computer software, consulting..." className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Seniority Level</Label>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {[
                          { value: "c_suite", label: "C-Suite" },
                          { value: "vp", label: "VP" },
                          { value: "director", label: "Director" },
                          { value: "owner", label: "Owner" },
                          { value: "manager", label: "Manager" },
                          { value: "senior", label: "Senior" },
                        ].map((s) => (
                          <Badge
                            key={s.value}
                            variant={pdlTitleLevels.includes(s.value) ? "default" : "outline"}
                            className="cursor-pointer text-[10px]"
                            onClick={() => setPdlTitleLevels((prev) =>
                              prev.includes(s.value) ? prev.filter((v) => v !== s.value) : [...prev, s.value]
                            )}
                          >
                            {s.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => searchPdl()} disabled={pdlSearching}>
                      {pdlSearching ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Search className="h-3.5 w-3.5 mr-1.5" />}
                      Find Leads
                    </Button>
                  </Card>

                  {/* Results */}
                  {pdlResults.length > 0 && (
                    <Card className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">{pdlTotal.toLocaleString()} leads match</h3>
                        <div className="flex items-center gap-2">
                          <Input value={pdlListName} onChange={(e) => setPdlListName(e.target.value)} placeholder="List name (optional)" className="w-48 h-8 text-xs" />
                          <Button size="sm" onClick={enrichAndImportPdl} disabled={pdlImporting || pdlSelected.size === 0}>
                            {pdlImporting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
                            Enrich + Import {pdlSelected.size > 0 ? `(${pdlSelected.size})` : ""}
                          </Button>
                        </div>
                      </div>
                      {!pdlHunterConfigured && (
                        <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded p-2">
                          Add HUNTER_API_KEY to enrich leads with verified emails. Without it, leads import without email addresses.
                        </p>
                      )}
                      <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="p-2 w-8">
                                <input type="checkbox" checked={pdlSelected.size === pdlResults.length && pdlResults.length > 0} onChange={(e) => { if (e.target.checked) setPdlSelected(new Set(pdlResults.map((p) => p.id))); else setPdlSelected(new Set()); }} className="rounded" />
                              </th>
                              <th className="p-2 text-left text-xs font-medium">Name</th>
                              <th className="p-2 text-left text-xs font-medium">Title</th>
                              <th className="p-2 text-left text-xs font-medium">Company</th>
                              <th className="p-2 text-left text-xs font-medium">Location</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pdlResults.map((p) => (
                              <tr key={p.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => setPdlSelected((prev) => { const next = new Set(prev); if (next.has(p.id)) next.delete(p.id); else next.add(p.id); return next; })}>
                                <td className="p-2"><input type="checkbox" checked={pdlSelected.has(p.id)} onChange={() => {}} className="rounded" /></td>
                                <td className="p-2">
                                  {p.linkedin_url ? (
                                    <a href={p.linkedin_url.startsWith("http") ? p.linkedin_url : `https://${p.linkedin_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium text-xs" onClick={(e) => e.stopPropagation()}>
                                      {p.full_name}
                                    </a>
                                  ) : (
                                    <span className="font-medium text-xs">{p.full_name}</span>
                                  )}
                                </td>
                                <td className="p-2 text-xs text-muted-foreground">{p.job_title}</td>
                                <td className="p-2 text-xs">
                                  <div>{p.company_name}</div>
                                  <span className="text-muted-foreground">{p.company_size}{p.company_industry ? ` · ${p.company_industry}` : ""}</span>
                                </td>
                                <td className="p-2 text-xs text-muted-foreground">
                                  {[p.location_locality, p.location_region, p.location_country].filter(Boolean).join(", ")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {pdlScrollToken && (
                        <Button size="sm" variant="outline" onClick={() => searchPdl(pdlScrollToken)} disabled={pdlSearching}>
                          {pdlSearching ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
                          Load More
                        </Button>
                      )}
                    </Card>
                  )}

                  {pdlResults.length === 0 && !pdlSearching && pdlConfigured && (
                    <Card className="flex flex-col items-center justify-center py-16 text-center">
                      <Users className="h-10 w-10 text-muted-foreground mb-3" />
                      <h3 className="font-semibold mb-1">Discover IT Decision Makers</h3>
                      <p className="text-sm text-muted-foreground">Set your ideal customer profile above and click Find Leads.<br/>PDL searches 1.5B+ profiles to match your criteria.</p>
                    </Card>
                  )}
                </>
              )}
            </>
          )}

          {/* ── Hunter.io Panel ── */}
          {prospectProvider === "hunter" && (
            <>
              {hunterConfigured === false ? (
                <Card className="flex flex-col items-center justify-center py-16 text-center p-6">
                  <Search className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="font-semibold mb-1">Hunter.io Not Configured</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Add <code className="bg-muted px-1.5 py-0.5 rounded text-xs">HUNTER_API_KEY</code> to your environment variables.
                  </p>
                  <p className="text-xs text-muted-foreground">Free: 50 credits/month. Get your key at hunter.io/api</p>
                </Card>
              ) : (
                <>
                  <Card className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Search Company Contacts</h3>
                      <Badge variant="outline" className="text-[10px]">Hunter.io — 1 credit per search</Badge>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs">Company Domain</Label>
                        <Input value={hunterDomain} onChange={(e) => setHunterDomain(e.target.value)} placeholder="stripe.com" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Or Company Name</Label>
                        <Input value={hunterCompany} onChange={(e) => setHunterCompany(e.target.value)} placeholder="Stripe" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Department</Label>
                        <Select value={hunterDepartment} onValueChange={setHunterDepartment}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="executive">Executive</SelectItem>
                            <SelectItem value="it">IT</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="hr">HR</SelectItem>
                            <SelectItem value="engineering">Engineering</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Seniority</Label>
                        <Select value={hunterSeniority} onValueChange={setHunterSeniority}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="executive">Executive</SelectItem>
                            <SelectItem value="senior">Senior</SelectItem>
                            <SelectItem value="junior">Junior</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button size="sm" onClick={searchHunter} disabled={hunterSearching}>
                      {hunterSearching ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Search className="h-3.5 w-3.5 mr-1.5" />}
                      Search Hunter.io
                    </Button>
                  </Card>

                  {hunterResults.length > 0 && (
                    <Card className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">{hunterTotalResults} emails found</h3>
                        <div className="flex items-center gap-2">
                          <Input value={hunterListName} onChange={(e) => setHunterListName(e.target.value)} placeholder="List name (optional)" className="w-48 h-8 text-xs" />
                          <Button size="sm" onClick={importHunterSelected} disabled={hunterImporting || hunterSelected.size === 0}>
                            {hunterImporting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
                            Import {hunterSelected.size > 0 ? `(${hunterSelected.size})` : "Selected"}
                          </Button>
                        </div>
                      </div>
                      <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="p-2 w-8">
                                <input type="checkbox" checked={hunterSelected.size === hunterResults.length && hunterResults.length > 0} onChange={(e) => { if (e.target.checked) setHunterSelected(new Set(hunterResults.map((r) => r.email))); else setHunterSelected(new Set()); }} className="rounded" />
                              </th>
                              <th className="p-2 text-left text-xs font-medium">Email</th>
                              <th className="p-2 text-left text-xs font-medium">Name</th>
                              <th className="p-2 text-left text-xs font-medium">Position</th>
                              <th className="p-2 text-left text-xs font-medium">Confidence</th>
                            </tr>
                          </thead>
                          <tbody>
                            {hunterResults.map((r) => (
                              <tr key={r.email} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => setHunterSelected((prev) => { const next = new Set(prev); if (next.has(r.email)) next.delete(r.email); else next.add(r.email); return next; })}>
                                <td className="p-2"><input type="checkbox" checked={hunterSelected.has(r.email)} onChange={() => {}} className="rounded" /></td>
                                <td className="p-2 font-mono text-xs">{r.email}</td>
                                <td className="p-2 text-xs">{[r.first_name, r.last_name].filter(Boolean).join(" ") || "—"}</td>
                                <td className="p-2 text-xs text-muted-foreground">{r.position || "—"}</td>
                                <td className="p-2">
                                  <Badge variant={r.confidence >= 80 ? "default" : r.confidence >= 50 ? "secondary" : "outline"} className="text-[10px]">
                                    {r.confidence}%{r.verified && " ✓"}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}

                  {hunterResults.length === 0 && !hunterSearching && hunterConfigured && (
                    <Card className="flex flex-col items-center justify-center py-16 text-center">
                      <Search className="h-10 w-10 text-muted-foreground mb-3" />
                      <h3 className="font-semibold mb-1">Find Emails by Company</h3>
                      <p className="text-sm text-muted-foreground">Enter a company domain above to find IT leads with verified emails.</p>
                    </Card>
                  )}
                </>
              )}
            </>
          )}

          {/* ── Apollo Panel ── */}
          {prospectProvider === "apollo" && (apolloConfigured === false ? (
            <Card className="flex flex-col items-center justify-center py-16 text-center p-6">
              <Search className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">Apollo.io Not Configured</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Add <code className="bg-muted px-1.5 py-0.5 rounded text-xs">APOLLO_API_KEY</code> to your environment variables.
              </p>
              <p className="text-xs text-muted-foreground">Requires paid plan ($49/mo+). Use Hunter.io for free access.</p>
            </Card>
          ) : (
            <>
              {/* Search Filters */}
              <Card className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Search Prospects</h3>
                  <Badge variant="outline" className="text-[10px]">Apollo.io</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">Job Titles (comma-separated)</Label>
                    <Input
                      value={apolloTitles}
                      onChange={(e) => setApolloTitles(e.target.value)}
                      placeholder="IT Director, CISO, CTO..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Keywords</Label>
                    <Input
                      value={apolloKeywords}
                      onChange={(e) => setApolloKeywords(e.target.value)}
                      placeholder="AI governance, cybersecurity..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Locations (comma-separated)</Label>
                    <Input
                      value={apolloLocations}
                      onChange={(e) => setApolloLocations(e.target.value)}
                      placeholder="United States, United Kingdom..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Company Size</Label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000"].map((range) => (
                        <Badge
                          key={range}
                          variant={apolloEmployeeRanges.includes(range) ? "default" : "outline"}
                          className="cursor-pointer text-[10px]"
                          onClick={() => setApolloEmployeeRanges((prev) =>
                            prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
                          )}
                        >
                          {range}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Seniority</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { value: "c_suite", label: "C-Suite" },
                      { value: "vp", label: "VP" },
                      { value: "director", label: "Director" },
                      { value: "owner", label: "Owner" },
                      { value: "manager", label: "Manager" },
                    ].map((s) => (
                      <Badge
                        key={s.value}
                        variant={apolloSeniorities.includes(s.value) ? "default" : "outline"}
                        className="cursor-pointer text-[10px]"
                        onClick={() => setApolloSeniorities((prev) =>
                          prev.includes(s.value) ? prev.filter((v) => v !== s.value) : [...prev, s.value]
                        )}
                      >
                        {s.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button size="sm" onClick={() => searchApollo(1)} disabled={apolloSearching}>
                  {apolloSearching ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Search className="h-3.5 w-3.5 mr-1.5" />}
                  Search Apollo
                </Button>
              </Card>

              {/* Results */}
              {apolloResults.length > 0 && (
                <Card className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                      Results ({apolloPagination.total_entries.toLocaleString()} found)
                    </h3>
                    <div className="flex items-center gap-2">
                      <Input
                        value={apolloListName}
                        onChange={(e) => setApolloListName(e.target.value)}
                        placeholder="List name (optional)"
                        className="w-48 h-8 text-xs"
                      />
                      <Button
                        size="sm"
                        onClick={importApolloSelected}
                        disabled={apolloImporting || apolloSelected.size === 0}
                      >
                        {apolloImporting ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
                        Import {apolloSelected.size > 0 ? `(${apolloSelected.size})` : "Selected"}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="p-2 text-left w-8">
                            <input
                              type="checkbox"
                              checked={apolloSelected.size === apolloResults.length && apolloResults.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) setApolloSelected(new Set(apolloResults.map((p) => p.apollo_id)));
                                else setApolloSelected(new Set());
                              }}
                              className="rounded"
                            />
                          </th>
                          <th className="p-2 text-left text-xs font-medium">Name</th>
                          <th className="p-2 text-left text-xs font-medium">Title</th>
                          <th className="p-2 text-left text-xs font-medium">Company</th>
                          <th className="p-2 text-left text-xs font-medium">Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apolloResults.map((p) => (
                          <tr
                            key={p.apollo_id}
                            className="border-t hover:bg-muted/30 cursor-pointer"
                            onClick={() => setApolloSelected((prev) => {
                              const next = new Set(prev);
                              if (next.has(p.apollo_id)) next.delete(p.apollo_id); else next.add(p.apollo_id);
                              return next;
                            })}
                          >
                            <td className="p-2">
                              <input
                                type="checkbox"
                                checked={apolloSelected.has(p.apollo_id)}
                                onChange={() => {}}
                                className="rounded"
                              />
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                {p.linkedin_url ? (
                                  <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                                    {p.first_name} {p.last_name}
                                  </a>
                                ) : (
                                  <span className="font-medium">{p.first_name} {p.last_name}</span>
                                )}
                              </div>
                            </td>
                            <td className="p-2 text-xs text-muted-foreground">{p.title}</td>
                            <td className="p-2 text-xs">
                              <div>{p.organization_name}</div>
                              {p.organization_size && (
                                <span className="text-muted-foreground">{p.organization_size} emp</span>
                              )}
                            </td>
                            <td className="p-2 text-xs text-muted-foreground">
                              {[p.city, p.state, p.country].filter(Boolean).join(", ")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {apolloPagination.total_pages > 1 && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Page {apolloPagination.page} of {apolloPagination.total_pages}
                      </p>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={apolloPagination.page <= 1 || apolloSearching}
                          onClick={() => searchApollo(apolloPagination.page - 1)}
                        >
                          Previous
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={apolloPagination.page >= apolloPagination.total_pages || apolloSearching}
                          onClick={() => searchApollo(apolloPagination.page + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              )}

              {/* Empty state after search */}
              {apolloResults.length === 0 && !apolloSearching && apolloPagination.total_entries === 0 && apolloConfigured && (
                <Card className="flex flex-col items-center justify-center py-16 text-center">
                  <Search className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="font-semibold mb-1">Find IT Leads</h3>
                  <p className="text-sm text-muted-foreground">
                    Search Apollo&apos;s database of 275M+ contacts. Adjust filters above and click Search.
                  </p>
                </Card>
              )}
            </>
          ))}
        </div>
      ) : (
        /* ─── Analytics Tab ─── */
        <div className="space-y-6">
          {sent.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-20 text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">No campaign data yet</h3>
              <p className="text-sm text-muted-foreground">
                Send your first campaign to see analytics here
              </p>
            </Card>
          ) : (() => {
            const totalSent = sent.reduce((s, c) => s + c.recipient_count, 0);
            const totalOpens = sent.reduce((s, c) => s + (c.opens || 0), 0);
            const totalClicks = sent.reduce((s, c) => s + (c.clicks || 0), 0);
            const totalBounces = sent.reduce((s, c) => s + (c.bounces || 0), 0);
            const totalUnsubs = sent.reduce((s, c) => s + (c.unsubscribes || 0), 0);
            const totalComplaints = sent.reduce((s, c) => s + (c.complaints || 0), 0);
            const openRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : "0";
            const clickRate = totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(1) : "0";
            const bounceRate = totalSent > 0 ? ((totalBounces / totalSent) * 100).toFixed(1) : "0";
            return (
              <>
                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <Card className="p-3 text-center">
                    <Send className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                    <p className="text-lg font-bold">{totalSent.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Total Sent</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <MailOpen className="h-4 w-4 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-700">{openRate}%</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Open Rate</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <MousePointerClick className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-purple-700">{clickRate}%</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Click Rate</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <AlertCircle className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-amber-600">{bounceRate}%</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Bounce Rate</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <Ban className="h-4 w-4 text-red-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-red-600">{totalUnsubs}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Unsubscribes</p>
                  </Card>
                  <Card className="p-3 text-center">
                    <AlertCircle className="h-4 w-4 text-red-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-red-500">{totalComplaints}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Complaints</p>
                  </Card>
                </div>

                {/* Per-campaign breakdown */}
                <div>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Campaign Performance
                  </h2>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b">
                          <th className="text-left p-3 font-medium text-muted-foreground">Campaign</th>
                          <th className="text-right p-3 font-medium text-muted-foreground">Sent</th>
                          <th className="text-right p-3 font-medium text-muted-foreground">Opens</th>
                          <th className="text-right p-3 font-medium text-muted-foreground">Open %</th>
                          <th className="text-right p-3 font-medium text-muted-foreground">Clicks</th>
                          <th className="text-right p-3 font-medium text-muted-foreground">Click %</th>
                          <th className="text-right p-3 font-medium text-muted-foreground">Bounces</th>
                          <th className="text-right p-3 font-medium text-muted-foreground">Unsubs</th>
                          <th className="text-right p-3 font-medium text-muted-foreground">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sent.map((c) => {
                          const or = c.recipient_count > 0 ? ((c.opens / c.recipient_count) * 100).toFixed(1) : "0";
                          const cr = c.recipient_count > 0 ? ((c.clicks / c.recipient_count) * 100).toFixed(1) : "0";
                          return (
                            <tr
                              key={c.id}
                              className="border-b last:border-b-0 hover:bg-slate-50 cursor-pointer transition-colors"
                              onClick={() => openEditCampaign(c)}
                            >
                              <td className="p-3">
                                <div className="font-medium truncate max-w-[200px]">{c.name}</div>
                                <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">{c.subject}</div>
                              </td>
                              <td className="p-3 text-right tabular-nums">{c.recipient_count.toLocaleString()}</td>
                              <td className="p-3 text-right tabular-nums text-green-600">{(c.opens || 0).toLocaleString()}</td>
                              <td className="p-3 text-right tabular-nums font-medium text-green-700">{or}%</td>
                              <td className="p-3 text-right tabular-nums text-purple-600">{(c.clicks || 0).toLocaleString()}</td>
                              <td className="p-3 text-right tabular-nums font-medium text-purple-700">{cr}%</td>
                              <td className="p-3 text-right tabular-nums text-amber-600">{c.bounces || 0}</td>
                              <td className="p-3 text-right tabular-nums text-red-600">{c.unsubscribes || 0}</td>
                              <td className="p-3 text-right text-muted-foreground whitespace-nowrap">
                                {c.sent_at ? new Date(c.sent_at).toLocaleDateString() : timeAgo(c.created_at)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 font-medium">
                          <td className="p-3">Total ({sent.length} campaigns)</td>
                          <td className="p-3 text-right tabular-nums">{totalSent.toLocaleString()}</td>
                          <td className="p-3 text-right tabular-nums text-green-600">{totalOpens.toLocaleString()}</td>
                          <td className="p-3 text-right tabular-nums text-green-700">{openRate}%</td>
                          <td className="p-3 text-right tabular-nums text-purple-600">{totalClicks.toLocaleString()}</td>
                          <td className="p-3 text-right tabular-nums text-purple-700">{clickRate}%</td>
                          <td className="p-3 text-right tabular-nums text-amber-600">{totalBounces}</td>
                          <td className="p-3 text-right tabular-nums text-red-600">{totalUnsubs}</td>
                          <td className="p-3"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Delete Campaign Confirmation */}
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

      {/* Delete Audience List Confirmation (list view) */}
      <Dialog open={!!deleteListConfirm} onOpenChange={() => setDeleteListConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Audience List?</DialogTitle>
            <DialogDescription>
              This will remove the list. The contacts themselves will not be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteListConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteListConfirm && deleteAudienceList(deleteListConfirm)}
            >
              Delete List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Audience List Dialog (list view) */}
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
              <Label htmlFor="edit-list-name-lv">List Name</Label>
              <Input
                id="edit-list-name-lv"
                value={editListName}
                onChange={(e) => setEditListName(e.target.value)}
                placeholder="e.g. Partner Leads March 2026"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-list-desc-lv">Description / Notes</Label>
              <Textarea
                id="edit-list-desc-lv"
                value={editListDesc}
                onChange={(e) => setEditListDesc(e.target.value)}
                placeholder="e.g. SaaS founders from LinkedIn outreach"
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

      {/* Add Contacts to List Dialog */}
      <Dialog open={!!addToListId} onOpenChange={(open) => { if (!open) { setAddToListId(null); setAddToListEmails(""); setManualContacts([{ email: "", first_name: "", last_name: "", company: "" }]); setAddContactMode("paste"); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Contacts to List</DialogTitle>
            <DialogDescription>
              Add contacts to &ldquo;{audienceLists.find((l) => l.id === addToListId)?.name}&rdquo;.
            </DialogDescription>
          </DialogHeader>

          {/* Mode toggle */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              type="button"
              onClick={() => setAddContactMode("paste")}
              className={`flex-1 text-xs font-medium rounded-md px-3 py-1.5 transition-colors ${addContactMode === "paste" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Paste / Bulk
            </button>
            <button
              type="button"
              onClick={() => setAddContactMode("manual")}
              className={`flex-1 text-xs font-medium rounded-md px-3 py-1.5 transition-colors ${addContactMode === "manual" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Manual Entry
            </button>
          </div>

          {addContactMode === "paste" ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="add-emails">Paste Contacts</Label>
                <Textarea
                  id="add-emails"
                  value={addToListEmails}
                  onChange={(e) => setAddToListEmails(e.target.value)}
                  placeholder={"Paste one per line. Supported formats:\n\njohn@example.com\njohn@example.com, John, Doe, Acme Inc\njohn@example.com\tJohn\tDoe\tAcme Inc"}
                  className="mt-1 min-h-[120px] font-mono text-xs"
                />
                <div className="mt-1.5 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {addToListEmails.trim()
                      ? `${addToListEmails.split(/\n/).filter((e) => e.trim()).length} rows entered`
                      : `Leave empty to add all ${externalCount} existing contacts`}
                  </p>
                  <div className="bg-muted/50 rounded-md p-2 border border-dashed">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Accepted formats</p>
                    <div className="grid grid-cols-1 gap-0.5 text-[11px] font-mono text-muted-foreground">
                      <span>email</span>
                      <span>email, first_name, last_name, company</span>
                      <span>email{"\t"}first_name{"\t"}last_name{"\t"}company</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
                {manualContacts.map((contact, idx) => (
                  <div key={idx} className="rounded-lg border p-3 space-y-2 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Contact {idx + 1}</span>
                      {manualContacts.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => setManualContacts((prev) => prev.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <Input
                        placeholder="Email *"
                        type="email"
                        value={contact.email}
                        onChange={(e) => setManualContacts((prev) => prev.map((c, i) => i === idx ? { ...c, email: e.target.value } : c))}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="First name"
                        value={contact.first_name}
                        onChange={(e) => setManualContacts((prev) => prev.map((c, i) => i === idx ? { ...c, first_name: e.target.value } : c))}
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder="Last name"
                        value={contact.last_name}
                        onChange={(e) => setManualContacts((prev) => prev.map((c, i) => i === idx ? { ...c, last_name: e.target.value } : c))}
                        className="h-8 text-xs"
                      />
                    </div>
                    <Input
                      placeholder="Company"
                      value={contact.company}
                      onChange={(e) => setManualContacts((prev) => prev.map((c, i) => i === idx ? { ...c, company: e.target.value } : c))}
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs gap-1.5"
                onClick={() => setManualContacts((prev) => [...prev, { email: "", first_name: "", last_name: "", company: "" }])}
              >
                <Plus className="h-3 w-3" />
                Add Another Contact
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddToListId(null); setAddToListEmails(""); setManualContacts([{ email: "", first_name: "", last_name: "", company: "" }]); setAddContactMode("paste"); }}>Cancel</Button>
            <Button onClick={addContactsToList} disabled={addingToList}>
              {addingToList && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              {addContactMode === "manual"
                ? `Add ${manualContacts.filter((c) => c.email.trim()).length} Contact${manualContacts.filter((c) => c.email.trim()).length !== 1 ? "s" : ""}`
                : addToListEmails.trim() ? "Add Contacts" : "Add All Contacts"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create List Dialog */}
      <Dialog open={showCreateList} onOpenChange={(open) => { setShowCreateList(open); if (!open) { setCreateListName(""); setCreateListDesc(""); setCreateListAddAll(true); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Audience List</DialogTitle>
            <DialogDescription>
              Create a new list to organize contacts for targeted campaigns.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-list-name">List Name <span className="text-red-500">*</span></Label>
              <Input
                id="create-list-name"
                value={createListName}
                onChange={(e) => setCreateListName(e.target.value)}
                placeholder="e.g. Partner Leads, Newsletter Subscribers"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="create-list-desc">Description (optional)</Label>
              <Input
                id="create-list-desc"
                value={createListDesc}
                onChange={(e) => setCreateListDesc(e.target.value)}
                placeholder="e.g. SaaS founders from LinkedIn outreach"
                className="mt-1"
              />
            </div>
            {externalCount > 0 && (
              <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
                <input
                  type="checkbox"
                  id="add-all-contacts"
                  checked={createListAddAll}
                  onChange={(e) => setCreateListAddAll(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="add-all-contacts" className="text-sm cursor-pointer">
                  Add all {externalCount} existing contacts to this list
                </label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateList(false)}>Cancel</Button>
            <Button onClick={createNewList} disabled={creatingList || !createListName.trim()}>
              {creatingList && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog (list view) */}
      <Dialog open={showImport && listTab === "audiences"} onOpenChange={(open) => { setShowImport(open); if (!open) { setImportListName(""); setImportListDesc(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Contacts to List</DialogTitle>
            <DialogDescription>
              Name your list, then upload a CSV. Columns: email (required), first_name, last_name, company.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="import-list-name-lv">List Name <span className="text-red-500">*</span></Label>
              <Input
                id="import-list-name-lv"
                value={importListName}
                onChange={(e) => setImportListName(e.target.value)}
                placeholder="e.g. Partner Leads March 2026"
                className="mt-1"
              />
            </div>
            {importListName.trim() && (
              <div>
                <Label htmlFor="import-list-desc-lv">Description (optional)</Label>
                <Input
                  id="import-list-desc-lv"
                  value={importListDesc}
                  onChange={(e) => setImportListDesc(e.target.value)}
                  placeholder="e.g. SaaS founders from LinkedIn outreach"
                  className="mt-1"
                />
              </div>
            )}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${importListName.trim() ? "cursor-pointer hover:bg-slate-50" : "opacity-50 cursor-not-allowed"}`}
              onClick={() => { if (importListName.trim()) document.getElementById("csv-file-input-lv")?.click(); else toast.error("Enter a list name first"); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!importListName.trim()) { toast.error("Enter a list name first"); return; }
                const file = e.dataTransfer.files[0];
                if (file && file.name.endsWith(".csv")) handleCsvImport(file);
                else toast.error("Please drop a .csv file");
              }}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">
                {importing ? "Importing..." : importListName.trim() ? "Click to upload or drag & drop" : "Enter a list name above to upload"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">CSV files only</p>
              <input
                id="csv-file-input-lv"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!importListName.trim()) { toast.error("Enter a list name first"); e.target.value = ""; return; }
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
          </div>
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
  onDuplicate,
}: {
  title: string;
  campaigns: Campaign[];
  onEdit: (c: Campaign) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (c: Campaign) => void;
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

              <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                {c.recipient_count > 0 && (
                  <span className="flex items-center gap-1" title="Recipients">
                    <Send className="h-3 w-3" />
                    {c.recipient_count.toLocaleString()}
                  </span>
                )}
                {c.recipient_count > 0 && (c.opens || 0) > 0 && (
                  <span className="flex items-center gap-1 text-green-600" title={`${c.opens} opens`}>
                    <MailOpen className="h-3 w-3" />
                    {((c.opens / c.recipient_count) * 100).toFixed(1)}%
                  </span>
                )}
                {c.recipient_count > 0 && (c.clicks || 0) > 0 && (
                  <span className="flex items-center gap-1 text-purple-600" title={`${c.clicks} clicks`}>
                    <MousePointerClick className="h-3 w-3" />
                    {((c.clicks / c.recipient_count) * 100).toFixed(1)}%
                  </span>
                )}
                {(c.bounces || 0) > 0 && (
                  <span className="flex items-center gap-1 text-amber-600" title={`${c.bounces} bounces`}>
                    <AlertCircle className="h-3 w-3" />
                    {c.bounces}
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

              <div className="flex items-center gap-0.5 shrink-0">
                {onDuplicate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Duplicate"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(c);
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                )}
                {onDelete && c.status === "draft" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-600"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(c.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
