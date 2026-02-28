"use client";

import { useOrg } from "@/components/providers/org-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface IntegrationCard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "available" | "coming_soon";
}

function GoogleIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
      <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
      <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
    </svg>
  );
}

function ScimIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

const integrations: IntegrationCard[] = [
  {
    id: "google_workspace",
    name: "Google Workspace",
    description:
      "Sync your organization's directory from Google Workspace. Import users and map Google groups to TeamPrompt teams.",
    icon: <GoogleIcon />,
    status: "available",
  },
  {
    id: "microsoft_entra",
    name: "Microsoft Entra ID",
    description:
      "Connect to Microsoft Entra ID (Azure AD) to sync your organization's directory and user groups.",
    icon: <MicrosoftIcon />,
    status: "coming_soon",
  },
  {
    id: "scim",
    name: "SCIM 2.0",
    description:
      "Enable SCIM provisioning for automated user lifecycle management with Okta, OneLogin, JumpCloud, and more.",
    icon: <ScimIcon />,
    status: "coming_soon",
  },
];

export default function IntegrationsPage() {
  const { currentUserRole } = useOrg();
  const isAdmin = currentUserRole === "admin";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/settings/organization"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Organization
        </Link>
        <h2 className="text-lg font-semibold">Integrations</h2>
        <p className="text-sm text-muted-foreground">
          Connect third-party directory providers to sync your team
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <Card
            key={integration.id}
            className="relative overflow-hidden"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-muted/50">
                  {integration.icon}
                </div>
                {integration.status === "coming_soon" ? (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Coming Soon
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground"
                  >
                    Not connected
                  </Badge>
                )}
              </div>

              <h3 className="font-semibold mb-1">{integration.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {integration.description}
              </p>

              {integration.status === "available" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={!isAdmin}
                  title={!isAdmin ? "Only admins can connect integrations" : undefined}
                >
                  Connect
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled
                >
                  Coming Soon
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
