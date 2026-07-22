import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/workspace/AppLayout";
import { MeetingSummarizer } from "@/components/workspace/MeetingSummarizer";

export const Route = createFileRoute("/_authenticated/app/meeting")({
  head: () => ({
    meta: [
      { title: "Meeting Notes — WorkSpace AI" },
      { name: "description", content: "Turn messy meeting notes into decisions and action items." },
      { property: "og:title", content: "Meeting Notes — WorkSpace AI" },
      { property: "og:description", content: "Turn messy meeting notes into decisions and action items." },
    ],
  }),
  component: () => (
    <AppLayout title="Meeting Notes Summarizer">
      <MeetingSummarizer />
    </AppLayout>
  ),
});
