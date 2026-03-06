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
import { Settings, Database, Shield, Server, Globe, Loader2 } from "lucide-react";
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
    try {
      await fetch("/api/admin/seo/indexnow", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoSubmit: enabled }),
      });
      setAutoIndexNow(enabled);
    } catch { /* ignore */ }
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              SEO — IndexNow
            </CardTitle>
            <CardDescription>Notify search engines of content changes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Engines</span>
              <span className="text-xs text-muted-foreground">Bing, Yandex, Naver, Seznam</span>
            </div>
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
                  ? `Submitted ${indexNowResult.urlCount || 0} URLs`
                  : `Failed: ${indexNowResult.message}`}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
