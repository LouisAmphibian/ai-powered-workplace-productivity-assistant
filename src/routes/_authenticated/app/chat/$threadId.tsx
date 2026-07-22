import { createFileRoute, useParams } from "@tanstack/react-router";
import { AppLayout } from "@/components/workspace/AppLayout";
import { WorkChatbot } from "@/components/workspace/WorkChatbot";

export const Route = createFileRoute("/_authenticated/app/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "Chat — WorkSpace AI" },
      { name: "description", content: "Continue your WorkSpace AI conversation." },
      { property: "og:title", content: "Chat — WorkSpace AI" },
      { property: "og:description", content: "Continue your WorkSpace AI conversation." },
    ],
  }),
  component: ChatThread,
});

function ChatThread() {
  const { threadId } = useParams({ from: "/_authenticated/app/chat/$threadId" });
  return (
    <AppLayout title="AI Chatbot">
      <WorkChatbot key={threadId} threadId={threadId} />
    </AppLayout>
  );
}
