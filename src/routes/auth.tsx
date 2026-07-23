import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";
import { signInSchema, signUpSchema, friendlyAuthError } from "@/lib/auth-validation";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — WorkSpace AI" },
      { name: "description", content: "Sign in or create your WorkSpace AI account." },
      { property: "og:title", content: "Sign in — WorkSpace AI" },
      { property: "og:description", content: "Sign in or create your WorkSpace AI account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState<false | "in" | "up" | "google">(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app" });
    });
  }, [navigate]);

  const validate = (schema: typeof signInSchema | typeof signUpSchema) => {
    const result = schema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as "email" | "password";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(signInSchema)) return;
    setLoading("in");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) return toast.error(friendlyAuthError(error));
    toast.success("Welcome back");
    navigate({ to: "/app" });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(signUpSchema)) return;
    setLoading("up");
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin + "/app" },
    });
    setLoading(false);
    if (error) return toast.error(friendlyAuthError(error));
    // Supabase returns an obfuscated user with empty identities when the email already exists.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return toast.error("An account with this email already exists. Try signing in instead.");
    }
    toast.success(
      "Account created. Check your inbox (and spam folder) for the verification email.",
      { duration: 7000 },
    );
  };

  const handleGoogle = async () => {
    setLoading("google");
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (res.error) {
      setLoading(false);
      return toast.error(res.error.message ?? "Google sign-in failed");
    }
    if (res.redirected) return;
    navigate({ to: "/app" });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-background to-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="mx-auto mb-2 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold">WorkSpace AI</span>
          </Link>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={!!loading}>
            {loading === "google" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or with email</span>
            </div>
          </div>
          <Tabs defaultValue="signin" onValueChange={() => setErrors({})}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-3" noValidate>
                <Field id="in-email" label="Email" value={email} onChange={setEmail} type="email" error={errors.email} />
                <Field
                  id="in-pw"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  type="password"
                  error={errors.password}
                  autoComplete="current-password"
                />
                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Button className="w-full" disabled={!!loading}>
                  {loading === "in" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign in
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-3" noValidate>
                <Field id="up-email" label="Email" value={email} onChange={setEmail} type="email" error={errors.email} />
                <Field
                  id="up-pw"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  type="password"
                  error={errors.password}
                  autoComplete="new-password"
                  hint="At least 8 characters with upper, lower, and a number."
                />
                <Button className="w-full" disabled={!!loading}>
                  {loading === "up" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree AI outputs may contain errors and should be reviewed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  error,
  hint,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  hint?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        autoComplete={autoComplete ?? (type === "password" ? "current-password" : "email")}
      />
      {error ? (
        <p id={`${id}-err`} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
