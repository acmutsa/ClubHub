"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail, RotateCcw } from "lucide-react";

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
  requestResetSchema,
  type RequestResetInput,
} from "@/lib/validators/password-reset";
import {
  requestPasswordResetCodeAction,
  verifyPasswordResetCodeAction,
} from "@/app/password/actions";
import { authClient } from "@/lib/auth/client";


const RESEND_COOLDOWN_SECONDS = 60;

export default function RequestPasswordResetForm() {
  const router = useRouter();

  // "email" -> user enters email
  // "otp" -> user enters 6-digit code on the same page
  const [step, setStep] = useState<"email" | "otp">("email");
  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  const [otpCode, setOtpCode] = useState<string>("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [resendNotification, setResendNotification] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  // Email step form
  const emailForm = useForm<RequestResetInput>({
    resolver: zodResolver(requestResetSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
    },
  });

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Step 1: Submit email
  async function handleEmailSubmit(values: RequestResetInput) {
      emailForm.clearErrors();
      const { error } = await authClient.emailOtp.sendVerificationOtp({ email: values.email, type: "forget-password"});

      if ( error ) {
        emailForm.setError("root", { message: error.message ?? "Something went wrong" });
        return;
      }

      setSubmittedEmail(values.email);
      setStep("otp");
      setOtpCode("");
      setOtpError(null);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setResendNotification(null);
    }
  // Handle Step 2: Verify 6-digit code
  async function handleVerifyOtp(codeToVerify?: string) {
    const code = (codeToVerify ?? otpCode).trim();
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setOtpError("Please enter the full 6-digit verification code.");
      return;
    }

    try {
      setIsVerifyingOtp(true);
      setOtpError(null);
      setResendNotification(null);

      const res = await verifyPasswordResetCodeAction({
        email: submittedEmail,
        code,
      });

      if (!res.ok) {
        setOtpError(res.message);
        return;
      }

      setIsRedirecting(true);
      // Redirect to the tokenized reset password page
      router.push(`/password/reset?token=${encodeURIComponent(res.token)}`);
    } catch {
      setOtpError("Failed to verify code. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  // Handle resending the verification code
  async function handleResendCode() {
    if (resendCooldown > 0 || isResending || !submittedEmail) return;

    try {
      setIsResending(true);
      setOtpError(null);
      setResendNotification(null);

      const res = await requestPasswordResetCodeAction({ email: submittedEmail });
      if (res.ok) {
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
        setResendNotification("A new verification code has been dispatched.");
        setOtpCode("");
      } else {
        setOtpError(res.error.message);
      }
    } catch {
      setOtpError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-6 text-center">
          {step === "email" ? (
            /* STEP 1: Enter Email */
            <div className="w-full grid gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <KeyRound className="size-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your email address and we will send you a 6-digit verification code to reset your password.
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
                    <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm">
                      {emailForm.formState.errors.root.message}
                    </div>
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

              <div className="text-center text-sm">
                <Link
                  href="/sign-in"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="size-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            /* STEP 2: Enter 6-digit OTP code (On the same page) */
            <div className="w-full grid gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Mail className="size-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Enter Verification Code</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  If an account exists for <span className="font-semibold text-foreground">{submittedEmail}</span>, a 6-digit verification code has been sent.
                </p>
              </div>

              {resendNotification && (
                <div className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-2.5 text-xs text-emerald-600 dark:text-emerald-400 text-left">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{resendNotification}</span>
                </div>
              )}

              {otpError && (
                <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-destructive text-sm text-left">
                  {otpError}
                </div>
              )}

              <div className="grid gap-4">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Label htmlFor="otp-input" className="sr-only">
                    6-digit verification code
                  </Label>
                  <InputOTP
                    id="otp-input"
                    maxLength={6}
                    value={otpCode}
                    onChange={(val) => {
                      setOtpCode(val);
                      setOtpError(null);
                      if (val.length === 6) {
                        handleVerifyOtp(val);
                      }
                    }}
                    disabled={isVerifyingOtp || isRedirecting}
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
                </div>

                <Button
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  className="w-full"
                  disabled={otpCode.length !== 6 || isVerifyingOtp || isRedirecting}
                >
                  {isVerifyingOtp || isRedirecting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      {isRedirecting ? "Verified! Redirecting..." : "Verifying code..."}
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>

                {/* Resend Code Section */}
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
                        disabled={isResending || isVerifyingOtp || isRedirecting}
                        className="text-primary hover:underline font-medium inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isResending && <RotateCcw className="size-3 animate-spin" />}
                        Resend code
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setOtpCode("");
                      setOtpError(null);
                      setResendNotification(null);
                    }}
                    className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline cursor-pointer transition-colors"
                  >
                    Use a different email address
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

