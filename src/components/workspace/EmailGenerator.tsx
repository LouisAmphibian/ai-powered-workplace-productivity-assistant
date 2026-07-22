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
import { Switch } from "@/components/ui/switch";
import { Loader2, Copy, Mail, Sparkles, Download, Save, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { ResponsibleBanner, FactCheckText } from "./ResponsibleBanner";
import { useWorkspace } from "@/lib/workspace-context";
import { generateEmailFn } from "@/lib/ai.functions";
import { pushHistory } from "@/lib/history";

const TONES = [
  "Formal",
  "Persuasive",
  "Concise",
  "Friendly",
  "Assertive",
  "Empathetic",
  "Enthusiastic",
  "Apologetic",
];

const AUDIENCES = [
  "Client",
  "Executive Team",
  "Direct Reports",
  "Cross-Functional Peer",
  "Vendor",
  "Investor",
  "New Hire",
  "External Partner",
];

export function EmailGenerator() {
  const { factCheck } = useWorkspace();
  const [audience, setAudience] = useState(AUDIENCES[1]);
  const [recipient, setRecipient] = useState("Sarah Chen, VP Product");
  const [context, setContext] = useState(
    "Sharing the Q3 product roadmap update. We are on track to ship the new analytics dashboard by mid-November, and initial pilot customers reported meaningful reductions in reporting time.",
  );
  const [details, setDetails] = useState("Include the pilot metrics and next steps for the review meeting on Friday.");
  const [outcome, setOutcome] = useState("Confirm the review meeting and get buy-in on scope.");
  const [tone, setTone] = useState("Formal");
  const [loading, setLoading] = useState<false | "gen" | "grammar" | "clarity" | "rewrite">(false);
  const [output, setOutput] = useState<{ subject: string; body: string } | null>(null);
  const [editable, setEditable] = useState(false);

  const call = async (
    action: "generate" | "improve_grammar" | "improve_clarity" | "rewrite",
    key: "gen" | "grammar" | "clarity" | "rewrite",
  ) => {
    if (action !== "generate" && !output) return;
    setLoading(key);
    try {
      const res = await generateEmailFn({
        data: {
          recipient,
          audience,
          context,
          details,
          outcome,
          tone,
          action,
          existing: output ? `Subject: ${output.subject}\n\n${output.body}` : "",
        },
      });
      setOutput(res);
      if (action === "generate") {
        pushHistory({ kind: "email", title: res.subject, data: res });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  const copyAll = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(`Subject: ${output.subject}\n\n${output.body}`);
    toast.success("Email copied");
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([`Subject: ${output.subject}\n\n${output.body}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${output.subject.slice(0, 40) || "email"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const save = () => {
    if (!output) return;
    pushHistory({ kind: "email", title: output.subject, favorite: true, data: output });
    toast.success("Saved to History");
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
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Recipient</Label>
                <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AUDIENCES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Primary topic / context</Label>
              <Textarea rows={4} value={context} onChange={(e) => setContext(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Important details</Label>
              <Textarea rows={2} value={details} onChange={(e) => setDetails(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Desired outcome</Label>
              <Input value={outcome} onChange={(e) => setOutcome(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => call("generate", "gen")}
              disabled={!!loading}
              className="w-full"
            >
              {loading === "gen" ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Generate Email</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Draft</CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Switch checked={editable} onCheckedChange={setEditable} id="edit-toggle" />
                <Label htmlFor="edit-toggle">Edit</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading === "gen" && (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Drafting your email…
              </div>
            )}
            {loading !== "gen" && !output && (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Your generated email will appear here.
              </div>
            )}
            {loading !== "gen" && output && (
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
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={copyAll}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                  <Button size="sm" variant="outline" onClick={download}>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                  <Button size="sm" variant="outline" onClick={save}>
                    <Save className="mr-2 h-4 w-4" /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => call("improve_grammar", "grammar")}
                    disabled={!!loading}
                  >
                    {loading === "grammar" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Grammar
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => call("improve_clarity", "clarity")}
                    disabled={!!loading}
                  >
                    {loading === "clarity" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Clarity
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => call("rewrite", "rewrite")}
                    disabled={!!loading}
                  >
                    {loading === "rewrite" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    Rewrite
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
