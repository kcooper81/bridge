"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Copy,
  Check,
  Key,
  Loader2,
  Trash2,
  AlertTriangle,
  Plug2,
  Clock,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

const ALL_SCOPES = [
  { id: "search_prompts", label: "Search Prompts", desc: "Search the shared prompt library" },
  { id: "get_prompt", label: "Get Prompt", desc: "Fetch full prompt content by ID or title" },
  { id: "list_templates", label: "List Templates", desc: "Browse prompt templates with variables" },
  { id: "check_dlp", label: "Check DLP", desc: "Scan text for sensitive data before sending to AI" },
  { id: "log_usage", label: "Log Usage", desc: "Record prompt usage for analytics and audit" },
];

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

export default function McpSettingsPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(ALL_SCOPES.map((s) => s.id));
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/mcp/keys");
      const data = await res.json();
      setKeys(data.keys || []);
    } catch {
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  async function createKey() {
    if (!newKeyName.trim()) return;
    if (newKeyScopes.length === 0) {
      toast.error("Select at least one scope");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/mcp/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim(), scopes: newKeyScopes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCreatedKey(data.key.raw_key);
      setNewKeyName("");
      setNewKeyScopes(ALL_SCOPES.map((s) => s.id));
      await loadKeys();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create key");
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(id: string) {
    try {
      const res = await fetch(`/api/mcp/keys/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Key revoked");
      setRevokeId(null);
      await loadKeys();
    } catch {
      toast.error("Failed to revoke key");
    }
  }

  function copyToClipboard(text: string, type: "key" | "config") {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopiedConfig(true);
      setTimeout(() => setCopiedConfig(false), 2000);
    }
    toast.success("Copied to clipboard");
  }

  const activeKeys = keys.filter((k) => !k.revoked_at);
  const revokedKeys = keys.filter((k) => k.revoked_at);

  const configJson = (key: string) => JSON.stringify({
    mcpServers: {
      teamprompt: {
        url: "https://teamprompt.app/api/mcp",
        headers: { Authorization: `Bearer ${key}` },
      },
    },
  }, null, 2);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/settings/integrations">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Plug2 className="h-5 w-5" />
            MCP Integration
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Connect AI tools like Claude Desktop, Cursor, and Windsurf to your TeamPrompt workspace.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Create API Key
        </Button>
      </div>

      {/* How it works */}
      <Card className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50">
        <h3 className="font-medium text-sm mb-2">How it works</h3>
        <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
          <li>Create an API key below</li>
          <li>Copy the connection config JSON</li>
          <li>Paste it into your AI tool&apos;s MCP settings (see setup guides below)</li>
          <li>Your AI tool can now search prompts, check DLP, and more</li>
        </ol>
      </Card>

      {/* Active keys */}
      <div>
        <h2 className="text-sm font-semibold mb-2">API Keys</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : activeKeys.length === 0 ? (
          <Card className="p-6 text-center">
            <Key className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No API keys yet. Create one to get started.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {activeKeys.map((key) => (
              <Card key={key.id} className="p-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-center justify-center flex-shrink-0">
                  <Key className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{key.name}</p>
                    <Badge variant="secondary" className="text-[10px]">{key.key_prefix}...</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                    <span>{key.scopes.length} scope{key.scopes.length !== 1 ? "s" : ""}</span>
                    <span>Created {timeAgo(key.created_at)}</span>
                    {key.last_used_at && <span>Last used {timeAgo(key.last_used_at)}</span>}
                    {key.expires_at && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        Expires {new Date(key.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-red-600"
                  onClick={() => setRevokeId(key.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Revoked keys */}
      {revokedKeys.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground mb-2">Revoked Keys</h2>
          <div className="space-y-1.5 opacity-50">
            {revokedKeys.map((key) => (
              <Card key={key.id} className="p-2.5 flex items-center gap-3">
                <Key className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">{key.name}</span>
                <Badge variant="outline" className="text-[10px]">Revoked</Badge>
                <span className="text-[10px] text-muted-foreground ml-auto">{key.key_prefix}...</span>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Setup guides */}
      <div>
        <h2 className="text-sm font-semibold mb-2">Setup Guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { name: "Claude Desktop", config: "claude_desktop_config.json", path: "Settings → Developer → MCP Servers" },
            { name: "Cursor", config: ".cursor/mcp.json", path: "Settings → MCP Servers → Add" },
            { name: "Windsurf", config: "MCP settings", path: "Settings → MCP → Add Server" },
            { name: "Claude Code", config: ".claude.json or settings", path: "Settings → MCP Servers" },
          ].map((tool) => (
            <Card key={tool.name} className="p-3">
              <p className="text-sm font-medium">{tool.name}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Add the config JSON to <code className="bg-muted px-1 rounded text-[10px]">{tool.config}</code>
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{tool.path}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Available tools */}
      <div>
        <h2 className="text-sm font-semibold mb-2">Available Tools</h2>
        <div className="space-y-1.5">
          {[
            { name: "search_prompts", desc: "Search your team's prompt library", example: '"Find prompts about onboarding"' },
            { name: "get_prompt", desc: "Get full prompt content by ID or title", example: '"Get the bug report template"' },
            { name: "list_templates", desc: "Browse all prompt templates with variables", example: '"Show me all templates"' },
            { name: "check_dlp", desc: "Scan text for sensitive data before sending to AI", example: '"Check if this text has any PII"' },
            { name: "log_usage", desc: "Record prompt usage for analytics and audit", example: '"Log that I used the code review prompt in Cursor"' },
          ].map((tool) => (
            <Card key={tool.name} className="p-2.5 flex items-start gap-3">
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono flex-shrink-0 mt-0.5">{tool.name}</code>
              <div className="min-w-0">
                <p className="text-xs">{tool.desc}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 italic">Example: {tool.example}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Key Dialog */}
      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) { setNewKeyName(""); setNewKeyScopes(ALL_SCOPES.map((s) => s.id)); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              This key will allow AI tools to access your TeamPrompt workspace via MCP.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Key Name</Label>
              <Input
                placeholder="e.g. Cursor - Work Laptop"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="mb-2 block">Permissions</Label>
              <div className="space-y-2">
                {ALL_SCOPES.map((scope) => (
                  <label key={scope.id} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newKeyScopes.includes(scope.id)}
                      onChange={(e) => {
                        setNewKeyScopes((prev) =>
                          e.target.checked ? [...prev, scope.id] : prev.filter((s) => s !== scope.id)
                        );
                      }}
                      className="rounded mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium">{scope.label}</p>
                      <p className="text-xs text-muted-foreground">{scope.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={createKey} disabled={creating || !newKeyName.trim()}>
              {creating && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Create Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show Created Key Dialog */}
      <Dialog open={!!createdKey} onOpenChange={(open) => { if (!open) setCreatedKey(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              API Key Created
            </DialogTitle>
            <DialogDescription>
              Copy your key now — it won&apos;t be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Your API Key</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 text-xs bg-muted p-2.5 rounded-md font-mono break-all select-all border">
                  {createdKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(createdKey!, "key")}
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Connection Config (paste into your AI tool)</Label>
              <div className="relative mt-1">
                <pre className="text-[11px] bg-muted p-3 rounded-md font-mono overflow-x-auto border">
                  {configJson(createdKey!)}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(configJson(createdKey!), "config")}
                >
                  {copiedConfig ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800/50">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Store this key securely. It provides access to your workspace and cannot be retrieved after closing this dialog.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setCreatedKey(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation */}
      <Dialog open={!!revokeId} onOpenChange={(open) => { if (!open) setRevokeId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              This will immediately disable the key. Any AI tools using it will lose access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => revokeId && revokeKey(revokeId)}>
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
