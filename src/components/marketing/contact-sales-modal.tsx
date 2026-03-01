"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight } from "lucide-react";

export function ContactSalesModal({
  children,
  buttonVariant = "default",
}: {
  children?: React.ReactNode;
  buttonVariant?: "default" | "outline-dark";
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          type: "sales",
          subject: `Enterprise inquiry — ${company || "Unknown company"} (${teamSize || "Unknown size"})`,
          message: `Company: ${company}\nTeam size: ${teamSize}\n\n${message}`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong. Please try again.");
        return;
      }

      toast.success("Thanks! Our sales team will be in touch soon.");
      setName("");
      setEmail("");
      setCompany("");
      setTeamSize("");
      setMessage("");
      setOpen(false);
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const trigger = children ?? (
    <Button
      size="lg"
      variant={buttonVariant === "outline-dark" ? "outline" : "default"}
      className={
        buttonVariant === "outline-dark"
          ? "text-base px-8 h-12 rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white font-semibold bg-transparent"
          : "text-base px-8 h-12 rounded-full font-semibold"
      }
    >
      Talk to sales
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Contact Sales</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Tell us about your team and we&apos;ll follow up within one business
            day.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sales-name">Name</Label>
              <Input
                id="sales-name"
                placeholder="Your name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sales-email">Work Email</Label>
              <Input
                id="sales-email"
                type="email"
                placeholder="you@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sales-company">Company</Label>
              <Input
                id="sales-company"
                placeholder="Company name"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Team Size</Label>
              <Select value={teamSize} onValueChange={setTeamSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1–10</SelectItem>
                  <SelectItem value="11-50">11–50</SelectItem>
                  <SelectItem value="51-200">51–200</SelectItem>
                  <SelectItem value="201-500">201–500</SelectItem>
                  <SelectItem value="500+">500+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sales-message">How can we help?</Label>
            <Textarea
              id="sales-message"
              placeholder="Tell us about your use case, compliance needs, or deployment questions..."
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full"
          >
            {submitting ? "Sending..." : "Send to Sales"}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground">
            Or email us directly at{" "}
            <a
              href="mailto:sales@teamprompt.app"
              className="text-primary hover:underline"
            >
              sales@teamprompt.app
            </a>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
