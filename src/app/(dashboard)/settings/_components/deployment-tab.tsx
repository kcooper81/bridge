"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useOrg } from "@/components/providers/org-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCopy,
  Download,
  ExternalLink,
  Loader2,
  Monitor,
  RefreshCw,
  Shield,
  ShieldCheck,
} from "lucide-react";

// ── Types ──

type MdmPlatform = "google-admin" | "intune" | "jamf" | "gpo";
type EnforcementLevel = "monitor" | "restrict" | "lockdown";

interface ToolInfo {
  id: string;
  name: string;
  domains: string[];
  category: string;
  approved: boolean;
}

interface PolicyState {
  policyEnabled: boolean;
  tools: ToolInfo[];
  approvedTools: string[];
}

// ── Constants ──

const CHROME_EXTENSION_ID = "hpdekjimndbhdkebpedfgaceohplbpil";
const CHROME_UPDATE_URL = "https://clients2.google.com/service/update2/crx";
const EDGE_UPDATE_URL = "https://edge.microsoft.com/extensionwebstorebase/v1/crx";

const PLATFORMS: { id: MdmPlatform; name: string; icon: string; description: string }[] = [
  { id: "google-admin", name: "Google Admin Console", icon: "G", description: "Chrome Enterprise via Google Workspace" },
  { id: "intune", name: "Microsoft Intune", icon: "M", description: "Edge & Chrome via Endpoint Manager" },
  { id: "jamf", name: "JAMF Pro", icon: "J", description: "Chrome on macOS (managed profiles)" },
  { id: "gpo", name: "Windows GPO", icon: "W", description: "Group Policy for domain-joined PCs" },
];

const ENFORCEMENT_LEVELS: { id: EnforcementLevel; name: string; description: string; details: string[]; badge: string; badgeClass: string }[] = [
  {
    id: "monitor",
    name: "Monitor Only",
    description: "Best for rolling out gradually. See how your team uses AI before adding restrictions.",
    details: [
      "Extension installs silently — users see it in their toolbar",
      "DLP scanning runs on every prompt (blocks/warns/redacts per your guardrail rules)",
      "All AI tool usage is logged to your audit trail",
      "Users can still visit any AI tool — no domains are blocked",
      "Users cannot remove or disable the extension",
    ],
    badge: "Low",
    badgeClass: "bg-blue-500/10 text-blue-600 border-0",
  },
  {
    id: "restrict",
    name: "Restrict Unapproved Tools",
    description: "Block unapproved AI tools in the browser while allowing approved ones through.",
    details: [
      "Everything in Monitor, plus:",
      "Unapproved AI tool domains are blocked — users see \"blocked by your organization\"",
      "Approved tools (ChatGPT, Claude, etc.) work normally with DLP scanning active",
      "Users can still use incognito mode (extension runs there too)",
      "URL rules update when you change your tool policy and re-download the config",
    ],
    badge: "Medium",
    badgeClass: "bg-amber-500/10 text-amber-600 border-0",
  },
  {
    id: "lockdown",
    name: "Full Lockdown",
    description: "Maximum enforcement. No workarounds possible within the managed browser.",
    details: [
      "Everything in Restrict, plus:",
      "Incognito / InPrivate mode is completely disabled",
      "Developer tools are disabled (no console access to bypass)",
      "All other browser extensions are blocked (only TeamPrompt allowed)",
      "Guest mode is disabled — users must use their managed profile",
    ],
    badge: "High",
    badgeClass: "bg-red-500/10 text-red-600 border-0",
  },
];

// ── Config Generators ──

function generateBlockedUrls(tools: ToolInfo[], policyEnabled: boolean): string[] {
  if (!policyEnabled) return [];
  return tools
    .filter((t) => !t.approved)
    .flatMap((t) => t.domains.map((d) => `*://${d}/*`));
}

