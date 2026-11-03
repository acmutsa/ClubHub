"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Circle, Loader2, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  getPasswordRequirements,
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/types/password-reset";
import { authClient } from "@/lib/auth/client";

type SubmitPasswordResetProps = {
  email: string;
  otp: string;
};

export default function SubmitPasswordReset({
  email,
  otp,
}: SubmitPasswordResetProps) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(false);

  const passwordForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: { password: "", confirmPassword: "" },
  });
  const passwordRequirements = getPasswordRequirements(
    passwordForm.watch("password") || ""
  );
  const passwordRequirementsMet = passwordRequirements.every(
    (requirement) => requirement.satisfied
  );

  useEffect(() => {
    if (!isCompleted) return;

    const timer = setTimeout(() => {
      router.replace("/sign-in");
    }, 3000);
    return () => clearTimeout(timer);
  }, [isCompleted, router]);

  async function handlePasswordSubmit(values: ResetPasswordInput) {
    try {
      const { error } = await authClient.emailOtp.resetPassword({
        email,
        otp,
        password: values.password,
      });

      if (error) {
        passwordForm.setError("root", {
          message: error.message || "Unable to reset your password. Please try again.",
        });
        return;
      }

      setIsCompleted(true);
    } catch (error) {
      passwordForm.setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "Unable to reset your password. Please try again.",
      });
    }
  }

  if (isCompleted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex w-full flex-col items-center gap-3 text-center"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Check className="size-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Password Updated</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Your password was successfully updated. You&apos;ll be redirected to
          the sign-in page shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="grid w-full gap-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LockKeyhole className="size-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Set New Password</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Choose a new password for {email}.
        </p>
      </div>

      <form
        onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
        noValidate
        className="text-left"
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              disabled={passwordForm.formState.isSubmitting}
              {...passwordForm.register("password")}
              className={cn(
                passwordForm.formState.errors.password &&
                  "border-destructive focus-visible:ring-destructive"
              )}
            />
            {passwordForm.formState.errors.password && (
              <p className="text-destructive text-xs">
                {passwordForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              disabled={passwordForm.formState.isSubmitting}
              {...passwordForm.register("confirmPassword")}
              className={cn(
                passwordForm.formState.errors.confirmPassword &&
                  "border-destructive focus-visible:ring-destructive"
              )}
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-destructive text-xs">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <ul
            aria-label="Password requirements"
            className="grid gap-1.5 text-xs"
          >
            {passwordRequirements.map((requirement) => (
              <li
                key={requirement.id}
                className={cn(
                  "flex items-center gap-2 transition-colors",
                  requirement.satisfied
                    ? "font-medium text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground"
                )}
              >
                {requirement.satisfied ? (
                  <Check className="size-3.5 shrink-0 stroke-[2.5]" />
                ) : (
                  <Circle className="size-3 shrink-0 opacity-40" />
                )}
                <span>{requirement.label}</span>
              </li>
            ))}
          </ul>

          {passwordForm.formState.errors.root && (
            <p className="text-destructive text-sm">
              {passwordForm.formState.errors.root.message}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={
              passwordForm.formState.isSubmitting || !passwordRequirementsMet
            }
          >
            {passwordForm.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Resetting password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}