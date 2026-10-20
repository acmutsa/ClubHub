"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
} from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  getPasswordRequirements,
  getPasswordStrength,
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validators/password-reset";

type Props = {
  token: string;
};

export function ResetPasswordForm({ token }: Props) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const watchedPassword = form.watch("password") || "";
  const watchedConfirmPassword = form.watch("confirmPassword") || "";

  const requirements = getPasswordRequirements(watchedPassword);
  const passwordsMatch =
    watchedPassword.length > 0 &&
    watchedConfirmPassword.length > 0 &&
    watchedPassword === watchedConfirmPassword;

  const strength = getPasswordStrength(watchedPassword);

  async function onSubmit(values: ResetPasswordInput) {
    try {
      const res = await authClient.resetPassword({
        newPassword: values.password,
        token,
      });

      if (res?.error) {
        form.setError("root", {
          message: res.error.message || "Failed to reset password. The token may have expired.",
        });
        return;
      }

      setStatusMessage("Password has been reset successfully! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      form.setError("root", { message });
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="grid gap-2">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <KeyRound className="size-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Set New Password</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Please enter your new password below. Make sure it satisfies all the security requirements.
            </p>
          </div>

          {statusMessage ? (
            <div className="w-full rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center shadow-xs">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-6" />
              </div>
              <h2 className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                Password Reset Complete
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">{statusMessage}</p>
              <div className="mt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/sign-in">Go to Sign In</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
              className="w-full text-left"
            >
              <div className="grid gap-5">
                {form.formState.errors.root && (
                  <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm">
                    {form.formState.errors.root.message}
                  </div>
                )}

                {/* New Password */}
                <div className="grid gap-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      disabled={form.formState.isSubmitting}
                      {...form.register("password")}
                      className={cn(
                        "pr-10",
                        form.formState.errors.password &&
                          "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-destructive text-xs">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Password Strength Meter */}
                {watchedPassword.length > 0 && (
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Password strength:</span>
                      <span
                        className={cn(
                          "font-medium",
                          strength.score === 1 && "text-red-500",
                          strength.score === 2 && "text-amber-500",
                          strength.score === 3 && "text-blue-500",
                          strength.score === 4 && "text-emerald-500"
                        )}
                      >
                        {strength.label}
                      </span>
                    </div>
                    <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className={cn("h-full transition-all duration-300", strength.colorClass)}
                        style={{ width: `${strength.percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Confirm Password */}
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      disabled={form.formState.isSubmitting}
                      {...form.register("confirmPassword")}
                      className={cn(
                        "pr-10",
                        form.formState.errors.confirmPassword &&
                          "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      tabIndex={-1}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer transition-colors"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-destructive text-xs">
                      {form.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Password Requirements Checklist */}
                <div className="rounded-lg border bg-muted/40 p-3.5 text-xs">
                  <div className="mb-2.5 flex items-center gap-1.5 font-medium text-foreground">
                    <Lock className="size-3.5" />
                    <span>Password Requirements:</span>
                  </div>
                  <ul className="grid gap-1.5">
                    {requirements.map((req) => (
                      <li
                        key={req.id}
                        className={cn(
                          "flex items-center gap-2 transition-colors",
                          req.satisfied
                            ? "text-emerald-600 dark:text-emerald-400 font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {req.satisfied ? (
                          <Check className="size-3.5 shrink-0 stroke-[2.5]" />
                        ) : (
                          <Circle className="size-3 shrink-0 opacity-40" />
                        )}
                        <span>{req.label}</span>
                      </li>
                    ))}
                    <li
                      className={cn(
                        "flex items-center gap-2 transition-colors",
                        passwordsMatch
                          ? "text-emerald-600 dark:text-emerald-400 font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {passwordsMatch ? (
                        <Check className="size-3.5 shrink-0 stroke-[2.5]" />
                      ) : (
                        <Circle className="size-3 shrink-0 opacity-40" />
                      )}
                      <span>Passwords match</span>
                    </li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