function generateAllowedUrls(tools: ToolInfo[], policyEnabled: boolean): string[] {
  if (!policyEnabled) return ["*://*/*"];
  return [
    "*://*.teamprompt.app/*",
    ...tools
      .filter((t) => t.approved)
      .flatMap((t) => t.domains.map((d) => `*://${d}/*`)),
  ];
}

function generateGoogleAdminConfig(
  level: EnforcementLevel,
  blockedUrls: string[],
  allowedUrls: string[],
) {
  const config: Record<string, unknown> = {
    // Force-install extension
    ExtensionInstallForcelist: [`${CHROME_EXTENSION_ID};${CHROME_UPDATE_URL}`],
    // Prevent users from disabling force-installed extensions
    ExtensionSettings: {
      [CHROME_EXTENSION_ID]: {
        installation_mode: "force_installed",
        update_url: CHROME_UPDATE_URL,
        toolbar_pin: "force_pinned",
      },
    },
  };

  if (level === "restrict" || level === "lockdown") {
    config.URLBlocklist = blockedUrls;
    config.URLAllowlist = allowedUrls;
  }

  if (level === "lockdown") {
    config.IncognitoModeAvailability = 1; // 0=enabled, 1=disabled, 2=forced
    config.DeveloperToolsAvailability = 2; // 0=allowed, 1=allowed for extensions, 2=disabled
    config.ExtensionInstallBlocklist = ["*"]; // Block all extensions except force-installed
    config.ExtensionInstallAllowlist = [CHROME_EXTENSION_ID];
    config.BrowserGuestModeEnabled = false;
  }

  return config;
}

function generateIntuneConfig(
  level: EnforcementLevel,
  blockedUrls: string[],
  allowedUrls: string[],
) {
  // Intune uses OMA-URI settings for both Chrome and Edge
  const settings: { name: string; omaUri: string; value: string; description: string }[] = [
    {
      name: "Force Install Extension (Chrome)",
      omaUri: "./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome~Extensions/ExtensionInstallForcelist",
      value: `<enabled/>\n<data id="ExtensionInstallForcelistDesc" value="1&#xF000;${CHROME_EXTENSION_ID};${CHROME_UPDATE_URL}"/>`,
      description: "Silently installs the TeamPrompt extension in Chrome",
    },
    {
      name: "Force Install Extension (Edge)",
      omaUri: "./Device/Vendor/MSFT/Policy/Config/Microsoft Edge~Policy~microsoft_edge~Extensions/ExtensionInstallForcelist",
      value: `<enabled/>\n<data id="ExtensionInstallForcelistDesc" value="1&#xF000;${CHROME_EXTENSION_ID};${EDGE_UPDATE_URL}"/>`,
      description: "Silently installs the TeamPrompt extension in Edge",
    },
  ];

  if (level === "restrict" || level === "lockdown") {
    settings.push({
      name: "URL Blocklist (Chrome)",
      omaUri: "./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome/URLBlocklist",
      value: `<enabled/>\n${blockedUrls.map((u, i) => `<data id="URLBlocklistDesc" value="${i + 1}&#xF000;${u}"/>`).join("\n")}`,
      description: "Blocks unapproved AI tool domains in Chrome",
    });
    settings.push({
      name: "URL Blocklist (Edge)",
      omaUri: "./Device/Vendor/MSFT/Policy/Config/Microsoft Edge~Policy~microsoft_edge/URLBlocklist",
      value: `<enabled/>\n${blockedUrls.map((u, i) => `<data id="URLBlocklistDesc" value="${i + 1}&#xF000;${u}"/>`).join("\n")}`,
      description: "Blocks unapproved AI tool domains in Edge",
    });
    settings.push({
      name: "URL Allowlist (Chrome)",
      omaUri: "./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome/URLAllowlist",
      value: `<enabled/>\n${allowedUrls.map((u, i) => `<data id="URLAllowlistDesc" value="${i + 1}&#xF000;${u}"/>`).join("\n")}`,
      description: "Allows approved AI tool domains in Chrome",
    });
    settings.push({
      name: "URL Allowlist (Edge)",
      omaUri: "./Device/Vendor/MSFT/Policy/Config/Microsoft Edge~Policy~microsoft_edge/URLAllowlist",
      value: `<enabled/>\n${allowedUrls.map((u, i) => `<data id="URLAllowlistDesc" value="${i + 1}&#xF000;${u}"/>`).join("\n")}`,
      description: "Allows approved AI tool domains in Edge",
    });
  }

  if (level === "lockdown") {
    settings.push({
      name: "Disable Incognito (Chrome)",
      omaUri: "./Device/Vendor/MSFT/Policy/Config/Chrome~Policy~googlechrome/IncognitoModeAvailability",
      value: "<enabled/>\n<data id=\"IncognitoModeAvailability\" value=\"1\"/>",
      description: "Prevents users from opening incognito windows",
    });
    settings.push({
      name: "Disable Incognito (Edge)",
      omaUri: "./Device/Vendor/MSFT/Policy/Config/Microsoft Edge~Policy~microsoft_edge/InPrivateModeAvailability",
      value: "<enabled/>\n<data id=\"InPrivateModeAvailability\" value=\"1\"/>",
      description: "Prevents users from opening InPrivate windows",
    });
  }

  return settings;
}

