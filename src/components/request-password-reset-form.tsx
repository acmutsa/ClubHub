"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Check,
  Circle,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import {
  getPasswordRequirements,
  requestResetSchema,
  resetPasswordSchema,
  type RequestResetInput,
  type ResetPasswordInput,
} from "@/lib/validators/password-reset";
import { authClient } from "@/lib/auth/client";

const RESEND_COOLDOWN_SECONDS = 60;

type Step = "email" | "otp" | "password";

export default function RequestPasswordResetForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const verificationInProgress = useRef(false);
  const [isCompleted, setIsCompleted] = useState(false);


  const emailForm = useForm<RequestResetInput>({
    resolver: zodResolver(requestResetSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

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
    if (isCompleted) {
      const timer = setTimeout(() => {
        router.replace("/sign-in");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setTimeout(() => {
      setResendCooldown((seconds) => seconds - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (step === "otp") {
      otpInputRef.current?.focus();
    }
  }, [step]);

  async function handleEmailSubmit(values: RequestResetInput) {
    const email = values.email.trim();
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "forget-password",
      });

      if (error) {
        emailForm.setError("root", {
          message: error.message || "Unable to send a verification code. Please try again.",
        });
        return;
      }

      setSubmittedEmail(email);
      setOtpCode("");
      setOtpError(null);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setStep("otp");
    } catch (error) {
      emailForm.setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "Unable to send a verification code. Please try again.",
      });
    }
  }

  async function handleVerifyOtp(code: string) {
    if (code.length !== 6 || verificationInProgress.current) return;

    verificationInProgress.current = true;
    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      const { error } = await authClient.emailOtp.checkVerificationOtp({
        email: submittedEmail,
        otp: code,
        type: "forget-password",
      });

      if (error) {
        setOtpError("Your code is invalid or has expired.");
        setOtpCode("");
        return;
      }

      setStep("password");
    } catch (error) {
      setOtpError(
        error instanceof Error ? error.message : "Unable to verify your code. Please try again."
      );
    } finally {
      setIsVerifyingOtp(false);
      verificationInProgress.current = false;
    }
  }

  async function handleResendCode() {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setOtpError(null);

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: submittedEmail,
        type: "forget-password",
      });

      if (error) {
        setOtpError(error.message || "Unable to resend the code. Please try again.");
        return;
      }

      setOtpCode("");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setOtpError(
        error instanceof Error ? error.message : "Unable to resend the code. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  }

  async function handlePasswordSubmit(values: ResetPasswordInput) {
    try {
      const { error } = await authClient.emailOtp.resetPassword({
        email: submittedEmail,
        otp: otpCode,
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

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6 text-center">
          {step === "email" && (
            <div className="grid w-full gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <KeyRound className="size-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your email address and we will send you a 6-digit verification code.
                </p>
              </div>

              <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} noValidate>
                <div className="grid gap-4">
                  <div className="grid gap-2 text-left">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="m@example.com"
                      disabled={emailForm.formState.isSubmitting}
                      {...emailForm.register("email")}
                      className={cn(
                        emailForm.formState.errors.email &&
                          "border-destructive focus-visible:ring-destructive"
                      )}
                    />
                    {emailForm.formState.errors.email && (
                      <p className="text-destructive text-xs">
                        {emailForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {emailForm.formState.errors.root && (
                    <p className="text-destructive text-sm">
                      {emailForm.formState.errors.root.message}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={emailForm.formState.isSubmitting}
                  >
                    {emailForm.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Sending verification code...
                      </>
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>
                </div>
              </form>

              <Link
                href="/sign-in"
                className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1.5 text-sm transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                Back to Sign In
              </Link>
            </div>
          )}

          {step === "otp" && (
            <div className="grid w-full gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="size-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Verify Your Email</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-semibold text-foreground">{submittedEmail}</span>.
                </p>
              </div>

              {otpError && (
                <p className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-left text-destructive text-sm">
                  {otpError}
                </p>
              )}

              <div className="grid gap-4">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Label htmlFor="otp-input" className="sr-only">
                    6-digit verification code
                  </Label>
                  <InputOTP
                    ref={otpInputRef}
                    id="otp-input"
                    maxLength={6}
                    value={otpCode}
                    onChange={(value) => {
                      setOtpCode(value);
                      setOtpError(null);
                      if (value.length === 6) handleVerifyOtp(value);
                    }}

                    disabled={isVerifyingOtp || isResending}
                    autoFocus
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                  {isVerifyingOtp && (
                    <span className="text-muted-foreground inline-flex items-center gap-2 text-sm">
                      <Loader2 className="size-4 animate-spin" />
                      Verifying code...
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2 pt-2 text-sm">
                  <div className="text-muted-foreground flex items-center gap-1.5">
                    <span>Didn&apos;t receive the code?</span>
                    {resendCooldown > 0 ? (
                      <span className="font-medium text-foreground">
                        Resend in {resendCooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        disabled={isResending || isVerifyingOtp}
                        className="text-primary hover:underline inline-flex cursor-pointer items-center gap-1 font-medium disabled:opacity-50"
                      >
                        {isResending && <RotateCcw className="size-3 animate-spin" />}
                        Resend code
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isResending || isVerifyingOtp}
                    onClick={() => {
                      setStep("email");
                      setOtpCode("");
                      setOtpError(null);
                    }}
                    className="text-muted-foreground hover:text-foreground cursor-pointer text-xs underline-offset-4 transition-colors hover:underline"
                  >
                    Use a different email address
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === "password" && (
            isCompleted ? (
              <div
                role="status"
                aria-live="polite"
                className="flex w-full flex-col items-center gap-3 text-center"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Check className="size-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Password Updated
                </h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Your password was successfully updated. You&apos;ll be redirected
                  to the sign-in page shortly.
                </p>
              </div>
            ) : (
              <div className="grid w-full gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <LockKeyhole className="size-6" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">Set New Password</h1>
                  <p className="text-muted-foreground text-sm text-balance">
                    Choose a new password for {submittedEmail}.
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
                        passwordForm.formState.isSubmitting ||
                        !passwordRequirementsMet
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
            )
          )}
        </div>
      </div>
    </div>
  );
}
