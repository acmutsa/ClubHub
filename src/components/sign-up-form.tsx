'use client'
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import * as z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";

const signUpSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .regex(/^[A-Za-z\s'-]+$/, "Invalid first name"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .regex(/^[A-Za-z\s'-]+$/, "Invalid last name"),
  email: z.email("Invalid email"),
  password: z.string().min(8, "Invalid password"),
});
export default function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"form">) {

  const router = useRouter();
  const form = useForm<z.infer<typeof signUpSchema>>({
      resolver:zodResolver(signUpSchema),
      mode: "onChange",
      defaultValues:{
        email: "",
        password: "",
        firstName: "",
        lastName: "",
      }
    });
  async function submitForm(values: z.infer<typeof signUpSchema>){
  
  
      const res = await signUp.email({
        email: values.email,
        password: values.password,
        name: `${values.firstName} ${values.lastName}`,
         callbackURL: "/",
         fetchOptions: {
          onSuccess: async () => router.push("/"),
        },

      })
      if (res.error) {
        form.setError("root", {
          message: res.error.message || "Failed to create account",
        });
        return;
      }
  }
  
  return (
    <form onSubmit={form.handleSubmit(submitForm)} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign up for an account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to sign up for an account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-3">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" type="text" placeholder="John"  {...form.register("firstName")}  className={cn(form.formState.errors.firstName && "border-red-500 focus-visible:ring-red-500")} required />
          {form.formState.errors.firstName && (
            <p className="text-red-500 text-sm">{form.formState.errors.firstName.message}</p>
          )}
        </div>
        <div className="grid gap-3">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" type="text" placeholder="Appleseed" {...form.register("lastName")}  className={cn(form.formState.errors.lastName && "border-red-500 focus-visible:ring-red-500")} required />
           {form.formState.errors.lastName && (
            <p className="text-red-500 text-sm">{form.formState.errors.lastName.message}</p>
          )}
        </div>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" {...form.register("email")} className={cn(form.formState.errors.email && "border-red-500 focus-visible:ring-red-500")} required />
           {form.formState.errors.email && (
            <p className="text-red-500 text-sm">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input id="password" type="password" required  {...form.register("password")} className={cn(form.formState.errors.password && "border-red-500 focus-visible:ring-red-500")}/>
            {form.formState.errors.password && (
            <p className="text-red-500 text-sm">{form.formState.errors.password.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" >
        Sign Up
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <Button variant="outline" className="w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              fill="currentColor"
            />
          </svg>
          Sign up with GitHub
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <a href="/sign-in" className="underline underline-offset-4">
          Sign in
        </a>
      </div>
    </form>
  );
}
