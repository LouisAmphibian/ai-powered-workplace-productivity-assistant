import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, CalendarClock, Coffee, Timer, Target } from "lucide-react";
import { ResponsibleBanner, FactCheckText } from "./ResponsibleBanner";
import { useWorkspace } from "@/lib/workspace-context";
import { planTasksFn, type PlanResult } from "@/lib/ai.functions";
import { pushHistory } from "@/lib/history";
import { toast } from "sonner";

const SAMPLE = `Prepare Q3 board deck (due Friday)
Reply to client escalation from Acme Corp
Review PR for reporting service
1:1 with Priya
Draft hiring requisition
Read industry newsletter
Plan team offsite agenda
Update analytics dashboard mockups
Approve marketing copy for launch
Clean out inbox`;

const QUAD = {
  do: { title: "Do First", desc: "Urgent & Important", cls: "border-red-400/60 bg-red-500/5" },
  schedule: { title: "Schedule", desc: "Important, Not Urgent", cls: "border-blue-400/60 bg-blue-500/5" },
  delegate: { title: "Delegate", desc: "Urgent, Not Important", cls: "border-amber-400/60 bg-amber-500/5" },
  eliminate: { title: "Eliminate", desc: "Not Urgent, Not Important", cls: "border-muted bg-muted/30" },
};

export function TaskPlanner() {
  const { factCheck } = useWorkspace();
  const [hours, setHours] = useState(8);
  const [raw, setRaw] = useState(SAMPLE);
  const [style, setStyle] = useState("Deep work first");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const run = async () => {
    setLoading(true);
    setPlan(null);
    setChecked({});
    try {
      const res = await planTasksFn({ data: { workload: raw, hoursPerDay: hours, style } });
      setPlan(res);
      pushHistory({
        kind: "planner",
        title: `${res.tasks?.length || 0} tasks planned`,
        data: res,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to plan");
    } finally {
      setLoading(false);
    }
  };

  const workBlocks = plan?.daily_schedule.filter((b) => b.type !== "break") ?? [];
  const done = workBlocks.filter((_, i) => checked[i]).length;
  const pct = workBlocks.length ? Math.round((done / workBlocks.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <ResponsibleBanner />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5" /> Plan your day
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Daily working hours</Label>
              <Input
                type="number"
                min={1}
                max={16}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Priority preference</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Deep work first">Deep work first</SelectItem>
                  <SelectItem value="Quick wins first">Quick wins first</SelectItem>
                  <SelectItem value="Balanced">Balanced</SelectItem>
                  <SelectItem value="Meetings clustered">Meetings clustered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Weekly goals / raw task list (one per line)</Label>
            <Textarea rows={8} value={raw} onChange={(e) => setRaw(e.target.value)} />
          </div>
          <Button onClick={run} disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Planning…</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Generate Plan</>
            )}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Prioritizing and scheduling…
        </div>
      )}

      {plan && (
        <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {(Object.keys(QUAD) as Array<keyof typeof QUAD>).map((k) => {
              const items = plan.eisenhower?.[k] ?? [];
              const meta = QUAD[k];
              return (
                <Card key={k} className={`border ${meta.cls}`}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {meta.title}{" "}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">{meta.desc}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {items.length ? (
                      <ul className="space-y-1 text-sm">
                        {items.map((t, i) => (
                          <li key={i}>• <FactCheckText text={t} enabled={factCheck} /></li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nothing here.</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" /> Daily time-block schedule
              </CardTitle>
              <div className="flex items-center gap-3">
                <Progress value={pct} className="w-32" />
                <span className="text-sm text-muted-foreground">{done}/{workBlocks.length}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {plan.daily_schedule.map((b, i) => (
                  <li key={i} className="flex items-center gap-3 py-2">
                    {b.type === "break" ? (
                      <Coffee className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Checkbox
                        checked={!!checked[i]}
                        onCheckedChange={(v) => setChecked((c) => ({ ...c, [i]: !!v }))}
                        id={`sched-${i}`}
                      />
                    )}
                    <Label htmlFor={`sched-${i}`} className="flex flex-1 flex-wrap items-center gap-3 font-normal">
                      <span className="w-40 shrink-0 text-sm text-muted-foreground">{b.time}</span>
                      <span className={checked[i] ? "text-muted-foreground line-through" : ""}>
                        <FactCheckText text={b.task} enabled={factCheck} />
                      </span>
                      {b.type === "focus" && <Badge variant="secondary">Focus</Badge>}
                    </Label>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {plan.weekly_plan?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" /> Weekly plan
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {plan.weekly_plan.map((d, i) => (
                  <div key={i} className="rounded-md border p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-semibold">{d.day}</span>
                      <Badge variant="outline">{d.focus}</Badge>
                    </div>
                    <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
                      {d.tasks.map((t, j) => <li key={j}><FactCheckText text={t} enabled={factCheck} /></li>)}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {plan.tips?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Coach tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {plan.tips.map((t, i) => <li key={i}><FactCheckText text={t} enabled={factCheck} /></li>)}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