function generateJamfConfig(
  level: EnforcementLevel,
  blockedUrls: string[],
  allowedUrls: string[],
) {
  // JAMF uses .mobileconfig (plist) format for Chrome policies
  const policies: Record<string, unknown> = {
    PayloadType: "com.google.Chrome",
    PayloadDisplayName: "TeamPrompt Chrome Policy",
    PayloadDescription: "Managed browser policy for TeamPrompt AI governance",
    ExtensionInstallForcelist: [`${CHROME_EXTENSION_ID};${CHROME_UPDATE_URL}`],
  };

  if (level === "restrict" || level === "lockdown") {
    policies.URLBlocklist = blockedUrls;
    policies.URLAllowlist = allowedUrls;
  }

  if (level === "lockdown") {
    policies.IncognitoModeAvailability = 1;
    policies.DeveloperToolsAvailability = 2;
    policies.ExtensionInstallBlocklist = ["*"];
    policies.ExtensionInstallAllowlist = [CHROME_EXTENSION_ID];
    policies.BrowserGuestModeEnabled = false;
  }

  return policies;
}

function generateGpoConfig(
  level: EnforcementLevel,
  blockedUrls: string[],
  allowedUrls: string[],
) {
  // GPO uses registry keys
  const keys: { path: string; name: string; type: string; value: string; description: string }[] = [
    {
      path: "HKLM\\SOFTWARE\\Policies\\Google\\Chrome\\ExtensionInstallForcelist",
      name: "1",
      type: "REG_SZ",
      value: `${CHROME_EXTENSION_ID};${CHROME_UPDATE_URL}`,
      description: "Force-install TeamPrompt extension",
    },
    {
      path: "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge\\ExtensionInstallForcelist",
      name: "1",
      type: "REG_SZ",
      value: `${CHROME_EXTENSION_ID};${EDGE_UPDATE_URL}`,
      description: "Force-install TeamPrompt extension (Edge)",
    },
  ];

  if (level === "restrict" || level === "lockdown") {
    blockedUrls.forEach((url, i) => {
      keys.push({
        path: "HKLM\\SOFTWARE\\Policies\\Google\\Chrome\\URLBlocklist",
        name: `${i + 1}`,
        type: "REG_SZ",
        value: url,
        description: i === 0 ? "Block unapproved AI tool domains (Chrome)" : "",
      });
      // Edge URL blocklist
      keys.push({
        path: "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge\\URLBlocklist",
        name: `${i + 1}`,
        type: "REG_SZ",
        value: url,
        description: i === 0 ? "Block unapproved AI tool domains (Edge)" : "",
      });
    });
    // URL allowlist for both browsers
    allowedUrls.forEach((url, i) => {
      keys.push({
        path: "HKLM\\SOFTWARE\\Policies\\Google\\Chrome\\URLAllowlist",
        name: `${i + 1}`,
        type: "REG_SZ",
        value: url,
        description: i === 0 ? "Allow approved AI tools + TeamPrompt (Chrome)" : "",
      });
      keys.push({
        path: "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge\\URLAllowlist",
        name: `${i + 1}`,
        type: "REG_SZ",
        value: url,
        description: i === 0 ? "Allow approved AI tools + TeamPrompt (Edge)" : "",
      });
    });
  }

  if (level === "lockdown") {
    // Chrome lockdown policies
    keys.push({
      path: "HKLM\\SOFTWARE\\Policies\\Google\\Chrome",
      name: "IncognitoModeAvailability",
      type: "REG_DWORD",
      value: "1",
      description: "Disable incognito mode (Chrome)",
    });
    keys.push({
      path: "HKLM\\SOFTWARE\\Policies\\Google\\Chrome",
      name: "DeveloperToolsAvailability",
      type: "REG_DWORD",
      value: "2",
      description: "Disable developer tools (Chrome)",
    });
    keys.push({
      path: "HKLM\\SOFTWARE\\Policies\\Google\\Chrome",
      name: "BrowserGuestModeEnabled",
      type: "REG_DWORD",
      value: "0",
      description: "Disable guest mode (Chrome)",
    });
    // Edge lockdown policies
    keys.push({
      path: "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge",
      name: "InPrivateModeAvailability",
      type: "REG_DWORD",
      value: "1",
      description: "Disable InPrivate mode (Edge)",
    });
    keys.push({
      path: "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge",
      name: "DeveloperToolsAvailability",
      type: "REG_DWORD",
      value: "2",
      description: "Disable developer tools (Edge)",
    });
    keys.push({
      path: "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge",
      name: "BrowserGuestModeEnabled",
      type: "REG_DWORD",
      value: "0",
      description: "Disable guest mode (Edge)",
    });
  }

  return keys;
}

