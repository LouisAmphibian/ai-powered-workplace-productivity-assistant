export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

export type ChatThread = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
};

const KEY = "ws_threads_v1";

export function loadThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveThreads(threads: ChatThread[]) {
  localStorage.setItem(KEY, JSON.stringify(threads));
  window.dispatchEvent(new Event("ws-threads-changed"));
}

export function getThread(id: string): ChatThread | undefined {
  return loadThreads().find((t) => t.id === id);
}

export function upsertThread(thread: ChatThread) {
  const list = loadThreads().filter((t) => t.id !== thread.id);
  list.unshift(thread);
  saveThreads(list);
}

export function deleteThread(id: string) {
  saveThreads(loadThreads().filter((t) => t.id !== id));
}

export function newThreadId() {
  return crypto.randomUUID();
}
