// Simple localStorage-based activity + favorites tracker.
export type HistoryKind = "email" | "meeting" | "planner" | "research" | "chat";

export type HistoryItem = {
  id: string;
  kind: HistoryKind;
  title: string;
  createdAt: number;
  favorite?: boolean;
  data?: unknown;
};

const KEY = "ws_history_v1";

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, 200)));
}

export function pushHistory(item: Omit<HistoryItem, "id" | "createdAt">) {
  const list = loadHistory();
  list.unshift({ ...item, id: crypto.randomUUID(), createdAt: Date.now() });
  saveHistory(list);
  window.dispatchEvent(new Event("ws-history-changed"));
}

export function toggleFavorite(id: string) {
  const list = loadHistory().map((h) => (h.id === id ? { ...h, favorite: !h.favorite } : h));
  saveHistory(list);
  window.dispatchEvent(new Event("ws-history-changed"));
}

export function removeHistory(id: string) {
  saveHistory(loadHistory().filter((h) => h.id !== id));
  window.dispatchEvent(new Event("ws-history-changed"));
}
