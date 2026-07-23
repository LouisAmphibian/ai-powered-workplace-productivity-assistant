import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Email is required" })
  .email({ message: "Enter a valid email address" })
  .max(255);

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .max(72, { message: "Password must be less than 72 characters" })
  .regex(/[A-Z]/, { message: "Include at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Include at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Include at least one number" });

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required" }),
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const resetRequestSchema = z.object({ email: emailSchema });

export const newPasswordSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

/** Map Supabase auth errors to user-friendly messages. */
export function friendlyAuthError(err: unknown): string {
  const msg = (err as { message?: string } | null)?.message ?? "";
  const code = (err as { code?: string } | null)?.code ?? "";
  const lower = msg.toLowerCase();

  if (code === "email_not_confirmed" || lower.includes("email not confirmed"))
    return "Please verify your email first. Check your inbox (and spam folder) for the confirmation link.";
  if (lower.includes("invalid login credentials"))
    return "Incorrect email or password.";
  if (lower.includes("user already registered") || lower.includes("already been registered"))
    return "An account with this email already exists. Try signing in instead.";
  if (code === "weak_password" || lower.includes("password"))
    return msg || "Password does not meet security requirements.";
  if (lower.includes("rate limit") || lower.includes("too many"))
    return "Too many attempts. Please wait a minute and try again.";
  if (lower.includes("network") || lower.includes("fetch"))
    return "Network error. Check your connection and try again.";
  return msg || "Something went wrong. Please try again.";
}
