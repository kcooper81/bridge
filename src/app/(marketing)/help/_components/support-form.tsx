"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePlus, Send, X } from "lucide-react";

export function SupportForm() {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("feedback");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [screenshots, setScreenshots] = useState<{ name: string; dataUrl: string }[]>([]);

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
          type,
          subject,
          message,
          screenshots: screenshots.map((s) => ({ name: s.name, dataUrl: s.dataUrl })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Something went wrong. Please try again.");
        return;
      }

      toast.success("Message sent! We'll get back to you soon.");
      setName("");
      setEmail("");
      setType("feedback");
      setSubject("");
      setMessage("");
      setScreenshots([]);
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const MAX_SIZE = 5 * 1024 * 1024;
    const MAX_FILES = 3;

    Array.from(files).forEach((file) => {
      if (screenshots.length >= MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} screenshots`);
        return;
      }
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name} exceeds 5 MB limit`);
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshots((prev) => [
          ...prev,
          { name: file.name, dataUrl: reader.result as string },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="support-name">Name</Label>
          <Input
            id="support-name"
            placeholder="Your name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="support-email">Email</Label>
          <Input
            id="support-email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="feedback">Feedback</SelectItem>
              <SelectItem value="bug">Bug Report</SelectItem>
              <SelectItem value="feature">Feature Request</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="support-subject">Subject</Label>
          <Input
            id="support-subject"
            placeholder="Brief summary"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="support-message">Message</Label>
        <Textarea
          id="support-message"
          placeholder="Describe your question, issue, or idea..."
          rows={5}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {/* Screenshots */}
      <div className="space-y-2">
        <Label>Screenshots (optional)</Label>
        <div className="flex flex-wrap gap-2">
          {screenshots.map((s, i) => (
            <div key={i} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.dataUrl}
                alt={s.name}
                className="h-16 w-16 rounded-lg border object-cover"
              />
              <button
                type="button"
                onClick={() => setScreenshots((prev) => prev.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {screenshots.length < 3 && (
            <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30 transition-colors">
              <ImagePlus className="h-5 w-5 text-muted-foreground" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Up to 3 images, max 5 MB each
        </p>
      </div>

      <Button type="submit" disabled={submitting} className="rounded-full px-8">
        {submitting ? "Sending..." : "Send Message"}
        {!submitting && <Send className="ml-2 h-4 w-4" />}
      </Button>
    </form>
  );
}
