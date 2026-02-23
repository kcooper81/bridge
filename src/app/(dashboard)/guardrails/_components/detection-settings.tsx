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
import {
  Brain,
  Sparkles,
  Zap,
  Lock,
  Info,
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
    smart_patterns_enabled: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (orgId) {
      getSecuritySettings(orgId).then(setSettings).catch(console.error);
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
            <div className="space-y-3">
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
                  <SelectItem value="presidio">Microsoft Presidio (Self-hosted)</SelectItem>
                  <SelectItem value="aws_comprehend">AWS Comprehend</SelectItem>
                  <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  AI detection requires additional configuration. Contact support for setup assistance.
                </p>
              </div>
            </div>
          )}
          {!hasPremiumAccess && (
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/settings/billing">Upgrade to Pro</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
