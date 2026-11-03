"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OtpForm from "./otp-form";
import SubmitPasswordReset from "./submit-password-reset";
import { cn } from "@/lib/utils";
import {
  requestResetSchema,
  type RequestResetInput,
} from "@/lib/types/password-reset";
import { authClient } from "@/lib/auth/client";

type Step = "email" | "otp" | "password";

export default function RequestPasswordResetForm() {
  const [step, setStep] = useState<Step>("email");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const emailForm = useForm<RequestResetInput>({
    resolver: zodResolver(requestResetSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  async function handleEmailSubmit(values: RequestResetInput) {
    const email = values.email.trim();
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "forget-password",
      });

      if (error) {
        emailForm.setError("root", {
          message:
            error.message ||
            "Unable to send a verification code. Please try again.",
        });
        return;
      }

      setSubmittedEmail(email);
      setOtpCode("");
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
                <h1 className="text-2xl font-bold tracking-tight">
                  Forgot Password
                </h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your email address and we will send you a 6-digit
                  verification code.
                </p>
              </div>

              <form
                onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
                noValidate
              >
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
            <OtpForm
              email={submittedEmail}
              onVerified={(code) => {
                setOtpCode(code);
                setStep("password");
              }}
              onChangeEmail={() => {
                setStep("email");
                setOtpCode("");
              }}
            />
          )}

          {step === "password" && (
            <SubmitPasswordReset email={submittedEmail} otp={otpCode} />
          )}
        </div>
      </div>
    </div>
  );
}
