"use client";

import { useState, useEffect, useCallback, useRef } from "react";
// Chat uses direct fetch + streaming (not useChat hook — AI SDK v6 changed the API)
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
  User,
  Pencil,
  Check,
  X,
  ChevronLeft,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface Conversation {
  id: string;
  title: string;
  model: string;
  provider: string;
  updated_at: string;
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export default function ChatPage() {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Available models from configured providers
  const availableModels = providers
    .filter((p) => p.is_active)
    .flatMap((p) => {
      const models = p.model_whitelist.length > 0
        ? p.availableModels.filter((m) => p.model_whitelist.includes(m.id))
        : p.availableModels;
      return models.map((m) => ({ provider: p.provider, providerLabel: p.label, model: m.id, modelLabel: m.label }));
    });

  const [chatMessages, setChatMessages] = useState<Array<{ id: string; role: string; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Simple streaming chat implementation
  async function sendMessage() {
    if (!chatInput.trim() || chatLoading) return;
    const userMessage = chatInput.trim();
    setChatInput("");
    setDlpBlock(null);

    const newMessages = [...chatMessages, { id: Date.now().toString(), role: "user", content: userMessage }];
    setChatMessages(newMessages);
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          model: selectedModel,
          provider: selectedProvider,
          conversationId: activeConvId,
        }),
      });

      // Check for DLP block
      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const data = await res.json();
        if (data.blocked) {
          setDlpBlock(data.violations || []);
          setChatMessages((prev) => prev.slice(0, -1));
          setChatLoading(false);
          return;
        }
        if (data.error) {
          toast.error(data.error);
          setChatLoading(false);
          return;
        }
      }

      // Get conversation ID
      const convId = res.headers.get("x-conversation-id");
      if (convId && !activeConvId) {
        setActiveConvId(convId);
        loadConversations();
      }

      // Stream the response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      const assistantId = (Date.now() + 1).toString();
      setChatMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setChatMessages((prev) =>
            prev.map((m) => m.id === assistantId ? { ...m, content: m.content + chunk } : m)
          );
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setChatLoading(false);
    }
  }

  const messages = chatMessages;
  const isLoading = chatLoading;

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/conversations");
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch { /* non-critical */ } finally {
      setLoadingConvs(false);
    }
  }, []);

  const loadProviders = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/providers");
      const data = await res.json();
      setProviders(data.providers || []);
      // Set default model
      if (data.providers?.length > 0 && !selectedModel) {
        const first = data.providers[0];
        const models = first.model_whitelist.length > 0
          ? first.availableModels.filter((m: { id: string }) => first.model_whitelist.includes(m.id))
          : first.availableModels;
        if (models.length > 0) {
          setSelectedModel(models[0].id);
          setSelectedProvider(first.provider);
        }
      }
    } catch { /* non-critical */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadConversations();
    loadProviders();
  }, [loadConversations, loadProviders]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on load and conversation switch
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeConvId]);

  async function loadConversation(convId: string) {
    setActiveConvId(convId);
    setDlpBlock(null);
    try {
      const res = await fetch(`/api/chat/conversations/${convId}`);
      const data = await res.json();
      if (data.messages) {
        setChatMessages(data.messages.map((m: { id: string; role: string; content: string }) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
        })));
      }
      if (data.conversation) {
        setSelectedModel(data.conversation.model);
        setSelectedProvider(data.conversation.provider);
      }
    } catch {
      toast.error("Failed to load conversation");
    }
  }

  function startNewChat() {
    setActiveConvId(null);
    setChatMessages([]);
    setDlpBlock(null);
    setChatInput("");
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
    } catch {
      toast.error("Failed to delete");
    }
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
    } catch {
      toast.error("Failed to rename");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const noProviders = providers.length === 0 && !loadingConvs;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden -m-4 md:-m-6">
      {/* Sidebar */}
      <div className={cn(
        "border-r bg-muted/30 flex flex-col transition-all duration-200",
        sidebarOpen ? "w-64" : "w-0 overflow-hidden"
      )}>
        {/* New chat button */}
        <div className="p-3 border-b">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-sm"
            onClick={startNewChat}
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Conversation list */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors",
                  activeConvId === conv.id
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => loadConversation(conv.id)}
              >
                <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                {editingTitle === conv.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      className="flex-1 bg-transparent text-xs border-b border-primary outline-none"
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
                    <span className="flex-1 truncate text-xs">{conv.title}</span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100">{timeAgo(conv.updated_at)}</span>
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
                      <button
                        className="p-0.5 hover:text-foreground"
                        onClick={(e) => { e.stopPropagation(); setEditingTitle(conv.id); setEditTitleValue(conv.title); }}
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        className="p-0.5 hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {conversations.length === 0 && !loadingConvs && (
              <p className="text-xs text-muted-foreground text-center py-8">No conversations yet</p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2 border-b bg-background flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", !sidebarOpen && "rotate-180")} />
          </Button>

          {availableModels.length > 0 && (
            <Select
              value={`${selectedProvider}:${selectedModel}`}
              onValueChange={(val) => {
                const [prov, mod] = val.split(":");
                setSelectedProvider(prov);
                setSelectedModel(mod);
              }}
            >
              <SelectTrigger className="w-[220px] h-8 text-xs">
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

          <Link href="/settings/integrations">
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground">
              <Settings className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">AI Providers</span>
            </Button>
          </Link>
        </div>

        {/* No providers setup */}
        {noProviders ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Set up an AI Provider</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Add your OpenAI, Anthropic, or Google API key to start chatting. Your messages are protected by your workspace&apos;s DLP rules.
              </p>
              <Link href="/settings/integrations">
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure AI Providers
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1">
              <div className="max-w-3xl mx-auto px-4 py-6">
                {messages.length === 0 && !isLoading && (
                  <div className="text-center py-20">
                    <Bot className="h-10 w-10 text-muted-foreground/40 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-muted-foreground">TeamPrompt Chat</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Send a message to start. DLP scanning is active.
                    </p>
                  </div>
                )}

                {messages.map((message: { id: string; role: string; content: string }) => (
                  <div
                    key={message.id}
                    className={cn("flex gap-3 mb-6", message.role === "user" ? "justify-end" : "")}
                  >
                    {message.role === "assistant" && (
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className={cn(
                      "rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}>
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="h-7 w-7 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="h-4 w-4 text-foreground/70" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3 mb-6">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* DLP Block Banner */}
            {dlpBlock && (
              <div className="mx-4 mb-2 rounded-lg border border-red-200 dark:border-red-800/50 bg-red-50/80 dark:bg-red-950/30 p-3 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-red-800 dark:text-red-300">Message blocked by DLP</p>
                  <ul className="mt-1 space-y-0.5">
                    {dlpBlock.map((v, i) => (
                      <li key={i} className="text-[11px] text-red-700 dark:text-red-400 flex items-center gap-1">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        {v.ruleName} ({v.category})
                      </li>
                    ))}
                  </ul>
                </div>
                <button onClick={() => setDlpBlock(null)} className="text-red-400 hover:text-red-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Input area */}
            <div className="border-t bg-background px-4 py-3 flex-shrink-0">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="max-w-3xl mx-auto flex items-end gap-2"
              >
                <Textarea
                  ref={inputRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Send a message..."
                  className="min-h-[44px] max-h-[200px] resize-none text-sm rounded-xl"
                  rows={1}
                  disabled={isLoading || noProviders}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-[44px] w-[44px] rounded-xl flex-shrink-0"
                  disabled={!chatInput.trim() || isLoading || noProviders}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              <p className="text-center text-[10px] text-muted-foreground mt-2 max-w-3xl mx-auto">
                Protected by your workspace&apos;s DLP rules. Messages are scanned before reaching the AI provider.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
