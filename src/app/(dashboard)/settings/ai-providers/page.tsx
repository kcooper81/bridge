"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Key, Check, Trash2, Plus, Eye, EyeOff, Brain } from "lucide-react";
import { toast } from "sonner";
import { PROVIDER_MODELS } from "@/lib/ai/providers";
import Link from "next/link";

interface ConfiguredProvider {
  id: string;
  provider: string;
  label: string;
  model_whitelist: string[];
  is_active: boolean;
  availableModels: Array<{ id: string; label: string }>;
}

export default function AIProvidersPage() {
  const [providers, setProviders] = useState<ConfiguredProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addProvider, setAddProvider] = useState("openai");
  const [addApiKey, setAddApiKey] = useState("");
  const [addModels, setAddModels] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [deleteProvider, setDeleteProvider] = useState<string | null>(null);

  const loadProviders = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/providers");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || `Request failed (${res.status})`);
        return;
      }
      const data = await res.json();
      setProviders(data.providers || []);
    } catch {
      toast.error("Failed to load providers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  async function saveProvider() {
    if (!addApiKey.trim()) { toast.error("API key is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/chat/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: addProvider,
          api_key: addApiKey.trim(),
          model_whitelist: addModels,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${data.provider.label} configured`);
      setShowAdd(false);
      setAddApiKey("");
      setAddModels([]);
      await loadProviders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function removeProvider(provider: string) {
    try {
      const res = await fetch("/api/chat/providers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || `Request failed (${res.status})`);
        return;
      }
      toast.success("Provider removed");
      setDeleteProvider(null);
      await loadProviders();
    } catch {
      toast.error("Failed to remove provider");
    }
  }

  const configuredProviderIds = providers.map((p) => p.provider);
  const unconfiguredProviders = Object.entries(PROVIDER_MODELS).filter(([id]) => !configuredProviderIds.includes(id));
  const selectedProviderInfo = PROVIDER_MODELS[addProvider];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">AI Providers</h2>
          <p className="text-sm text-muted-foreground">
            Add your API keys to use AI models in TeamPrompt Chat. Keys are encrypted and never leave your workspace.
          </p>
        </div>
        {unconfiguredProviders.length > 0 && (
          <Button size="sm" onClick={() => { setAddProvider(unconfiguredProviders[0][0]); setShowAdd(true); }}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Provider
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : providers.length === 0 ? (
        <Card className="p-8 text-center">
          <Key className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-1">No AI providers configured</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add your OpenAI, Anthropic, or Google API key to enable AI Chat for your team.
          </p>
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Provider
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {providers.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{p.label}</span>
                    <Badge variant="default" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <Check className="h-2.5 w-2.5 mr-0.5" />
                      Active
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteProvider(p.provider)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {(p.model_whitelist.length > 0
                    ? p.availableModels.filter((m) => p.model_whitelist.includes(m.id))
                    : p.availableModels
                  ).map((m) => (
                    <Badge key={m.id} variant="secondary" className="text-xs">
                      {m.label}
                    </Badge>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  {p.model_whitelist.length > 0
                    ? `${p.model_whitelist.length} model${p.model_whitelist.length !== 1 ? "s" : ""} enabled`
                    : "All models enabled"
                  }
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Provider Dialog */}
      <Dialog open={showAdd} onOpenChange={(open) => { setShowAdd(open); if (!open) { setAddApiKey(""); setAddModels([]); setShowKey(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add AI Provider</DialogTitle>
            <DialogDescription>
              Your API key is encrypted before storage and never leaves your workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Provider</Label>
              <select
                className="w-full mt-1 h-9 rounded-md border bg-background px-3 text-sm"
                value={addProvider}
                onChange={(e) => { setAddProvider(e.target.value); setAddModels([]); }}
              >
                {Object.entries(PROVIDER_MODELS).map(([id, info]) => (
                  <option key={id} value={id} disabled={configuredProviderIds.includes(id)}>
                    {info.label} {configuredProviderIds.includes(id) ? "(configured)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>API Key</Label>
              <div className="relative mt-1">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder={addProvider === "openai" ? "sk-..." : addProvider === "anthropic" ? "sk-ant-..." : "AI..."}
                  value={addApiKey}
                  onChange={(e) => setAddApiKey(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Get your key from {addProvider === "openai" ? "platform.openai.com/api-keys" : addProvider === "anthropic" ? "console.anthropic.com/settings/keys" : "aistudio.google.com/apikey"}
              </p>
            </div>
            <div>
              <Label>Allowed Models (leave empty for all)</Label>
              <div className="mt-2 space-y-2">
                {selectedProviderInfo?.models.map((m) => (
                  <label key={m.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={addModels.includes(m.id)}
                      onChange={(e) => {
                        setAddModels((prev) =>
                          e.target.checked ? [...prev, m.id] : prev.filter((id) => id !== m.id)
                        );
                      }}
                    />
                    {m.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={saveProvider} disabled={saving || !addApiKey.trim()}>
              {saving && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Save Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteProvider} onOpenChange={(open) => { if (!open) setDeleteProvider(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Provider</DialogTitle>
            <DialogDescription>
              This will delete the API key. Team members won&apos;t be able to use {PROVIDER_MODELS[deleteProvider || ""]?.label || "this provider"} models in Chat.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteProvider(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteProvider && removeProvider(deleteProvider)}>
              Remove Provider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link to AI-powered DLP detection */}
      <Card className="p-4 flex items-center gap-3 bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/50">
        <div className="h-9 w-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
          <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">AI-Powered DLP Detection</p>
          <p className="text-xs text-muted-foreground">Use AI models for advanced PII detection in your guardrail rules — detects names, addresses, medical info that patterns miss.</p>
        </div>
        <Link href="/guardrails">
          <Button variant="outline" size="sm">Configure</Button>
        </Link>
      </Card>
    </div>
  );
}
