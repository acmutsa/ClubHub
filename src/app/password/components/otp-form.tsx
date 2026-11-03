"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, Loader2, RotateCcw } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth/client";

const RESEND_COOLDOWN_SECONDS = 60;

type OtpFormProps = {
  email: string;
  onVerified: (code: string) => void;
  onChangeEmail: () => void;
};

export default function OtpForm({
  email,
  onVerified,
  onChangeEmail,
}: OtpFormProps) {
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(
    RESEND_COOLDOWN_SECONDS
  );
  const otpInputRef = useRef<HTMLInputElement>(null);
  const verificationInProgress = useRef(false);

  useEffect(() => {
    otpInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setTimeout(() => {
      setResendCooldown((seconds) => seconds - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCooldown]);

  async function handleVerifyOtp(code: string) {
    if (code.length !== 6 || verificationInProgress.current) return;

    verificationInProgress.current = true;
    setIsVerifyingOtp(true);
    setOtpError(null);
    let isVerified = false;

    try {
      const { error } = await authClient.emailOtp.checkVerificationOtp({
        email,
        otp: code,
        type: "forget-password",
      });

      if (error) {
        setOtpError("Your code is invalid or has expired.");
        setOtpCode("");
        return;
      }

      isVerified = true;
    } catch (error) {
      setOtpError(
        error instanceof Error
          ? error.message
          : "Unable to verify your code. Please try again."
      );
    } finally {
      setIsVerifyingOtp(false);
      verificationInProgress.current = false;
    }

    if (isVerified) onVerified(code);
  }

  async function handleResendCode() {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setOtpError(null);

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
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
        error instanceof Error
          ? error.message
          : "Unable to resend the code. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="grid w-full gap-6">
      <div className="flex flex-col items-center gap-2">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Verify Your Email</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter the 6-digit code sent to{" "}
          <span className="font-semibold text-foreground">{email}</span>.
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
              if (value.length === 6) void handleVerifyOtp(value);
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
            onClick={onChangeEmail}
            className="text-muted-foreground hover:text-foreground cursor-pointer text-xs underline-offset-4 transition-colors hover:underline"
          >
            Use a different email address
          </button>
        </div>
      </div>
    </div>
  );
}