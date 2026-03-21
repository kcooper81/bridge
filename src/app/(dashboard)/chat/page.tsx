"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Send,
  Loader2,
  MessageSquare,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Bot,
  Pencil,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  Copy,
  RefreshCw,
  Square,
  Shield,
  Library,
  Search,
  Star,
  Braces,
  FileText,
  Download,
  Pin,
  BarChart3,
  Paperclip,
  ArrowLeft,
  Circle,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Columns2,
  Share2,
  FileDown,
  Printer,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ListOrdered,
  List,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { trackChatMessageSent, trackChatConversationCreated, trackChatFileUploaded, trackChatCompareUsed, trackChatPresetUsed, trackChatAdminCommand, trackChatCollectionCreated } from "@/lib/analytics";
import { useOrg } from "@/components/providers/org-provider";

// ── Shared sub-components ──

function ConvSection({ label, icon, children, collapsible, defaultOpen = true }: {
  label: string; icon?: React.ReactNode; children: React.ReactNode;
  collapsible?: boolean; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-1 mt-2 first:mt-0">
      <button
        type="button"
        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 w-full text-left hover:text-muted-foreground transition-colors"
        onClick={() => collapsible && setOpen(!open)}
      >
        {icon}
        {label}
        {collapsible && (
          <ChevronRight className={cn("h-3 w-3 ml-auto transition-transform", open && "rotate-90")} />
        )}
      </button>
      {open && <div className="space-y-0.5">{children}</div>}
    </div>
  );
}

// ── Types ──

interface Conversation {
  id: string;
  title: string;
  model: string;
  provider: string;
  updated_at: string;
  pinned?: boolean;
  folder_id?: string | null;
  tag_ids?: string[]; // collection IDs (reusing tag_ids from DB)
}

interface Collection {
  id: string;
  name: string;
  color: string;
}

interface ChatPreset {
  id: string;
  name: string;
  description?: string;
  system_prompt?: string;
  first_message?: string;
  model?: string;
  provider?: string;
  icon?: string;
  color?: string;
  is_shared?: boolean;
  created_by?: string;
}

interface ProviderConfig {
  id: string;
  provider: string;
  label: string;
  model_whitelist: string[];
  is_active: boolean;
  availableModels: Array<{ id: string; label: string }>;
}

interface DlpViolation {
  ruleName: string;
  category: string;
  severity: string;
}

interface ChatMsg {
  id: string;
  role: string;
  content: string;
  images?: string[];
  rating?: number; // -1, 0, 1
  files?: Array<{ name: string; type: string; size: number }>; // attached file metadata
  created_at?: string; // ISO timestamp from server
  model?: string; // model that generated this message
}

interface PendingFile {
  file: File;
  name: string;
  type: string;
  size: number;
  extractedText?: string;
  uploading?: boolean;
  error?: string;
  dlpPassed?: boolean;
}


// ── Slash command definitions ──

const SLASH_COMMANDS: Array<{
  command: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  section?: string;
}> = [
  { command: "/prompt", label: "Insert a prompt", description: "Search and insert from your prompt library", icon: FileText },
  { command: "/template", label: "Use a template", description: "Insert a template with fill-in variables", icon: Braces },
  { command: "/scan", label: "Check for sensitive data", description: "Run DLP scan on your current message", icon: Shield },
  { command: "/model", label: "Switch model", description: "Change the AI model for this conversation", icon: Bot },
  { command: "/export", label: "Export conversation", description: "Download this conversation as markdown", icon: Download },
  { command: "/clear", label: "Clear conversation", description: "Start a new conversation", icon: Trash2 },
  { command: "/compare", label: "Compare models", description: "Send same message to two models side-by-side", icon: Columns2 },
  // Admin/manager only commands — now with real data
  { command: "/activity", label: "Team activity summary", description: "View real team activity data from your database", icon: BarChart3, roles: ["admin", "manager"], section: "Admin" },
  { command: "/violations", label: "DLP violations report", description: "View real DLP violation data and trends", icon: ShieldAlert, roles: ["admin", "manager"], section: "Admin" },
  { command: "/usage", label: "Usage analytics", description: "View real prompt usage and adoption metrics", icon: BarChart3, roles: ["admin", "manager"], section: "Admin" },
  { command: "/audit", label: "Audit log query", description: "Search real audit trail events", icon: Search, roles: ["admin", "manager"], section: "Admin" },
];

const TAG_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#64748b",
];

// ── Main component ──

