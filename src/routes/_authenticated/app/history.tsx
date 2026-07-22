import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/workspace/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, StarOff, Trash2, Mail, FileText, CalendarClock, BookOpen, MessageSquare } from "lucide-react";
import { loadHistory, removeHistory, toggleFavorite, type HistoryItem } from "@/lib/history";

export const Route = createFileRoute("/_authenticated/app/history")({
  head: () => ({
    meta: [
      { title: "History — WorkSpace AI" },
      { name: "description", content: "Search and revisit your WorkSpace AI outputs." },
      { property: "og:title", content: "History — WorkSpace AI" },
      { property: "og:description", content: "Search and revisit your WorkSpace AI outputs." },
    ],
  }),
  component: HistoryPage,
});

const ICONS: Record<HistoryItem["kind"], typeof Mail> = {
  email: Mail,
  meeting: FileText,
  planner: CalendarClock,
  research: BookOpen,
  chat: MessageSquare,
};
const HREF: Record<HistoryItem["kind"], string> = {
  email: "/app/email",
  meeting: "/app/meeting",
  planner: "/app/planner",
  research: "/app/research",
  chat: "/app/chat",
};

function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => {
    const load = () => setItems(loadHistory());
    load();
    window.addEventListener("ws-history-changed", load);
    return () => window.removeEventListener("ws-history-changed", load);
  }, []);
  const filtered = items.filter((i) => (i.title + " " + i.kind).toLowerCase().includes(q.toLowerCase()));

  return (
    <AppLayout title="History">
      <Card>
        <CardHeader>
          <CardTitle>All activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Search history…" value={q} onChange={(e) => setQ(e.target.value)} />
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing here yet.</p>
          ) : (
            <ul className="divide-y">
              {filtered.map((i) => {
                const Icon = ICONS[i.kind];
                return (
                  <li key={i.id} className="flex items-center gap-3 py-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <Link to={HREF[i.kind] as never} className="flex-1 truncate text-sm hover:underline">
                      {i.title}
                    </Link>
                    <Badge variant="outline" className="capitalize">{i.kind}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(i.createdAt).toLocaleString()}
                    </span>
                    <Button size="icon" variant="ghost" onClick={() => toggleFavorite(i.id)} aria-label="Favorite">
                      {i.favorite ? <Star className="h-4 w-4 text-yellow-500" /> : <StarOff className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => removeHistory(i.id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
