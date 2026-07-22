import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/workspace/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/app/help")({
  head: () => ({
    meta: [
      { title: "Help — WorkSpace AI" },
      { name: "description", content: "Guides and tips for using WorkSpace AI features responsibly." },
      { property: "og:title", content: "Help — WorkSpace AI" },
      { property: "og:description", content: "Guides and tips for using WorkSpace AI." },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  return (
    <AppLayout title="Help & Documentation">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              WorkSpace AI is a productivity assistant that helps you draft emails, summarize meetings,
              plan tasks, research topics, and chat with an assistant tuned for workplace tasks.
            </p>
            <ul>
              <li><strong>Smart Email</strong> — write in any tone, then improve grammar, clarity, or rewrite.</li>
              <li><strong>Meeting Notes</strong> — get an exec summary, decisions, risks, and action items.</li>
              <li><strong>Task Planner</strong> — Eisenhower matrix + time-blocked schedule with progress.</li>
              <li><strong>Research</strong> — topic or pasted source → structured insights and a simple explanation.</li>
              <li><strong>Chatbot</strong> — threaded chat saved to this browser only.</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Responsible AI</CardTitle></CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <ul>
              <li>The assistant is instructed to avoid inventing facts or numbers.</li>
              <li>Turn on <em>Fact &amp; Bias Check</em> in the sidebar to highlight placeholders and absolute claims.</li>
              <li>Always review AI output before sending it externally.</li>
              <li>Chat history stays in this browser; your account only stores auth data.</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Architecture</CardTitle></CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Built with TanStack Start (React 19 + Vite) and Tailwind. Auth uses Lovable Cloud (email/password + Google).
              AI features call Lovable AI Gateway (Google Gemini) through server functions using the Vercel AI SDK.
              History and chat threads are stored in localStorage.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Accessibility</CardTitle></CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <ul>
              <li>Full keyboard navigation on all controls.</li>
              <li>ARIA labels on icon-only buttons.</li>
              <li>Light/dark theme with high-contrast tokens.</li>
              <li>Semantic HTML, headings, and focus rings.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
