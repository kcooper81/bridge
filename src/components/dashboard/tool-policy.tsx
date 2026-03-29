"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useOrg } from "@/components/providers/org-provider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  CheckCircle2,
  CloudOff,
  Globe,
  Loader2,
  Lock,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ToolInfo {
  id: string;
  name: string;
  domains: string[];
  category: string;
  approved: boolean;
  cloudflareBlocked: boolean;
}

export function ToolPolicy() {
  const { currentUserRole } = useOrg();
  const [tools, setTools] = useState<ToolInfo[]>([]);
  const [policyEnabled, setPolicyEnabled] = useState(false);
  const [cloudflareConnected, setCloudflareConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isAdmin = currentUserRole === "admin";

  const fetchPolicy = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/guardrails/tool-policy", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTools(data.tools);
        setPolicyEnabled(data.policyEnabled);
        setCloudflareConnected(data.cloudflareConnected);
      }
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPolicy(); }, [fetchPolicy]);

  async function savePolicy(updatedTools: ToolInfo[], enabled: boolean) {
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const approvedToolIds = updatedTools.filter((t) => t.approved).map((t) => t.id);

      const res = await fetch("/api/guardrails/tool-policy", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ approvedToolIds, policyEnabled: enabled }),
      });

      if (res.ok) {
        const data = await res.json();
        const parts = [];
        if (data.cloudflareSynced) {
          const r = data.cloudflareResult;
          if (r?.created > 0) parts.push(`${r.created} blocked at DNS`);
          if (r?.deleted > 0) parts.push(`${r.deleted} unblocked at DNS`);
        }
        toast.success(parts.length > 0 ? `Policy saved. ${parts.join(", ")}.` : "Policy saved");
        fetchPolicy();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save policy");
      }
    } catch {
      toast.error("Failed to save policy");
    } finally {
      setSaving(false);
    }
  }

  // Debounce saves to prevent rapid-fire API calls
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const pendingToolsRef = useRef<ToolInfo[]>(tools);
  const pendingPolicyRef = useRef(policyEnabled);

  function debouncedSave(updatedTools: ToolInfo[], enabled: boolean) {
    pendingToolsRef.current = updatedTools;
    pendingPolicyRef.current = enabled;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      savePolicy(pendingToolsRef.current, pendingPolicyRef.current);
    }, 800);
  }

  function toggleTool(toolId: string) {
    if (!isAdmin) return;
    const updated = tools.map((t) =>
      t.id === toolId ? { ...t, approved: !t.approved } : t
    );
    setTools(updated);
    debouncedSave(updated, policyEnabled);
  }

  function togglePolicy(enabled: boolean) {
    if (!isAdmin) return;
    setPolicyEnabled(enabled);
    debouncedSave(tools, enabled);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const approvedCount = tools.filter((t) => t.approved).length;
  const blockedCount = tools.filter((t) => !t.approved).length;

  return (
    <div className="space-y-6">
      {/* Policy toggle */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">AI Tool Restriction Policy</p>
              <p className="text-sm text-muted-foreground">
                {policyEnabled
                  ? `Only approved tools are allowed. ${approvedCount} approved, ${blockedCount} blocked.`
                  : "All AI tools are currently allowed. Enable to restrict to approved tools only."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {policyEnabled && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-0">
                <ShieldCheck className="mr-1 h-3 w-3" />
                Active
              </Badge>
            )}
            {isAdmin && (
              <Switch
                checked={policyEnabled}
                onCheckedChange={togglePolicy}
                disabled={saving}
              />
            )}
          </div>
        </div>
      </Card>

      {/* Enforcement info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-foreground/40" />
            <div>
              <p className="text-sm font-semibold">Browser Extension</p>
              <p className="text-xs text-muted-foreground">
                {policyEnabled
                  ? "Extension blocks unapproved tools when users try to interact with them."
                  : "Extension allows all AI tools. DLP scanning still runs on supported tools."}
              </p>
            </div>
            <Badge variant="outline" className="ml-auto text-[10px] shrink-0">
              {policyEnabled ? "Enforcing" : "Monitor Only"}
            </Badge>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            {cloudflareConnected ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <CloudOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-semibold">Cloudflare Gateway</p>
              <p className="text-xs text-muted-foreground">
                {cloudflareConnected
                  ? "DNS-level blocking active. Covers all devices on the network."
                  : "Not connected. DNS-level blocking unavailable."}
              </p>
            </div>
            {cloudflareConnected ? (
              <Badge className="ml-auto text-[10px] shrink-0 bg-emerald-500/10 text-emerald-600 border-0">
                Synced
              </Badge>
            ) : (
              <Button variant="outline" size="sm" className="ml-auto text-xs shrink-0" asChild>
                <a href="/settings/integrations">Connect</a>
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Tool list */}
      {policyEnabled && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">AI Tools</p>
            {saving && (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3 transition-colors",
                  tool.approved
                    ? "border-emerald-500/20 bg-emerald-500/[0.02]"
                    : "border-border bg-card"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                    tool.approved ? "bg-emerald-500/10" : "bg-muted"
                  )}>
                    {tool.approved ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{tool.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {tool.domains[0]}
                      {tool.approved ? "" : " · Blocked"}
                      {!tool.approved && tool.cloudflareBlocked ? " · DNS blocked" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      tool.approved ? "text-emerald-600 border-emerald-200" : "text-red-500 border-red-200"
                    )}
                  >
                    {tool.approved ? "Approved" : "Blocked"}
                  </Badge>
                  {isAdmin && (
                    <Switch
                      checked={tool.approved}
                      onCheckedChange={() => toggleTool(tool.id)}
                      disabled={saving}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {!isAdmin && (
            <p className="text-xs text-muted-foreground mt-3">
              Contact your admin to change the approved tools list.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
