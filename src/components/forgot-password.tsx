'use client'

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { authClient } from "@/lib/auth-client"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email" })
    .min(1, { message: "Email is required" }),
})

export default function ForgotPasswordForm() {
  const [success, setSuccess] = useState<string | null>(null)

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  })

  async function onSubmit(values: z.infer<typeof ForgotPasswordSchema>) {
    setSuccess(null)
    console.log("sending reset email to", values.email);
    await authClient.forgetPassword(
      {
        email: values.email,
        redirectTo: "/auth/reset-password",
      },
      {
        onSuccess: () => {
          setSuccess("If your account exists, a reset link will be sent.")
          form.reset()
        },
        onError: (ctx) => {
          form.setError("root", {
            message: ctx.error.message,
          })
        },
      }
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Forgot password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to receive a reset link
        </p>
      </div>

      <div className="grid gap-3">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-red-500 text-sm">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      {form.formState.errors.root && (
        <p className="text-red-500 text-sm">
          {form.formState.errors.root.message}
        </p>
      )}

      {success && (
        <p className="text-sm p-0">
          {success}
        </p>
      )}

      <Button
        type="submit"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  )
}