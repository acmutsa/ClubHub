"use client";
import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const forgotPasswordSchema = z.object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
});


export default function PasswordResetForm() {

    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        mode: "onTouched",
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
        try {
            const res = await authClient.requestPasswordReset({
                email: values.email,
                redirectTo: "/password/reset",
            });
            if (res?.error) {
                return;
            }
            setStatusMessage("If an account exists with that email, a password reset link has been sent.");
        } catch (err: any) {
            form.setError("root", { message: err?.message || "Something went wrong." });
        }
    }


    return (
        <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="grid grid-cols-1 gap-4">
                        <h1 className="text-2xl font-bold">Forgot Password</h1>
                        <p className="text-muted-foreground text-sm text-balance">
                            Enter your email below to reset your password
                        </p>
                        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
                            <div className="grid gap-6">
                                <div className="grid gap-3 text-left">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        {...form.register("email")}
                                        className={cn(form.formState.errors.email && "border-red-500 focus-visible:ring-red-500")}
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
                                {statusMessage && (
                                    <p className="text-muted-foreground text-sm text-balance">
                                        {statusMessage}
                                    </p>
                                )}
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? "Sending..." : "Reset Password"}
                                </Button>
                            </div>
                        </form>

                    </div>

                </div>
            </div>
        </div>
    )
}