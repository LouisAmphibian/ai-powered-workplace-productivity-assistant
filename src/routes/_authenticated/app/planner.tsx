import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/workspace/AppLayout";
import { TaskPlanner } from "@/components/workspace/TaskPlanner";

export const Route = createFileRoute("/_authenticated/app/planner")({
  head: () => ({
    meta: [
      { title: "Task Planner — WorkSpace AI" },
      { name: "description", content: "Prioritize with an Eisenhower matrix and time-blocked schedule." },
      { property: "og:title", content: "Task Planner — WorkSpace AI" },
      { property: "og:description", content: "Prioritize with an Eisenhower matrix and time-blocked schedule." },
    ],
  }),
  component: () => (
    <AppLayout title="AI Task Planner">
      <TaskPlanner />
    </AppLayout>
  ),
});
