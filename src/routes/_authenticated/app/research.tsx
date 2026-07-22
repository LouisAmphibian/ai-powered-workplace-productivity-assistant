import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/workspace/AppLayout";
import { ResearchAssistant } from "@/components/workspace/ResearchAssistant";

export const Route = createFileRoute("/_authenticated/app/research")({
  head: () => ({
    meta: [
      { title: "Research — WorkSpace AI" },
      { name: "description", content: "Research any topic and get structured, honest, easy-to-read summaries." },
      { property: "og:title", content: "Research — WorkSpace AI" },
      { property: "og:description", content: "Research any topic with WorkSpace AI." },
    ],
  }),
  component: () => (
    <AppLayout title="AI Research Assistant">
      <ResearchAssistant />
    </AppLayout>
  ),
});
