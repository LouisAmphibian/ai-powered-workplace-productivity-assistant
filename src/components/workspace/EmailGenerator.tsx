import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Copy, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ResponsibleBanner, FactCheckText } from "./ResponsibleBanner";
import { useWorkspace } from "@/lib/workspace-context";

type Tone = "Formal" | "Persuasive" | "Concise" | "Friendly";

const OPENERS: Record<Tone, string> = {
  Formal: "I hope this message finds you well.",
  Persuasive: "I wanted to share an opportunity I believe will benefit your team.",
  Concise: "Quick note on the item below.",
  Friendly: "Hope you're having a great week!",
};

const CLOSERS: Record<Tone, string> = {
  Formal: "Kind regards,\n[Your Name]",
  Persuasive: "Looking forward to your thoughts,\n[Your Name]",
  Concise: "Thanks,\n[Your Name]",
  Friendly: "Cheers,\n[Your Name]",
};

function generate(audience: string, topic: string, tone: Tone) {
  const subject = `${tone === "Concise" ? "" : "Update: "}${topic.slice(0, 60)}${topic.length > 60 ? "…" : ""}`;
  const body = `Hi ${audience || "[Recipient]"},

${OPENERS[tone]}

${topic}

Please let me know if you have any questions or would like to discuss further. I'm happy to set up time later this week.

${CLOSERS[tone]}`;
  return { subject: subject.trim(), body };
}

export function EmailGenerator() {
  const { factCheck } = useWorkspace();
  const [audience, setAudience] = useState("Executive Team");
  const [topic, setTopic] = useState(
    "Sharing the Q3 product roadmap update. We're on track to ship the new analytics dashboard by [DATE], and initial pilot customers have reported a 30% reduction in reporting time.",
  );
  const [tone, setTone] = useState<Tone>("Formal");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<{ subject: string; body: string } | null>(null);
  const [editable, setEditable] = useState(false);

  const onGenerate = () => {
    setLoading(true);
    setOutput(null);
    setTimeout(() => {
      setOutput(generate(audience, topic, tone));
      setLoading(false);
    }, 700);
  };

  const copyAll = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(`Subject: ${output.subject}\n\n${output.body}`);
    toast.success("Email copied to clipboard");
  };

  return (
    <div className="space-y-4">
      <ResponsibleBanner />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" /> Compose
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient / Audience</Label>
              <Input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Client, Executive, Team…" />
            </div>
            <div className="space-y-2">
              <Label>Primary Topic / Context</Label>
              <Textarea rows={6} value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as Tone)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Formal">Formal</SelectItem>
                  <SelectItem value="Persuasive">Persuasive</SelectItem>
                  <SelectItem value="Concise">Concise</SelectItem>
                  <SelectItem value="Friendly">Friendly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={onGenerate} disabled={loading} className="w-full">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Email</>}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Draft</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Switch checked={editable} onCheckedChange={setEditable} id="edit-toggle" />
                <Label htmlFor="edit-toggle">Edit</Label>
              </div>
              <Button size="sm" variant="outline" onClick={copyAll} disabled={!output}>
                <Copy className="mr-2 h-4 w-4" /> Copy
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading && (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Drafting your email…
              </div>
            )}
            {!loading && !output && (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Your generated email will appear here.
              </div>
            )}
            {!loading && output && (
              <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground">Subject</Label>
                  {editable ? (
                    <Input value={output.subject} onChange={(e) => setOutput({ ...output, subject: e.target.value })} />
                  ) : (
                    <div className="rounded-md border bg-muted/40 p-2 font-medium">
                      <FactCheckText text={output.subject} enabled={factCheck} />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground">Body</Label>
                  {editable ? (
                    <Textarea rows={14} value={output.body} onChange={(e) => setOutput({ ...output, body: e.target.value })} />
                  ) : (
                    <div className="whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-sm leading-relaxed">
                      <FactCheckText text={output.body} enabled={factCheck} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
