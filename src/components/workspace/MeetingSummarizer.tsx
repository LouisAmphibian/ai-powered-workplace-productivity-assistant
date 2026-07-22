import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  FileText,
  Sparkles,
  ListChecks,
  ClipboardList,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Download,
} from "lucide-react";
import { ResponsibleBanner, FactCheckText } from "./ResponsibleBanner";
import { useWorkspace } from "@/lib/workspace-context";
import { summarizeMeetingFn, type MeetingSummary } from "@/lib/ai.functions";
import { pushHistory } from "@/lib/history";
import { toast } from "sonner";

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

const priorityColor: Record<string, string> = {
  High: "bg-red-500/15 text-red-600 dark:text-red-400",
  Medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Low: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

export function MeetingSummarizer() {
  const { factCheck } = useWorkspace();
  const [transcript, setTranscript] = useState(SAMPLE);
  const [length, setLength] = useState<"short" | "standard" | "detailed">("standard");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<MeetingSummary | null>(null);

  const run = async () => {
    setLoading(true);
    setSummary(null);
    try {
      const res = await summarizeMeetingFn({ data: { transcript, length } });
      setSummary(res);
      pushHistory({
        kind: "meeting",
        title: res.executive_summary?.slice(0, 60) || "Meeting summary",
        data: res,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to summarize");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!summary) return;
    const md = `# Meeting Summary\n\n## Executive Summary\n${summary.executive_summary}\n\n## Key Points\n${summary.key_points.map((p) => `- ${p}`).join("\n")}\n\n## Decisions\n${summary.decisions.map((p) => `- ${p}`).join("\n")}\n\n## Risks\n${summary.risks.map((p) => `- ${p}`).join("\n")}\n\n## Open Questions\n${summary.questions.map((p) => `- ${p}`).join("\n")}\n\n## Action Items\n${summary.action_items.map((a) => `- [${a.priority}] ${a.task} — ${a.owner} (${a.deadline})`).join("\n")}\n\n## Next Steps\n${summary.next_steps.map((p) => `- ${p}`).join("\n")}\n`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meeting-summary.md";
    a.click();
    URL.revokeObjectURL(url);
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
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-40 space-y-1">
              <Label className="text-xs">Length</Label>
              <Select value={length} onValueChange={(v) => setLength(v as typeof length)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={run} disabled={loading}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing…</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Summarize</>
              )}
            </Button>
            {summary && (
              <Button variant="outline" onClick={download}>
                <Download className="mr-2 h-4 w-4" /> Export .md
              </Button>
            )}
          </div>
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
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" /> Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              <FactCheckText text={summary.executive_summary} enabled={factCheck} />
            </CardContent>
          </Card>

          <Section icon={<ListChecks className="h-5 w-5" />} title="Key Points" items={summary.key_points} factCheck={factCheck} />
          <Section icon={<Sparkles className="h-5 w-5" />} title="Decisions" items={summary.decisions} factCheck={factCheck} />
          <Section icon={<AlertTriangle className="h-5 w-5" />} title="Risks" items={summary.risks} factCheck={factCheck} />
          <Section icon={<HelpCircle className="h-5 w-5" />} title="Open Questions" items={summary.questions} factCheck={factCheck} />

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" /> Action Items
              </CardTitle>
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
                  {summary.action_items.map((a, i) => (
                    <TableRow key={i}>
                      <TableCell className="max-w-[280px]">
                        <FactCheckText text={a.task} enabled={factCheck} />
                      </TableCell>
                      <TableCell>{a.owner}</TableCell>
                      <TableCell>
                        <Badge className={priorityColor[a.priority] ?? ""} variant="secondary">
                          {a.priority}
                        </Badge>
                      </TableCell>
                      <TableCell><FactCheckText text={a.deadline} enabled={factCheck} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Section icon={<ArrowRight className="h-5 w-5" />} title="Next Steps" items={summary.next_steps} factCheck={factCheck} className="lg:col-span-2" />
        </div>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  items,
  factCheck,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  factCheck: boolean;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">{icon} {title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items?.length ? (
          <ul className="list-disc space-y-1.5 pl-5 text-sm">
            {items.map((d, i) => (
              <li key={i}><FactCheckText text={d} enabled={factCheck} /></li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">None identified.</p>
        )}
      </CardContent>
    </Card>
  );
}
