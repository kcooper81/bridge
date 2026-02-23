"use client";

import { useState, useEffect, useCallback } from "react";
import { useOrg } from "@/components/providers/org-provider";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NoOrgBanner } from "@/components/dashboard/no-org-banner";
import { installLibraryPack } from "@/lib/vault-api";
import { LIBRARY_PACKS } from "@/lib/library/packs";
import { toast } from "sonner";
import {
  Check,
  Code2,
  Crown,
  Download,
  Headphones,
  LayoutDashboard,
  Loader2,
  Megaphone,
  Scale,
  TrendingUp,
  Users,
} from "lucide-react";

// Map icon string names to components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  Megaphone,
  Headphones,
  TrendingUp,
  Users,
  Scale,
  LayoutDashboard,
  Crown,
};

export default function LibraryPage() {
  const { loading, noOrg, prompts, refresh } = useOrg();
  const [installedPacks, setInstalledPacks] = useState<Set<string>>(new Set());
  const [installingPack, setInstallingPack] = useState<string | null>(null);

  // Detect which packs are already installed by checking if prompt titles exist
  const detectInstalled = useCallback(() => {
    const promptTitles = new Set(prompts.map((p) => p.title));
    const installed = new Set<string>();

    for (const pack of LIBRARY_PACKS) {
      // A pack is "installed" if at least half its prompts exist
      const matchCount = pack.prompts.filter((sp) =>
        promptTitles.has(sp.title)
      ).length;
      if (matchCount >= Math.ceil(pack.prompts.length / 2)) {
        installed.add(pack.id);
      }
    }

    setInstalledPacks(installed);
  }, [prompts]);

  useEffect(() => {
    detectInstalled();
  }, [detectInstalled]);

  async function handleInstall(packId: string) {
    setInstallingPack(packId);
    try {
      const result = await installLibraryPack(packId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      const parts: string[] = [];
      if (result.promptsCreated > 0) parts.push(`${result.promptsCreated} prompts`);
      if (result.guidelinesCreated > 0) parts.push(`${result.guidelinesCreated} guidelines`);
      if (result.rulesCreated > 0) parts.push(`${result.rulesCreated} guardrails`);

      toast.success(parts.length > 0 ? `Installed: ${parts.join(", ")}` : "Pack installed");
      setInstalledPacks((prev) => {
        const next = new Set(Array.from(prev));
        next.add(packId);
        return next;
      });
      refresh();
    } catch {
      toast.error("Failed to install pack");
    } finally {
      setInstallingPack(null);
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader
          title="Template Library"
          description="Browse and install curated content packs for your team"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-56 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </>
    );
  }

  if (noOrg) {
    return (
      <>
        <PageHeader
          title="Template Library"
          description="Browse and install curated content packs for your team"
        />
        <NoOrgBanner />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Template Library"
        description="Browse and install curated content packs for your team. Each pack includes prompts, guidelines, and guardrails tailored to a specific role or function."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {LIBRARY_PACKS.map((pack) => {
          const IconComponent = ICON_MAP[pack.icon] || Code2;
          const isInstalled = installedPacks.has(pack.id);
          const isInstalling = installingPack === pack.id;

          // Count items
          const promptCount = pack.prompts.length;
          const guidelineCount = pack.guidelines.length;
          const guardrailCount = pack.guardrailCategories?.length || 0;

          return (
            <Card key={pack.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  {isInstalled && (
                    <Badge variant="outline" className="text-green-600 border-green-200 dark:text-green-400 dark:border-green-800">
                      <Check className="mr-1 h-3 w-3" />
                      Installed
                    </Badge>
                  )}
                </div>
                <CardTitle className="mt-3 text-base">{pack.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                  {pack.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {promptCount} {promptCount === 1 ? "prompt" : "prompts"}
                  </Badge>
                  {guidelineCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {guidelineCount} {guidelineCount === 1 ? "guideline" : "guidelines"}
                    </Badge>
                  )}
                  {guardrailCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {guardrailCount} {guardrailCount === 1 ? "guardrail" : "guardrails"}
                    </Badge>
                  )}
                </div>

                <Button
                  variant={isInstalled ? "outline" : "default"}
                  size="sm"
                  className="w-full"
                  disabled={isInstalled || isInstalling}
                  onClick={() => handleInstall(pack.id)}
                >
                  {isInstalling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Installing...
                    </>
                  ) : isInstalled ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Installed
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Install Pack
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
