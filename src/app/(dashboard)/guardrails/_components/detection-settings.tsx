"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Lock,
  Info,
  Loader2,
} from "lucide-react";
import { getSecuritySettings, updateSecuritySettings } from "@/lib/sensitive-terms-api";
import { toast } from "sonner";
import type { SecuritySettings } from "@/lib/types";

interface DetectionSettingsProps {
  orgId: string;
  canEdit: boolean;
  hasPremiumAccess: boolean;
}

export function DetectionSettings({ orgId, canEdit, hasPremiumAccess }: DetectionSettingsProps) {
  const [settings, setSettings] = useState<SecuritySettings>({
    entropy_detection_enabled: false,
    entropy_threshold: 4.0,
    ai_detection_enabled: false,
    ai_detection_provider: null,
    ai_api_key: "",
    ai_endpoint_url: "",
    smart_patterns_enabled: false,
  });
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [endpointDraft, setEndpointDraft] = useState("");
  const [savingApi, setSavingApi] = useState(false);

  useEffect(() => {
    if (orgId) {
      getSecuritySettings(orgId).then((s) => {
        setSettings(s);
        setApiKeyDraft(s.ai_api_key || "");
        setEndpointDraft(s.ai_endpoint_url || "");
      }).catch((err) => {
        console.error("Failed to load security settings:", err);
        toast.error("Failed to load detection settings");
      });
    }
  }, [orgId]);

  const handleSave = async (updates: Partial<SecuritySettings>) => {
    setSaving(true);
    try {
      await updateSecuritySettings(orgId, updates);
      setSettings((prev) => ({ ...prev, ...updates }));
      toast.success("Settings updated");
    } catch (err) {
      toast.error("Failed to update settings");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Entropy Detection */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Entropy Detection</CardTitle>
                <CardDescription className="text-xs">Detect high-randomness strings</CardDescription>
              </div>
            </div>
            <Switch
              checked={settings.entropy_detection_enabled}
              onCheckedChange={(checked) => handleSave({ entropy_detection_enabled: checked })}
              disabled={!canEdit || saving}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Automatically detect strings with high entropy (randomness) that are likely to be API keys, tokens, or encoded secrets.
          </p>
          {settings.entropy_detection_enabled && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Sensitivity Threshold</Label>
                <Badge variant="outline" className="text-xs">
                  {settings.entropy_threshold.toFixed(1)} bits/char
                </Badge>
              </div>
              <Slider
                value={[settings.entropy_threshold]}
                onValueChange={(values: number[]) => setSettings((prev) => ({ ...prev, entropy_threshold: values[0] }))}
                onValueCommit={(values: number[]) => handleSave({ entropy_threshold: values[0] })}
                min={3.0}
                max={5.0}
                step={0.1}
                disabled={!canEdit}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>More sensitive</span>
                <span>Less sensitive</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Smart Patterns */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-tp-green/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-tp-green" />
              </div>
              <div>
                <CardTitle className="text-base">Smart Patterns</CardTitle>
                <CardDescription className="text-xs">Extended pattern library</CardDescription>
              </div>
            </div>
            <Switch
              checked={settings.smart_patterns_enabled}
              onCheckedChange={(checked) => handleSave({ smart_patterns_enabled: checked })}
              disabled={!canEdit || saving}
            />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Enable additional detection patterns for phone numbers, IP addresses, file paths, internal domains, and more.
          </p>
          {settings.smart_patterns_enabled && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Phone Numbers", "IP Addresses", "File Paths", "Internal Domains", "Bank Info", "Medical IDs"].map((p) => (
                <Badge key={p} variant="secondary" className="text-[10px]">
                  {p}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Detection */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Brain className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-base">AI-Powered Detection</CardTitle>
                <CardDescription className="text-xs">Machine learning PII detection</CardDescription>
              </div>
            </div>
            {hasPremiumAccess ? (
              <Switch
                checked={settings.ai_detection_enabled}
                onCheckedChange={(checked) => handleSave({ ai_detection_enabled: checked })}
                disabled={!canEdit || saving}
              />
            ) : (
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                Pro Plan
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Use machine learning models to detect names, addresses, medical information, and other sensitive data that pattern matching might miss.
          </p>
          {hasPremiumAccess && settings.ai_detection_enabled && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Detection Provider</Label>
                <Select
                  value={settings.ai_detection_provider || ""}
                  onValueChange={(value) => handleSave({ ai_detection_provider: value as SecuritySettings["ai_detection_provider"] })}
                  disabled={!canEdit}
                >
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI (GPT-4o)</SelectItem>
                    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    <SelectItem value="google">Google (Gemini)</SelectItem>
                    <SelectItem value="presidio">Microsoft Presidio (Self-hosted)</SelectItem>
                    <SelectItem value="aws_comprehend">AWS Comprehend</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.ai_detection_provider && (
                <div className="rounded-lg border border-border p-4 space-y-4">
                  <h4 className="text-sm font-medium">API Configuration</h4>

                  {settings.ai_detection_provider === "presidio" && (
                    <div className="space-y-2">
                      <Label className="text-sm">Presidio Endpoint URL</Label>
                      <Input
                        value={endpointDraft}
                        onChange={(e) => setEndpointDraft(e.target.value)}
                        placeholder="https://your-presidio-instance.example.com/analyze"
                        disabled={!canEdit}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Your self-hosted Presidio analyzer endpoint. Must be accessible from our servers.
                      </p>
                    </div>
                  )}

                  {(settings.ai_detection_provider === "aws_comprehend" || settings.ai_detection_provider === "openai" || settings.ai_detection_provider === "anthropic" || settings.ai_detection_provider === "google") && (
                    <div className="space-y-2">
                      <Label className="text-sm">
                        {settings.ai_detection_provider === "aws_comprehend" ? "AWS Access Key"
                          : settings.ai_detection_provider === "anthropic" ? "Anthropic API Key"
                          : settings.ai_detection_provider === "google" ? "Google AI API Key"
                          : "OpenAI API Key"}
                      </Label>
                      <div className="relative">
                        <Input
                          type={showApiKey ? "text" : "password"}
                          value={apiKeyDraft}
                          onChange={(e) => setApiKeyDraft(e.target.value)}
                          placeholder={settings.ai_detection_provider === "aws_comprehend" ? "AKIA..."
                            : settings.ai_detection_provider === "anthropic" ? "sk-ant-..."
                            : settings.ai_detection_provider === "google" ? "AIza..."
                            : "sk-..."}
                          disabled={!canEdit}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                        >
                          {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {settings.ai_detection_provider === "aws_comprehend"
                          ? "Your AWS access key for Comprehend. Secret key is stored encrypted."
                          : settings.ai_detection_provider === "anthropic"
                            ? "Your Anthropic API key. Stored encrypted and used for AI detection and rule generation."
                          : settings.ai_detection_provider === "google"
                            ? "Your Google AI API key from aistudio.google.com. Used for PII detection via Gemini."
                            : "Your OpenAI API key. Stored encrypted and only used for PII detection."}
                      </p>
                    </div>
                  )}

                  {settings.ai_detection_provider === "aws_comprehend" && (
                    <div className="space-y-2">
                      <Label className="text-sm">AWS Region / Endpoint</Label>
                      <Input
                        value={endpointDraft}
                        onChange={(e) => setEndpointDraft(e.target.value)}
                        placeholder="us-east-1"
                        disabled={!canEdit}
                      />
                    </div>
                  )}

                  <Button
                    size="sm"
                    disabled={!canEdit || savingApi}
                    onClick={async () => {
                      setSavingApi(true);
                      try {
                        await updateSecuritySettings(orgId, {
                          ai_api_key: apiKeyDraft || undefined,
                          ai_endpoint_url: endpointDraft || undefined,
                        });
                        setSettings((prev) => ({
                          ...prev,
                          ai_api_key: apiKeyDraft,
                          ai_endpoint_url: endpointDraft,
                        }));
                        toast.success("API configuration saved");
                      } catch {
                        toast.error("Failed to save API configuration");
                      } finally {
                        setSavingApi(false);
                      }
                    }}
                  >
                    {savingApi ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                    ) : (
                      "Save API Configuration"
                    )}
                  </Button>

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      {settings.ai_detection_provider === "presidio"
                        ? "Deploy Presidio using the official Docker image, then enter your endpoint URL above."
                        : settings.ai_detection_provider === "aws_comprehend"
                          ? "Create an IAM user with ComprehendFullAccess policy. Enter the access key above."
                          : settings.ai_detection_provider === "anthropic"
                            ? "Create an API key at console.anthropic.com. Claude models are used for detection and rule generation."
                          : settings.ai_detection_provider === "google"
                            ? "Create an API key at aistudio.google.com. Gemini models are used for PII detection."
                            : "Create an API key at platform.openai.com. Only gpt-4 class models are used for detection."}
                    </p>
                  </div>
                </div>
              )}

              {!settings.ai_detection_provider && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Select a provider above to configure API access.
                  </p>
                </div>
              )}
            </div>
          )}
          {!hasPremiumAccess && (
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/settings/billing">Upgrade to Pro</Link>
            </Button>
          )}
        </CardContent>
      </Card>
      {/* ── Sensitive Topics (LLM Classification) ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-5 w-5 text-primary" />
            Topic-Based Classification
          </CardTitle>
          <CardDescription>
            Define sensitive topics in plain language. When AI detection is enabled, prompts are classified against these topics using your configured AI provider.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.ai_detection_enabled && settings.ai_api_key ? (
            <SensitiveTopicsEditor orgId={orgId} canEdit={canEdit} />
          ) : (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Enable AI-Powered Detection above and configure an API key to use topic-based classification.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Sensitive Topics Editor ── */

function SensitiveTopicsEditor({ orgId, canEdit }: { orgId: string; canEdit: boolean }) {
  const [topics, setTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const db = createClient();
        const { data: { user } } = await db.auth.getUser();
        if (!user) return;
        const { data: profile } = await db.from("profiles").select("org_id").eq("id", user.id).single();
        if (!profile?.org_id) return;
        const { data: org } = await db.from("organizations").select("settings").eq("id", profile.org_id).single();
        const settings = (org?.settings || {}) as Record<string, unknown>;
        setTopics((settings.sensitive_topics as string[]) || []);
      } catch { /* */ } finally { setLoading(false); }
    }
    load();
  }, [orgId]);

  async function save(updatedTopics: string[]) {
    setSaving(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const db = createClient();
      const { data: { user } } = await db.auth.getUser();
      if (!user) return;
      const { data: profile } = await db.from("profiles").select("org_id").eq("id", user.id).single();
      if (!profile?.org_id) return;
      const { data: org } = await db.from("organizations").select("settings").eq("id", profile.org_id).single();
      const currentSettings = (org?.settings || {}) as Record<string, unknown>;
      await db.from("organizations").update({ settings: { ...currentSettings, sensitive_topics: updatedTopics } }).eq("id", profile.org_id);
      setTopics(updatedTopics);
      toast.success("Topics updated");
    } catch { toast.error("Failed to save"); } finally { setSaving(false); }
  }

  function addTopic() {
    if (!newTopic.trim()) return;
    const updated = [...topics, newTopic.trim()];
    setNewTopic("");
    save(updated);
  }

  function removeTopic(index: number) {
    const updated = topics.filter((_, i) => i !== index);
    save(updated);
  }

  if (loading) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Describe topics in natural language. The AI will classify prompts against each topic.
      </p>
      <div className="space-y-2">
        {topics.map((topic, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <span className="text-sm">{topic}</span>
            {canEdit && (
              <button onClick={() => removeTopic(i)} className="text-xs text-destructive hover:underline" disabled={saving}>
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      {canEdit && (
        <div className="flex gap-2">
          <Input
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder='e.g. "Customer financial data" or "Patient health information"'
            className="text-sm"
            onKeyDown={(e) => e.key === "Enter" && addTopic()}
          />
          <Button size="sm" onClick={addTopic} disabled={saving || !newTopic.trim()}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
          </Button>
        </div>
      )}
      {topics.length === 0 && (
        <p className="text-xs text-muted-foreground italic">
          No topics defined. Add topics like &quot;customer financial data&quot;, &quot;employee salary information&quot;, or &quot;unreleased product details&quot;.
        </p>
      )}
    </div>
  );
}