export default function ChatPage() {
  const { currentUserRole, org, prompts: orgPrompts } = useOrg();
  const isAdmin = currentUserRole === "admin";
  const orgSettings = (org?.settings || {}) as Record<string, unknown>;
  const chatEnabledForMembers = orgSettings.ai_chat_enabled === true;
  const approvedPrompts = orgPrompts.filter((p) => p.status === "approved");

  // ── State ──
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [dlpBlock, setDlpBlock] = useState<DlpViolation[] | null>(null);
  const [redactions, setRedactions] = useState<Array<{original: string; replacement: string; category: string}> | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [promptPanelOpen, setPromptPanelOpen] = useState(false);
  const [outlinePanelOpen, setOutlinePanelOpen] = useState(false);
  const [flyoutTab, setFlyoutTab] = useState<"outline" | "saved">("outline");
  const [savedItems, setSavedItems] = useState<Array<{id: string; title: string; content: string; content_type: string; board: string; tags: string[]; conversation_id?: string; source_message_id?: string; created_at: string}>>([]);
  const [savedBoards, setSavedBoards] = useState<string[]>([]);
  const [savedFilter, setSavedFilter] = useState("All");
  const [savingMessageId, setSavingMessageId] = useState<string | null>(null);
  const [promptPanelPinned, setPromptPanelPinned] = useState(false);
  const [promptSearch, setPromptSearch] = useState("");
  const [promptFilter, setPromptFilter] = useState<"all" | "favorites" | "templates">("all");
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashMenuIndex, setSlashMenuIndex] = useState(0);
  const [slashFilter, setSlashFilter] = useState("");
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Collections & organization
  const [collections, setCollections] = useState<Collection[]>([]);
  const [presets, setPresets] = useState<ChatPreset[]>([]);
  const [activeCollection, setActiveCollection] = useState<string | null>(null); // viewing a collection
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionColor, setNewCollectionColor] = useState(TAG_COLORS[6]);
  const [editingCollection, setEditingCollection] = useState<string | null>(null);
  const [editCollectionName, setEditCollectionName] = useState("");
  const [adminContext, setAdminContext] = useState<string | null>(null);
  const [presetSystemPrompt, setPresetSystemPrompt] = useState<string | null>(null);
  const [sidebarTab, setSidebarTab] = useState<"chats" | "favorites" | "collections">("chats");
  const [contextMenu, setContextMenu] = useState<{ convId: string; x: number; y: number } | null>(null);
  const [collectionContextMenu, setCollectionContextMenu] = useState<{ collectionId: string; x: number; y: number } | null>(null);
  const [contextSubmenu, setContextSubmenu] = useState<"collections" | null>(null);
  const [messageRatings, setMessageRatings] = useState<Record<string, number>>({});
  const [compareMode, setCompareMode] = useState(false);
  const [compareModel, setCompareModel] = useState("");
  const [compareProvider, setCompareProvider] = useState("");
  const [compareMessages, setCompareMessages] = useState<ChatMsg[]>([]);
  const [compareLoading, setCompareLoading] = useState(false);
  const [adminNoticeDismissed, setAdminNoticeDismissed] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("chat-admin-notice-dismissed") === "1";
    return false;
  });
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  const msgIdCounter = useRef(0);
  const nextMsgId = () => `${Date.now()}-${++msgIdCounter.current}`;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const compareAbortRef = useRef<AbortController | null>(null);
  const fileContextRef = useRef<string | null>(null);
  const slashMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Available models ──
  const availableModels = providers
    .filter((p) => p.is_active)
    .flatMap((p) => {
      const models = p.model_whitelist.length > 0
        ? p.availableModels.filter((m) => p.model_whitelist.includes(m.id))
        : p.availableModels;
      return models.map((m) => ({ provider: p.provider, providerLabel: p.label, model: m.id, modelLabel: m.label }));
    });

  // ── Image compression ──
  function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const maxWidth = 800;
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported")); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
      img.src = url;
    });
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      if (file.size > 25 * 1024 * 1024) { toast.error(`${file.name} is too large (max 25MB)`); continue; }

      if (file.type.startsWith("image/")) {
        // Images — compress and add to pendingImages (sent as base64 for multimodal)
        try {
          const compressed = await compressImage(file);
          setPendingImages((prev) => [...prev, compressed]);
        } catch { toast.error(`Failed to process ${file.name}`); }
      } else {
        // Documents — add to pendingFiles, upload for text extraction
        const pf: PendingFile = { file, name: file.name, type: file.type, size: file.size, uploading: true };
        setPendingFiles((prev) => [...prev, pf]);

        // Upload for server-side text extraction + DLP scan
        try {
          const fd = new FormData();
          fd.append("files", file);
          const res = await fetch("/api/chat/upload", { method: "POST", body: fd });
          if (!res.ok) {
            setPendingFiles((prev) => prev.map((f) => f.file === file ? { ...f, uploading: false, error: `Upload failed (${res.status})` } : f));
            continue;
          }
          const data = await res.json();

          if (data.blocked) {
            setDlpBlock(data.violations || []);
            setPendingFiles((prev) => prev.filter((f) => f.file !== file));
            continue;
          }

          if (data.error) {
            setPendingFiles((prev) => prev.map((f) => f.file === file ? { ...f, uploading: false, error: data.error } : f));
            continue;
          }

          const extracted = data.files?.[0];
          setPendingFiles((prev) => prev.map((f) => f.file === file ? { ...f, uploading: false, extractedText: extracted?.text || "", dlpPassed: true } : f));
          trackChatFileUploaded(file.type || file.name.split(".").pop() || "unknown");
        } catch {
          setPendingFiles((prev) => prev.map((f) => f.file === file ? { ...f, uploading: false, error: "Upload failed" } : f));
        }
      }
    }
    e.target.value = "";
  }

  function removePendingImage(index: number) {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  // ── Stream message to AI ──
  async function sendMessage(messagesToSend?: ChatMsg[], overrideContext?: string) {
    const input = chatInput.trim();
    if (!input && !messagesToSend && pendingImages.length === 0 && pendingFiles.length === 0) return;
    if (isLoading) return;
    // Don't send if files are still uploading
    if (pendingFiles.some((f) => f.uploading)) { toast.info("Files are still processing..."); return; }

    setDlpBlock(null);
    setRedactions(null);

    // Build user message — keep it clean, file text sent separately as context
    let messageContent = input;
    const filesMeta: Array<{ name: string; type: string; size: number }> = [];
    let fileContext: string | null = null;

    if (pendingFiles.length > 0) {
      const fileTexts = pendingFiles
        .filter((f) => f.extractedText && !f.error)
        .map((f) => {
          filesMeta.push({ name: f.name, type: f.type, size: f.size });
          return `--- File: ${f.name} ---\n${f.extractedText}`;
        });
      if (fileTexts.length > 0) {
        fileContext = fileTexts.join("\n\n");
      }
    }
    fileContextRef.current = fileContext;

    if (!messageContent && pendingImages.length > 0) {
      messageContent = "What's in this image?";
    }
    if (!messageContent && filesMeta.length > 0) {
      messageContent = `Analyze ${filesMeta.length === 1 ? filesMeta[0].name : `these ${filesMeta.length} files`}`;
    }
    if (!messageContent && !messagesToSend) return;

    const userMsg: ChatMsg = {
      id: nextMsgId(),
      role: "user",
      content: messageContent || "",
      images: pendingImages.length > 0 ? [...pendingImages] : undefined,
      files: filesMeta.length > 0 ? filesMeta : undefined,
    };
    const allMessages = messagesToSend || [...messages, userMsg];

    if (!messagesToSend) {
      setChatInput("");
      setPendingImages([]);
      setPendingFiles([]);
      if (inputRef.current) inputRef.current.style.height = "auto";
      setMessages(allMessages);
    }

    setIsLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const contextToSend = overrideContext || adminContext;
    const presetPrompt = presetSystemPrompt;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
            ...(m.images?.length ? { images: m.images } : {}),
          })),
          model: selectedModel,
          provider: selectedProvider,
          conversationId: activeConvId,
          ...(contextToSend ? { adminContext: contextToSend } : {}),
          ...(presetPrompt ? { presetSystemPrompt: presetPrompt } : {}),
          ...(fileContext ? { fileContext } : {}),
        }),
        signal: controller.signal,
      });

      // Track + clear contexts after sending
      trackChatMessageSent(selectedModel, selectedProvider);
      if (!activeConvIdRef.current) trackChatConversationCreated();
      if (contextToSend) setAdminContext(null);
      if (presetPrompt) setPresetSystemPrompt(null);

      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const data = await res.json();
        if (data.blocked) {
          setDlpBlock(data.violations || []);
          if (!messagesToSend) setMessages((prev) => prev.slice(0, -1));
          setIsLoading(false);
          return;
        }
        if (data.error) { toast.error(data.error); setIsLoading(false); return; }
      }

      if (!res.ok) {
        toast.error(`Chat request failed (${res.status})`);
        if (!messagesToSend) setMessages((prev) => prev.slice(0, -1));
        setIsLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      const assistantId = nextMsgId();
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", rating: 0 }]);

      let convIdParsed = false;

      if (reader) {
        try {
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            let chunk = decoder.decode(value, { stream: true });

            if (!convIdParsed) {
              buffer += chunk;

              // Parse optional __REDACTIONS__ prefix before __CONV_ID__
              const redactMatch = buffer.match(/^__REDACTIONS__(.*?)__\n/);
              if (redactMatch) {
                try {
                  const parsed = JSON.parse(redactMatch[1]);
                  const items = parsed.items || parsed;
                  const redactedContent = parsed.redactedContent;
                  setRedactions(Array.isArray(items) ? items : []);
                  // Update the last user message to show what the AI actually received
                  if (redactedContent) {
                    setMessages((prev) => {
                      const updated = [...prev];
                      for (let i = updated.length - 1; i >= 0; i--) {
                        if (updated[i].role === "user") {
                          updated[i] = { ...updated[i], content: redactedContent };
                          break;
                        }
                      }
                      return updated;
                    });
                  }
                } catch { /* ignore parse errors */ }
                buffer = buffer.slice(redactMatch[0].length);
              }

              const match = buffer.match(/^__CONV_ID__([a-f0-9-]+)__\n/);
              if (match) {
                if (!activeConvId) {
                  setActiveConvId(match[1]);
                  loadConversations();
                }
                convIdParsed = true;
                chunk = buffer.slice(match[0].length);
                buffer = "";
              } else if (buffer.length > 200) {
                convIdParsed = true;
                chunk = buffer;
                buffer = "";
              } else {
                continue;
              }
            }

            if (chunk) {
              setMessages((prev) =>
                prev.map((m) => m.id === assistantId ? { ...m, content: m.content + chunk } : m)
              );
            }
          }
        } catch (err) {
          if ((err as Error).name !== "AbortError") throw err;
        }
      }

      // Also send to compare model if in compare mode
      if (compareMode && compareModel && !messagesToSend) {
        sendCompareMessage(allMessages);
      }

      loadConversations();
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        toast.error(err instanceof Error ? err.message : "Failed to send message");
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }

  // ── Compare mode: send to second model ──
  async function sendCompareMessage(allMessages: ChatMsg[]) {
    setCompareMessages([]); // Reset to prevent unbounded growth
    setCompareLoading(true);
    const controller = new AbortController();
    compareAbortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({
            role: m.role,
            content: m.content,
            ...(m.images?.length ? { images: m.images } : {}),
          })),
          model: compareModel,
          provider: compareProvider,
          compareOnly: true, // don't create a conversation on server
          ...(fileContextRef.current ? { fileContext: fileContextRef.current } : {}),
        }),
        signal: controller.signal,
      });

      if (!res.ok) { setCompareLoading(false); return; }

      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        setCompareLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      const assistantId = `compare-${nextMsgId()}`;
      setCompareMessages((prev) => [...prev, ...allMessages.filter(m => m.role === "user").slice(-1), { id: assistantId, role: "assistant", content: "" }]);

      if (reader) {
        try {
          let buffer = "";
          let prefixParsed = true; // compareOnly responses have no stream prefix
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            let chunk = decoder.decode(value, { stream: true });

            if (!prefixParsed) {
              buffer += chunk;
              // Parse optional __REDACTIONS__ prefix
              const redactPfx = buffer.match(/^__REDACTIONS__(.*?)__\n/);
              if (redactPfx) {
                // Strip redactions prefix but don't set state (primary stream already handled it)
                buffer = buffer.slice(redactPfx[0].length);
              }
              const match = buffer.match(/^__CONV_ID__[a-f0-9-]+__\n/);
              if (match) {
                prefixParsed = true;
                chunk = buffer.slice(match[0].length);
                buffer = "";
              } else if (buffer.length > 200) {
                prefixParsed = true;
                chunk = buffer;
                buffer = "";
              } else {
                continue;
              }
            }

            if (chunk) {
              setCompareMessages((prev) =>
                prev.map((m) => m.id === assistantId ? { ...m, content: m.content + chunk } : m)
              );
            }
          }
        } catch (err) {
          if ((err as Error).name !== "AbortError") throw err;
        }
      }
    } catch { /* non-critical */ } finally {
      setCompareLoading(false);
      compareAbortRef.current = null;
    }
  }

  function stopGeneration() { abortControllerRef.current?.abort(); compareAbortRef.current?.abort(); }

  function regenerateLastResponse() {
    const lastAssistantIdx = [...messages].reverse().findIndex((m) => m.role === "assistant");
    if (lastAssistantIdx === -1) return;
    const idx = messages.length - 1 - lastAssistantIdx;
    const messagesWithoutLast = messages.slice(0, idx);
    setMessages(messagesWithoutLast);
    setCompareMessages([]); // Clear stale compare response
    sendMessage(messagesWithoutLast);
  }

  function copyMessage(content: string, id: string) {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // ── Rate message ──
  async function rateMessage(messageId: string, rating: number) {
    const current = messageRatings[messageId] || 0;
    const newRating = current === rating ? 0 : rating;
    setMessageRatings((prev) => ({ ...prev, [messageId]: newRating }));
    try {
      await fetch("/api/chat/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, rating: newRating }),
      });
    } catch { /* non-critical */ }
  }

  // ── Prompt library ──
  const filteredPrompts = approvedPrompts.filter((p) => {
    if (promptFilter === "favorites" && !p.is_favorite) return false;
    if (promptFilter === "templates" && !p.is_template) return false;
    if (promptSearch) {
      const q = promptSearch.toLowerCase();
      return p.title.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q));
    }
    return true;
  }).sort((a, b) => b.usage_count - a.usage_count);

  function insertPrompt(content: string) {
    setChatInput((prev) => prev ? `${prev}\n\n${content}` : content);
    if (!promptPanelPinned) setPromptPanelOpen(false);
    inputRef.current?.focus();
  }

  // ── Slash commands ──
  const filteredSlashCommands = SLASH_COMMANDS.filter((cmd) => {
    if (cmd.roles && !cmd.roles.includes(currentUserRole)) return false;
    if (slashFilter && !cmd.command.includes(slashFilter) && !cmd.label.toLowerCase().includes(slashFilter)) return false;
    return true;
  });

  async function executeSlashCommand(command: string) {
    setSlashMenuOpen(false);
    setChatInput("");

    switch (command) {
      case "/prompt":
      case "/template":
        setPromptPanelOpen(true);
        setOutlinePanelOpen(false);
        setPromptFilter(command === "/template" ? "templates" : "all");
        break;
      case "/scan":
        toast.info("DLP scan runs automatically on every message you send");
        break;
      case "/model":
        toast.info("Use the model dropdown in the header to switch models");
        break;
      case "/export": {
        if (messages.length === 0) { toast.error("No messages to export"); break; }
        const md = messages.map((m) => `## ${m.role === "user" ? "You" : "Assistant"}\n\n${m.content}`).join("\n\n---\n\n");
        const blob = new Blob([md], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `chat-${new Date().toISOString().slice(0, 10)}.md`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Conversation exported");
        break;
      }
      case "/clear":
        startNewChat();
        break;
      case "/compare":
        setCompareMode(!compareMode);
        if (!compareMode) trackChatCompareUsed();
        if (!compareModel && availableModels.length > 1) {
          const other = availableModels.find((m) => m.model !== selectedModel);
          if (other) { setCompareModel(other.model); setCompareProvider(other.provider); }
        }
        break;
      // Admin commands — fetch real data then auto-send
      case "/activity":
      case "/violations":
      case "/usage":
      case "/audit": {
        const promptMap: Record<string, string> = {
          "/activity": "Give me a summary of my team's AI activity for the past week. Use the data provided to identify trends, highlight the most active users, and note which models are most popular.",
          "/violations": "Summarize the DLP violations data. Highlight the most common violation categories, identify repeat offenders, and recommend any rule changes based on the patterns.",
          "/usage": "Analyze the prompt usage data. Which prompts are most effective? What's the AI adoption rate? Any recommendations for improving utilization?",
          "/audit": "Here is the audit trail data. Summarize the key events. I'll ask follow-up questions to drill into specific areas.",
        };
        toast.info("Fetching data from your database...");
        trackChatAdminCommand(command);
        try {
          const res = await fetch("/api/chat/admin-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command }),
          });
          if (!res.ok) { toast.error(`Failed to fetch admin data (${res.status})`); break; }
          const data = await res.json();
          if (data.error) { toast.error(data.error); break; }
          // Build messages directly (avoid stale closure from setTimeout)
          const prompt = promptMap[command];
          const userMsg: ChatMsg = { id: nextMsgId(), role: "user", content: prompt };
          // Build the full messages array from current state via ref
          const currentMessages = [...messages, userMsg];
          setMessages(currentMessages);
          setChatInput("");
          // Send after state update — use the array we just built, not state
          sendMessageDirect(currentMessages, data.context);
        } catch {
          toast.error("Failed to fetch admin data");
        }
        break;
      }
    }
  }

  // Direct send that bypasses state timing issues
  async function sendMessageDirect(allMessages: ChatMsg[], context: string) {
    setIsLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          model: selectedModel,
          provider: selectedProvider,
          conversationId: activeConvId,
          adminContext: context,
        }),
        signal: controller.signal,
      });

      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const data = await res.json();
        if (data.blocked) { setDlpBlock(data.violations || []); setIsLoading(false); return; }
        if (data.error) { toast.error(data.error); setIsLoading(false); return; }
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      const assistantId = nextMsgId();
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", rating: 0 }]);
      let convIdParsed = false;

      if (reader) {
        try {
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            let chunk = decoder.decode(value, { stream: true });
            if (!convIdParsed) {
              buffer += chunk;
              // Parse optional __REDACTIONS__ prefix
              const redactPfx = buffer.match(/^__REDACTIONS__(.*?)__\n/);
              if (redactPfx) {
                try {
                  const rp = JSON.parse(redactPfx[1]);
                  setRedactions(Array.isArray(rp.items || rp) ? (rp.items || rp) : []);
                  // Update user message with redacted content
                  if (rp.redactedContent) {
                    setMessages((prev) => {
                      const updated = [...prev];
                      for (let i = updated.length - 1; i >= 0; i--) {
                        if (updated[i].role === "user") {
                          updated[i] = { ...updated[i], content: rp.redactedContent };
                          break;
                        }
                      }
                      return updated;
                    });
                  }
                } catch { /* ignore parse errors */ }
                buffer = buffer.slice(redactPfx[0].length);
              }
              const match = buffer.match(/^__CONV_ID__([a-f0-9-]+)__\n/);
              if (match) {
                if (!activeConvId) { setActiveConvId(match[1]); loadConversations(); }
                convIdParsed = true;
                chunk = buffer.slice(match[0].length);
                buffer = "";
              } else if (buffer.length > 200) {
                convIdParsed = true; chunk = buffer; buffer = "";
              } else { continue; }
            }
            if (chunk) {
              setMessages((prev) =>
                prev.map((m) => m.id === assistantId ? { ...m, content: m.content + chunk } : m)
              );
            }
          }
        } catch (err) {
          if ((err as Error).name !== "AbortError") throw err;
        }
      }
      // Trigger compare if active
      if (compareMode && compareModel) {
        sendCompareMessage(allMessages);
      }
      loadConversations();
    } catch (err) {
      if ((err as Error).name !== "AbortError") toast.error("Failed to send");
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      setAdminContext(null);
    }
  }

  // ── Data loading ──
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/conversations");
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch { /* non-critical */ } finally { setLoadingConvs(false); }
  }, []);

  const selectedModelRef = useRef(selectedModel);
  selectedModelRef.current = selectedModel;
  const activeConvIdRef = useRef(activeConvId);
  activeConvIdRef.current = activeConvId;

  const loadProviders = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/providers");
      const data = await res.json();
      setProviders(data.providers || []);
      if (data.providers?.length > 0 && !selectedModelRef.current) {
        const first = data.providers[0];
        const models = first.model_whitelist.length > 0
          ? first.availableModels.filter((m: { id: string }) => first.model_whitelist.includes(m.id))
          : first.availableModels;
        if (models.length > 0) { setSelectedModel(models[0].id); setSelectedProvider(first.provider); }
      }
    } catch { /* non-critical */ }
  }, []);

  const loadCollections = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/tags");
      const data = await res.json();
      setCollections(data.tags || []);
    } catch { /* non-critical */ }
  }, []);

  const loadPresets = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/presets");
      const data = await res.json();
      setPresets(data.presets || []);
    } catch { /* non-critical */ }
  }, []);

  const loadSavedItems = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/saved");
      const data = await res.json();
      setSavedItems(data.items || []);
      setSavedBoards(data.boards || []);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => {
    loadConversations();
    loadProviders();
    loadCollections();
    loadPresets();
    loadSavedItems();
  }, [loadConversations, loadProviders, loadCollections, loadPresets, loadSavedItems]);

  async function saveMessageContent(messageId: string, content: string) {
    setSavingMessageId(messageId);
    try {
      const res = await fetch("/api/chat/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          conversation_id: activeConvId,
          source_message_id: messageId,
        }),
      });
      const data = await res.json();
      if (data.item) {
        setSavedItems((prev) => [data.item, ...prev]);
        toast.success("Saved to your items");
      }
    } catch { toast.error("Failed to save"); }
    finally { setSavingMessageId(null); }
  }

  async function deleteSavedItem(itemId: string) {
    setSavedItems((prev) => prev.filter((i) => i.id !== itemId));
    try {
      await fetch("/api/chat/saved", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId }),
      });
    } catch { /* non-critical */ }
  }

  // Close slash menu on click outside
  useEffect(() => {
    if (!slashMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (slashMenuRef.current && !slashMenuRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setSlashMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [slashMenuOpen]);

  // ChatGPT-style scroll behavior:
  // 1. Always scroll to bottom when user sends a message
  // 2. During streaming, auto-scroll only if user hasn't scrolled up
  // 3. If user scrolls up mid-stream, stop auto-scrolling
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);
  const prevMessageCountRef = useRef(0);

  // Detect when user manually scrolls up during streaming
  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
    if (!viewport) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      userScrolledUpRef.current = distanceFromBottom > 200;
    };
    viewport.addEventListener("scroll", handleScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const prevCount = prevMessageCountRef.current;
    const newCount = messages.length;
    prevMessageCountRef.current = newCount;

    // New message added (user sent or assistant message created) — always scroll
    if (newCount > prevCount) {
      userScrolledUpRef.current = false;
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // Streaming update (same message count, content changed) — scroll only if near bottom
    if (!userScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" }); // "auto" for instant during stream
    }
  }, [messages]);
  useEffect(() => { inputRef.current?.focus(); }, [activeConvId]);

  // Global keyboard shortcuts
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      // Ctrl+N / Cmd+N — new chat
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        startNewChat();
      }
    }
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sidebar resize ──
  useEffect(() => {
    if (!isResizing) return;
    function handleMouseMove(e: MouseEvent) {
      const newWidth = Math.min(480, Math.max(260, e.clientX));
      setSidebarWidth(newWidth);
    }
    function handleMouseUp() {
      setIsResizing(false);
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);


  // ── Conversation operations ──
  async function loadConversation(convId: string) {
    setActiveConvId(convId);
    setDlpBlock(null);
    setRedactions(null);
    setCompareMessages([]);
    try {
      const res = await fetch(`/api/chat/conversations/${convId}`);
      if (!res.ok) { toast.error("Failed to load conversation"); return; }
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages.map((m: { id: string; role: string; content: string; rating?: number; created_at?: string; model?: string }) => ({
          id: m.id, role: m.role, content: m.content, rating: m.rating || 0,
          created_at: m.created_at, model: m.model,
        })));
        // Load existing ratings
        const ratings: Record<string, number> = {};
        for (const m of data.messages) {
          if (m.rating) ratings[m.id] = m.rating;
        }
        setMessageRatings(ratings);
      }
      if (data.conversation?.model) {
        setSelectedModel(data.conversation.model);
        setSelectedProvider(data.conversation.provider || "openai");
      }
    } catch { toast.error("Failed to load conversation"); }
  }

  function startNewChat() {
    setActiveConvId(null);
    setMessages([]);
    setDlpBlock(null);
    setRedactions(null);
    setChatInput("");
    setAdminContext(null);
    setPresetSystemPrompt(null);
    setCompareMode(false);
    setCompareMessages([]);
    setPendingFiles([]);
    setPendingImages([]);
    fileContextRef.current = null;
    inputRef.current?.focus();
  }

  async function deleteConversation(convId: string) {
    const conv = conversations.find((c) => c.id === convId);
    // Optimistically remove from UI
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (activeConvId === convId) startNewChat();

    // Show undo toast (3 seconds to undo)
    let undone = false;
    let deleted = false;
    const doDelete = () => {
      if (undone || deleted) return;
      deleted = true;
      fetch("/api/chat/conversations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: convId }),
      }).catch(() => {});
    };
    toast("Conversation deleted", {
      action: {
        label: "Undo",
        onClick: () => {
          undone = true;
          // Re-add and re-fetch to get correct sort order
          if (conv) {
            setConversations((prev) => [...prev, conv].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
          }
        },
      },
      duration: 3000,
      onDismiss: doDelete,
      onAutoClose: doDelete,
    });
  }

  async function renameConversation(convId: string, title: string) {
    try {
      await fetch(`/api/chat/conversations/${convId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, title } : c));
      setEditingTitle(null);
    } catch { toast.error("Failed to rename"); }
  }

  async function togglePin(convId: string) {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;
    const newPinned = !conv.pinned;
    setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, pinned: newPinned } : c));
    try {
      const res = await fetch(`/api/chat/conversations/${convId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: newPinned }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Failed to save favorite:", data);
        toast.error("Failed to save favorite");
        // Revert optimistic update
        setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, pinned: !newPinned } : c));
      }
    } catch {
      toast.error("Failed to save favorite");
      setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, pinned: !newPinned } : c));
    }
  }

  // ── Collection operations ──
  async function createCollection() {
    if (!newCollectionName.trim()) return;
    try {
      const res = await fetch("/api/chat/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCollectionName.trim(), color: newCollectionColor }),
      });
      const data = await res.json();
      if (data.tag) {
        setCollections((prev) => [...prev, data.tag]);
        trackChatCollectionCreated();
      }
      setNewCollectionName("");
      setNewCollectionColor(TAG_COLORS[6]);
      setShowNewCollection(false);
    } catch { toast.error("Failed to create collection"); }
  }

  async function deleteCollection(collectionId: string) {
    try {
      await fetch("/api/chat/tags", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: collectionId }),
      });
      setCollections((prev) => prev.filter((c) => c.id !== collectionId));
      setConversations((prev) => prev.map((c) => ({
        ...c,
        tag_ids: (c.tag_ids || []).filter((t) => t !== collectionId),
      })));
      if (activeCollection === collectionId) setActiveCollection(null);
      setCollectionContextMenu(null);
    } catch { toast.error("Failed to delete collection"); }
  }

  async function renameCollection(collectionId: string, name: string) {
    setCollections((prev) => prev.map((c) => c.id === collectionId ? { ...c, name } : c));
    setEditingCollection(null);
    try {
      await fetch("/api/chat/tags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: collectionId, name }),
      });
    } catch { /* non-critical, optimistic update already applied */ }
  }

  async function toggleConvCollection(convId: string, collectionId: string) {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;
    const hasIt = conv.tag_ids?.includes(collectionId);
    setConversations((prev) => prev.map((c) => {
      if (c.id !== convId) return c;
      const ids = c.tag_ids || [];
      return { ...c, tag_ids: hasIt ? ids.filter((t) => t !== collectionId) : [...ids, collectionId] };
    }));
    try {
      await fetch("/api/chat/tags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, tagId: collectionId, action: hasIt ? "remove" : "add" }),
      });
    } catch { /* non-critical */ }
  }

  // ── Preset: start a new chat from preset ──
  function startPreset(preset: ChatPreset) {
    trackChatPresetUsed(preset.name);
    startNewChat();
    if (preset.model && preset.provider) {
      setSelectedModel(preset.model);
      setSelectedProvider(preset.provider);
    }
    if (preset.first_message) {
      setChatInput(preset.first_message);
    }
    if (preset.system_prompt) {
      setPresetSystemPrompt(preset.system_prompt);
    }
    inputRef.current?.focus();
  }

  // ── Input handling ──
  function handleInputChange(value: string) {
    setChatInput(value);
    if (value === "/" || (value.startsWith("/") && !value.includes(" "))) {
      setSlashMenuOpen(true);
      setSlashFilter(value);
      setSlashMenuIndex(0);
    } else {
      setSlashMenuOpen(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (slashMenuOpen) {
      if (e.key === "ArrowDown") { e.preventDefault(); setSlashMenuIndex((prev) => Math.min(prev + 1, filteredSlashCommands.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSlashMenuIndex((prev) => Math.max(prev - 1, 0)); }
      else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); if (filteredSlashCommands[slashMenuIndex]) executeSlashCommand(filteredSlashCommands[slashMenuIndex].command); }
      else if (e.key === "Escape") { setSlashMenuOpen(false); }
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const noProviders = providers.length === 0 && !loadingConvs;
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Reuse the same file handler as the paperclip button
      const fakeEvent = { target: { files, value: "" } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  }

  // ── Filter conversations ──
  const filteredConversations = conversations.filter((c) => {
    // If viewing a collection, only show conversations in that collection
    if (activeCollection && !c.tag_ids?.includes(activeCollection)) return false;
    if (searchQuery) {
      return c.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;

  const pinnedConvs = filteredConversations.filter((c) => c.pinned);
  const unpinnedConvs = filteredConversations.filter((c) => !c.pinned);
  const todayConvs = unpinnedConvs.filter((c) => new Date(c.updated_at).getTime() >= todayStart);
  const yesterdayConvs = unpinnedConvs.filter((c) => {
    const t = new Date(c.updated_at).getTime();
    return t >= yesterdayStart && t < todayStart;
  });
  const weekConvs = unpinnedConvs.filter((c) => {
    const t = new Date(c.updated_at).getTime();
    return t >= weekStart && t < yesterdayStart;
  });
  const olderConvs = unpinnedConvs.filter((c) => new Date(c.updated_at).getTime() < weekStart);

  // Collection counts and most-recent sort
  const collectionCounts = new Map<string, number>();
  const collectionLatest = new Map<string, number>();
  for (const c of conversations) {
    for (const tagId of c.tag_ids || []) {
      collectionCounts.set(tagId, (collectionCounts.get(tagId) || 0) + 1);
      const t = new Date(c.updated_at).getTime();
      if (t > (collectionLatest.get(tagId) || 0)) collectionLatest.set(tagId, t);
    }
  }
  const sortedCollections = [...collections].sort((a, b) => (collectionLatest.get(b.id) || 0) - (collectionLatest.get(a.id) || 0));
  const lastIsAssistant = messages.length > 0 && messages[messages.length - 1].role === "assistant";

  // ── Open right-click context menu ──
  function openContextMenu(e: React.MouseEvent, convId: string) {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ convId, x: e.clientX, y: e.clientY });
    setContextSubmenu(null);
  }

  // ── Render conversation item ──
  function renderConvItem(conv: Conversation) {
    const convCollections = collections.filter((c) => conv.tag_ids?.includes(c.id));
    const hoverInfo = [conv.model, new Date(conv.updated_at).toLocaleDateString()].filter(Boolean).join(" · ");
    const isOld = new Date(conv.updated_at).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000;
    const isActive = activeConvId === conv.id;
    return (
      <div
        key={conv.id}
        className={cn(
          "group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-all duration-150",
          isActive
            ? "bg-primary/10 text-foreground"
            : "text-muted-foreground dark:text-zinc-400 hover:bg-muted hover:text-foreground",
          isOld && !isActive && "opacity-70"
        )}
        onClick={() => loadConversation(conv.id)}
        onDoubleClick={(e) => { e.stopPropagation(); setEditingTitle(conv.id); setEditTitleValue(conv.title); }}
        onContextMenu={(e) => openContextMenu(e, conv.id)}
        title={hoverInfo}
      >
        {editingTitle === conv.id ? (
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <input
              className="flex-1 bg-transparent text-[13px] border-b border-primary outline-none min-w-0 py-0.5"
              value={editTitleValue}
              onChange={(e) => setEditTitleValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") renameConversation(conv.id, editTitleValue); if (e.key === "Escape") setEditingTitle(null); }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <button className="p-1 hover:text-primary" onClick={(e) => { e.stopPropagation(); renameConversation(conv.id, editTitleValue); }}><Check className="h-3.5 w-3.5" /></button>
            <button className="p-1 hover:text-foreground" onClick={(e) => { e.stopPropagation(); setEditingTitle(null); }}><X className="h-3.5 w-3.5" /></button>
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0 overflow-hidden flex items-center gap-1.5">
              {conv.pinned && <Star className="h-3 w-3 fill-amber-400 text-amber-400 flex-shrink-0" />}
              <span className="truncate text-[13px] flex-1 min-w-0">{conv.title}</span>
              {isLoading && activeConvId === conv.id && (
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
              )}
              {convCollections.length > 0 && (
                <div className="flex gap-0.5 flex-shrink-0">
                  {convCollections.slice(0, 2).map((col) => (
                    <span key={col.id} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: col.color }} title={col.name} />
                  ))}
                </div>
              )}
            </div>
            <button
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
              title="Delete"
              onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </>
        )}
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden -m-4 md:-m-6">
      {/* ─── Sidebar ─── */}
      <div
        className={cn(
          "border-r bg-muted/30 flex flex-col relative",
          sidebarOpen ? "" : "w-0 min-w-0 overflow-hidden",
          !isResizing && "transition-all duration-200"
        )}
        style={sidebarOpen ? { width: sidebarWidth, minWidth: sidebarWidth, maxWidth: sidebarWidth } : undefined}
      >
        {/* Top actions */}
        <div className="p-3 border-b flex-shrink-0">
          <Button variant="outline" className="w-full justify-start gap-2 h-10 text-sm" onClick={startNewChat}>
            <Plus className="h-4 w-4" />
            New Chat
            <kbd className="ml-auto text-[10px] text-muted-foreground/50 font-mono bg-muted rounded px-1.5 py-0.5">Ctrl+N</kbd>
          </Button>
          {conversations.length > 3 && (
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b flex-shrink-0">
          {(["chats", "favorites", "collections"] as const).map((tab) => (
            <button
              key={tab}
              className={cn(
                "flex-1 py-2.5 text-xs font-medium transition-colors relative text-center",
                sidebarTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => { setSidebarTab(tab); setActiveCollection(null); }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {sidebarTab === tab && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <ScrollArea className="flex-1">
          <div className="p-2 overflow-hidden transition-all duration-200 w-0 min-w-full">

            {/* ── Chats tab ── */}
            {sidebarTab === "chats" && (
              <div className="space-y-0.5">
                {conversations.length === 0 && !loadingConvs && (
                  <p className="text-sm text-muted-foreground text-center py-12">No conversations yet</p>
                )}
                {pinnedConvs.length > 0 && (
                  <ConvSection label="Favorites" icon={<Star className="h-3 w-3 text-amber-400" />}>
                    {pinnedConvs.map(renderConvItem)}
                  </ConvSection>
                )}
                {todayConvs.length > 0 && <ConvSection label="Today">{todayConvs.map(renderConvItem)}</ConvSection>}
                {yesterdayConvs.length > 0 && <ConvSection label="Yesterday">{yesterdayConvs.map(renderConvItem)}</ConvSection>}
                {weekConvs.length > 0 && <ConvSection label="Previous 7 Days" collapsible defaultOpen={false}>{weekConvs.map(renderConvItem)}</ConvSection>}
                {olderConvs.length > 0 && <ConvSection label="Older" collapsible defaultOpen={false}>{olderConvs.map(renderConvItem)}</ConvSection>}
              </div>
            )}

            {/* ── Favorites tab ── */}
            {sidebarTab === "favorites" && (
              <div className="space-y-0.5">
                {pinnedConvs.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="h-8 w-8 text-amber-300/40 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No favorites yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Right-click a chat to add it</p>
                  </div>
                ) : (
                  pinnedConvs.map(renderConvItem)
                )}
              </div>
            )}

            {/* ── Collections tab ── */}
            {sidebarTab === "collections" && !activeCollection && (
              <div className="space-y-1">
                {sortedCollections.length === 0 && (
                  <div className="text-center py-12">
                    <Circle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No collections yet</p>
                    <p className="text-xs text-muted-foreground/60 mt-1 mb-4">Group related chats together</p>
                    <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => setShowNewCollection(true)}>
                      <Plus className="h-3.5 w-3.5" />
                      New Collection
                    </Button>
                  </div>
                )}
                {sortedCollections.map((col) => (
                  <button
                    key={col.id}
                    className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm hover:bg-muted transition-colors"
                    onClick={() => setActiveCollection(col.id)}
                    onContextMenu={(e) => { e.preventDefault(); setCollectionContextMenu({ collectionId: col.id, x: e.clientX, y: e.clientY }); }}
                  >
                    <span className="h-3.5 w-3.5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: col.color }} />
                    <span className="flex-1 text-left truncate font-medium">{col.name}</span>
                    <span className="text-xs text-muted-foreground/50 tabular-nums">{collectionCounts.get(col.id) || 0}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                  </button>
                ))}
                {sortedCollections.length > 0 && (
                  <button
                    className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    onClick={() => setShowNewCollection(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Collection</span>
                  </button>
                )}
              </div>
            )}

            {/* ── Collection detail view ── */}
            {sidebarTab === "collections" && activeCollection && (() => {
              const col = collections.find((c) => c.id === activeCollection);
              return (
                <div className="space-y-1">
                  <button
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-foreground hover:text-primary transition-colors w-full rounded-xl border bg-background/50"
                    onClick={() => setActiveCollection(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: col?.color }} />
                    <span className="flex-1 text-left truncate">{col?.name || "Collection"}</span>
                    <span className="text-xs text-muted-foreground">{filteredConversations.length}</span>
                  </button>
                  <div className="space-y-0.5">
                    {filteredConversations.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">No chats in this collection yet.<br /><span className="text-xs">Right-click any chat to add it.</span></p>
                    )}
                    {filteredConversations.map(renderConvItem)}
                  </div>
                </div>
              );
            })()}

          </div>
        </ScrollArea>

        {/* Resize handle */}
        {sidebarOpen && (
          <div
            className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize z-10 group hover:bg-primary/20 transition-colors"
            onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
          >
            <div className="absolute top-1/2 right-0 -translate-y-1/2 h-8 w-1 rounded-full bg-muted-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>

      {/* ── Right-click context menu (conversation) ── */}
      {contextMenu && (() => {
        const conv = conversations.find((c) => c.id === contextMenu.convId);
        if (!conv) return null;
        const menuX = Math.min(contextMenu.x, (typeof window !== "undefined" ? window.innerWidth : 1200) - 200);
        const menuY = Math.min(contextMenu.y, (typeof window !== "undefined" ? window.innerHeight : 800) - 320);
        return (
          <>
            <div className="fixed inset-0 z-40" onClick={() => { setContextMenu(null); setContextSubmenu(null); }} onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); setContextSubmenu(null); }} />
            <div className="fixed z-50 bg-popover border rounded-xl shadow-2xl py-1.5 w-[200px]" style={{ left: menuX, top: menuY }} onClick={(e) => e.stopPropagation()}>
              {/* Model & date info */}
              <div className="px-3 py-1.5 text-[10px] text-muted-foreground/60 truncate border-b mb-1">
                {conv.model} · {new Date(conv.updated_at).toLocaleDateString()}
              </div>
              <button className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-muted transition-colors" onClick={() => { togglePin(conv.id); setContextMenu(null); }}>
                <Star className={cn("h-4 w-4", conv.pinned && "fill-amber-400 text-amber-400")} />
                {conv.pinned ? "Remove from Favorites" : "Add to Favorites"}
              </button>
              <button className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-muted transition-colors" onClick={() => { setEditingTitle(conv.id); setEditTitleValue(conv.title); setContextMenu(null); }}>
                <Pencil className="h-4 w-4" />
                Rename
              </button>
              <button className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-muted transition-colors" onClick={() => {
                const url = `${window.location.origin}/chat?id=${conv.id}`;
                navigator.clipboard.writeText(url);
                toast.success("Share link copied to clipboard");
                setContextMenu(null);
              }}>
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <div className="border-t my-1 mx-2" />
              <button className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-muted transition-colors" onClick={async () => {
                setContextMenu(null);
                // Load conversation messages if not already active
                if (activeConvId !== conv.id) {
                  try {
                    const res = await fetch(`/api/chat/conversations/${conv.id}`);
                    const data = await res.json();
                    if (data.messages) {
                      const md = data.messages.map((m: { role: string; content: string }) => `## ${m.role === "user" ? "You" : "Assistant"}\n\n${m.content}`).join("\n\n---\n\n");
                      const blob = new Blob([md], { type: "text/markdown" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${conv.title.slice(0, 40)}-${new Date().toISOString().slice(0, 10)}.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("Exported as Markdown");
                    }
                  } catch { toast.error("Failed to export"); }
                } else {
                  const md = messages.map((m) => `## ${m.role === "user" ? "You" : "Assistant"}\n\n${m.content}`).join("\n\n---\n\n");
                  const blob = new Blob([md], { type: "text/markdown" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${conv.title.slice(0, 40)}-${new Date().toISOString().slice(0, 10)}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("Exported as Markdown");
                }
              }}>
                <FileDown className="h-4 w-4" />
                Export Markdown
              </button>
              <button className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-muted transition-colors" onClick={() => {
                setContextMenu(null);
                if (activeConvId !== conv.id) {
                  loadConversation(conv.id).then(() => {
                    setTimeout(() => window.print(), 300);
                  });
                } else {
                  window.print();
                }
              }}>
                <Printer className="h-4 w-4" />
                Export as PDF
              </button>
              <div className="border-t my-1 mx-2" />
              {/* Collections submenu */}
              <div className="relative" onMouseEnter={() => setContextSubmenu("collections")} onMouseLeave={() => { if (contextSubmenu === "collections") setContextSubmenu(null); }}>
                <button className={cn("flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-muted transition-colors", contextSubmenu === "collections" && "bg-muted")} onClick={() => setContextSubmenu(contextSubmenu === "collections" ? null : "collections")}>
                  <Circle className="h-4 w-4" />
                  <span className="flex-1 text-left">Collections</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                {contextSubmenu === "collections" && (
                  <div className="absolute left-full top-0 ml-0.5 bg-popover border rounded-xl shadow-2xl py-1.5 min-w-[180px] z-50">
                    {collections.map((col) => (
                      <button key={col.id} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm hover:bg-muted transition-colors" onClick={() => toggleConvCollection(conv.id, col.id)}>
                        <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                        <span className="flex-1 text-left truncate">{col.name}</span>
                        {conv.tag_ids?.includes(col.id) && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                      </button>
                    ))}
                    {collections.length > 0 && <div className="border-t my-1 mx-2" />}
                    <button className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" onClick={() => { setShowNewCollection(true); setContextMenu(null); }}>
                      <Plus className="h-4 w-4" />
                      New collection
                    </button>
                  </div>
                )}
              </div>
              <div className="border-t my-1 mx-2" />
              <button className="flex items-center gap-3 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors" onClick={() => { deleteConversation(conv.id); setContextMenu(null); }}>
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </>
        );
      })()}

      {/* ── Right-click context menu (collection) ── */}
      {collectionContextMenu && (() => {
        const col = collections.find((c) => c.id === collectionContextMenu.collectionId);
        if (!col) return null;
        const menuX = Math.min(collectionContextMenu.x, (typeof window !== "undefined" ? window.innerWidth : 1200) - 180);
        const menuY = Math.min(collectionContextMenu.y, (typeof window !== "undefined" ? window.innerHeight : 800) - 150);
        return (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setCollectionContextMenu(null)} onContextMenu={(e) => { e.preventDefault(); setCollectionContextMenu(null); }} />
            <div className="fixed z-50 bg-popover border rounded-xl shadow-2xl py-1.5 w-[180px]" style={{ left: menuX, top: menuY }} onClick={(e) => e.stopPropagation()}>
              <button className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-muted transition-colors" onClick={() => { setEditingCollection(col.id); setEditCollectionName(col.name); setCollectionContextMenu(null); }}>
                <Pencil className="h-4 w-4" />
                Rename
              </button>
              <button className="flex items-center gap-3 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors" onClick={() => { deleteCollection(col.id); }}>
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </>
        );
      })()}

      {/* ── New collection dialog ── */}
      {showNewCollection && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setShowNewCollection(false)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-popover border rounded-xl shadow-2xl p-5 w-[340px]">
            <h3 className="text-base font-semibold mb-4">New Collection</h3>
            <input
              className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary mb-3"
              placeholder="Collection name"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && newCollectionName.trim()) createCollection(); if (e.key === "Escape") setShowNewCollection(false); }}
              autoFocus
            />
            <p className="text-xs text-muted-foreground mb-2">Color</p>
            <div className="flex gap-2 mb-5">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  className={cn("h-7 w-7 rounded-full border-2 transition-all", newCollectionColor === c ? "border-foreground scale-110 shadow-sm" : "border-transparent hover:scale-105")}
                  style={{ backgroundColor: c }}
                  onClick={() => setNewCollectionColor(c)}
                />
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowNewCollection(false)}>Cancel</Button>
              <Button size="sm" onClick={createCollection} disabled={!newCollectionName.trim()}>Create</Button>
            </div>
          </div>
        </>
      )}

      {/* ── Rename collection dialog ── */}
      {editingCollection && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setEditingCollection(null)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-popover border rounded-xl shadow-2xl p-5 w-[340px]">
            <h3 className="text-base font-semibold mb-4">Rename Collection</h3>
            <input
              className="w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              value={editCollectionName}
              onChange={(e) => setEditCollectionName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && editCollectionName.trim()) renameCollection(editingCollection, editCollectionName.trim()); if (e.key === "Escape") setEditingCollection(null); }}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setEditingCollection(null)}>Cancel</Button>
              <Button size="sm" onClick={() => renameCollection(editingCollection, editCollectionName.trim())} disabled={!editCollectionName.trim()}>Save</Button>
            </div>
          </div>
        </>
      )}

      {/* ─── Main chat area ─── */}
      <div
        className={cn("flex-1 flex min-w-0 relative", compareMode ? "flex-row" : "flex-col")}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drop overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-50 bg-primary/5 border-2 border-dashed border-primary/40 rounded-xl flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <Paperclip className="h-10 w-10 text-primary/50 mx-auto mb-3" />
              <p className="text-lg font-medium text-primary/70">Drop files here</p>
              <p className="text-sm text-muted-foreground mt-1">PDFs, docs, code files, images</p>
            </div>
          </div>
        )}
        {compareMode ? (
          // ── Compare mode: side-by-side ──
          <>
            {/* Left panel — primary model */}
            <div className="flex-1 flex flex-col min-w-0 border-r">
              <div className="flex items-center gap-2 px-4 py-2 border-b bg-background flex-shrink-0">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}>
                  <ChevronLeft className={cn("h-4 w-4 transition-transform", !sidebarOpen && "rotate-180")} />
                </Button>
                {availableModels.length > 0 && (
                  <Select value={`${selectedProvider}:${selectedModel}`} onValueChange={(val) => { const [p, ...r] = val.split(":"); setSelectedProvider(p); setSelectedModel(r.join(":")); }}>
                    <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue placeholder="Model A" /></SelectTrigger>
                    <SelectContent>
                      {availableModels.map((m) => (
                        <SelectItem key={`${m.provider}:${m.model}`} value={`${m.provider}:${m.model}`}>
                          <span className="text-muted-foreground mr-1">{m.providerLabel}</span>{m.modelLabel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <div className="flex-1" />
                <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={() => { setCompareMode(false); setCompareMessages([]); }}>
                  <X className="h-3 w-3" /> Exit Compare
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="max-w-2xl mx-auto px-4 py-6">
                  {messages.map((message) => {
                    if (message.role === "assistant" && !message.content && isLoading) return null;
                    return renderMessage(message);
                  })}
                  {isLoading && (messages[messages.length - 1]?.role === "user" || (messages[messages.length - 1]?.role === "assistant" && !messages[messages.length - 1]?.content)) && renderLoadingDots()}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>
            {/* Right panel — compare model */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center gap-2 px-4 py-2 border-b bg-background flex-shrink-0">
                {availableModels.length > 0 && (
                  <Select value={`${compareProvider}:${compareModel}`} onValueChange={(val) => { const [p, ...r] = val.split(":"); setCompareProvider(p); setCompareModel(r.join(":")); }}>
                    <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue placeholder="Model B" /></SelectTrigger>
                    <SelectContent>
                      {availableModels.map((m) => (
                        <SelectItem key={`${m.provider}:${m.model}`} value={`${m.provider}:${m.model}`}>
                          <span className="text-muted-foreground mr-1">{m.providerLabel}</span>{m.modelLabel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <ScrollArea className="flex-1">
                <div className="max-w-2xl mx-auto px-4 py-6">
                  {compareMessages.filter(m => m.role === "assistant").length === 0 && !compareLoading && (
                    <p className="text-sm text-muted-foreground text-center py-20">Send a message to compare responses</p>
                  )}
                  {compareMessages.filter(m => m.role === "assistant").map((message) => renderMessage(message))}
                  {compareLoading && renderLoadingDots()}
                </div>
              </ScrollArea>
            </div>
          </>
        ) : (
          // ── Normal mode ──
          <>
            {/* Floating controls */}
            {!sidebarOpen && (
              <div className="absolute top-3 left-3 z-10">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
                  <ChevronLeft className="h-4 w-4 rotate-180" />
                </Button>
              </div>
            )}
            {messages.length > 0 && (
              <div className="absolute top-3 right-3 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-8 px-2 gap-1.5 text-xs", outlinePanelOpen && "bg-muted")}
                  onClick={() => { setOutlinePanelOpen(!outlinePanelOpen); if (!outlinePanelOpen) setPromptPanelOpen(false); }}
                  title="Conversation outline & saved items"
                >
                  <FileText className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {/* Admin notice — dismissible */}
            {isAdmin && !chatEnabledForMembers && !adminNoticeDismissed && (
              <div className="mx-4 mt-2 rounded-lg border border-blue-200 dark:border-blue-800/50 bg-blue-50/80 dark:bg-blue-950/30 px-3 py-2 flex items-center gap-2 text-xs">
                <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="flex-1 text-blue-800 dark:text-blue-300">
                  Only admins can see AI Chat right now.{" "}
                  <Link href="/settings/security" className="font-medium underline underline-offset-2 hover:text-blue-900 dark:hover:text-blue-200">
                    Enable for all members
                  </Link>{" "}
                  in Settings &rarr; Security when you&apos;re ready.
                </span>
                <button onClick={() => { setAdminNoticeDismissed(true); localStorage.setItem("chat-admin-notice-dismissed", "1"); }} className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 flex-shrink-0">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* No providers setup */}
            {noProviders ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-lg font-semibold mb-2">Set up an AI Provider</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Add your OpenAI, Anthropic, or Google API key to start chatting. Your messages are protected by your workspace&apos;s DLP rules.
                  </p>
                  <Link href="/settings/ai-providers">
                    <Button><Settings className="h-4 w-4 mr-2" />Configure AI Providers</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <ScrollArea className="flex-1" ref={scrollAreaRef}>
                  <div className="max-w-3xl mx-auto px-4 py-6">
                    {messages.length === 0 && !isLoading && (
                      <div className="flex flex-col items-center justify-center py-16 sm:py-24">
                        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">What can I help you with?</h1>
                        <p className="text-muted-foreground text-sm mb-10">Ask anything. Your messages are DLP-protected.</p>

                        {/* Presets */}
                        {presets.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mb-8">
                            {presets.slice(0, 4).map((preset) => (
                              <button
                                key={preset.id}
                                className="flex items-center gap-3 border rounded-xl px-4 py-3 text-left hover:border-primary/40 hover:bg-muted/50 transition-all group"
                                onClick={() => startPreset(preset)}
                              >
                                <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${preset.color || "#6366f1"}15` }}>
                                  <Sparkles className="h-4 w-4" style={{ color: preset.color || "#6366f1" }} />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{preset.name}</p>
                                  {preset.description && <p className="text-xs text-muted-foreground truncate">{preset.description}</p>}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Suggestion cards — 2x2 grid */}
                        {(() => {
                          const allSuggestions = [
                            [
                              { icon: FileText, title: "Write a status update", desc: "Project progress report" },
                              { icon: Search, title: "Review code for bugs", desc: "Find issues in your code" },
                              { icon: MessageSquare, title: "Draft a customer email", desc: "Professional communication" },
                              { icon: Bot, title: "Explain an error", desc: "Debug with context" },
                            ],
                            [
                              { icon: FileText, title: "Summarize a document", desc: "Key points and takeaways" },
                              { icon: Sparkles, title: "Brainstorm ideas", desc: "Creative problem solving" },
                              { icon: MessageSquare, title: "Write a meeting agenda", desc: "Structured discussion plan" },
                              { icon: Search, title: "Analyze this data", desc: "Insights and patterns" },
                            ],
                          ];
                          const suggestions = allSuggestions[Math.floor(Date.now() / (1000 * 60 * 30)) % allSuggestions.length];
                          return (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                              {suggestions.map((s) => (
                                <button
                                  key={s.title}
                                  className="flex items-start gap-3 border rounded-xl px-4 py-3 text-left hover:border-primary/40 hover:bg-muted/50 transition-all group"
                                  onClick={() => { setChatInput(s.title); inputRef.current?.focus(); }}
                                >
                                  <s.icon className="h-4 w-4 text-muted-foreground/50 mt-0.5 flex-shrink-0 group-hover:text-primary/60 transition-colors" />
                                  <div>
                                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{s.title}</p>
                                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {messages.map((message, idx) => {
                      // Skip empty assistant messages — loading dots handle that state
                      if (message.role === "assistant" && !message.content && isLoading) return null;
                      return renderMessage(message, idx);
                    })}

                    {isLoading && (messages[messages.length - 1]?.role === "user" || (messages[messages.length - 1]?.role === "assistant" && !messages[messages.length - 1]?.content)) && renderLoadingDots()}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>


                {/* Stop / Regenerate bar */}
                {(isLoading || lastIsAssistant) && (
                  <div className="flex items-center justify-center py-2">
                    {isLoading ? (
                      <Button variant="outline" size="sm" className="text-xs gap-1.5 rounded-full" onClick={stopGeneration}>
                        <Square className="h-3 w-3" />Stop generating
                      </Button>
                    ) : lastIsAssistant ? (
                      <Button variant="outline" size="sm" className="text-xs gap-1.5 rounded-full" onClick={regenerateLastResponse}>
                        <RefreshCw className="h-3 w-3" />Regenerate response
                      </Button>
                    ) : null}
                  </div>
                )}

                {/* DLP Block Banner */}
                {dlpBlock && (
                  <div className="mx-4 mb-2 rounded-lg border border-red-200 dark:border-red-800/50 bg-red-50/80 dark:bg-red-950/30 p-3 flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-red-800 dark:text-red-300">Message blocked by DLP</p>
                      <ul className="mt-1 space-y-0.5">
                        {dlpBlock.map((v, i) => (
                          <li key={i} className="text-[11px] text-red-700 dark:text-red-400 flex items-center gap-1">
                            <AlertTriangle className="h-2.5 w-2.5" />{v.ruleName} ({v.category})
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button onClick={() => setDlpBlock(null)} className="text-red-400 hover:text-red-600"><X className="h-3.5 w-3.5" /></button>
                  </div>
                )}

                {/* Redaction Banner */}
                {redactions && (
                  <div className="mx-4 mb-2 rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50/80 dark:bg-amber-950/30 p-3 flex items-start gap-2">
                    <Shield className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">{redactions.length} item{redactions.length > 1 ? "s" : ""} redacted before sending</p>
                      <ul className="mt-1 space-y-0.5">
                        {redactions.map((r, i) => (
                          <li key={i} className="text-[11px] text-amber-700 dark:text-amber-400">
                            {r.category} &rarr; replaced with {r.replacement}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button onClick={() => setRedactions(null)}><X className="h-3.5 w-3.5 text-amber-400" /></button>
                  </div>
                )}

                {/* Slash command menu */}
                {slashMenuOpen && filteredSlashCommands.length > 0 && (
                  <div ref={slashMenuRef} className="mx-4 mb-1 max-w-3xl lg:mx-auto">
                    <div className="rounded-lg border bg-popover shadow-lg overflow-hidden max-h-[320px] overflow-y-auto">
                      {filteredSlashCommands.map((cmd, idx) => {
                        const prevCmd = filteredSlashCommands[idx - 1];
                        const showSection = cmd.section && cmd.section !== prevCmd?.section;
                        return (
                          <div key={cmd.command}>
                            {showSection && (
                              <div className="px-3 pt-2 pb-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground border-t">
                                {cmd.section}
                              </div>
                            )}
                            <button
                              type="button"
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                                idx === slashMenuIndex ? "bg-accent" : "hover:bg-muted/50"
                              )}
                              onClick={() => executeSlashCommand(cmd.command)}
                              onMouseEnter={() => setSlashMenuIndex(idx)}
                            >
                              <div className={cn(
                                "h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0",
                                cmd.section === "Admin" ? "bg-amber-100 dark:bg-amber-900/30" : "bg-muted"
                              )}>
                                <cmd.icon className={cn("h-3.5 w-3.5", cmd.section === "Admin" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <code className="text-xs font-mono text-primary">{cmd.command}</code>
                                  <span className="text-xs font-medium">{cmd.label}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">{cmd.description}</p>
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Input area — integrated composer */}
                <div className="bg-background px-4 py-4 flex-shrink-0">
                  <div className="max-w-3xl mx-auto">
                    {/* Pending attachments */}
                    {(pendingImages.length > 0 || pendingFiles.length > 0) && (
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {pendingImages.map((img, idx) => (
                          <div key={`img-${idx}`} className="relative group">
                            <img src={img} alt={`Upload ${idx + 1}`} className="h-16 w-16 rounded-lg object-cover border" />
                            <button type="button" onClick={() => removePendingImage(idx)} className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {pendingFiles.map((pf, idx) => (
                          <div key={`file-${idx}`} className={cn(
                            "relative group flex items-center gap-2 border rounded-lg px-3 py-2 max-w-[240px]",
                            pf.dlpPassed ? "border-green-200 dark:border-green-800/40 bg-green-50/50 dark:bg-green-950/20" :
                            pf.error ? "border-red-200 dark:border-red-800/40 bg-red-50/50 dark:bg-red-950/20" : "bg-muted/50"
                          )}>
                            <FileText className={cn("h-5 w-5 flex-shrink-0", pf.dlpPassed ? "text-green-600 dark:text-green-400" : "text-muted-foreground")} />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium truncate">{pf.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {pf.uploading ? <span className="flex items-center gap-1"><Loader2 className="h-2.5 w-2.5 animate-spin" />Scanning...</span>
                                  : pf.error ? <span className="text-destructive">{pf.error}</span>
                                  : pf.dlpPassed ? <span className="flex items-center gap-1 text-green-600 dark:text-green-400"><Shield className="h-2.5 w-2.5" />DLP passed · {formatFileSize(pf.size)}</span>
                                  : <span>{formatFileSize(pf.size)}</span>}
                              </p>
                            </div>
                            <button type="button" onClick={() => removePendingFile(idx)} className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Composer — input with inline buttons */}
                    <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="relative">
                      <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt,.csv,.tsv,.json,.xml,.yaml,.yml,.md,.py,.js,.ts,.jsx,.tsx,.html,.css,.sql,.sh,.go,.rs,.java,.c,.cpp,.rb,.php,.swift,.kt,.r,.xlsx,.xls" multiple className="hidden" onChange={handleFileSelect} />
                      <div className="flex items-end rounded-2xl border bg-background shadow-sm focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/30 transition-all">
                        <button
                          type="button"
                          className="pb-3.5 pt-3.5 px-3 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 self-end"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isLoading || noProviders}
                          title="Attach files"
                        >
                          <Paperclip className="h-5 w-5" />
                        </button>
                        <Textarea
                          ref={inputRef}
                          value={chatInput}
                          onChange={(e) => {
                            handleInputChange(e.target.value);
                            const el = e.target;
                            el.style.height = "auto";
                            el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
                          }}
                          onKeyDown={handleKeyDown}
                          placeholder="Message TeamPrompt..."
                          className="min-h-[52px] max-h-[200px] resize-none text-[15px] border-0 shadow-none focus-visible:ring-0 rounded-none py-3.5 px-0 overflow-y-auto"
                          rows={1}
                          disabled={isLoading || noProviders}
                        />
                        <button
                          type="submit"
                          className={cn(
                            "pb-3.5 pt-3.5 px-3 flex-shrink-0 transition-colors self-end",
                            (!chatInput.trim() && pendingImages.length === 0 && pendingFiles.length === 0) || isLoading || noProviders
                              ? "text-muted-foreground/30"
                              : "text-primary hover:text-primary/80"
                          )}
                          disabled={(!chatInput.trim() && pendingImages.length === 0 && pendingFiles.length === 0) || isLoading || noProviders}
                        >
                          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        </button>
                      </div>
                    </form>
                    {/* Model selector + DLP badge below input */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        {availableModels.length > 0 && (
                          <Select
                            value={`${selectedProvider}:${selectedModel}`}
                            onValueChange={(val) => {
                              const [prov, ...rest] = val.split(":");
                              setSelectedProvider(prov);
                              setSelectedModel(rest.join(":"));
                            }}
                          >
                            <SelectTrigger className="h-7 text-[11px] border-0 bg-transparent hover:bg-muted transition-colors px-2 gap-1 w-auto">
                              <SelectValue placeholder="Model" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableModels.map((m) => (
                                <SelectItem key={`${m.provider}:${m.model}`} value={`${m.provider}:${m.model}`}>
                                  <span className="text-muted-foreground mr-1">{m.providerLabel}</span>
                                  {m.modelLabel}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <span className="text-[10px] text-muted-foreground/40">Type / for commands</span>
                      </div>
                      <Link href="/guardrails" className="flex items-center gap-1 text-[10px] text-green-600/60 hover:text-green-600 transition-colors">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        DLP
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* Shared input area for compare mode */}
        {compareMode && (
          <div className="border-t bg-background px-4 py-3 flex-shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="max-w-3xl mx-auto flex items-end gap-2">
              <Textarea
                ref={inputRef}
                value={chatInput}
                onChange={(e) => { handleInputChange(e.target.value); const el = e.target; el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 200)}px`; }}
                onKeyDown={handleKeyDown}
                placeholder="Send to both models..."
                className="min-h-[44px] max-h-[200px] resize-none text-sm rounded-xl overflow-y-auto"
                rows={1}
                disabled={isLoading || noProviders}
              />
              <Button type="submit" size="icon" className="h-[44px] w-[44px] rounded-xl flex-shrink-0" disabled={(!chatInput.trim() && pendingImages.length === 0 && pendingFiles.length === 0) || isLoading || noProviders} aria-label={isLoading ? "Generating response" : "Send message"}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* ─── Prompt Library Panel (right sidebar) ─── */}
      <div className={cn(
        "border-l bg-background flex flex-col transition-all duration-200 overflow-hidden",
        promptPanelOpen ? "w-80" : "w-0"
      )}>
        <div className="p-3 border-b flex items-center justify-between flex-shrink-0">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Library className="h-4 w-4" />Prompt Library
          </h3>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="sm" className={cn("h-6 w-6 p-0", promptPanelPinned && "text-primary")} title={promptPanelPinned ? "Unpin panel" : "Pin panel open"} onClick={() => setPromptPanelPinned(!promptPanelPinned)}>
              <Pin className={cn("h-3.5 w-3.5", promptPanelPinned && "fill-primary")} />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setPromptPanelOpen(false); setPromptPanelPinned(false); }} aria-label="Close prompt panel">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-2 space-y-2 border-b flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text" placeholder="Search prompts..." value={promptSearch}
              onChange={(e) => setPromptSearch(e.target.value)}
              className="w-full h-8 rounded-md border bg-background pl-7 pr-2 text-xs outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex gap-1">
            {(["all", "favorites", "templates"] as const).map((f) => (
              <button
                key={f} type="button" onClick={() => setPromptFilter(f)}
                className={cn(
                  "flex-1 text-[10px] font-medium rounded-md px-2 py-1 transition-colors capitalize",
                  promptFilter === f ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {f === "favorites" && <Star className="h-2.5 w-2.5 inline mr-0.5" />}
                {f === "templates" && <Braces className="h-2.5 w-2.5 inline mr-0.5" />}
                {f}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredPrompts.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                {promptSearch ? "No prompts match your search" : "No prompts available"}
              </p>
            ) : (
              filteredPrompts.slice(0, 50).map((prompt) => (
                <button
                  key={prompt.id} type="button"
                  className="w-full text-left rounded-lg border p-2.5 hover:bg-muted/50 hover:border-primary/30 transition-colors group"
                  onClick={() => insertPrompt(prompt.content)}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate flex items-center gap-1">
                        {prompt.is_template && <Braces className="h-2.5 w-2.5 text-primary flex-shrink-0" />}
                        {prompt.is_favorite && <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500 flex-shrink-0" />}
                        {prompt.title}
                      </p>
                      {prompt.description && <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{prompt.description}</p>}
                    </div>
                    <span className="text-[9px] text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100">Insert</span>
                  </div>
                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {prompt.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[9px] bg-muted rounded px-1.5 py-0.5 text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-2 border-t flex-shrink-0">
          <Link href="/vault">
            <Button variant="ghost" size="sm" className="w-full text-xs gap-1.5 text-muted-foreground">
              <FileText className="h-3 w-3" />Manage Prompts
            </Button>
          </Link>
        </div>
      </div>

      {/* ─── Conversation Outline Panel (right flyout) ─── */}
      <div className={cn(
        "border-l bg-background flex flex-col transition-all duration-200 overflow-hidden",
        outlinePanelOpen ? "w-80" : "w-0"
      )}>
        <div className="flex items-center justify-between border-b flex-shrink-0 px-1">
          <div className="flex flex-1">
            {(["outline", "saved"] as const).map((tab) => (
              <button
                key={tab}
                className={cn(
                  "flex-1 py-2.5 text-xs font-medium transition-colors relative text-center",
                  flyoutTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => { setFlyoutTab(tab); if (tab === "saved") loadSavedItems(); }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {flyoutTab === tab && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0" onClick={() => setOutlinePanelOpen(false)} aria-label="Close outline panel">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {flyoutTab === "outline" && (
        <ScrollArea className="flex-1">
          <div className="p-3 w-0 min-w-full overflow-hidden">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Start a conversation to see its outline</p>
            ) : (
              <div className="space-y-0.5">
                {/* Timeline — auto-detected entries from message content */}
                {messages.map((m, i) => {
                  // Skip assistant messages with no content (loading state)
                  if (!m.content) return null;

                  // Detect entry type and generate summary
                  let IconComp: React.ComponentType<{className?: string}> = MessageSquare;
                  let summary = "";
                  let accent = "text-muted-foreground";

                  if (m.role === "user") {
                    if (m.files && m.files.length > 0) {
                      IconComp = FileText;
                      summary = `Uploaded ${m.files.map(f => f.name).join(", ")}`;
                      accent = "text-blue-600";
                    } else if (/\[[A-Z_]+\]/.test(m.content)) {
                      IconComp = Shield;
                      const placeholders = Array.from(new Set(m.content.match(/\[[A-Z_]+\]/g) || []));
                      summary = `Redacted: ${placeholders.join(", ")}`;
                      accent = "text-amber-600";
                    } else {
                      IconComp = MessageSquare;
                      summary = m.content.split("\n")[0].slice(0, 60);
                      if (m.content.length > 60) summary += "...";
                    }
                  } else {
                    const hasCode = /```[\s\S]*?```/.test(m.content);
                    const hasTable = /\|.*\|.*\|/.test(m.content);
                    const hasList = /^\s*[-*•]\s/m.test(m.content) || /^\s*\d+\.\s/m.test(m.content);
                    const hasHeadings = /^#{1,3}\s/m.test(m.content);
                    const hasLinks = /https?:\/\/[^\s)]+/.test(m.content);
                    const hasQuiz = /\?\s*\n\s*[A-D]\)/i.test(m.content) || /correct answer|quiz|question \d/i.test(m.content);
                    const hasComparison = /\bvs\.?\b|compared to|difference between|pros and cons/i.test(m.content);
                    const hasSteps = /step \d|first,.*second,|1\.\s.*\n2\.\s/i.test(m.content);
                    const hasEmail = /subject:|dear |hi |hello |regards|sincerely/i.test(m.content) && m.content.length < 2000;
                    const hasSummary = /summary|key (takeaways|points|findings)|in (summary|conclusion)|tl;?dr/i.test(m.content);

                    if (hasCode) {
                      IconComp = Braces;
                      const langMatch = m.content.match(/```(\w+)/);
                      summary = langMatch ? `Generated ${langMatch[1]} code` : "Generated code";
                      accent = "text-emerald-600";
                    } else if (hasQuiz) {
                      IconComp = HelpCircle;
                      summary = "Quiz / Q&A";
                      accent = "text-purple-600";
                    } else if (hasComparison) {
                      IconComp = BarChart3;
                      summary = "Comparison / analysis";
                      accent = "text-indigo-600";
                    } else if (hasEmail) {
                      IconComp = Send;
                      summary = "Drafted email/message";
                      accent = "text-sky-600";
                    } else if (hasSummary) {
                      IconComp = Pin;
                      summary = "Summary / key points";
                      accent = "text-orange-600";
                    } else if (hasTable) {
                      IconComp = BarChart3;
                      summary = "Generated table/data";
                      accent = "text-violet-600";
                    } else if (hasLinks) {
                      IconComp = ExternalLink;
                      const linkCount = (m.content.match(/https?:\/\/[^\s)]+/g) || []).length;
                      summary = `Shared ${linkCount} link${linkCount > 1 ? "s" : ""}`;
                      accent = "text-blue-600";
                    } else if (hasSteps) {
                      IconComp = ListOrdered;
                      summary = "Step-by-step instructions";
                      accent = "text-teal-600";
                    } else if (hasHeadings && hasList) {
                      IconComp = FileText;
                      const firstHeading = m.content.match(/^#{1,3}\s+(.+)/m);
                      summary = firstHeading ? firstHeading[1].slice(0, 50) : "Detailed response";
                    } else if (hasList) {
                      IconComp = List;
                      summary = "Listed items";
                    } else {
                      IconComp = Sparkles;
                      const firstSentence = m.content.match(/^[^.!?\n]+[.!?]?/);
                      summary = firstSentence ? firstSentence[0].slice(0, 55) : m.content.slice(0, 55);
                      if (summary.length >= 55) summary += "...";
                    }
                  }

                  return (
                    <button
                      key={m.id || i}
                      className={cn(
                        "group/entry w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors hover:bg-muted/50",
                        m.role === "user" ? "opacity-60" : ""
                      )}
                      onClick={() => {
                        // Scroll to this message
                        const el = document.querySelector(`[data-msg-id="${m.id}"]`);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                    >
                      <IconComp className={cn("h-3.5 w-3.5 flex-shrink-0 mt-0.5", accent)} />
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-xs truncate", accent || "text-foreground")}>{summary}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {m.role === "user" ? "You" : "AI"}{m.created_at ? ` · ${new Date(m.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}
                        </p>
                      </div>
                      {m.role === "assistant" && m.content && (
                        <button
                          className={cn("p-0.5 flex-shrink-0 opacity-0 group-hover/entry:opacity-100 transition-all",
                            savedItems.some(s => s.source_message_id === m.id) ? "text-primary" : "text-muted-foreground/40 hover:text-primary"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!savedItems.some(s => s.source_message_id === m.id)) {
                              saveMessageContent(m.id, m.content);
                            }
                          }}
                          title={savedItems.some(s => s.source_message_id === m.id) ? "Saved" : "Save"}
                        >
                          {savedItems.some(s => s.source_message_id === m.id) ? <BookmarkCheck className="h-3 w-3" /> : <Bookmark className="h-3 w-3" />}
                        </button>
                      )}
                    </button>
                  );
                })}

                {/* Stats at bottom */}
                <div className="mt-4 pt-3 border-t">
                  <div className="text-[10px] text-muted-foreground/60 px-2.5 space-y-0.5">
                    <p>{messages.length} messages · {messages.reduce((a, m) => a + m.content.length, 0).toLocaleString()} chars</p>
                    <p>Model: {selectedModel}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        )}

        {flyoutTab === "saved" && (
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2 overflow-hidden w-0 min-w-full">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search saved items..."
                  className="w-full h-8 rounded-lg border bg-background pl-8 pr-3 text-xs outline-none focus:ring-1 focus:ring-primary"
                  onChange={(e) => {
                    const q = e.target.value;
                    if (q.length >= 2) {
                      fetch(`/api/chat/saved?q=${encodeURIComponent(q)}`).then(r => r.json()).then(d => setSavedItems(d.items || [])).catch(() => {});
                    } else if (q.length === 0) { loadSavedItems(); }
                  }}
                />
              </div>

              {/* Board filter */}
              {savedBoards.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  <button
                    className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors", savedFilter === "All" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
                    onClick={() => setSavedFilter("All")}
                  >All</button>
                  {savedBoards.map((b) => (
                    <button
                      key={b}
                      className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors", savedFilter === b ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}
                      onClick={() => setSavedFilter(b)}
                    >{b}</button>
                  ))}
                </div>
              )}

              {/* Items */}
              {savedItems.filter(i => savedFilter === "All" || i.board === savedFilter).length === 0 ? (
                <div className="text-center py-8">
                  <Bookmark className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No saved items yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Hover an AI response and click the bookmark icon</p>
                </div>
              ) : (
                savedItems.filter(i => savedFilter === "All" || i.board === savedFilter).map((item) => (
                  <div key={item.id} className="group border rounded-lg p-3 hover:border-primary/30 transition-colors overflow-hidden">
                    <div className="flex items-start justify-between gap-2 min-w-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {item.content_type} · {item.board} · {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                        <button className="p-0.5 text-muted-foreground/40 hover:text-foreground" onClick={() => { navigator.clipboard.writeText(item.content); toast.success("Copied!"); }} title="Copy"><Copy className="h-3 w-3" /></button>
                        <button className="p-0.5 text-muted-foreground/40 hover:text-destructive" onClick={() => deleteSavedItem(item.id)} title="Remove"><X className="h-3 w-3" /></button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-3 break-words overflow-hidden">{item.content}</p>
                    {item.conversation_id && (
                      <button
                        className="text-[10px] text-primary hover:underline mt-1.5"
                        onClick={() => { loadConversation(item.conversation_id!); setOutlinePanelOpen(false); }}
                      >
                        Go to conversation
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );

  // ── Helper render functions ──

  function renderMessage(message: ChatMsg, idx?: number) {
    const rating = messageRatings[message.id] || 0;
    const timestamp = message.created_at
      ? new Date(message.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      : message.id && !isNaN(Number(message.id.split("-")[0]))
        ? new Date(Number(message.id.split("-")[0])).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
        : "";
    // ── User message ──
    if (message.role === "user") {
      return (
        <div key={message.id} data-msg-id={message.id} className="group flex justify-end mb-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <div className="max-w-[75%] min-w-0">
            <div className="rounded-2xl bg-primary text-primary-foreground px-5 py-3 text-[15px] leading-7 overflow-hidden break-words">
              {message.images && message.images.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-2">
                  {message.images.map((img, imgIdx) => (
                    <img key={imgIdx} src={img} alt={`Attachment ${imgIdx + 1}`} className="max-h-48 rounded-lg object-contain" />
                  ))}
                </div>
              )}
              {message.files && message.files.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {message.files.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2.5 bg-white/10 backdrop-blur rounded-lg px-3 py-2.5 min-w-[140px]">
                      <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 opacity-80" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{f.name}</p>
                        <p className="text-[10px] opacity-60">{f.type?.split("/").pop() || "file"} · {formatFileSize(f.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            <div className="flex items-center gap-1 mt-1.5 justify-end">
              {timestamp && <span className="text-[10px] text-muted-foreground/40">{timestamp}</span>}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Copy" onClick={() => copyMessage(message.content, message.id)}>
                  {copiedId === message.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ── Assistant message — no bubble, clean document-like rendering ──
    return (
      <div key={message.id} data-msg-id={message.id} className="group mb-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
            <img src="/brand/logo-icon.svg" alt="TeamPrompt" className="h-4 w-4 dark:hidden" />
            <img src="/brand/logo-icon-dark.svg" alt="TeamPrompt" className="h-4 w-4 hidden dark:block" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="prose dark:prose-invert max-w-none text-[15px] leading-7 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_pre]:relative [&_pre]:bg-zinc-900 [&_pre]:text-zinc-100 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:text-[13px] [&_pre]:overflow-x-auto [&_pre]:my-4 [&_code]:text-[13px] [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_p]:mb-3 [&_ul]:mb-3 [&_ol]:mb-3 [&_li]:mb-1 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_table]:text-sm [&_th]:text-left [&_th]:font-semibold [&_td]:py-1.5 [&_td]:pr-4">
              <ReactMarkdown
                components={{
                  pre: ({ children, ...props }) => {
                    // Extract language from className (e.g. "language-python")
                    const codeEl = children as React.ReactElement;
                    const className = codeEl?.props?.className || "";
                    const lang = className.replace("language-", "").split(" ")[0] || "";
                    const codeText = codeEl?.props?.children;
                    return (
                      <div className="group/code rounded-xl overflow-hidden border border-zinc-700/50 my-4">
                        {/* Header bar with language + copy */}
                        <div className="flex items-center justify-between bg-zinc-800 px-4 py-2">
                          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wide">{lang || "code"}</span>
                          <button
                            className="flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
                            onClick={() => {
                              if (typeof codeText === "string") { navigator.clipboard.writeText(codeText); toast.success("Copied!"); }
                            }}
                          >
                            <Copy className="h-3 w-3" />
                            Copy
                          </button>
                        </div>
                        <pre {...props} className="!rounded-none !mt-0 !mb-0 !border-0">{children}</pre>
                      </div>
                    );
                  },
                  table: ({ children, ...props }) => (
                    <div className="overflow-x-auto my-4 rounded-lg border">
                      <table {...props} className="!my-0">{children}</table>
                    </div>
                  ),
                }}
              >{message.content}</ReactMarkdown>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-1 mt-2">
              {timestamp && <span className="text-[10px] text-muted-foreground/40 mr-1">{timestamp}</span>}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className={cn("p-1 rounded transition-colors",
                    savedItems.some(s => s.source_message_id === message.id)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  )}
                  title={savedItems.some(s => s.source_message_id === message.id) ? "Saved" : "Save to items"}
                  onClick={() => {
                    if (!savedItems.some(s => s.source_message_id === message.id)) {
                      saveMessageContent(message.id, message.content);
                    }
                  }}
                >
                  {savingMessageId === message.id
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : savedItems.some(s => s.source_message_id === message.id)
                      ? <BookmarkCheck className="h-3 w-3" />
                      : <Bookmark className="h-3 w-3" />
                  }
                </button>
                <button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Copy" onClick={() => copyMessage(message.content, message.id)}>
                  {copiedId === message.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </button>
                {idx !== undefined && idx === messages.length - 1 && !isLoading && (
                  <button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Regenerate" onClick={regenerateLastResponse}>
                    <RefreshCw className="h-3 w-3" />
                  </button>
                )}
                <button
                  className={cn("p-1 rounded transition-colors", rating === 1 ? "text-green-500 bg-green-500/10" : "text-muted-foreground hover:text-green-500 hover:bg-muted")}
                  title="Good response" onClick={() => rateMessage(message.id, 1)}
                >
                  <ThumbsUp className="h-3 w-3" />
                </button>
                <button
                  className={cn("p-1 rounded transition-colors", rating === -1 ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:text-red-500 hover:bg-muted")}
                  title="Bad response" onClick={() => rateMessage(message.id, -1)}
                >
                  <ThumbsDown className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderLoadingDots() {
    return (
      <div className="flex gap-3 mb-8">
        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
          <img src="/brand/logo-icon.svg" alt="TeamPrompt" className="h-4 w-4 dark:hidden" />
          <img src="/brand/logo-icon-dark.svg" alt="TeamPrompt" className="h-4 w-4 hidden dark:block" />
        </div>
        <div className="pt-2">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:0ms]" />
            <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:150ms]" />
            <div className="h-2 w-2 rounded-full bg-muted-foreground/30 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }
}
