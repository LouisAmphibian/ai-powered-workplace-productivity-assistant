import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/workspace/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — WorkSpace AI" },
      { name: "description", content: "Manage your WorkSpace AI account and preferences." },
      { property: "og:title", content: "Settings — WorkSpace AI" },
      { property: "og:description", content: "Manage your WorkSpace AI account and preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [factCheck, setFactCheck] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    setFactCheck(localStorage.getItem("factCheck") === "1");
  }, []);
  const clearAll = () => {
    localStorage.removeItem("ws_history_v1");
    localStorage.removeItem("ws_threads_v1");
    window.dispatchEvent(new Event("ws-history-changed"));
    window.dispatchEvent(new Event("ws-threads-changed"));
    toast.success("Local data cleared");
  };
  return (
    <AppLayout title="Settings">
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Account</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div><span className="text-muted-foreground">Email:</span> {email ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="fc">Fact & Bias Check</Label>
                <p className="text-xs text-muted-foreground">Highlight unverified claims in generated output.</p>
              </div>
              <Switch
                id="fc"
                checked={factCheck}
                onCheckedChange={(v) => {
                  setFactCheck(v);
                  localStorage.setItem("factCheck", v ? "1" : "0");
                }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Privacy</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Chat threads and history are stored only in this browser (localStorage). Nothing is sent to a database.
            </p>
            <Button variant="destructive" onClick={clearAll}>Clear all local data</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
