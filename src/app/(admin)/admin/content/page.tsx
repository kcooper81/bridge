"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Eye,
  MousePointer,
  BarChart3,
  Plus,
  Loader2,
  RefreshCw,
  Unplug,
  Link2,
  FileText,
  Lightbulb,
  Trash2,
  Pencil,
  ArrowUpRight,
  TrendingUp,
  Target,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";

// --- Types ---

interface SearchRow {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface ContentItem {
  id: string;
  title: string;
  type: string;
  status: string;
  content: string | null;
  target_keywords: string[];
  source_query: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface SiteInfo {
  siteUrl: string;
  permissionLevel: string;
}

// --- Helpers ---

const STATUS_COLORS: Record<string, string> = {
  idea: "bg-blue-500/10 text-blue-600",
  draft: "bg-amber-500/10 text-amber-600",
  review: "bg-violet-500/10 text-violet-600",
  published: "bg-green-500/10 text-green-600",
  archived: "bg-zinc-500/10 text-zinc-500",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  blog: FileText,
  linkedin: Globe,
  twitter: Globe,
  reddit: Globe,
  other: FileText,
};

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toFixed(0);
}

function timeAgo(iso: string): string {
  const d = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(d / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// --- Component ---

export default function ContentPage() {
  // Connection
  const [connected, setConnected] = useState(false);
  const [siteUrl, setSiteUrl] = useState<string | null>(null);
  const [sites, setSites] = useState<SiteInfo[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [connecting, setConnecting] = useState(false);

  // SEO data
  const [queries, setQueries] = useState<SearchRow[]>([]);
  const [pages, setPages] = useState<SearchRow[]>([]);
  const [dateRange, setDateRange] = useState(28);
  const [loadingSeo, setLoadingSeo] = useState(false);
  const [seoView, setSeoView] = useState<"queries" | "gaps" | "pages">("queries");

  // Content pipeline
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Form
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState("blog");
  const [formKeywords, setFormKeywords] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formSourceQuery, setFormSourceQuery] = useState("");
  const [saving, setSaving] = useState(false);

  // --- Data loading ---

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/integrations/search-console/status");
      const data = await res.json();
      setConnected(data.connected);
      setSiteUrl(data.site_url);
    } catch {
      // not connected
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  const fetchSeoData = useCallback(async () => {
    if (!connected || !siteUrl) return;
    setLoadingSeo(true);
    try {
      const [qRes, pRes] = await Promise.all([
        fetch(`/api/admin/search-console?dimension=query&days=${dateRange}`),
        fetch(`/api/admin/search-console?dimension=page&days=${dateRange}`),
      ]);
      if (qRes.ok) {
        const q = await qRes.json();
        setQueries(q.rows || []);
      }
      if (pRes.ok) {
        const p = await pRes.json();
        setPages(p.rows || []);
      }
    } catch (err) {
      console.error("Failed to fetch SEO data:", err);
      toast.error("Failed to load Search Console data");
    } finally {
      setLoadingSeo(false);
    }
  }, [connected, siteUrl, dateRange]);

  const fetchSites = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/search-console/sites");
      if (res.ok) {
        const data = await res.json();
        setSites(data.sites || []);
      }
    } catch {}
  }, []);

