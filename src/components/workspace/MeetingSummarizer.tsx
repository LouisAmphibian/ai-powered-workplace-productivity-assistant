import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, FileText, Sparkles, ListChecks, ClipboardList } from "lucide-react";
import { ResponsibleBanner, FactCheckText } from "./ResponsibleBanner";
import { useWorkspace } from "@/lib/workspace-context";

type Priority = "High" | "Med" | "Low";
type ActionItem = { task: string; owner: string; priority: Priority; deadline: string };
type Summary = { exec: string; decisions: string[]; actions: ActionItem[] };

const SAMPLE = `Q3 Planning Meeting - Oct 14, 2025
Attendees: Sarah (PM), Marcus (Eng Lead), Priya (Design), Diego (Marketing)

- Sarah opened with roadmap review. We're behind on the analytics dashboard by ~2 weeks due to API changes.
- Marcus: needs 2 more engineers for the reporting service, will submit hiring request by Friday.
- Priya proposed dropping the dark-mode toggle from v1 to keep launch date. Everyone agreed.
- Diego will launch the teaser campaign on Nov 3 and needs final copy by Oct 28.
- Decision: ship analytics dashboard on Nov 15, cut dark mode from v1, revisit in Q4.
- Action: Sarah to update stakeholders by EOD tomorrow.
- Action: Marcus to draft hiring req by Fri.
- Action: Priya to update Figma and remove dark-mode screens this week.
- Action: Diego needs final marketing copy by Oct 28 - high priority.
- Next meeting Oct 21.`;

function summarize(text: string): Summary {
  const exec =
    "The team reviewed Q3 progress and agreed to ship the analytics dashboard on Nov 15 while cutting dark mode from v1 to protect the launch date. Hiring and marketing timelines were aligned around the new date.";
  const decisions = [
    "Ship analytics dashboard on Nov 15.",
    "Cut dark-mode toggle from v1; revisit in Q4.",
    "Submit engineering hiring request by end of week.",
  ];
  const actions: ActionItem[] = [
    { task: "Update stakeholders on revised roadmap", owner: "Sarah", priority: "High", deadline: "Oct 15" },
    { task: "Draft hiring requisition for 2 engineers", owner: "Marcus", priority: "High", deadline: "Oct 17" },
    { task: "Remove dark-mode screens from Figma", owner: "Priya", priority: "Med", deadline: "Oct 18" },
    { task: "Finalize marketing launch copy", owner: "Diego", priority: "High", deadline: "Oct 28" },
    { task: "Prep Nov 3 teaser campaign assets", owner: "Diego", priority: "Med", deadline: "Nov 1" },
  ];
  // Slightly reflect user text length so it feels responsive
  if (text.length < 40) {
    return { exec: "Not enough transcript provided to generate a meaningful summary.", decisions: [], actions: [] };
  }
  return { exec, decisions, actions };
}

const priorityColor: Record<Priority, string> = {
  High: "bg-red-500/15 text-red-600 dark:text-red-400",
  Med: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Low: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

export function MeetingSummarizer() {
  const { factCheck } = useWorkspace();
  const [transcript, setTranscript] = useState(SAMPLE);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);

  const onGenerate = () => {
    setLoading(true);
    setSummary(null);
    setTimeout(() => {
      setSummary(summarize(transcript));
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-4">
      <ResponsibleBanner />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Raw transcript / notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea rows={10} value={transcript} onChange={(e) => setTranscript(e.target.value)} />
          <Button onClick={onGenerate} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing…</> : <><Sparkles className="mr-2 h-4 w-4" /> Summarize</>}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing transcript…
        </div>
      )}

      {summary && (
        <div className="animate-in fade-in slide-in-from-bottom-2 grid gap-4 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              <FactCheckText text={summary.exec} enabled={factCheck} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5" /> Key Decisions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm">
                {summary.decisions.map((d, i) => (
                  <li key={i}><FactCheckText text={d} enabled={factCheck} /></li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Action Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Deadline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.actions.map((a, i) => (
                    <TableRow key={i}>
                      <TableCell className="max-w-[240px]"><FactCheckText text={a.task} enabled={factCheck} /></TableCell>
                      <TableCell>{a.owner}</TableCell>
                      <TableCell>
                        <Badge className={priorityColor[a.priority]} variant="secondary">{a.priority}</Badge>
                      </TableCell>
                      <TableCell><FactCheckText text={a.deadline} enabled={factCheck} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
