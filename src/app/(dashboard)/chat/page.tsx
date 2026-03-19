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
  Slash,
  Pin,
  BarChart3,
  Paperclip,
  FolderPlus,
  Folder,
  FolderOpen,
  Tag,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Columns2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useOrg } from "@/components/providers/org-provider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// ── Shared sub-components ──

function ConvSection({ label, icon, children, collapsible, defaultOpen = true }: {
  label: string; icon?: React.ReactNode; children: React.ReactNode;
  collapsible?: boolean; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-2">
      <button
        type="button"
        className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-full text-left"
        onClick={() => collapsible && setOpen(!open)}
      >
        {icon}
        {label}
        {collapsible && (
          <ChevronRight className={cn("h-2 w-2 ml-auto transition-transform", open && "rotate-90")} />
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
  tag_ids?: string[];
}

interface ChatFolder {
  id: string;
  name: string;
  color: string;
  sort_order: number;
}

interface ChatTag {
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
}

interface SearchResult {
  messageId: string;
  conversationId: string;
  conversationTitle: string;
  role: string;
  snippet: string;
  created_at: string;
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
  const { currentUserRole, org, members, prompts: orgPrompts } = useOrg();
  const isAdmin = currentUserRole === "admin";
  const orgSettings = (org?.settings || {}) as Record<string, unknown>;
  const chatEnabledForMembers = orgSettings.ai_chat_enabled === true;
  const systemPrompt = orgSettings.ai_system_prompt as string | undefined;
  const currentMember = members.find((m) => m.isCurrentUser);
  const userInitial = (currentMember?.name || currentMember?.email || "U")[0].toUpperCase();

  const approvedPrompts = orgPrompts.filter((p) => p.status === "approved");

  // ── State ──
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [dlpBlock, setDlpBlock] = useState<DlpViolation[] | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [promptPanelOpen, setPromptPanelOpen] = useState(false);
  const [promptPanelPinned, setPromptPanelPinned] = useState(false);
  const [promptSearch, setPromptSearch] = useState("");
  const [promptFilter, setPromptFilter] = useState<"all" | "favorites" | "templates">("all");
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashMenuIndex, setSlashMenuIndex] = useState(0);
  const [slashFilter, setSlashFilter] = useState("");
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // New feature state
  const [folders, setFolders] = useState<ChatFolder[]>([]);
  const [tags, setTags] = useState<ChatTag[]>([]);
  const [presets, setPresets] = useState<ChatPreset[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[6]);
  const [showNewTag, setShowNewTag] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"chats" | "folders">("chats");
  const [searchMode, setSearchMode] = useState<"title" | "fulltext">("title");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchingFullText, setSearchingFullText] = useState(false);
  const [adminContext, setAdminContext] = useState<string | null>(null);
  const [tagMenuConvId, setTagMenuConvId] = useState<string | null>(null);
  const [activeFilterTag, setActiveFilterTag] = useState<string | null>(null);
  const [messageRatings, setMessageRatings] = useState<Record<string, number>>({});
  const [compareMode, setCompareMode] = useState(false);
  const [compareModel, setCompareModel] = useState("");
  const [compareProvider, setCompareProvider] = useState("");
  const [compareMessages, setCompareMessages] = useState<ChatMsg[]>([]);
  const [compareLoading, setCompareLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const compareAbortRef = useRef<AbortController | null>(null);
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
      if (!file.type.startsWith("image/")) { toast.error(`${file.name} is not an image`); continue; }
      if (file.size > 20 * 1024 * 1024) { toast.error(`${file.name} is too large (max 20MB)`); continue; }
      try {
        const compressed = await compressImage(file);
        setPendingImages((prev) => [...prev, compressed]);
      } catch { toast.error(`Failed to process ${file.name}`); }
    }
    e.target.value = "";
  }

  function removePendingImage(index: number) {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Stream message to AI ──
  async function sendMessage(messagesToSend?: ChatMsg[], overrideContext?: string) {
    const input = chatInput.trim();
    if (!input && !messagesToSend && pendingImages.length === 0) return;
    if (isLoading) return;

    setDlpBlock(null);
    const userMsg: ChatMsg = {
      id: Date.now().toString(),
      role: "user",
      content: input || (pendingImages.length > 0 ? "What's in this image?" : ""),
      images: pendingImages.length > 0 ? [...pendingImages] : undefined,
    };
    const allMessages = messagesToSend || [...messages, userMsg];

    if (!messagesToSend) {
      setChatInput("");
      setPendingImages([]);
      if (inputRef.current) inputRef.current.style.height = "auto";
      setMessages(allMessages);
    }

    setIsLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const contextToSend = overrideContext || adminContext;

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
        }),
        signal: controller.signal,
      });

      // Clear admin context after sending
      if (contextToSend) setAdminContext(null);

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

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      const assistantId = (Date.now() + 1).toString();
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
    setCompareLoading(true);
    const controller = new AbortController();
    compareAbortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          model: compareModel,
          provider: compareProvider,
        }),
        signal: controller.signal,
      });

      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        setCompareLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      const assistantId = `compare-${Date.now()}`;
      setCompareMessages((prev) => [...prev, ...allMessages.filter(m => m.role === "user").slice(-1), { id: assistantId, role: "assistant", content: "" }]);

      if (reader) {
        try {
          let buffer = "";
          let prefixParsed = false;
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            let chunk = decoder.decode(value, { stream: true });

            if (!prefixParsed) {
              buffer += chunk;
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
        try {
          const res = await fetch("/api/chat/admin-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command }),
          });
          const data = await res.json();
          if (data.error) { toast.error(data.error); break; }
          // Set the context and auto-send
          const prompt = promptMap[command];
          setChatInput(prompt);
          setAdminContext(data.context);
          // Use setTimeout to let state update, then send
          setTimeout(() => {
            const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: prompt };
            const allMsgs = [...messages, userMsg];
            setMessages(allMsgs);
            setChatInput("");
            sendMessageDirect(allMsgs, data.context);
          }, 100);
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
      const assistantId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "", rating: 0 }]);
      let convIdParsed = false;

      if (reader) {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          let chunk = decoder.decode(value, { stream: true });
          if (!convIdParsed) {
            buffer += chunk;
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

  const loadProviders = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/providers");
      const data = await res.json();
      setProviders(data.providers || []);
      if (data.providers?.length > 0 && !selectedModel) {
        const first = data.providers[0];
        const models = first.model_whitelist.length > 0
          ? first.availableModels.filter((m: { id: string }) => first.model_whitelist.includes(m.id))
          : first.availableModels;
        if (models.length > 0) { setSelectedModel(models[0].id); setSelectedProvider(first.provider); }
      }
    } catch { /* non-critical */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFolders = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/folders");
      const data = await res.json();
      setFolders(data.folders || []);
    } catch { /* non-critical */ }
  }, []);

  const loadTags = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/tags");
      const data = await res.json();
      setTags(data.tags || []);
    } catch { /* non-critical */ }
  }, []);

  const loadPresets = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/presets");
      const data = await res.json();
      setPresets(data.presets || []);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => {
    loadConversations();
    loadProviders();
    loadFolders();
    loadTags();
    loadPresets();
  }, [loadConversations, loadProviders, loadFolders, loadTags, loadPresets]);

  // Close slash menu on click outside
  useEffect(() => {
    if (!slashMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (slashMenuRef.current && !slashMenuRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setSlashMenuOpen(false);
        setChatInput("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [slashMenuOpen]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { inputRef.current?.focus(); }, [activeConvId]);

  // ── Full-text search ──
  async function fullTextSearch(query: string) {
    if (query.length < 2) { setSearchResults([]); return; }
    setSearchingFullText(true);
    try {
      const res = await fetch(`/api/chat/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch { /* non-critical */ } finally { setSearchingFullText(false); }
  }

  // Debounced full-text search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  function handleSearchChange(value: string) {
    setSearchQuery(value);
    if (searchMode === "fulltext") {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => fullTextSearch(value), 400);
    }
  }

  // ── Conversation operations ──
  async function loadConversation(convId: string) {
    setActiveConvId(convId);
    setDlpBlock(null);
    setCompareMessages([]);
    try {
      const res = await fetch(`/api/chat/conversations/${convId}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages.map((m: { id: string; role: string; content: string; rating?: number }) => ({
          id: m.id, role: m.role, content: m.content, rating: m.rating || 0,
        })));
        // Load existing ratings
        const ratings: Record<string, number> = {};
        for (const m of data.messages) {
          if (m.rating) ratings[m.id] = m.rating;
        }
        setMessageRatings(ratings);
      }
      if (data.conversation) {
        setSelectedModel(data.conversation.model);
        setSelectedProvider(data.conversation.provider);
      }
    } catch { toast.error("Failed to load conversation"); }
  }

  function startNewChat() {
    setActiveConvId(null);
    setMessages([]);
    setDlpBlock(null);
    setChatInput("");
    setAdminContext(null);
    setCompareMessages([]);
    inputRef.current?.focus();
  }

  async function deleteConversation(convId: string) {
    try {
      await fetch("/api/chat/conversations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: convId }),
      });
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConvId === convId) startNewChat();
    } catch { toast.error("Failed to delete"); }
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

  function togglePin(convId: string) {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;
    const newPinned = !conv.pinned;
    setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, pinned: newPinned } : c));
    fetch(`/api/chat/conversations/${convId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: newPinned }),
    }).catch(() => {});
  }

  async function moveToFolder(convId: string, folderId: string | null) {
    setConversations((prev) => prev.map((c) => c.id === convId ? { ...c, folder_id: folderId } : c));
    try {
      await fetch(`/api/chat/conversations/${convId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_id: folderId }),
      });
    } catch { toast.error("Failed to move"); }
  }

  // ── Folder operations ──
  async function createFolder() {
    if (!newFolderName.trim()) return;
    try {
      const res = await fetch("/api/chat/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName.trim() }),
      });
      const data = await res.json();
      if (data.folder) setFolders((prev) => [...prev, data.folder]);
      setNewFolderName("");
      setShowNewFolder(false);
    } catch { toast.error("Failed to create folder"); }
  }

  async function deleteFolder(folderId: string) {
    try {
      await fetch("/api/chat/folders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: folderId }),
      });
      setFolders((prev) => prev.filter((f) => f.id !== folderId));
      setConversations((prev) => prev.map((c) => c.folder_id === folderId ? { ...c, folder_id: null } : c));
    } catch { toast.error("Failed to delete folder"); }
  }

  // ── Tag operations ──
  async function createTag() {
    if (!newTagName.trim()) return;
    try {
      const res = await fetch("/api/chat/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim(), color: newTagColor }),
      });
      const data = await res.json();
      if (data.tag) setTags((prev) => [...prev, data.tag]);
      setNewTagName("");
      setShowNewTag(false);
    } catch { toast.error("Failed to create tag"); }
  }

  async function toggleConvTag(convId: string, tagId: string) {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;
    const hasTag = conv.tag_ids?.includes(tagId);
    setConversations((prev) => prev.map((c) => {
      if (c.id !== convId) return c;
      const tagIds = c.tag_ids || [];
      return { ...c, tag_ids: hasTag ? tagIds.filter((t) => t !== tagId) : [...tagIds, tagId] };
    }));
    try {
      await fetch("/api/chat/tags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, tagId, action: hasTag ? "remove" : "add" }),
      });
    } catch { /* non-critical */ }
  }

  // ── Preset: start a new chat from preset ──
  function startPreset(preset: ChatPreset) {
    startNewChat();
    if (preset.model && preset.provider) {
      setSelectedModel(preset.model);
      setSelectedProvider(preset.provider);
    }
    if (preset.first_message) {
      setChatInput(preset.first_message);
    }
    // System prompt will be injected server-side via adminContext
    if (preset.system_prompt) {
      setAdminContext(preset.system_prompt);
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

  // ── Filter conversations ──
  const filteredConversations = conversations.filter((c) => {
    if (activeFilterTag && !c.tag_ids?.includes(activeFilterTag)) return false;
    if (searchQuery && searchMode === "title") {
      return c.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;

  const pinnedConvs = filteredConversations.filter((c) => c.pinned && !c.folder_id);
  const unfolderedConvs = filteredConversations.filter((c) => !c.pinned && !c.folder_id);
  const todayConvs = unfolderedConvs.filter((c) => new Date(c.updated_at).getTime() >= todayStart);
  const weekConvs = unfolderedConvs.filter((c) => {
    const t = new Date(c.updated_at).getTime();
    return t >= weekStart && t < todayStart;
  });
  const olderConvs = unfolderedConvs.filter((c) => new Date(c.updated_at).getTime() < weekStart);
  const lastIsAssistant = messages.length > 0 && messages[messages.length - 1].role === "assistant";

  // ── Render conversation item ──
  function renderConvItem(conv: Conversation) {
    const convTags = tags.filter((t) => conv.tag_ids?.includes(t.id));
    return (
      <div
        key={conv.id}
        className={cn(
          "group flex items-start gap-2 rounded-lg px-2.5 py-2 cursor-pointer transition-colors",
          activeConvId === conv.id ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        onClick={() => loadConversation(conv.id)}
      >
        <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
        {editingTitle === conv.id ? (
          <div className="flex-1 flex items-center gap-1 min-w-0">
            <input
              className="flex-1 bg-transparent text-xs border-b border-primary outline-none min-w-0"
              value={editTitleValue}
              onChange={(e) => setEditTitleValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") renameConversation(conv.id, editTitleValue); if (e.key === "Escape") setEditingTitle(null); }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <button onClick={(e) => { e.stopPropagation(); renameConversation(conv.id, editTitleValue); }}><Check className="h-3 w-3" /></button>
            <button onClick={(e) => { e.stopPropagation(); setEditingTitle(null); }}><X className="h-3 w-3" /></button>
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <span className="truncate text-xs block font-medium">{conv.title}</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-muted-foreground truncate">{conv.model?.split("-").slice(0, 2).join("-")}</span>
                {conv.folder_id && (() => {
                  const f = folders.find((f) => f.id === conv.folder_id);
                  return f ? (
                    <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 truncate">
                      <Folder className="h-2 w-2 flex-shrink-0" style={{ color: f.color }} />
                      {f.name}
                    </span>
                  ) : null;
                })()}
                {convTags.length > 0 && (
                  <div className="flex gap-0.5 flex-shrink-0">
                    {convTags.slice(0, 3).map((tag) => (
                      <span key={tag.id} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} title={tag.name} />
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Hover actions */}
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 flex items-center gap-0.5 mt-0.5">
              <button className="p-0.5 hover:text-amber-500" title={conv.pinned ? "Unpin" : "Pin"} onClick={(e) => { e.stopPropagation(); togglePin(conv.id); }}>
                <Pin className={cn("h-3 w-3", conv.pinned && "fill-amber-500 text-amber-500")} />
              </button>
              {(tags.length > 0 || folders.length > 0) && (
                <button className="p-0.5 hover:text-primary" title="Tags & Folders" onClick={(e) => { e.stopPropagation(); setTagMenuConvId(tagMenuConvId === conv.id ? null : conv.id); }}>
                  <Tag className="h-3 w-3" />
                </button>
              )}
              <button className="p-0.5 hover:text-foreground" title="Rename" onClick={(e) => { e.stopPropagation(); setEditingTitle(conv.id); setEditTitleValue(conv.title); }}>
                <Pencil className="h-3 w-3" />
              </button>
              <button className="p-0.5 hover:text-destructive" title="Delete" onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}>
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden -m-4 md:-m-6">
      {/* ─── Sidebar ─── */}
      <div className={cn(
        "border-r bg-muted/30 flex flex-col transition-all duration-200 min-w-0",
        sidebarOpen ? "w-80 flex-shrink-0" : "w-0 overflow-hidden"
      )}>
        <div className="p-3 space-y-2 border-b flex-shrink-0">
          <div className="flex gap-1.5">
            <Button variant="outline" className="flex-1 justify-start gap-2 text-sm" onClick={startNewChat}>
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 flex-shrink-0"
              title="New folder"
              onClick={() => { setShowNewFolder(true); setSidebarTab("folders"); }}
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchMode === "fulltext" ? "Search all messages..." : "Search chats..."}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-8 rounded-md border bg-background pl-8 pr-16 text-xs outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => { setSearchMode(searchMode === "title" ? "fulltext" : "title"); setSearchResults([]); setSearchQuery(""); }}
              className={cn(
                "absolute right-1.5 top-1/2 -translate-y-1/2 h-5 px-2 rounded text-[9px] font-medium transition-colors",
                searchMode === "fulltext" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title={searchMode === "fulltext" ? "Searching message content" : "Searching titles only"}
            >
              {searchMode === "fulltext" ? "Messages" : "Titles"}
            </button>
          </div>
        </div>

        {/* Tag filter chips */}
        {tags.length > 0 && (
          <div className="px-3 py-1.5 border-b flex gap-1 flex-wrap flex-shrink-0">
            {activeFilterTag && (
              <button
                className="h-5 px-1.5 rounded text-[9px] font-medium bg-muted text-muted-foreground hover:text-foreground"
                onClick={() => setActiveFilterTag(null)}
              >
                Clear
              </button>
            )}
            {tags.map((tag) => (
              <button
                key={tag.id}
                className={cn(
                  "h-5 px-1.5 rounded text-[9px] font-medium transition-colors flex items-center gap-1",
                  activeFilterTag === tag.id ? "ring-1 ring-primary bg-primary/5" : "hover:bg-muted"
                )}
                onClick={() => setActiveFilterTag(activeFilterTag === tag.id ? null : tag.id)}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                {tag.name}
              </button>
            ))}
          </div>
        )}

        {/* View toggle: Chats / Folders */}
        <div className="flex border-b flex-shrink-0">
          <button
            className={cn("flex-1 py-1.5 text-[10px] font-medium transition-colors", sidebarTab === "chats" ? "text-primary border-b-2 border-primary" : "text-muted-foreground")}
            onClick={() => setSidebarTab("chats")}
          >
            Chats
          </button>
          <button
            className={cn("flex-1 py-1.5 text-[10px] font-medium transition-colors", sidebarTab === "folders" ? "text-primary border-b-2 border-primary" : "text-muted-foreground")}
            onClick={() => setSidebarTab("folders")}
          >
            Folders{folders.length > 0 && ` (${folders.length})`}
          </button>
        </div>

        <ScrollArea className="flex-1">
          {/* Full-text search results */}
          {searchMode === "fulltext" && searchQuery.length >= 2 && (
            <div className="p-2 space-y-1">
              {searchingFullText && <p className="text-xs text-muted-foreground text-center py-4"><Loader2 className="h-3 w-3 animate-spin inline mr-1" />Searching...</p>}
              {!searchingFullText && searchResults.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No results</p>}
              {searchResults.map((r) => (
                <button
                  key={r.messageId}
                  className="w-full text-left rounded-lg px-2.5 py-2 hover:bg-muted transition-colors"
                  onClick={() => loadConversation(r.conversationId)}
                >
                  <p className="text-xs font-medium truncate">{r.conversationTitle}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{r.snippet}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{r.role} · {new Date(r.created_at).toLocaleDateString()}</p>
                </button>
              ))}
            </div>
          )}

          {/* Conversation list / folder view */}
          {(searchMode !== "fulltext" || searchQuery.length < 2) && (
            <div className="p-2 space-y-1">
              {/* ── Chats tab: time-grouped, unfiled conversations ── */}
              {sidebarTab === "chats" && (
                <>
                  {conversations.length === 0 && !loadingConvs && (
                    <p className="text-xs text-muted-foreground text-center py-8">No conversations yet</p>
                  )}
                  {pinnedConvs.length > 0 && (
                    <ConvSection label="Pinned" icon={<Pin className="h-2.5 w-2.5" />}>
                      {pinnedConvs.map(renderConvItem)}
                    </ConvSection>
                  )}
                  {/* Show folder groups inline if any conversations are in folders */}
                  {folders.map((folder) => {
                    const folderConvs = filteredConversations.filter((c) => c.folder_id === folder.id && !c.pinned);
                    if (folderConvs.length === 0) return null;
                    return (
                      <ConvSection
                        key={folder.id}
                        label={folder.name}
                        icon={<Folder className="h-2.5 w-2.5" style={{ color: folder.color }} />}
                        collapsible
                      >
                        {folderConvs.map(renderConvItem)}
                      </ConvSection>
                    );
                  })}
                  {todayConvs.length > 0 && <ConvSection label="Today">{todayConvs.map(renderConvItem)}</ConvSection>}
                  {weekConvs.length > 0 && <ConvSection label="This Week">{weekConvs.map(renderConvItem)}</ConvSection>}
                  {olderConvs.length > 0 && <ConvSection label="Older" collapsible>{olderConvs.map(renderConvItem)}</ConvSection>}
                </>
              )}

              {/* ── Folders tab: manage folders + see all by folder ── */}
              {sidebarTab === "folders" && (
                <>
                  {folders.length === 0 && !showNewFolder && (
                    <div className="text-center py-6">
                      <Folder className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground mb-2">Organize chats into folders</p>
                      <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => setShowNewFolder(true)}>
                        <FolderPlus className="h-3 w-3" />
                        Create folder
                      </Button>
                    </div>
                  )}

                  {folders.map((folder) => {
                    const folderConvs = filteredConversations.filter((c) => c.folder_id === folder.id);
                    return (
                      <ConvSection
                        key={folder.id}
                        label={`${folder.name} (${folderConvs.length})`}
                        icon={<FolderOpen className="h-2.5 w-2.5" style={{ color: folder.color }} />}
                        collapsible
                      >
                        {folderConvs.length === 0 && <p className="text-[10px] text-muted-foreground px-2.5 py-1">Empty — drag a chat here or use its menu</p>}
                        {folderConvs.map(renderConvItem)}
                        <button
                          className="w-full text-left text-[10px] text-destructive/60 hover:text-destructive px-2.5 py-1 transition-colors"
                          onClick={() => deleteFolder(folder.id)}
                        >
                          Delete folder
                        </button>
                      </ConvSection>
                    );
                  })}

                  {/* Unfiled */}
                  {filteredConversations.filter((c) => !c.folder_id).length > 0 && (
                    <ConvSection label="Unfiled" icon={<MessageSquare className="h-2.5 w-2.5" />} collapsible>
                      {filteredConversations.filter((c) => !c.folder_id).map(renderConvItem)}
                    </ConvSection>
                  )}

                  {/* New folder inline form */}
                  {showNewFolder ? (
                    <div className="px-2.5 py-2 flex gap-1.5">
                      <input
                        className="flex-1 h-7 rounded-md border bg-background px-2.5 text-xs outline-none focus:ring-1 focus:ring-primary min-w-0"
                        placeholder="Folder name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") createFolder(); if (e.key === "Escape") setShowNewFolder(false); }}
                        autoFocus
                      />
                      <button className="text-primary hover:text-primary/80" onClick={createFolder}><Check className="h-4 w-4" /></button>
                      <button className="text-muted-foreground hover:text-foreground" onClick={() => setShowNewFolder(false)}><X className="h-4 w-4" /></button>
                    </div>
                  ) : folders.length > 0 && (
                    <button
                      className="flex items-center gap-1.5 px-2.5 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
                      onClick={() => setShowNewFolder(true)}
                    >
                      <FolderPlus className="h-3.5 w-3.5" />
                      New folder
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Bottom bar: new tag + folder actions */}
        <div className="border-t p-2 flex-shrink-0">
          {showNewTag ? (
            <div className="flex gap-1.5 items-center">
              <input
                className="flex-1 h-7 rounded-md border bg-background px-2.5 text-xs outline-none focus:ring-1 focus:ring-primary min-w-0"
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") createTag(); if (e.key === "Escape") setShowNewTag(false); }}
                autoFocus
              />
              <div className="flex gap-0.5 flex-shrink-0">
                {TAG_COLORS.slice(0, 5).map((c) => (
                  <button
                    key={c}
                    className={cn("h-4 w-4 rounded-full border", newTagColor === c && "ring-1 ring-offset-1 ring-primary")}
                    style={{ backgroundColor: c }}
                    onClick={() => setNewTagColor(c)}
                  />
                ))}
              </div>
              <button className="text-primary hover:text-primary/80 flex-shrink-0" onClick={createTag}><Check className="h-4 w-4" /></button>
              <button className="text-muted-foreground hover:text-foreground flex-shrink-0" onClick={() => setShowNewTag(false)}><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <button
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowNewTag(true)}
            >
              <Tag className="h-3 w-3" />
              New tag
            </button>
          )}
        </div>
      </div>

      {/* Tag/folder context menu — rendered outside sidebar to avoid clipping */}
      {tagMenuConvId && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setTagMenuConvId(null)} />
          <div className="fixed z-50 bg-popover border rounded-lg shadow-xl p-2 min-w-[180px] max-w-[220px]" style={{ left: sidebarOpen ? "332px" : "12px", top: "160px" }} onClick={(e) => e.stopPropagation()}>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">Tags</p>
            {tags.length === 0 && <p className="text-[10px] text-muted-foreground px-1 mb-1">No tags yet — create one below</p>}
            {tags.map((tag) => {
              const conv = conversations.find((c) => c.id === tagMenuConvId);
              return (
                <button
                  key={tag.id}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded hover:bg-muted transition-colors"
                  onClick={() => toggleConvTag(tagMenuConvId, tag.id)}
                >
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                  <span className="flex-1 text-left truncate">{tag.name}</span>
                  {conv?.tag_ids?.includes(tag.id) && <Check className="h-3 w-3 text-primary flex-shrink-0" />}
                </button>
              );
            })}

            {folders.length > 0 && (
              <>
                <div className="border-t my-1.5" />
                <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">Move to folder</p>
                <button
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded hover:bg-muted"
                  onClick={() => { moveToFolder(tagMenuConvId, null); setTagMenuConvId(null); }}
                >
                  <X className="h-2.5 w-2.5 flex-shrink-0" />
                  <span>No folder</span>
                </button>
                {folders.map((f) => {
                  const conv = conversations.find((c) => c.id === tagMenuConvId);
                  return (
                    <button
                      key={f.id}
                      className="flex items-center gap-2 w-full px-2 py-1.5 text-xs rounded hover:bg-muted"
                      onClick={() => { moveToFolder(tagMenuConvId, f.id); setTagMenuConvId(null); }}
                    >
                      <Folder className="h-2.5 w-2.5 flex-shrink-0" style={{ color: f.color }} />
                      <span className="truncate">{f.name}</span>
                      {conv?.folder_id === f.id && <Check className="h-3 w-3 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </>
      )}

      {/* ─── Main chat area ─── */}
      <div className={cn("flex-1 flex min-w-0", compareMode ? "flex-row" : "flex-col")}>
        {compareMode ? (
          // ── Compare mode: side-by-side ──
          <>
            {/* Left panel — primary model */}
            <div className="flex-1 flex flex-col min-w-0 border-r">
              <div className="flex items-center gap-2 px-4 py-2 border-b bg-background flex-shrink-0">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSidebarOpen(!sidebarOpen)}>
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
                  {messages.map((message) => renderMessage(message))}
                  {isLoading && messages[messages.length - 1]?.role === "user" && renderLoadingDots()}
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
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-2 border-b bg-background flex-shrink-0">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <ChevronLeft className={cn("h-4 w-4 transition-transform", !sidebarOpen && "rotate-180")} />
              </Button>

              {availableModels.length > 0 && (
                <Select
                  value={`${selectedProvider}:${selectedModel}`}
                  onValueChange={(val) => {
                    const [prov, ...rest] = val.split(":");
                    setSelectedProvider(prov);
                    setSelectedModel(rest.join(":"));
                  }}
                >
                  <SelectTrigger className="w-[240px] h-8 text-xs">
                    <SelectValue placeholder="Select model" />
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

              <div className="flex-1" />

              <div className="flex items-center gap-2">
                {systemPrompt && (
                  <span className="flex items-center gap-1 rounded-full border border-violet-200 dark:border-violet-800/50 bg-violet-50/80 dark:bg-violet-950/30 px-2.5 py-1 text-[10px] font-medium text-violet-700 dark:text-violet-400" title={`System prompt: ${systemPrompt.slice(0, 100)}...`}>
                    <Sparkles className="h-2.5 w-2.5" />
                    System Prompt
                  </span>
                )}
                <Link href="/guardrails" className="flex items-center gap-1.5 rounded-full border border-green-200 dark:border-green-800/50 bg-green-50/80 dark:bg-green-950/30 px-2.5 py-1 hover:bg-green-100/80 dark:hover:bg-green-950/50 transition-colors">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-medium text-green-700 dark:text-green-400">DLP Protected</span>
                </Link>
                <Link href="/vault" className="hidden sm:flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                  <MessageSquare className="h-3 w-3" />
                  Prompt Library
                </Link>
                <Link href="/settings/ai-providers">
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 text-muted-foreground px-2">
                    <Settings className="h-3 w-3" />
                    <span className="hidden sm:inline">Providers</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Admin notice */}
            {isAdmin && !chatEnabledForMembers && (
              <div className="mx-4 mt-2 rounded-lg border border-blue-200 dark:border-blue-800/50 bg-blue-50/80 dark:bg-blue-950/30 px-3 py-2 flex items-center gap-2 text-xs">
                <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-blue-800 dark:text-blue-300">
                  Only admins can see AI Chat right now.{" "}
                  <Link href="/settings/security" className="font-medium underline underline-offset-2 hover:text-blue-900 dark:hover:text-blue-200">
                    Enable for all members
                  </Link>{" "}
                  in Settings &rarr; Security when you&apos;re ready.
                </span>
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
                <ScrollArea className="flex-1">
                  <div className="max-w-3xl mx-auto px-4 py-6">
                    {messages.length === 0 && !isLoading && (
                      <div className="text-center py-12">
                        <Bot className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-muted-foreground">TeamPrompt Chat</h2>
                        <p className="text-sm text-muted-foreground mt-1 mb-6">
                          Your messages are scanned by DLP rules before reaching the AI.
                        </p>

                        {/* Presets */}
                        {presets.length > 0 && (
                          <div className="mb-6">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Quick Start</p>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                              {presets.slice(0, 6).map((preset) => (
                                <button
                                  key={preset.id}
                                  className="flex items-center gap-2 border rounded-lg px-3 py-2 text-left hover:border-primary/50 hover:bg-muted/50 transition-colors max-w-[200px]"
                                  onClick={() => startPreset(preset)}
                                >
                                  <div className="h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${preset.color || "#6366f1"}20` }}>
                                    <Sparkles className="h-3.5 w-3.5" style={{ color: preset.color || "#6366f1" }} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-medium truncate">{preset.name}</p>
                                    {preset.description && <p className="text-[10px] text-muted-foreground truncate">{preset.description}</p>}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Suggestions */}
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          {[
                            "Write a project status update",
                            "Review this code for bugs",
                            "Draft a customer email",
                            "Explain this error message",
                          ].map((suggestion) => (
                            <button
                              key={suggestion}
                              className="text-xs border rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                              onClick={() => { setChatInput(suggestion); inputRef.current?.focus(); }}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {messages.map((message, idx) => renderMessage(message, idx))}

                    {isLoading && messages[messages.length - 1]?.role === "user" && renderLoadingDots()}

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

                {/* Input area */}
                <div className="border-t bg-background px-4 py-3 flex-shrink-0">
                  <div className="max-w-3xl mx-auto flex items-center gap-1.5 mb-2">
                    <button
                      type="button"
                      onClick={() => setPromptPanelOpen(!promptPanelOpen)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors",
                        promptPanelOpen ? "bg-primary/10 border-primary/30 text-primary" : "text-muted-foreground hover:text-foreground hover:border-primary/30"
                      )}
                    >
                      <Library className="h-3 w-3" />Prompts
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange("/")}
                      className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                    >
                      <Slash className="h-3 w-3" />Commands
                    </button>
                    {availableModels.length > 1 && (
                      <button
                        type="button"
                        onClick={() => executeSlashCommand("/compare")}
                        className={cn(
                          "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors",
                          compareMode ? "bg-primary/10 border-primary/30 text-primary" : "text-muted-foreground hover:text-foreground hover:border-primary/30"
                        )}
                      >
                        <Columns2 className="h-3 w-3" />Compare
                      </button>
                    )}
                  </div>

                  {pendingImages.length > 0 && (
                    <div className="max-w-3xl mx-auto flex gap-2 mb-2 flex-wrap">
                      {pendingImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt={`Upload ${idx + 1}`} className="h-16 w-16 rounded-lg object-cover border" />
                          <button
                            type="button"
                            onClick={() => removePendingImage(idx)}
                            className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="max-w-3xl mx-auto flex items-end gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
                    <Button
                      type="button" variant="ghost" size="icon"
                      className="h-[44px] w-[44px] rounded-xl flex-shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading || noProviders} title="Attach image"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
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
                      placeholder="Type / for commands, or send a message..."
                      className="min-h-[44px] max-h-[200px] resize-none text-sm rounded-xl overflow-y-auto"
                      rows={1}
                      disabled={isLoading || noProviders}
                    />
                    <Button type="submit" size="icon" className="h-[44px] w-[44px] rounded-xl flex-shrink-0" disabled={!chatInput.trim() || isLoading || noProviders}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                  <p className="text-center text-[10px] text-muted-foreground mt-2 max-w-3xl mx-auto">
                    Messages are scanned by your workspace&apos;s DLP rules before reaching the AI provider. Your API key, your data.
                  </p>
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
              <Button type="submit" size="icon" className="h-[44px] w-[44px] rounded-xl flex-shrink-0" disabled={!chatInput.trim() || isLoading || noProviders}>
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
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setPromptPanelOpen(false); setPromptPanelPinned(false); }}>
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
    </div>
  );

  // ── Helper render functions ──

  function renderMessage(message: ChatMsg, idx?: number) {
    const rating = messageRatings[message.id] || 0;
    return (
      <div
        key={message.id}
        className={cn("group flex gap-3 mb-6", message.role === "user" ? "justify-end" : "")}
      >
        {message.role === "assistant" && (
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
            <Bot className="h-4 w-4 text-primary" />
          </div>
        )}
        <div className="max-w-[85%] min-w-0">
          <div className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            {message.images && message.images.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {message.images.map((img, imgIdx) => (
                  <img key={imgIdx} src={img} alt={`Attachment ${imgIdx + 1}`} className="max-h-48 rounded-lg object-contain" />
                ))}
              </div>
            )}
            {message.role === "assistant" ? (
              <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_pre]:bg-zinc-900 [&_pre]:text-zinc-100 [&_pre]:rounded-lg [&_pre]:p-3 [&_pre]:text-xs [&_pre]:overflow-x-auto [&_code]:text-xs [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre_code]:bg-transparent [&_pre_code]:p-0">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
          </div>
          {/* Message actions */}
          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Copy" onClick={() => copyMessage(message.content, message.id)}>
              {copiedId === message.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            </button>
            {message.role === "assistant" && idx !== undefined && idx === messages.length - 1 && !isLoading && (
              <button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Regenerate" onClick={regenerateLastResponse}>
                <RefreshCw className="h-3 w-3" />
              </button>
            )}
            {/* Rating buttons for assistant messages */}
            {message.role === "assistant" && (
              <>
                <button
                  className={cn("p-1 rounded transition-colors", rating === 1 ? "text-green-500 bg-green-500/10" : "text-muted-foreground hover:text-green-500 hover:bg-muted")}
                  title="Good response"
                  onClick={() => rateMessage(message.id, 1)}
                >
                  <ThumbsUp className="h-3 w-3" />
                </button>
                <button
                  className={cn("p-1 rounded transition-colors", rating === -1 ? "text-red-500 bg-red-500/10" : "text-muted-foreground hover:text-red-500 hover:bg-muted")}
                  title="Bad response"
                  onClick={() => rateMessage(message.id, -1)}
                >
                  <ThumbsDown className="h-3 w-3" />
                </button>
              </>
            )}
          </div>
        </div>
        {message.role === "user" && (
          <Avatar className="h-7 w-7 flex-shrink-0 mt-1">
            {currentMember?.avatar_url && <AvatarImage src={currentMember.avatar_url} alt={currentMember?.name || "You"} />}
            <AvatarFallback className="bg-foreground/10 text-foreground/70 text-xs font-semibold">{userInitial}</AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  }

  function renderLoadingDots() {
    return (
      <div className="flex gap-3 mb-6">
        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div className="bg-muted rounded-2xl px-4 py-3">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }
}
