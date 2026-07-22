import { createFileRoute } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { WorkspaceProvider, useWorkspace } from "@/lib/workspace-context";
import { AppSidebar } from "@/components/workspace/AppSidebar";
import { EmailGenerator } from "@/components/workspace/EmailGenerator";
import { MeetingSummarizer } from "@/components/workspace/MeetingSummarizer";
import { TaskPlanner } from "@/components/workspace/TaskPlanner";
import { ResponsibleBanner } from "@/components/workspace/ResponsibleBanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WorkSpace AI — Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Draft emails, summarize meetings, and plan your day with an AI-powered workplace productivity assistant.",
      },
      { property: "og:title", content: "WorkSpace AI — Workplace Productivity Assistant" },
      {
        property: "og:description",
        content:
          "Draft emails, summarize meetings, and plan your day with an AI-powered workplace productivity assistant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TITLES: Record<string, string> = {
  email: "Smart Email Generator",
  meeting: "Meeting Notes Summarizer",
  planner: "AI Task Planner & Scheduler",
};

function Shell() {
  const { view } = useWorkspace();
  const { theme, toggle } = useTheme();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur">
            <div className="flex items-center gap-2 min-w-0">
              <SidebarTrigger />
              <h1 className="truncate text-base font-semibold sm:text-lg">{TITLES[view]}</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">
            {view === "email" && <EmailGenerator />}
            {view === "meeting" && <MeetingSummarizer />}
            {view === "planner" && <TaskPlanner />}
            <ResponsibleBanner position="bottom" />
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

function Index() {
  return (
    <ThemeProvider>
      <WorkspaceProvider>
        <Shell />
      </WorkspaceProvider>
    </ThemeProvider>
  );
}
