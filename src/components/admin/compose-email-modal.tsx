"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import RichEditor from "@/components/admin/rich-editor";
import type { RichEditorRef } from "@/components/admin/rich-editor";

interface Mailbox {
  email: string;
  display_name: string;
  use_branded_template?: boolean;
}

interface ComposeEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toEmail?: string;
  toName?: string;
  subject?: string;
  orgId?: string;
  onSent?: (ticketId: string) => void;
}

export function ComposeEmailModal({
  open,
  onOpenChange,
  toEmail: initialEmail = "",
  toName: initialName = "",
  subject: initialSubject = "",
  orgId,
  onSent,
}: ComposeEmailModalProps) {
  const [toEmail, setToEmail] = useState(initialEmail);
  const [toName, setToName] = useState(initialName);
  const [subject, setSubject] = useState(initialSubject);
  const [sending, setSending] = useState(false);
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [selectedInbox, setSelectedInbox] = useState("support@teamprompt.app");
  const [plainEmail, setPlainEmail] = useState(false);
  const editorRef = useRef<RichEditorRef>(null);

  useEffect(() => { setToEmail(initialEmail); }, [initialEmail]);
  useEffect(() => { setToName(initialName); }, [initialName]);
  useEffect(() => { setSubject(initialSubject); }, [initialSubject]);

  // Load mailboxes when modal opens
  const loadMailboxes = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/mailboxes");
      if (res.ok) {
        const data = await res.json();
        setMailboxes(data.mailboxes || []);
      }
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => {
    if (open) loadMailboxes();
  }, [open, loadMailboxes]);

  // When inbox changes, check if that mailbox has branded template off by default
  useEffect(() => {
    const mailbox = mailboxes.find((m) => m.email === selectedInbox);
    if (mailbox && mailbox.use_branded_template === false) {
      setPlainEmail(true);
    }
  }, [selectedInbox, mailboxes]);

  const handleSend = async () => {
    if (!toEmail.trim() || !subject.trim()) {
      toast.error("Email and subject are required");
      return;
    }
    if (!editorRef.current || editorRef.current.isEmpty()) {
      toast.error("Message body is required");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/admin/tickets/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_email: toEmail.trim(),
          to_name: toName.trim() || undefined,
          subject: subject.trim(),
          message: editorRef.current.getHTML(),
          is_html: true,
          org_id: orgId || undefined,
          inbox_email: selectedInbox,
          plain_email: plainEmail,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send");
      }

      const data = await res.json();

      if (data.email_sent) {
        toast.success(`Email sent from ${selectedInbox}`);
      } else {
        toast.success("Ticket created (email sending not configured)");
      }

      editorRef.current.clear();
      onOpenChange(false);
      onSent?.(data.ticket_id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
          <DialogDescription>
            Send an email and track the conversation in your inbox.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {/* From inbox selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">From</label>
            <Select value={selectedInbox} onValueChange={setSelectedInbox}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mailboxes.length > 0 ? (
                  mailboxes.map((m) => (
                    <SelectItem key={m.email} value={m.email}>
                      {m.display_name} &lt;{m.email}&gt;
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="support@teamprompt.app">
                    TeamPrompt Support &lt;support@teamprompt.app&gt;
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">To</label>
              <Input
                placeholder="email@example.com"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                className="h-9 text-sm"
                type="email"
              />
            </div>
            <div className="w-40">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Name</label>
              <Input
                placeholder="Optional"
                value={toName}
                onChange={(e) => setToName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label>
            <Input
              placeholder="Subject line"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Message</label>
            <RichEditor ref={editorRef} placeholder="Write your message..." />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="rounded"
                checked={!plainEmail}
                onChange={(e) => setPlainEmail(!e.target.checked)}
              />
              <Sparkles className="h-3 w-3" />
              Branded template
            </label>
            {plainEmail && (
              <span className="text-[10px] text-muted-foreground">
                Sends as a plain email — like Gmail
              </span>
            )}
          </div>
          <Button onClick={handleSend} disabled={sending} className="gap-1.5">
            {sending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
