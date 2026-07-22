import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Mail,
  FileText,
  CalendarClock,
  BookOpen,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WorkSpace AI — Your Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Draft emails, summarize meetings, plan your week, research topics, and chat with an AI built for work. Fast, private, and responsible AI.",
      },
      { property: "og:title", content: "WorkSpace AI — Your Workplace Productivity Assistant" },
      {
        property: "og:description",
        content:
          "Draft emails, summarize meetings, plan your week, research topics, and chat with an AI built for work.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Mail, title: "Smart Email Generator", desc: "Draft, rewrite, and polish emails in any tone." },
  { icon: FileText, title: "Meeting Summarizer", desc: "Turn messy notes into decisions and action items." },
  { icon: CalendarClock, title: "Task Planner", desc: "Prioritize with Eisenhower + time-blocked schedule." },
  { icon: BookOpen, title: "Research Assistant", desc: "Explain any topic, source, or document clearly." },
  { icon: MessageSquare, title: "AI Chatbot", desc: "A private workplace assistant with saved threads." },
  { icon: ShieldCheck, title: "Responsible AI", desc: "Bias flags, fact-check mode, and privacy first." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold">WorkSpace AI</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/auth">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link to="/auth" search={{ mode: "signup" } as never}>
            <Button>Get started</Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-4 pb-20 pt-16 text-center sm:pt-24">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background/50 px-3 py-1 text-xs">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Powered by Lovable AI · Responsible by design
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Your AI copilot for <span className="text-primary">work that matters</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          Draft emails, summarize meetings, plan your week, research anything, and chat with an
          assistant that understands your workplace.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/auth">
            <Button size="lg" className="min-w-40">
              Open the app <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" variant="outline" className="min-w-40">
              Create free account
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-24 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="rounded-xl border bg-card p-5 transition hover:shadow-md">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t bg-background/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} WorkSpace AI</span>
          <span>AI outputs can contain errors — review before sending.</span>
        </div>
      </footer>
    </div>
  );
}
