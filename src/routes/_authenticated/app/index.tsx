import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/workspace/AppLayout";
import { Dashboard } from "@/components/workspace/Dashboard";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — WorkSpace AI" },
      { name: "description", content: "Your WorkSpace AI dashboard with quick actions, stats, and recent activity." },
      { property: "og:title", content: "Dashboard — WorkSpace AI" },
      { property: "og:description", content: "Your WorkSpace AI dashboard." },
    ],
  }),
  component: () => (
    <AppLayout title="Dashboard">
      <Dashboard />
    </AppLayout>
  ),
});
