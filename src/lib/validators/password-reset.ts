import * as z from "zod";

export const requestResetSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>\-_+=\[\]\\/`~]/;

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be 128 characters or fewer")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    SPECIAL_CHAR_REGEX,
    "Password must contain at least one special character (e.g., $&!@%)"
  );

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RequestResetInput = z.infer<typeof requestResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export type PasswordRequirement = {
  id: string;
  label: string;
  satisfied: boolean;
};

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    {
      id: "length",
      label: "Minimum of 8 characters",
      satisfied: password.length >= 8,
    },
    {
      id: "uppercase",
      label: "At least one uppercase letter (A-Z)",
      satisfied: /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: "At least one lowercase letter (a-z)",
      satisfied: /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "At least one number (0-9)",
      satisfied: /[0-9]/.test(password),
    },
    {
      id: "special",
      label: "At least one special character (e.g., $&!@%)",
      satisfied: SPECIAL_CHAR_REGEX.test(password),
    },
  ];
}
