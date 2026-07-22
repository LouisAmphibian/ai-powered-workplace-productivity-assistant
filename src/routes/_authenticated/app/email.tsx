import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/workspace/AppLayout";
import { EmailGenerator } from "@/components/workspace/EmailGenerator";

export const Route = createFileRoute("/_authenticated/app/email")({
  head: () => ({
    meta: [
      { title: "Smart Email — WorkSpace AI" },
      { name: "description", content: "Draft, rewrite, and polish professional emails with WorkSpace AI." },
      { property: "og:title", content: "Smart Email — WorkSpace AI" },
      { property: "og:description", content: "Draft and polish professional emails with WorkSpace AI." },
    ],
  }),
  component: () => (
    <AppLayout title="Smart Email Generator">
      <EmailGenerator />
    </AppLayout>
  ),
});
