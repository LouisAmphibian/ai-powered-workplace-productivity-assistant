import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, CalendarClock } from "lucide-react";
import { ResponsibleBanner, FactCheckText } from "./ResponsibleBanner";
import { useWorkspace } from "@/lib/workspace-context";

type Quadrant = "UI" | "UNI" | "NUI" | "NUNI";
type Task = { title: string; quadrant: Quadrant };
type Block = { time: string; task: string };

const SAMPLE_TASKS = `Prepare Q3 board deck (due Friday)
Reply to client escalation from Acme Corp
Review PR for reporting service
1:1 with Priya
Draft hiring requisition
Read industry newsletter
Plan team offsite agenda
Update analytics dashboard mockups
Approve marketing copy for launch
Clean out inbox`;

const QUAD_META: Record<Quadrant, { title: string; desc: string; cls: string }> = {
  UI: { title: "Do First", desc: "Urgent & Important", cls: "border-red-400/60 bg-red-500/5" },
  UNI: { title: "Schedule", desc: "Important, Not Urgent", cls: "border-blue-400/60 bg-blue-500/5" },
  NUI: { title: "Delegate", desc: "Urgent, Not Important", cls: "border-amber-400/60 bg-amber-500/5" },
  NUNI: { title: "Eliminate", desc: "Not Urgent, Not Important", cls: "border-muted bg-muted/30" },
};

function classify(line: string): Quadrant {
  const l = line.toLowerCase();
  const urgent = /(today|tomorrow|friday|escalation|due|asap|urgent|launch|deadline)/.test(l);
  const important = /(board|client|hiring|1:1|roadmap|approve|deck|strategy|plan|review|dashboard)/.test(l);
  if (urgent && important) return "UI";
  if (!urgent && important) return "UNI";
  if (urgent && !important) return "NUI";
  return "NUNI";
}

function buildSchedule(tasks: Task[], hours: number): Block[] {
  const ordered = [
    ...tasks.filter((t) => t.quadrant === "UI"),
    ...tasks.filter((t) => t.quadrant === "UNI"),
    ...tasks.filter((t) => t.quadrant === "NUI"),
    ...tasks.filter((t) => t.quadrant === "NUNI"),
  ];
  const blocks: Block[] = [];
  let startHour = 9;
  const slot = Math.max(0.5, Math.min(2, hours / Math.max(ordered.length, 1)));
  for (const t of ordered) {
    const endHour = startHour + slot;
    const fmt = (h: number) => {
      const hh = Math.floor(h);
      const mm = Math.round((h - hh) * 60);
      const suffix = hh >= 12 ? "PM" : "AM";
      const disp = ((hh + 11) % 12) + 1;
      return `${disp}:${mm.toString().padStart(2, "0")} ${suffix}`;
    };
    blocks.push({ time: `${fmt(startHour)} – ${fmt(endHour)}`, task: t.title });
    startHour = endHour;
    if (startHour - 9 >= hours) break;
    // Lunch break at ~12:30
    if (startHour >= 12 && startHour < 13 && !blocks.some((b) => b.task === "Lunch break")) {
      blocks.push({ time: `${fmt(startHour)} – ${fmt(startHour + 0.5)}`, task: "Lunch break" });
      startHour += 0.5;
    }
  }
  return blocks;
}

export function TaskPlanner() {
  const { factCheck } = useWorkspace();
  const [hours, setHours] = useState(8);
  const [raw, setRaw] = useState(SAMPLE_TASKS);
  const [priority, setPriority] = useState("Deep work first");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [schedule, setSchedule] = useState<Block[] | null>(null);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const onGenerate = () => {
    setLoading(true);
    setTasks(null);
    setSchedule(null);
    setTimeout(() => {
      const items = raw
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map<Task>((l) => ({ title: l, quadrant: classify(l) }));
      setTasks(items);
      setSchedule(buildSchedule(items, hours));
      setChecked({});
      setLoading(false);
    }, 700);
  };

  return (
    <div className="space-y-4">
      <ResponsibleBanner />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5" /> Plan your day</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Daily working hours</Label>
              <Input type="number" min={1} max={16} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Priority preference</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Deep work first">Deep work first</SelectItem>
                  <SelectItem value="Quick wins first">Quick wins first</SelectItem>
                  <SelectItem value="Balanced">Balanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Weekly goals / raw task list (one per line)</Label>
            <Textarea rows={8} value={raw} onChange={(e) => setRaw(e.target.value)} />
          </div>
          <Button onClick={onGenerate} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Planning…</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Plan</>}
          </Button>
        </CardContent>
      </Card>

      {tasks && (
        <div className="animate-in fade-in slide-in-from-bottom-2 grid gap-4 md:grid-cols-2">
          {(Object.keys(QUAD_META) as Quadrant[]).map((q) => {
            const items = tasks.filter((t) => t.quadrant === q);
            const meta = QUAD_META[q];
            return (
              <Card key={q} className={`border ${meta.cls}`}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {meta.title} <span className="ml-2 text-xs font-normal text-muted-foreground">{meta.desc}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {items.length ? (
                    <ul className="space-y-1 text-sm">
                      {items.map((t, i) => (
                        <li key={i}>• <FactCheckText text={t.title} enabled={factCheck} /></li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tasks in this quadrant.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {schedule && (
        <Card className="animate-in fade-in slide-in-from-bottom-2">
          <CardHeader>
            <CardTitle>Daily time-block schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {schedule.map((b, i) => (
                <li key={i} className="flex items-center gap-3 py-2">
                  <Checkbox
                    checked={!!checked[i]}
                    onCheckedChange={(v) => setChecked((c) => ({ ...c, [i]: !!v }))}
                    id={`sched-${i}`}
                  />
                  <Label htmlFor={`sched-${i}`} className="flex flex-1 flex-wrap items-center gap-3 font-normal">
                    <span className="w-40 shrink-0 text-sm text-muted-foreground">{b.time}</span>
                    <span className={checked[i] ? "text-muted-foreground line-through" : ""}>
                      <FactCheckText text={b.task} enabled={factCheck} />
                    </span>
                  </Label>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
