"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import RichEditor from "@/components/admin/rich-editor";
import type { RichEditorRef } from "@/components/admin/rich-editor";

interface ComposeEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-filled recipient email */
  toEmail?: string;
  /** Pre-filled recipient name */
  toName?: string;
  /** Pre-filled subject line */
  subject?: string;
  /** Organization ID to associate with the ticket */
  orgId?: string;
  /** Callback after successful send */
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
  const editorRef = useRef<RichEditorRef>(null);

  // Reset form when modal opens with new props
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setToEmail(initialEmail);
      setToName(initialName);
      setSubject(initialSubject);
    }
    onOpenChange(open);
  };

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
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send");
      }

      const data = await res.json();

      if (data.email_sent) {
        toast.success(`Email sent to ${toEmail}`);
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
          <DialogDescription>
            This will send an email and create a ticket in your inbox for tracking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
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
          <p className="text-[11px] text-muted-foreground">
            Logged as a ticket in your inbox
          </p>
          <Button onClick={handleSend} disabled={sending} className="gap-1.5">
            {sending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Send Email
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
