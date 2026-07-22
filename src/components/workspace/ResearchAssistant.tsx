import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, BookOpen, ThumbsUp, ThumbsDown, Lightbulb, Baby, ListChecks } from "lucide-react";
import { ResponsibleBanner, FactCheckText } from "./ResponsibleBanner";
import { useWorkspace } from "@/lib/workspace-context";
import { researchFn, type ResearchResult } from "@/lib/ai.functions";
import { pushHistory } from "@/lib/history";
import { toast } from "sonner";

export function ResearchAssistant() {
  const { factCheck } = useWorkspace();
  const [topic, setTopic] = useState("Impact of AI-assisted coding on engineering team productivity");
  const [source, setSource] = useState("");
  const [level, setLevel] = useState<"Beginner" | "Intermediate" | "Expert">("Intermediate");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<ResearchResult | null>(null);

  const onFile = async (f: File | null) => {
    if (!f) return;
    if (!/^text\//.test(f.type) && !f.name.match(/\.(md|txt|csv|json)$/i)) {
      toast.error("Please upload a plain text file (.txt, .md, .csv, .json)");
      return;
    }
    setSource(await f.text());
  };

  const run = async () => {
    setLoading(true);
    setRes(null);
    try {
      const r = await researchFn({ data: { topic, source, level } });
      setRes(r);
      pushHistory({ kind: "research", title: topic, data: r });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to research");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <ResponsibleBanner />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Research
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Topic or question</Label>
            <Input value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Source material or URL (optional — paste text)</Label>
            <Textarea rows={5} value={source} onChange={(e) => setSource(e.target.value)} placeholder="Paste an article, notes, or a URL you want summarized."/>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-48 space-y-1.5">
              <Label>Reading level</Label>
              <Select value={level} onValueChange={(v) => setLevel(v as typeof level)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Upload text file</Label>
              <Input type="file" accept=".txt,.md,.csv,.json,text/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            </div>
            <Button onClick={run} disabled={loading}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Researching…</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Research</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Gathering insights…
        </div>
      )}

      {res && (
        <div className="animate-in fade-in slide-in-from-bottom-2 grid gap-4 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> Executive summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">
              <FactCheckText text={res.executive_summary} enabled={factCheck} />
            </CardContent>
          </Card>

          <Bullets icon={<Lightbulb className="h-5 w-5" />} title="Key insights" items={res.key_insights} factCheck={factCheck} />
          <Bullets icon={<ListChecks className="h-5 w-5" />} title="Important facts" items={res.important_facts} factCheck={factCheck} />
          <Bullets icon={<ThumbsUp className="h-5 w-5" />} title="Advantages" items={res.advantages} factCheck={factCheck} />
          <Bullets icon={<ThumbsDown className="h-5 w-5" />} title="Disadvantages" items={res.disadvantages} factCheck={factCheck} />
          <Bullets icon={<Lightbulb className="h-5 w-5" />} title="Recommendations" items={res.recommendations} factCheck={factCheck} className="lg:col-span-2" />

          {res.simplified && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Baby className="h-5 w-5" /> Explain like I'm five</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed">
                <FactCheckText text={res.simplified} enabled={factCheck} />
              </CardContent>
            </Card>
          )}
          <Bullets icon={<ListChecks className="h-5 w-5" />} title="Takeaways" items={res.takeaways} factCheck={factCheck} className="lg:col-span-2" />
        </div>
      )}
    </div>
  );
}

function Bullets({ icon, title, items, factCheck, className }: { icon: React.ReactNode; title: string; items: string[]; factCheck: boolean; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">{icon} {title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items?.length ? (
          <ul className="list-disc space-y-1.5 pl-5 text-sm">
            {items.map((d, i) => <li key={i}><FactCheckText text={d} enabled={factCheck} /></li>)}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">None.</p>
        )}
      </CardContent>
    </Card>
  );
}