  const loadContent = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/content");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {} finally {
      setLoadingContent(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    loadContent();
  }, [checkStatus, loadContent]);

  useEffect(() => {
    if (connected && siteUrl) fetchSeoData();
  }, [connected, siteUrl, dateRange, fetchSeoData]);

  useEffect(() => {
    if (connected && !siteUrl) fetchSites();
  }, [connected, siteUrl, fetchSites]);

  // Check URL params for post-connect redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "true") {
      toast.success("Search Console connected");
      checkStatus();
      window.history.replaceState({}, "", "/admin/content");
    }
    if (params.get("error")) {
      toast.error(`Connection failed: ${params.get("error")}`);
      window.history.replaceState({}, "", "/admin/content");
    }
  }, [checkStatus]);

  // --- Actions ---

  const connectSearchConsole = async () => {
    setConnecting(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Not authenticated");
        return;
      }
      const res = await fetch("/api/integrations/search-console/connect", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to connect");
      }
    } catch {
      toast.error("Connection failed");
    } finally {
      setConnecting(false);
    }
  };

  const disconnectSearchConsole = async () => {
    const res = await fetch("/api/integrations/search-console/disconnect", {
      method: "DELETE",
    });
    if (res.ok) {
      setConnected(false);
      setSiteUrl(null);
      setQueries([]);
      setPages([]);
      toast.success("Disconnected");
    }
  };

  const selectSite = async (url: string) => {
    const res = await fetch("/api/admin/search-console/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteUrl: url }),
    });
    if (res.ok) {
      setSiteUrl(url);
      toast.success("Site selected");
    }
  };

  const saveItem = async () => {
    if (!formTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: formTitle.trim(),
        type: formType,
        target_keywords: formKeywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        notes: formNotes || null,
        source_query: formSourceQuery || null,
      };

      if (editItem) {
        const res = await fetch("/api/admin/content", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editItem.id, ...payload }),
        });
        if (res.ok) {
          const data = await res.json();
          setItems((prev) =>
            prev.map((i) => (i.id === editItem.id ? data.item : i))
          );
          toast.success("Updated");
        }
      } else {
        const res = await fetch("/api/admin/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          setItems((prev) => [data.item, ...prev]);
          toast.success("Idea added");
        }
      }
      closeDialog();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch("/api/admin/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems((prev) => prev.map((i) => (i.id === id ? data.item : i)));
    }
  };

  const deleteItem = async (id: string) => {
    const res = await fetch(`/api/admin/content?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Deleted");
    }
  };

  const createIdeaFromQuery = (query: string) => {
    setFormTitle(`Blog: ${query}`);
    setFormType("blog");
    setFormKeywords(query);
    setFormSourceQuery(query);
    setFormNotes("");
    setEditItem(null);
    setShowDialog(true);
  };

  const openEdit = (item: ContentItem) => {
    setFormTitle(item.title);
    setFormType(item.type);
    setFormKeywords(item.target_keywords.join(", "));
    setFormNotes(item.notes || "");
    setFormSourceQuery(item.source_query || "");
    setEditItem(item);
    setShowDialog(true);
  };

  const openNew = () => {
    setFormTitle("");
    setFormType("blog");
    setFormKeywords("");
    setFormNotes("");
    setFormSourceQuery("");
    setEditItem(null);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditItem(null);
  };

  // --- Computed ---

  const totalClicks = queries.reduce((s, r) => s + r.clicks, 0);
  const totalImpressions = queries.reduce((s, r) => s + r.impressions, 0);
  const avgCtr =
    totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgPosition =
    queries.length > 0
      ? queries.reduce((s, r) => s + r.position, 0) / queries.length
      : 0;

  const contentGaps = [...queries]
    .filter((q) => q.impressions >= 10 && q.ctr < 0.02)
    .sort((a, b) => b.impressions - a.impressions);

  const filteredItems =
    statusFilter === "all"
      ? items
      : items.filter((i) => i.status === statusFilter);

  const statusCounts = {
    idea: items.filter((i) => i.status === "idea").length,
    draft: items.filter((i) => i.status === "draft").length,
    review: items.filter((i) => i.status === "review").length,
    published: items.filter((i) => i.status === "published").length,
  };

  // --- Render ---

  if (loadingStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Content & SEO
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search performance insights and content pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          {connected ? (
            <>
              <Badge variant="outline" className="gap-1.5 text-green-600">
                <Link2 className="h-3 w-3" />
                {siteUrl || "Connected"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={disconnectSearchConsole}
              >
                <Unplug className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button onClick={connectSearchConsole} disabled={connecting}>
              {connecting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Connect Search Console
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="seo">
        <TabsList>
          <TabsTrigger value="seo" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            SEO Insights
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-1.5">
            <Lightbulb className="h-4 w-4" />
            Content Pipeline
            {statusCounts.idea + statusCounts.draft > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">
                {statusCounts.idea + statusCounts.draft}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── SEO Insights Tab ── */}
        <TabsContent value="seo" className="space-y-6 mt-6">
          {!connected ? (
            <Card className="p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">
                Connect Google Search Console
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                See which search queries bring visitors to your site, identify
                content gaps, and make data-driven decisions about what to write
                next.
              </p>
              <Button onClick={connectSearchConsole} disabled={connecting}>
                {connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Link2 className="h-4 w-4 mr-2" />
                )}
                Connect with Google
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Requires Search Console API enabled in your Google Cloud project
                and the callback URL registered.
              </p>
            </Card>
          ) : !siteUrl ? (
            <Card className="p-8">
              <h2 className="text-lg font-semibold mb-4">Select a site</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Choose which Search Console property to monitor.
              </p>
              {sites.length === 0 ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Loading sites...
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={fetchSites}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 max-w-lg">
                  {sites.map((site) => (
                    <button
                      key={site.siteUrl}
                      onClick={() => selectSite(site.siteUrl)}
                      className="flex items-center gap-3 p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors text-left"
                    >
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{site.siteUrl}</p>
                        <p className="text-xs text-muted-foreground">
                          {site.permissionLevel}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          ) : (
            <>
              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {[7, 28, 90].map((d) => (
                    <Button
                      key={d}
                      variant={dateRange === d ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDateRange(d)}
                    >
                      {d}d
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchSeoData}
                  disabled={loadingSeo}
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-1.5 ${loadingSeo ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MousePointer className="h-4 w-4" />
                    Clicks
                  </div>
                  <p className="text-2xl font-bold">
                    {formatNumber(totalClicks)}
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Eye className="h-4 w-4" />
                    Impressions
                  </div>
                  <p className="text-2xl font-bold">
                    {formatNumber(totalImpressions)}
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    Avg CTR
                  </div>
                  <p className="text-2xl font-bold">
                    {(avgCtr * 100).toFixed(1)}%
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Target className="h-4 w-4" />
                    Avg Position
                  </div>
                  <p className="text-2xl font-bold">{avgPosition.toFixed(1)}</p>
                </Card>
              </div>

              {/* Sub-tabs */}
              <div className="flex gap-1 border-b">
                {(
                  [
                    ["queries", "Top Queries", queries.length],
                    ["gaps", "Content Gaps", contentGaps.length],
                    ["pages", "Top Pages", pages.length],
                  ] as const
                ).map(([key, label, count]) => (
                  <button
                    key={key}
                    onClick={() => setSeoView(key)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      seoView === key
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({count})
                    </span>
                  </button>
                ))}
              </div>

              {/* Data table */}
              {loadingSeo ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b">
                        <th className="text-left px-4 py-2.5 font-medium">
                          {seoView === "pages" ? "Page" : "Query"}
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium w-20">
                          Clicks
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium w-24">
                          Impr.
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium w-20">
                          CTR
                        </th>
                        <th className="text-right px-4 py-2.5 font-medium w-20">
                          Pos.
                        </th>
                        {seoView !== "pages" && (
                          <th className="w-10 px-2"></th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {(seoView === "pages"
                        ? pages
                        : seoView === "gaps"
                          ? contentGaps
                          : queries
                      )
                        .slice(0, 50)
                        .map((row, i) => (
                          <tr
                            key={i}
                            className="border-b last:border-0 hover:bg-muted/30"
                          >
                            <td className="px-4 py-2.5 max-w-xs truncate">
                              {seoView === "pages" ? (
                                <span
                                  className="text-primary hover:underline cursor-pointer"
                                  onClick={() =>
                                    window.open(row.key, "_blank")
                                  }
                                >
                                  {row.key.replace(
                                    /^https?:\/\/[^/]+/,
                                    ""
                                  ) || "/"}
                                </span>
                              ) : (
                                row.key
                              )}
                              {seoView === "gaps" && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-[10px] text-amber-600"
                                >
                                  opportunity
                                </Badge>
                              )}
                            </td>
                            <td className="text-right px-4 py-2.5 tabular-nums">
                              {row.clicks}
                            </td>
                            <td className="text-right px-4 py-2.5 tabular-nums">
                              {formatNumber(row.impressions)}
                            </td>
                            <td className="text-right px-4 py-2.5 tabular-nums">
                              {(row.ctr * 100).toFixed(1)}%
                            </td>
                            <td className="text-right px-4 py-2.5 tabular-nums">
                              {row.position.toFixed(1)}
                            </td>
                            {seoView !== "pages" && (
                              <td className="px-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  title="Create content idea"
                                  onClick={() =>
                                    createIdeaFromQuery(row.key)
                                  }
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      {(seoView === "pages"
                        ? pages
                        : seoView === "gaps"
                          ? contentGaps
                          : queries
                      ).length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-12 text-muted-foreground"
                          >
                            No data for this period
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ── Content Pipeline Tab ── */}
        <TabsContent value="pipeline" className="space-y-6 mt-6">
          {/* Pipeline stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(
              [
                ["idea", "Ideas", Lightbulb],
                ["draft", "Drafts", FileText],
                ["review", "In Review", Eye],
                ["published", "Published", ArrowUpRight],
              ] as const
            ).map(([key, label, Icon]) => (
              <Card
                key={key}
                className={`p-4 cursor-pointer transition-colors ${statusFilter === key ? "ring-2 ring-primary" : "hover:bg-muted/30"}`}
                onClick={() =>
                  setStatusFilter(statusFilter === key ? "all" : key)
                }
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Icon className="h-4 w-4" />
                  {label}
                </div>
                <p className="text-2xl font-bold">
                  {statusCounts[key as keyof typeof statusCounts]}
                </p>
              </Card>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {statusFilter}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="ml-1 hover:text-foreground"
                  >
                    x
                  </button>
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                {filteredItems.length} item
                {filteredItems.length !== 1 ? "s" : ""}
              </span>
            </div>
            <Button onClick={openNew} size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Idea
            </Button>
          </div>

          {/* Items list */}
          {loadingContent ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredItems.length === 0 ? (
            <Card className="p-12 text-center">
              <Lightbulb className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                {items.length === 0
                  ? "No content ideas yet. Add your first one or create ideas from SEO data."
                  : "No items match this filter."}
              </p>
              {items.length === 0 && (
                <Button onClick={openNew} variant="outline">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add First Idea
                </Button>
              )}
            </Card>
          ) : (
            <div className="border rounded-lg divide-y">
              {filteredItems.map((item) => {
                const TypeIcon = TYPE_ICONS[item.type] || FileText;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30"
                  >
                    <TypeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {item.title}
                        </p>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] flex-shrink-0 ${STATUS_COLORS[item.status] || ""}`}
                        >
                          {item.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px] flex-shrink-0"
                        >
                          {item.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {item.target_keywords.length > 0 && (
                          <span className="text-xs text-muted-foreground truncate max-w-xs">
                            {item.target_keywords.join(", ")}
                          </span>
                        )}
                        {item.source_query && (
                          <span className="text-xs text-blue-500">
                            from: &quot;{item.source_query}&quot;
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground/60">
                          {timeAgo(item.updated_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Select
                        value={item.status}
                        onValueChange={(v) => updateStatus(item.id, v)}
                      >
                        <SelectTrigger className="h-7 w-24 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="idea">Idea</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEdit(item)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => deleteItem(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Add/Edit Dialog ── */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Edit Content Item" : "Add Content Idea"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title</label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g., Blog: AI prompt management for legal teams"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Type</label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blog">Blog Post</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                    <SelectItem value="reddit">Reddit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Source Query
                </label>
                <Input
                  value={formSourceQuery}
                  onChange={(e) => setFormSourceQuery(e.target.value)}
                  placeholder="Search query that inspired this"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Target Keywords
              </label>
              <Input
                value={formKeywords}
                onChange={(e) => setFormKeywords(e.target.value)}
                placeholder="comma-separated keywords"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Notes</label>
              <Textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Outline, key points, references..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={saveItem} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              {editItem ? "Save Changes" : "Add Idea"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
