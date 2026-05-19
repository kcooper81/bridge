"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ResendVerificationButton({
  email,
  className,
}: {
  email: string;
  className?: string;
}) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleClick() {
    if (!email) return;
    setSending(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSent(true);
        toast.success("If that account exists, we re-sent the confirmation email.");
      } else if (res.status === 429) {
        toast.error("Please wait a few minutes before requesting another email.");
      } else {
        toast.error("Couldn't send the email. Try again shortly.");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={sending || sent}
      className={className}
    >
      {sending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
      {sent ? "Email sent again" : "Resend confirmation email"}
    </Button>
  );
}
