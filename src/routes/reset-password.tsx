import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { newPasswordSchema, friendlyAuthError } from "@/lib/auth-validation";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — WorkSpace AI" },
      { name: "description", content: "Set a new password for your WorkSpace AI account." },
      { property: "og:title", content: "Choose a new password — WorkSpace AI" },
      { property: "og:description", content: "Set a new password for your WorkSpace AI account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState<"checking" | "ok" | "invalid">("checking");

  // Supabase places a recovery session in the URL hash and creates a session automatically.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady("ok");
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady("ok");
      else {
        // Give the hash-parse a beat, then decide.
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: d2 }) => {
            setReady(d2.session ? "ok" : "invalid");
          });
        }, 800);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = newPasswordSchema.safeParse({ password, confirm });
    if (!parsed.success) {
      const fe: { password?: string; confirm?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as "password" | "confirm";
        if (!fe[key]) fe[key] = issue.message;
      }
      setErrors(fe);
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(friendlyAuthError(error));
    toast.success("Password updated. You're signed in.");
    navigate({ to: "/app" });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-background to-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Choose a new password</CardTitle>
        </CardHeader>
        <CardContent>
          {ready === "checking" ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying reset link…
            </div>
          ) : ready === "invalid" ? (
            <div className="space-y-3 text-sm">
              <p className="text-destructive">This reset link is invalid or has expired.</p>
              <a href="/forgot-password" className="text-primary hover:underline">
                Request a new link
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="pw">New password</Label>
                <Input
                  id="pw"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  aria-invalid={!!errors.password}
                />
                {errors.password ? (
                  <p className="text-xs text-destructive">{errors.password}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    At least 8 characters with upper, lower, and a number.
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pw2">Confirm password</Label>
                <Input
                  id="pw2"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                  aria-invalid={!!errors.confirm}
                />
                {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
              </div>
              <Button className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
