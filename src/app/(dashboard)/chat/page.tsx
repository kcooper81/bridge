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
  User,
  Pencil,
  Check,
  X,
  ChevronLeft,
  Settings,
  Copy,
  RefreshCw,
  Square,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { useOrg } from "@/components/providers/org-provider";

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

interface ChatMsg {
  id: string;
  role: string;
  content: string;
}

export default function ChatPage() {
  const { currentUserRole, org } = useOrg();
  const isAdmin = currentUserRole === "admin";
  const orgSettings = (org?.settings || {}) as Record<string, unknown>;
  const chatEnabledForMembers = orgSettings.ai_chat_enabled === true;

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Available models from configured providers
  const availableModels = providers
    .filter((p) => p.is_active)
    .flatMap((p) => {
      const models = p.model_whitelist.length > 0
        ? p.availableModels.filter((m) => p.model_whitelist.includes(m.id))
        : p.availableModels;
      return models.map((m) => ({ provider: p.provider, providerLabel: p.label, model: m.id, modelLabel: m.label }));
    });

  // Stream a message to the AI
  async function sendMessage(messagesToSend?: ChatMsg[]) {
    const input = chatInput.trim();
    if (!input && !messagesToSend) return;
    if (isLoading) return;

    setDlpBlock(null);
    const userMsg: ChatMsg = { id: Date.now().toString(), role: "user", content: input };
    const allMessages = messagesToSend || [...messages, userMsg];

    if (!messagesToSend) {
      setChatInput("");
      setMessages(allMessages);
    }

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
        }),
        signal: controller.signal,
      });

      // Check for DLP block or error
      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const data = await res.json();
        if (data.blocked) {
          setDlpBlock(data.violations || []);
          if (!messagesToSend) setMessages((prev) => prev.slice(0, -1));
          setIsLoading(false);
          return;
        }
        if (data.error) {
          toast.error(data.error);
          setIsLoading(false);
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
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            setMessages((prev) =>
              prev.map((m) => m.id === assistantId ? { ...m, content: m.content + chunk } : m)
            );
          }
        } catch (err) {
          if ((err as Error).name === "AbortError") {
            // User stopped generation — keep partial response
          } else {
            throw err;
          }
        }
      }

      // Refresh conversation list to show updated title
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

  // Stop generation
  function stopGeneration() {
    abortControllerRef.current?.abort();
  }

  // Regenerate last assistant response
  function regenerateLastResponse() {
    // Remove last assistant message and resend
    const lastAssistantIdx = [...messages].reverse().findIndex((m) => m.role === "assistant");
    if (lastAssistantIdx === -1) return;
    const idx = messages.length - 1 - lastAssistantIdx;
    const messagesWithoutLast = messages.slice(0, idx);
    setMessages(messagesWithoutLast);
    sendMessage(messagesWithoutLast);
  }

  // Copy message content
  function copyMessage(content: string, id: string) {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        setMessages(data.messages.map((m: { id: string; role: string; content: string }) => ({
          id: m.id, role: m.role, content: m.content,
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
    setMessages([]);
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

  // Filter conversations by search
  const filteredConversations = searchQuery
    ? conversations.filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : conversations;

  // Check if last message is from assistant (for regenerate button)
  const lastIsAssistant = messages.length > 0 && messages[messages.length - 1].role === "assistant";

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden -m-4 md:-m-6">
      {/* Sidebar */}
      <div className={cn(
        "border-r bg-muted/30 flex flex-col transition-all duration-200",
        sidebarOpen ? "w-64" : "w-0 overflow-hidden"
      )}>
        <div className="p-3 space-y-2 border-b">
          <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={startNewChat}>
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
          {conversations.length > 5 && (
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-7 rounded-md border bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-primary"
            />
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {filteredConversations.map((conv) => (
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
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
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

          {/* Status indicators */}
          <div className="flex items-center gap-2">
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

        {/* Admin notice — chat not enabled for members */}
        {isAdmin && !chatEnabledForMembers && (
          <div className="mx-4 mt-2 rounded-lg border border-blue-200 dark:border-blue-800/50 bg-blue-50/80 dark:bg-blue-950/30 px-3 py-2 flex items-center gap-2 text-xs">
            <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-blue-800 dark:text-blue-300">
              Only admins can see AI Chat right now.{" "}
              <Link href="/settings/security" className="font-medium underline underline-offset-2 hover:text-blue-900 dark:hover:text-blue-200">
                Enable for all members
              </Link>{" "}
              in Settings → Security when you&apos;re ready.
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
                    <p className="text-sm text-muted-foreground mt-1 mb-6">
                      Your messages are scanned by DLP rules before reaching the AI.
                    </p>
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

                {messages.map((message, idx) => (
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
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}>
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
                        <button
                          className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy"
                          onClick={() => copyMessage(message.content, message.id)}
                        >
                          {copiedId === message.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                        {message.role === "assistant" && idx === messages.length - 1 && !isLoading && (
                          <button
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Regenerate"
                            onClick={regenerateLastResponse}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </button>
                        )}
                      </div>
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
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Stop / Regenerate bar */}
            {(isLoading || lastIsAssistant) && (
              <div className="flex items-center justify-center py-2">
                {isLoading ? (
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 rounded-full" onClick={stopGeneration}>
                    <Square className="h-3 w-3" />
                    Stop generating
                  </Button>
                ) : lastIsAssistant ? (
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 rounded-full" onClick={regenerateLastResponse}>
                    <RefreshCw className="h-3 w-3" />
                    Regenerate response
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
                  placeholder="Send a message... (Shift+Enter for new line)"
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
                Messages are scanned by your workspace&apos;s DLP rules before reaching the AI provider. Your API key, your data.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
