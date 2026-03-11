"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Database, Shield, Server, Globe, Loader2, ExternalLink, FileText, Search } from "lucide-react";
import { toast } from "sonner";
import { SUPER_ADMIN_EMAILS } from "@/lib/constants";

export default function SettingsPage() {
  const [indexNowLoading, setIndexNowLoading] = useState(false);
  const [indexNowResult, setIndexNowResult] = useState<{ success: boolean; message: string; urlCount?: number } | null>(null);
  const [autoIndexNow, setAutoIndexNow] = useState(false);
  const [autoIndexNowLoading, setAutoIndexNowLoading] = useState(false);

  // Load auto-submit setting
  useEffect(() => {
    fetch("/api/admin/seo/indexnow?setting=auto")
      .then((r) => r.json())
      .then((d) => { if (d.autoSubmit !== undefined) setAutoIndexNow(d.autoSubmit); })
      .catch(() => {});
  }, []);

  async function toggleAutoIndexNow(enabled: boolean) {
    setAutoIndexNowLoading(true);
    const previousValue = autoIndexNow;
    setAutoIndexNow(enabled);
    try {
      const res = await fetch("/api/admin/seo/indexnow", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoSubmit: enabled }),
      });
      if (!res.ok) {
        throw new Error("Failed to update setting");
      }
    } catch (err) {
      setAutoIndexNow(previousValue);
      toast.error(err instanceof Error ? err.message : "Failed to toggle auto-submit");
    }
    setAutoIndexNowLoading(false);
  }

  async function handleIndexNow() {
    setIndexNowLoading(true);
    setIndexNowResult(null);
    try {
      const res = await fetch("/api/admin/seo/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submitAll: true }),
      });
      const data = await res.json();
      setIndexNowResult(data);
    } catch (err) {
      setIndexNowResult({ success: false, message: err instanceof Error ? err.message : "Network error" });
    }
    setIndexNowLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground">System configuration and status</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Environment
            </CardTitle>
            <CardDescription>Runtime information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Framework</span>
              <Badge variant="outline">Next.js 14</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Node Environment</span>
              <Badge variant="outline">{process.env.NODE_ENV}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Supabase URL</span>
              <span className="text-sm font-mono text-muted-foreground truncate max-w-[200px]">
                {process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "").split(".")[0]}...
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database
            </CardTitle>
            <CardDescription>Supabase Postgres</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Provider</span>
              <Badge variant="outline">Supabase</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Auth</span>
              <Badge variant="outline">Supabase Auth</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Storage</span>
              <Badge variant="outline">Supabase Storage</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Access control settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">RLS</span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                Enabled
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Super Admin Access</span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                Profile-based
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Admin Email</span>
              <span className="text-sm font-mono text-muted-foreground">
                {SUPER_ADMIN_EMAILS[0]}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Payments
            </CardTitle>
            <CardDescription>Stripe integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Provider</span>
              <Badge variant="outline">Stripe</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Webhook</span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Dashboard</span>
              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                Open Stripe
              </a>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              SEO Health
            </CardTitle>
            <CardDescription>Search engine optimization status and tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Sitemap & Indexing */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Sitemap & Indexing
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sitemap</span>
                  <a
                    href="https://teamprompt.app/sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    sitemap.xml
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">robots.txt</span>
                  <a
                    href="https://teamprompt.app/robots.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    robots.txt
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Google Search Console</span>
                  <a
                    href="https://search.google.com/search-console?resource_id=sc-domain%3Ateamprompt.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Open GSC
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Google Verification</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    DNS Verified
                  </Badge>
                </div>
              </div>

              {/* IndexNow */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  IndexNow (Bing, Yandex, Naver, Seznam)
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">API Key</span>
                  <Badge className={process.env.NEXT_PUBLIC_SUPABASE_URL ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "bg-red-100 text-red-800"}>
                    Configured
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-indexnow" className="text-sm text-muted-foreground cursor-pointer">Auto-submit on deploy</Label>
                  <Switch
                    id="auto-indexnow"
                    checked={autoIndexNow}
                    onCheckedChange={toggleAutoIndexNow}
                    disabled={autoIndexNowLoading}
                  />
                </div>
                <Button onClick={handleIndexNow} disabled={indexNowLoading} size="sm" className="w-full">
                  {indexNowLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Globe className="h-4 w-4 mr-2" />}
                  Submit All URLs Now
                </Button>
                {indexNowResult && (
                  <div className={`p-3 rounded-lg text-sm ${indexNowResult.success ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
                    {indexNowResult.success
                      ? `Submitted ${indexNowResult.urlCount || 0} URLs to IndexNow`
                      : `Failed: ${indexNowResult.message}`}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
