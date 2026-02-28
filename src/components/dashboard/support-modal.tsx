"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  Bug,
  ImagePlus,
  Lightbulb,
  MessageSquare,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { useOrg } from "@/components/providers/org-provider";
import {
  HELP_CATEGORIES,
  HELP_OVERVIEW,
  searchHelpContent,
  type HelpCategory,
  type HelpArticle,
} from "@/lib/help-content";
import { ReleaseNotesList, useHasUnseenRelease } from "@/components/dashboard/whats-new-modal";

interface SupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TicketType = "bug" | "feature" | "feedback";

type HelpView =
  | { type: "home" }
  | { type: "category"; category: HelpCategory }
  | { type: "article"; category: HelpCategory; article: HelpArticle };

const TICKET_TYPES: { value: TicketType; label: string; icon: typeof Bug }[] = [
  { value: "bug", label: "Bug Report", icon: Bug },
  { value: "feature", label: "Feature Request", icon: Lightbulb },
  { value: "feedback", label: "Feedback", icon: MessageSquare },
];

export function SupportModal({ open, onOpenChange, initialTab }: SupportModalProps & { initialTab?: "help" | "whats-new" | "contact" }) {
  const [tab, setTab] = useState<"help" | "whats-new" | "contact">(initialTab || "help");
  const { unseen, markSeen } = useHasUnseenRelease();

  // Help tab state
  const [query, setQuery] = useState("");
  const [helpView, setHelpView] = useState<HelpView>({ type: "home" });

  // Contact tab state
  const { user } = useAuth();
  const { members } = useOrg();
  const currentMember = members.find((m) => m.isCurrentUser);

  const [ticketType, setTicketType] = useState<TicketType>("feedback");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [screenshots, setScreenshots] = useState<{ name: string; dataUrl: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Sync tab when initialTab changes (handles "whats-new" from version click)
  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  // Reset form state on close
  useEffect(() => {
    if (!open) {
      setQuery("");
      setHelpView({ type: "home" });
      setTicketType("feedback");
      setSubject("");
      setMessage("");
      setScreenshots([]);
      setSubmitting(false);
      setSubmitted(false);
    }
  }, [open]);

  // Help search
  const searchResults = useMemo(
    () => (query.length >= 2 ? searchHelpContent(query) : []),
    [query]
  );

  const handleBack = useCallback(() => {
    if (helpView.type === "article") {
      setHelpView({ type: "category", category: helpView.category });
    } else {
      setHelpView({ type: "home" });
      setQuery("");
    }
  }, [helpView]);

  const isSearching = query.length >= 2;

  // Contact form submit
  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentMember?.name || user?.email || "Unknown",
          email: user?.email || "",
          type: ticketType,
          subject: subject.trim(),
          message: message.trim(),
          screenshots: screenshots.map((s) => ({ name: s.name, dataUrl: s.dataUrl })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit");
      }

      setSubmitted(true);
      setTimeout(() => onOpenChange(false), 2000);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b space-y-3">
          <div className="flex items-center gap-3 pr-8">
            {tab === "help" && helpView.type !== "home" && !isSearching && (
              <button
                onClick={handleBack}
                className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted transition-colors shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <DialogTitle className="flex-1 text-lg">
              Help & Support
            </DialogTitle>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-lg bg-muted/50">
            <button
              onClick={() => setTab("help")}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === "help"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Help
            </button>
            <button
              onClick={() => setTab("whats-new")}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors relative",
                tab === "whats-new"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              What&apos;s New
              {unseen && tab !== "whats-new" && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
            <button
              onClick={() => setTab("contact")}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === "contact"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Contact Support
            </button>
          </div>

          {/* Search bar — help tab only */}
          {tab === "help" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search help articles..."
                className="pl-9"
              />
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6">
            {tab === "whats-new" ? (
              <ReleaseNotesList onView={markSeen} />
            ) : tab === "help" ? (
              isSearching ? (
                <SearchResultsView
                  results={searchResults}
                  onSelectArticle={(cat, art) =>
                    setHelpView({ type: "article", category: cat, article: art })
                  }
                />
              ) : helpView.type === "home" ? (
                <HomeView
                  onSelectCategory={(cat) =>
                    setHelpView({ type: "category", category: cat })
                  }
                />
              ) : helpView.type === "category" ? (
                <CategoryView
                  category={helpView.category}
                  onSelectArticle={(art) =>
                    setHelpView({
                      type: "article",
                      category: helpView.category,
                      article: art,
                    })
                  }
                />
              ) : (
                <ArticleView
                  category={helpView.category}
                  article={helpView.article}
                />
              )
            ) : submitted ? (
              <SuccessView />
            ) : (
              <ContactForm
                ticketType={ticketType}
                onTypeChange={setTicketType}
                subject={subject}
                onSubjectChange={setSubject}
                message={message}
                onMessageChange={setMessage}
                screenshots={screenshots}
                onScreenshotsChange={setScreenshots}
                submitting={submitting}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </div>

        {/* Footer — help tab only */}
        {tab === "help" && (
          <div className="border-t px-6 py-3 flex items-center justify-between">
            <a
              href="/help"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View full documentation
              <ExternalLink className="h-3 w-3" />
            </a>
            <p className="text-[10px] text-muted-foreground">
              {HELP_CATEGORIES.reduce((sum, c) => sum + c.articles.length, 0)} articles
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Help sub-views (reused from help-modal pattern) ───

function HomeView({ onSelectCategory }: { onSelectCategory: (cat: HelpCategory) => void }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        {HELP_OVERVIEW.subtitle}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {HELP_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat)}
              className="flex items-start gap-3 rounded-xl border p-4 text-left hover:bg-muted/50 hover:border-primary/20 transition-colors group"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium group-hover:text-primary transition-colors">
                  {cat.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {cat.description}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategoryView({
  category,
  onSelectArticle,
}: {
  category: HelpCategory;
  onSelectArticle: (article: HelpArticle) => void;
}) {
  const Icon = category.icon;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium">{category.title}</p>
          <p className="text-xs text-muted-foreground">{category.description}</p>
        </div>
      </div>

      <div className="space-y-1">
        {category.articles.map((article) => (
          <button
            key={article.q}
            onClick={() => onSelectArticle(article)}
            className="flex items-center gap-3 w-full rounded-lg p-3 text-left hover:bg-muted/50 transition-colors group"
          >
            <span className="text-sm flex-1">{article.q}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ArticleView({
  category,
  article,
}: {
  category: HelpCategory;
  article: HelpArticle;
}) {
  const Icon = category.icon;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <Badge variant="secondary" className="text-xs">
          {category.title}
        </Badge>
      </div>
      <h3 className="text-base font-semibold">{article.q}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
        {article.a}
      </p>
    </div>
  );
}

function SearchResultsView({
  results,
  onSelectArticle,
}: {
  results: { category: HelpCategory; article: HelpArticle }[];
  onSelectArticle: (cat: HelpCategory, art: HelpArticle) => void;
}) {
  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No articles found. Try different keywords.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground mb-3">
        {results.length} result{results.length !== 1 ? "s" : ""}
      </p>
      {results.map(({ category, article }, i) => {
        const Icon = category.icon;
        return (
          <button
            key={`${category.id}-${i}`}
            onClick={() => onSelectArticle(category, article)}
            className="flex items-start gap-3 w-full rounded-lg p-3 text-left hover:bg-muted/50 transition-colors group"
          >
            <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium group-hover:text-primary transition-colors">
                {article.q}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {article.a}
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5">
              {category.title}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}

// ─── Contact sub-views ───

function ContactForm({
  ticketType,
  onTypeChange,
  subject,
  onSubjectChange,
  message,
  onMessageChange,
  screenshots,
  onScreenshotsChange,
  submitting,
  onSubmit,
}: {
  ticketType: TicketType;
  onTypeChange: (type: TicketType) => void;
  subject: string;
  onSubjectChange: (value: string) => void;
  message: string;
  onMessageChange: (value: string) => void;
  screenshots: { name: string; dataUrl: string }[];
  onScreenshotsChange: (files: { name: string; dataUrl: string }[]) => void;
  submitting: boolean;
  onSubmit: () => void;
}) {
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB per file
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
        onScreenshotsChange([
          ...screenshots,
          { name: file.name, dataUrl: reader.result as string },
        ]);
      };
      reader.readAsDataURL(file);
    });
    // Reset input so re-selecting same file works
    e.target.value = "";
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <div className="grid grid-cols-3 gap-2">
          {TICKET_TYPES.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                onClick={() => onTypeChange(t.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm transition-colors",
                  ticketType === t.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="support-subject" className="text-sm font-medium">
          Subject
        </label>
        <Input
          id="support-subject"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Brief summary of your issue or request"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="support-message" className="text-sm font-medium">
          Message
        </label>
        <Textarea
          id="support-message"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Describe your issue or request in detail..."
          rows={5}
        />
      </div>

      {/* Screenshot upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Screenshots (optional)</label>
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
                onClick={() => onScreenshotsChange(screenshots.filter((_, j) => j !== i))}
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

      <Button
        onClick={onSubmit}
        disabled={submitting || !subject.trim() || !message.trim()}
        className="w-full"
      >
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {submitting ? "Submitting..." : "Submit Ticket"}
      </Button>
    </div>
  );
}

function SuccessView() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-tp-green/10 mb-4">
        <CheckCircle className="h-7 w-7 text-tp-green" />
      </div>
      <h3 className="text-lg font-semibold">Ticket submitted!</h3>
      <p className="text-sm text-muted-foreground mt-1">
        We&apos;ll get back to you as soon as possible.
      </p>
    </div>
  );
}
