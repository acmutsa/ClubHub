"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GalleryVerticalEnd } from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const resetSchema = z
  .object({
    password: z.string().min(12, "Password must be at least 12 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    mode: "onTouched",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetFormValues) {
    if (!token) {
      form.setError("root", {
        message: "Invalid or missing password reset token.",
      });
      return;
    }

    try {
      const res = await authClient.resetPassword({
        newPassword: values.password,
        token,
      });

      if (res?.error) {
        form.setError("root", {
          message: res.error.message || "Failed to reset password.",
        });
        return;
      }

      setStatusMessage("Password has been reset successfully! Redirecting...");
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    } catch (err: any) {
      form.setError("root", {
        message: err?.message || "Something went wrong.",
      });
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-xs">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="grid grid-cols-1 gap-4">
            <h1 className="text-2xl font-bold">Set New Password</h1>
            <p className="text-muted-foreground text-balance text-sm">
              Please enter your new password below.
            </p>

            {statusMessage ? (
              <div className="grid gap-4">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {statusMessage}
                </p>
                <Button asChild variant="outline">
                  <Link href="/sign-in">Go to Sign In</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <div className="grid gap-6">
                  {form.formState.errors.root && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.root.message}
                    </p>
                  )}

                  {!token && (
                    <p className="text-destructive text-sm">
                      Missing reset token. Please use the link provided in your email.
                    </p>
                  )}

                  <div className="grid gap-3 text-left">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••••••"
                      {...form.register("password")}
                      disabled={form.formState.isSubmitting || !token}
                    />
                    {form.formState.errors.password && (
                      <p className="text-destructive text-xs">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-3 text-left">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••••••"
                      {...form.register("confirmPassword")}
                      disabled={form.formState.isSubmitting || !token}
                    />
                    {form.formState.errors.confirmPassword && (
                      <p className="text-destructive text-xs">
                        {form.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={form.formState.isSubmitting || !token}
                  >
                    {form.formState.isSubmitting ? "Resetting..." : "Reset Password"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="absolute top-6 left-6 flex justify-center gap-2 md:top-10 md:left-10 md:justify-start">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          UTSA Clubs
        </Link>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}