"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Mail,
  Save,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { RichEditorRef } from "@/components/admin/rich-editor";
import Link from "next/link";

const RichEditor = dynamic(() => import("@/components/admin/rich-editor"), {
  ssr: false,
});

interface MailboxRow {
  id: string;
  email: string;
  display_name: string;
  signature_html: string | null;
  use_branded_template: boolean;
  auto_reply_enabled: boolean;
  auto_reply_subject: string | null;
  auto_reply_body: string | null;
}

export default function InboxSettingsPage() {
  const [mailboxes, setMailboxes] = useState<MailboxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit form
  const [displayName, setDisplayName] = useState("");
  const [useBrandedTemplate, setUseBrandedTemplate] = useState(true);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplySubject, setAutoReplySubject] = useState("");
  const [autoReplyBody, setAutoReplyBody] = useState("");
  const signatureEditorRef = useRef<RichEditorRef>(null);
  const [signatureLoaded, setSignatureLoaded] = useState(false);

  const loadMailboxes = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/mailbox-settings");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setMailboxes(data.mailboxes || []);
    } catch {
      toast.error("Failed to load mailbox settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMailboxes();
  }, [loadMailboxes]);

  const selected = mailboxes.find((m) => m.id === selectedId) || null;

  const selectMailbox = (mailbox: MailboxRow) => {
    setSelectedId(mailbox.id);
    setDisplayName(mailbox.display_name);
    setUseBrandedTemplate(mailbox.use_branded_template !== false);
    setAutoReplyEnabled(mailbox.auto_reply_enabled);
    setAutoReplySubject(mailbox.auto_reply_subject || "");
    setAutoReplyBody(mailbox.auto_reply_body || "");
    setSignatureLoaded(false);
    // Signature is loaded into the editor via useEffect below
  };

  // Load signature into editor when mailbox changes
  useEffect(() => {
    if (!selected || signatureLoaded) return;
    // Give the editor time to mount
    const timer = setTimeout(() => {
      if (signatureEditorRef.current && selected.signature_html) {
        signatureEditorRef.current.setHTML(selected.signature_html);
      }
      setSignatureLoaded(true);
    }, 200);
    return () => clearTimeout(timer);
  }, [selected, signatureLoaded]);

  const saveMailbox = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const signatureHtml = signatureEditorRef.current
        ? signatureEditorRef.current.getHTML()
        : selected?.signature_html || null;

      // Check if signature is empty (just an empty paragraph)
      const isSignatureEmpty =
        !signatureHtml ||
        signatureHtml === "<p></p>" ||
        signatureHtml.replace(/<[^>]*>/g, "").trim() === "";

      const res = await fetch("/api/admin/mailbox-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedId,
          display_name: displayName.trim(),
          signature_html: isSignatureEmpty ? null : signatureHtml,
          use_branded_template: useBrandedTemplate,
          auto_reply_enabled: autoReplyEnabled,
          auto_reply_subject: autoReplySubject.trim() || null,
          auto_reply_body: autoReplyBody.trim() || null,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      setMailboxes((prev) =>
        prev.map((m) => (m.id === selectedId ? data.mailbox : m))
      );
      toast.success("Mailbox settings saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/admin/settings" className="hover:text-foreground transition-colors">
            Settings
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Inbox</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Inbox Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure signatures, display names, and auto-responders for each mailbox.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Mailbox list */}
        <div className="border rounded-lg divide-y bg-card">
          <div className="px-4 py-3 bg-muted/50">
            <h3 className="text-sm font-medium">Mailboxes</h3>
          </div>
          {mailboxes.map((mailbox) => (
            <button
              key={mailbox.id}
              type="button"
              onClick={() => selectMailbox(mailbox)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                selectedId === mailbox.id && "bg-primary/5 border-l-2 border-l-primary"
              )}
            >
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{mailbox.display_name}</p>
                <p className="text-xs text-muted-foreground truncate">{mailbox.email}</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
                {mailbox.signature_html && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                    Sig
                  </Badge>
                )}
                {mailbox.use_branded_template === false && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                    Personal
                  </Badge>
                )}
                {mailbox.auto_reply_enabled && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                    Auto
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Edit panel */}
        {selected ? (
          <div className="border rounded-lg bg-card">
            <div className="px-6 py-4 border-b bg-muted/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                <h3 className="text-sm font-medium">{selected.email}</h3>
              </div>
              <Button size="sm" onClick={saveMailbox} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : (
                  <Save className="h-3.5 w-3.5 mr-1" />
                )}
                Save Changes
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Display Name */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Display Name</label>
                <p className="text-xs text-muted-foreground mb-2">
                  The &quot;From&quot; name shown to recipients (e.g., &quot;TeamPrompt Support&quot;)
                </p>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="TeamPrompt Support"
                />
              </div>

              <Separator />

              {/* Signature */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email Signature</label>
                <p className="text-xs text-muted-foreground mb-2">
                  HTML signature appended to replies from this mailbox. Use the editor to add your logo, links, and formatting.
                </p>
                <RichEditor
                  ref={signatureEditorRef}
                  placeholder="Add your email signature..."
                  className="min-h-[120px]"
                />
                {selected.signature_html && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Preview:</p>
                    <div
                      className="border rounded-md p-3 text-sm bg-muted/30"
                      dangerouslySetInnerHTML={{ __html: selected.signature_html }}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Branded Template Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium">Branded Email Template</label>
                  <Switch
                    checked={useBrandedTemplate}
                    onCheckedChange={setUseBrandedTemplate}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {useBrandedTemplate
                    ? "Replies use the full branded template with header, footer, and logo. Turn off for a more personal feel."
                    : "Replies look like a normal personal email — just your message and signature. No branding or logo."}
                </p>
              </div>

              <Separator />

              {/* Auto-Responder */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium">Auto-Responder</label>
                  <Switch
                    checked={autoReplyEnabled}
                    onCheckedChange={setAutoReplyEnabled}
                  />
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Automatically reply to new emails received at this mailbox. This is separate from the ticket acknowledgment email.
                </p>

                {autoReplyEnabled && (
                  <div className="space-y-3 pl-0 border-l-2 border-primary/20 ml-0 pl-4">
                    <div>
                      <label className="text-xs font-medium mb-1 block">Subject</label>
                      <Input
                        value={autoReplySubject}
                        onChange={(e) => setAutoReplySubject(e.target.value)}
                        placeholder="Out of office / We received your message"
                        className="h-9"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1 block">Body</label>
                      <Textarea
                        value={autoReplyBody}
                        onChange={(e) => setAutoReplyBody(e.target.value)}
                        placeholder="Thank you for reaching out. We'll get back to you within 24 hours."
                        rows={4}
                        className="resize-y"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg bg-card flex items-center justify-center p-12 text-center">
            <div>
              <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Select a mailbox to configure its settings
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
