import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Mail,
  FileText,
  CalendarClock,
  BookOpen,
  MessageSquare,
  Star,
  Activity,
  Sparkles,
} from "lucide-react";
import { loadHistory, type HistoryItem } from "@/lib/history";

const CARDS = [
  { to: "/app/email", label: "Smart Email", icon: Mail, blurb: "Draft a professional email." },
  { to: "/app/meeting", label: "Meeting Notes", icon: FileText, blurb: "Summarize a transcript." },
  { to: "/app/planner", label: "Task Planner", icon: CalendarClock, blurb: "Plan your day or week." },
  { to: "/app/research", label: "Research", icon: BookOpen, blurb: "Explain any topic clearly." },
  { to: "/app/chat", label: "AI Chatbot", icon: MessageSquare, blurb: "Chat with WorkSpace AI." },
];

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

export function Dashboard() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => {
    const load = () => setItems(loadHistory());
    load();
    window.addEventListener("ws-history-changed", load);
    return () => window.removeEventListener("ws-history-changed", load);
  }, []);

  const stats = {
    total: items.length,
    week: items.filter((i) => Date.now() - i.createdAt < 7 * 864e5).length,
    favorites: items.filter((i) => i.favorite).length,
  };

  const recent = items.slice(0, 6);
  const favorites = items.filter((i) => i.favorite).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" /> Welcome back
        </div>
        <h2 className="mt-1 text-2xl font-semibold">What would you like to get done today?</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/app/chat"><Button size="sm"><MessageSquare className="mr-2 h-4 w-4" /> Ask WorkSpace AI</Button></Link>
          <Link to="/app/email"><Button size="sm" variant="outline"><Mail className="mr-2 h-4 w-4" /> Draft an email</Button></Link>
          <Link to="/app/planner"><Button size="sm" variant="outline"><CalendarClock className="mr-2 h-4 w-4" /> Plan my day</Button></Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total generations" value={stats.total} />
        <Stat label="This week" value={stats.week} />
        <Stat label="Favorites" value={stats.favorites} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Quick actions</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CARDS.map((c) => (
            <Link key={c.to} to={c.to as never}>
              <Card className="h-full transition hover:shadow-md">
                <CardContent className="flex flex-col gap-2 p-4">
                  <c.icon className="h-5 w-5 text-primary" />
                  <div className="font-medium">{c.label}</div>
                  <p className="text-xs text-muted-foreground">{c.blurb}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" /> Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet — try a quick action above.</p>
            ) : (
              <ul className="divide-y">
                {recent.map((i) => {
                  const Icon = ICONS[i.kind];
                  return (
                    <li key={i.id} className="py-2">
                      <Link to={HREF[i.kind] as never} className="flex items-center gap-3 hover:opacity-80">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 truncate text-sm">{i.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(i.createdAt).toLocaleDateString()}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-4 w-4" /> Favorites
            </CardTitle>
          </CardHeader>
          <CardContent>
            {favorites.length === 0 ? (
              <p className="text-sm text-muted-foreground">Star items from History to pin them here.</p>
            ) : (
              <ul className="divide-y">
                {favorites.map((i) => {
                  const Icon = ICONS[i.kind];
                  return (
                    <li key={i.id} className="py-2">
                      <Link to={HREF[i.kind] as never} className="flex items-center gap-3 hover:opacity-80">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 truncate text-sm">{i.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-xs uppercase text-muted-foreground">{label}</div>
        <div className="mt-1 text-3xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
