import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { resetRequestSchema, friendlyAuthError } from "@/lib/auth-validation";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — WorkSpace AI" },
      { name: "description", content: "Request a password reset link for your WorkSpace AI account." },
      { property: "og:title", content: "Reset your password — WorkSpace AI" },
      { property: "og:description", content: "Request a password reset link for your WorkSpace AI account." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = resetRequestSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);
    if (err) return toast.error(friendlyAuthError(err));
    setSent(true);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-background to-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent ? (
            <div className="space-y-3 text-sm">
              <p>
                If an account exists for <strong>{email}</strong>, we've sent a password reset link.
                Check your inbox and spam folder.
              </p>
              <Link to="/auth" className="inline-flex items-center gap-1 text-primary hover:underline">
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  aria-invalid={!!error}
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
              <Button className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send reset link
              </Button>
              <Link to="/auth" className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> Back to sign in
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
