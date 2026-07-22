import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus, Send, MessageSquare, Trash2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  loadThreads,
  saveThreads,
  newThreadId,
  type ChatThread,
  type ChatMessage,
} from "@/lib/threads";
import { chatFn } from "@/lib/ai.functions";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { ResponsibleBanner } from "./ResponsibleBanner";

const SUGGESTIONS = [
  "Draft a status update for my leadership team",
  "Summarize this quarter's OKRs into 5 bullets",
  "Help me prepare for a difficult 1:1",
  "Turn this idea into a project brief",
];

export function WorkChatbot({ threadId }: { threadId: string }) {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const load = () => setThreads(loadThreads());
    load();
    window.addEventListener("ws-threads-changed", load);
    return () => window.removeEventListener("ws-threads-changed", load);
  }, []);

  const thread = useMemo(
    () => threads.find((t) => t.id === threadId) ?? null,
    [threads, threadId],
  );

  useEffect(() => {
    // Ensure a thread record exists for this route
    if (!thread) {
      const t: ChatThread = { id: threadId, title: "New chat", messages: [], updatedAt: Date.now() };
      const next = [t, ...loadThreads()];
      saveThreads(next);
      setThreads(next);
    }
  }, [thread, threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);

  const persist = (updater: (t: ChatThread) => ChatThread) => {
    const list = loadThreads();
    const idx = list.findIndex((x) => x.id === threadId);
    const base: ChatThread =
      idx >= 0 ? list[idx] : { id: threadId, title: "New chat", messages: [], updatedAt: Date.now() };
    const next = updater(base);
    const rest = list.filter((x) => x.id !== threadId);
    saveThreads([next, ...rest]);
    setThreads([next, ...rest]);
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    setInput("");
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: Date.now(),
    };
    persist((t) => ({
      ...t,
      title: t.messages.length === 0 ? content.slice(0, 40) : t.title,
      messages: [...t.messages, userMsg],
      updatedAt: Date.now(),
    }));
    setLoading(true);
    try {
      const current = loadThreads().find((x) => x.id === threadId);
      const history = (current?.messages ?? []).map((m) => ({ role: m.role, content: m.content }));
      const { content: reply } = await chatFn({ data: { messages: history } });
      const asstMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        createdAt: Date.now(),
      };
      persist((t) => ({ ...t, messages: [...t.messages, asstMsg], updatedAt: Date.now() }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const newThread = () => {
    const id = newThreadId();
    navigate({ to: "/app/chat/$threadId", params: { threadId: id } as never });
  };

  const removeThread = (id: string) => {
    const remaining = loadThreads().filter((t) => t.id !== id);
    saveThreads(remaining);
    setThreads(remaining);
    if (id === threadId) {
      if (remaining[0]) navigate({ to: "/app/chat/$threadId", params: { threadId: remaining[0].id } as never });
      else navigate({ to: "/app/chat" });
    }
  };

  const filtered = threads.filter((t) =>
    (t.title + " " + t.messages.map((m) => m.content).join(" "))
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card className="flex h-[70vh] flex-col p-3">
        <div className="mb-2 flex items-center gap-2">
          <Button size="sm" onClick={newThread} className="flex-1">
            <Plus className="mr-2 h-4 w-4" /> New chat
          </Button>
        </div>
        <Input
          placeholder="Search threads…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-2"
        />
        <ScrollArea className="flex-1">
          <ul className="space-y-1">
            {filtered.map((t) => (
              <li key={t.id} className="group flex items-center gap-1">
                <button
                  onClick={() => navigate({ to: "/app/chat/$threadId", params: { threadId: t.id } as never })}
                  className={`flex-1 truncate rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent ${t.id === threadId ? "bg-accent font-medium" : ""}`}
                >
                  <MessageSquare className="mr-2 inline h-3.5 w-3.5" />
                  {t.title || "New chat"}
                </button>
                <button
                  aria-label="Delete thread"
                  onClick={() => removeThread(t.id)}
                  className="rounded p-1 opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="p-2 text-xs text-muted-foreground">No threads.</li>
            )}
          </ul>
        </ScrollArea>
      </Card>

      <Card className="flex h-[70vh] flex-col">
        <div className="border-b p-3">
          <ResponsibleBanner position="top" />
        </div>
        <ScrollArea className="flex-1 px-4 py-3">
          {!thread || thread.messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center gap-4 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold">How can I help you today?</h2>
              <p className="text-sm text-muted-foreground">
                Ask about drafting, planning, summarizing, or explaining anything for work.
              </p>
              <div className="grid w-full gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-md border p-3 text-left text-sm hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {thread.messages.map((m) => (
                <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex"}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex">
                  <div className="max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>
        <div className="border-t p-3">
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask WorkSpace AI…"
              rows={2}
              className="resize-none"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
