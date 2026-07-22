import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppLayout } from "@/components/workspace/AppLayout";
import { loadThreads, newThreadId } from "@/lib/threads";

export const Route = createFileRoute("/_authenticated/app/chat/")({
  head: () => ({
    meta: [
      { title: "Chatbot — WorkSpace AI" },
      { name: "description", content: "Chat with WorkSpace AI — your workplace productivity copilot." },
      { property: "og:title", content: "Chatbot — WorkSpace AI" },
      { property: "og:description", content: "Chat with WorkSpace AI." },
    ],
  }),
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();
  useEffect(() => {
    const threads = loadThreads();
    const id = threads[0]?.id ?? newThreadId();
    navigate({ to: "/app/chat/$threadId", params: { threadId: id } as never, replace: true });
  }, [navigate]);
  return (
    <AppLayout title="AI Chatbot">
      <div className="grid h-[70vh] place-items-center text-sm text-muted-foreground">Opening chat…</div>
    </AppLayout>
  );
}