function generateRegFile(keys: ReturnType<typeof generateGpoConfig>): string {
  const lines = ["Windows Registry Editor Version 5.00", ""];
  const grouped: Record<string, { name: string; type: string; value: string }[]> = {};

  for (const key of keys) {
    if (!grouped[key.path]) grouped[key.path] = [];
    grouped[key.path].push({ name: key.name, type: key.type, value: key.value });
  }

  for (const [path, entries] of Object.entries(grouped)) {
    lines.push(`[${path}]`);
    for (const entry of entries) {
      if (entry.type === "REG_DWORD") {
        const num = parseInt(entry.value, 10);
        const hex = isNaN(num) ? "00000000" : num.toString(16).padStart(8, "0");
        lines.push(`"${entry.name}"=dword:${hex}`);
      } else {
        lines.push(`"${entry.name}"="${entry.value.replace(/\\/g, "\\\\")}"`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ── Deployment Guides ──

const DEPLOYMENT_GUIDES: Record<MdmPlatform, { title: string; steps: { text: string; detail?: string; link?: string }[] }> = {
  "google-admin": {
    title: "Deploy via Google Admin Console",
    steps: [
      { text: "Open Google Admin Console", link: "https://admin.google.com" },
      { text: "Navigate to Devices > Chrome > Settings > Users & browsers" },
      { text: "Select the organizational unit to apply the policy to (or Root for all users)" },
      { text: "Scroll to Extensions > Force-installed extensions" },
      { text: "Click the extension ID field and paste the TeamPrompt extension ID", detail: CHROME_EXTENSION_ID },
      { text: "For URL blocking: scroll to Content > URL blocking and paste the blocked URLs from the config below" },
      { text: "For lockdown: scroll to Security > Incognito mode and set to 'Disallow incognito mode'" },
      { text: "Click Save. Changes propagate within 24 hours (or force with chrome://policy refresh)", detail: "Users will see the extension appear automatically on their next Chrome launch. They cannot remove or disable it." },
    ],
  },
  intune: {
    title: "Deploy via Microsoft Intune",
    steps: [
      { text: "Open Microsoft Intune admin center", link: "https://intune.microsoft.com" },
      { text: "Navigate to Devices > Configuration > Create > New policy" },
      { text: "Select Platform: Windows 10 and later, Profile type: Settings catalog" },
      { text: "Name the profile 'TeamPrompt Browser Policy'" },
      { text: "Click Add settings > search for 'ExtensionInstallForcelist'" },
      { text: "Add the Chrome and/or Edge extension force-install entries from the config below" },
      { text: "For URL blocking: search for 'URLBlocklist' and add each blocked domain" },
      { text: "For lockdown: search for 'IncognitoModeAvailability' and set to 1 (disabled)" },
      { text: "Assign the profile to the appropriate device or user groups" },
      { text: "Click Review + create", detail: "Policies deploy at next device sync (usually within 1 hour). Force sync via Settings > Accounts > Access work or school > Info > Sync." },
    ],
  },
  jamf: {
    title: "Deploy via JAMF Pro",
    steps: [
      { text: "Open JAMF Pro", link: "https://your-instance.jamfcloud.com" },
      { text: "Navigate to Computers > Configuration Profiles > New" },
      { text: "Name the profile 'TeamPrompt Browser Policy'" },
      { text: "Click Application & Custom Settings > External Applications > Add > Chrome" },
      { text: "Under Preference Domain, enter: com.google.Chrome" },
      { text: "Upload the JSON config below (or paste individual keys)" },
      { text: "Scope the profile to the appropriate computer groups or departments" },
      { text: "Click Save", detail: "Profile deploys at next JAMF check-in. Force with: sudo jamf policy" },
    ],
  },
  gpo: {
    title: "Deploy via Windows Group Policy",
    steps: [
      { text: "Download Chrome ADMX templates if not already installed", link: "https://chromeenterprise.google/browser/download/#manage-policies-tab" },
      { text: "Open Group Policy Management Console (gpmc.msc)" },
      { text: "Create or edit a GPO linked to the target OU" },
      { text: "Navigate to Computer Configuration > Administrative Templates > Google Chrome > Extensions" },
      { text: "Open 'Configure the list of force-installed extensions'" },
      { text: "Enable the policy and add the TeamPrompt extension entry from the config below" },
      { text: "For URL blocking: navigate to Google Chrome > Block access to a list of URLs" },
      { text: "For lockdown: enable 'Incognito mode availability' and set to 'Incognito mode disabled'" },
      { text: "Close the editor and force a gpupdate on target machines", detail: "Run: gpupdate /force on each machine, or wait for the next Group Policy refresh cycle (default: 90 minutes)." },
      { text: "Alternative: download the .reg file below and import it directly", detail: "Right-click the .reg file > Merge. Requires admin privileges. Useful for testing before rolling out via GPO." },
    ],
  },
};

// ── Component ──

const WIZARD_STEPS = [
  { id: 1, label: "Platform", short: "MDM" },
  { id: 2, label: "Enforcement", short: "Level" },
  { id: 3, label: "Config", short: "Config" },
  { id: 4, label: "Deploy", short: "Deploy" },
];

export function DeploymentTab() {
  const { currentUserRole } = useOrg();
  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState<MdmPlatform>("google-admin");
  const [level, setLevel] = useState<EnforcementLevel>("restrict");
  const [policy, setPolicy] = useState<PolicyState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [includeEdge, setIncludeEdge] = useState(true);

  const isAdmin = currentUserRole === "admin";

  // Fetch current tool policy
  const fetchPolicy = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Not signed in");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/guardrails/tool-policy", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to load tool policy");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setPolicy(data);
      setError(null);
    } catch {
      setError("Failed to load tool policy");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPolicy(); }, [fetchPolicy]);

  // Generate config based on selections
  const blockedUrls = policy ? generateBlockedUrls(policy.tools, policy.policyEnabled) : [];
  const allowedUrls = policy ? generateAllowedUrls(policy.tools, policy.policyEnabled) : [];

  const configOutput = (() => {
    switch (platform) {
      case "google-admin":
        return JSON.stringify(generateGoogleAdminConfig(level, blockedUrls, allowedUrls), null, 2);
      case "intune": {
        const settings = generateIntuneConfig(level, blockedUrls, allowedUrls);
        // Filter out Edge entries if toggle is off
        const filtered = includeEdge ? settings : settings.filter((s) => !s.name.includes("(Edge)"));
        return JSON.stringify(filtered, null, 2);
      }
      case "jamf":
        return JSON.stringify(generateJamfConfig(level, blockedUrls, allowedUrls), null, 2);
      case "gpo": {
        let keys = generateGpoConfig(level, blockedUrls, allowedUrls);
        if (!includeEdge) keys = keys.filter((k) => !k.path.includes("Microsoft\\Edge"));
        // Show .reg format for GPO (not JSON)
        return generateRegFile(keys);
      }
    }
  })();

  function handleCopy() {
    if (!navigator.clipboard) {
      toast.error("Clipboard not available. Use Download instead.");
      return;
    }
    navigator.clipboard.writeText(configOutput).then(() => {
      setCopied(true);
      toast.success("Config copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error("Failed to copy. Use Download instead.");
    });
  }

  function handleDownload() {
    let filename: string;
    let content: string;
    let mimeType = "application/json";

    switch (platform) {
      case "google-admin":
        filename = "teamprompt-chrome-policy.json";
        content = configOutput;
        break;
      case "intune":
        filename = "teamprompt-intune-settings.json";
        content = configOutput;
        break;
      case "jamf":
        filename = "teamprompt-jamf-chrome.json";
        content = configOutput;
        break;
      case "gpo":
        filename = "teamprompt-browser-policy.reg";
        content = configOutput; // Already in .reg format
        mimeType = "text/plain";
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Shield className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Only admins can manage browser deployment policies.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-amber-500" />
          <p className="text-sm font-medium mb-1">Couldn&apos;t load deployment settings</p>
          <p className="text-xs text-muted-foreground mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={() => { setLoading(true); setError(null); fetchPolicy(); }}>
            <RefreshCw className="mr-2 h-3 w-3" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const blockedCount = policy?.tools.filter((t) => !t.approved).length || 0;
  const approvedCount = policy?.tools.filter((t) => t.approved).length || 0;
  const platformName = PLATFORMS.find((p) => p.id === platform)?.name || "";
  const levelName = ENFORCEMENT_LEVELS.find((l) => l.id === level)?.name || "";
  const guide = DEPLOYMENT_GUIDES[platform];
  const showEdgeToggle = platform === "intune" || platform === "gpo";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Managed Browser Deployment
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Push TeamPrompt to every managed browser — users can&apos;t remove or disable it.
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-1">
        {WIZARD_STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <button
              onClick={() => setStep(s.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all w-full",
                step === s.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : s.id < step
                    ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              <span className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0",
                step === s.id
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : s.id < step
                    ? "bg-emerald-500/20 text-emerald-600"
                    : "bg-muted-foreground/10 text-muted-foreground"
              )}>
                {s.id < step ? <Check className="h-3 w-3" /> : s.id}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.short}</span>
            </button>
            {i < WIZARD_STEPS.length - 1 && (
              <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 mx-0.5", s.id < step ? "text-emerald-400" : "text-muted-foreground/30")} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 1: Platform ── */}
      {step === 1 && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div>
              <p className="text-sm font-semibold">Which MDM does your organization use?</p>
              <p className="text-xs text-muted-foreground mt-1">
                This determines the config format. If you&apos;re not sure, ask your IT team.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                    platform === p.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30 hover:bg-muted/30"
                  )}
                >
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold shrink-0",
                    platform === p.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {p.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.description}</p>
                  </div>
                  {platform === p.id && <Check className="h-4 w-4 text-primary shrink-0 ml-auto" />}
                </button>
              ))}
            </div>

            {/* Edge toggle for Intune/GPO */}
            {showEdgeToggle && (
              <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-2.5">
                <Switch checked={includeEdge} onCheckedChange={setIncludeEdge} />
                <div>
                  <p className="text-xs font-medium">Include Microsoft Edge policies</p>
                  <p className="text-[10px] text-muted-foreground">Apply the same rules to Edge alongside Chrome</p>
                </div>
              </div>
            )}

            <Button className="w-full" onClick={() => setStep(2)}>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Enforcement level ── */}
      {step === 2 && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div>
              <p className="text-sm font-semibold">How strict should the policy be?</p>
              <p className="text-xs text-muted-foreground mt-1">
                You can change this later by re-downloading the config.
              </p>
            </div>

            <div className="space-y-2">
              {ENFORCEMENT_LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  className={cn(
                    "flex items-start gap-3 w-full rounded-xl border px-4 py-3 text-left transition-all",
                    level === l.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30 hover:bg-muted/30"
                  )}
                >
                  <div className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2 shrink-0 mt-0.5",
                    level === l.id ? "border-primary bg-primary" : "border-muted-foreground/30"
                  )}>
                    {level === l.id && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{l.name}</p>
                      <Badge className={cn("text-[10px]", l.badgeClass)}>{l.badge}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{l.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* What this level does */}
            {(() => {
              const selected = ENFORCEMENT_LEVELS.find((l) => l.id === level);
              if (!selected) return null;
              return (
                <div className="rounded-xl border border-primary/20 bg-primary/[0.02] p-3">
                  <p className="text-xs font-semibold mb-2">What your users will experience:</p>
                  <ul className="space-y-1.5">
                    {selected.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        {d.endsWith(":") ? (
                          <span className="font-medium text-foreground/70">{d}</span>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <span>{d}</span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}

            {/* Policy status */}
            {(level === "restrict" || level === "lockdown") && !policy?.policyEnabled && (
              <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-amber-600">No tool policy set</p>
                  <p className="text-[10px] text-muted-foreground">URL blocking requires an active tool policy. The config will still force-install the extension.</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs shrink-0" asChild>
                  <a href="/guardrails">Set Up</a>
                </Button>
              </div>
            )}

            {(level === "restrict" || level === "lockdown") && policy?.policyEnabled && (
              <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <strong className="text-emerald-600">{approvedCount} approved</strong>, <strong className="text-red-500">{blockedCount} blocked</strong> tools will be enforced in the browser.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 3: Config output ── */}
      {step === 3 && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div>
              <p className="text-sm font-semibold">Your {platformName} config is ready</p>
              <p className="text-xs text-muted-foreground mt-1">
                Copy or download, then import into {platformName}.
              </p>
            </div>

            {/* What's included */}
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs font-semibold mb-2">This config will:</p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Force-install TeamPrompt extension</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Pin extension to toolbar</span>
                </div>
                {(level === "restrict" || level === "lockdown") && policy?.policyEnabled && (
                  <>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Block {blockedCount} unapproved domains</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Allow {approvedCount} approved tools</span>
                    </div>
                  </>
                )}
                {level === "lockdown" && (
                  <>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Disable incognito{showEdgeToggle ? " / InPrivate" : ""}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>Disable dev tools + guest mode</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Config preview */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-muted/30">
                <p className="text-xs font-medium text-muted-foreground">
                  {platform === "gpo" ? "Windows Registry (.reg)" : `${platformName} config`}
                </p>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleCopy}>
                    {copied ? <Check className="mr-1.5 h-3 w-3" /> : <ClipboardCopy className="mr-1.5 h-3 w-3" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleDownload}>
                    <Download className="mr-1.5 h-3 w-3" />
                    {platform === "gpo" ? ".reg file" : "Download"}
                  </Button>
                </div>
              </div>
              <pre className="p-4 text-[11px] leading-relaxed overflow-x-auto max-h-64 overflow-y-auto bg-background">
                {configOutput}
              </pre>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(4)}>
                I&apos;ve downloaded the config
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 4: Deploy + Verify ── */}
      {step === 4 && (
        <div className="space-y-4">
          {/* Deployment guide */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{guide.title}</CardTitle>
              <p className="text-xs text-muted-foreground">
                Using: <strong>{platformName}</strong> &middot; <strong>{levelName}</strong>
                {showEdgeToggle && <> &middot; Edge: <strong>{includeEdge ? "Yes" : "No"}</strong></>}
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <ol className="space-y-3">
                {guide.steps.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        {s.text}
                        {s.link && (
                          <a href={s.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 ml-1 text-primary hover:underline">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </p>
                      {s.detail && (
                        <p className="text-xs text-muted-foreground mt-1 rounded-md bg-muted/50 px-2.5 py-1.5 font-mono break-all">
                          {s.detail}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Verification checklist */}
          <Card className="bg-muted/30 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Verify it&apos;s working
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <p>After deploying, check a managed device:</p>
              <ol className="space-y-1.5 list-decimal list-inside">
                <li>Open {showEdgeToggle ? "Chrome or Edge" : "Chrome"} on a managed device</li>
                <li>Go to <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{showEdgeToggle ? "chrome://extensions (or edge://extensions)" : "chrome://extensions"}</code> — TeamPrompt shows &ldquo;Installed by your organization&rdquo;</li>
                <li>Go to <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{showEdgeToggle ? "chrome://policy (or edge://policy)" : "chrome://policy"}</code> — your policies are listed</li>
                {(level === "restrict" || level === "lockdown") && policy?.policyEnabled && (
                  <li>Visit a blocked AI tool — should show &ldquo;blocked by your organization&rdquo;</li>
                )}
                {level === "lockdown" && (
                  <>
                    <li>Try incognito{showEdgeToggle ? "/InPrivate" : ""} — should be disabled</li>
                    <li>Try F12 for dev tools — should not open</li>
                  </>
                )}
                <li>Visit an approved AI tool and type — the TeamPrompt overlay should appear</li>
              </ol>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to config
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download config again
            </Button>
          </div>

          {/* FAQ */}
          <div className="space-y-2 pt-2">
            <p className="text-sm font-semibold">Common Questions</p>
            {[
              {
                q: "Does this work on personal (BYOD) devices?",
                a: "Chrome policies apply to managed Chrome profiles, not the entire browser. If your org uses Google Workspace, policies apply when the user signs into their work Chrome profile — even on a personal laptop. Intune/JAMF require device enrollment.",
              },
              {
                q: "What happens if a user uses Firefox or Safari?",
                a: "Chrome/Edge policies only apply to Chrome and Edge. For Firefox, you'd need a separate deployment via Firefox Enterprise policies (similar format). Safari doesn't support managed extensions. For full coverage, combine browser policies with Cloudflare DNS blocking.",
              },
              {
                q: "How often should I re-generate the config?",
                a: "Re-download whenever you change your AI tool approval policy (add/remove approved tools). The extension itself auto-updates from the Chrome Web Store — no redeployment needed for extension updates.",
              },
              {
                q: "Can users bypass URL blocking with a VPN?",
                a: "Browser-level URL blocking happens before the network request, so VPNs don't bypass it. However, users could use a non-managed browser. For airtight enforcement, combine with Cloudflare DNS blocking (covers all browsers and apps on the network).",
              },
              {
                q: "What's the difference between this and Cloudflare?",
                a: "Browser policies enforce rules in Chrome/Edge specifically (extension install + URL blocking). Cloudflare enforces at the DNS/network level (covers all apps, all browsers). Use both for defense-in-depth, or browser policies alone if you don't need network-level enforcement. Set up Cloudflare in Settings \u2192 Integrations.",
              },
            ].map((faq, i) => (
              <details key={i} className="group rounded-lg border border-border">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm font-medium">
                  {faq.q}
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <p className="px-4 pb-3 text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
