import * as z from "zod";

export const requestResetSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>\-_+=\[\]\\/`~]/;

const PASSWORD_REQUIREMENTS = {
  length: {
    label: "Minimum of 8 characters",
    message: "Password must be at least 8 characters",
  },
  uppercase: {
    label: "At least one uppercase letter (A-Z)",
    message: "Password must contain at least one uppercase letter",
  },
  lowercase: {
    label: "At least one lowercase letter (a-z)",
    message: "Password must contain at least one lowercase letter",
  },
  number: {
    label: "At least one number (0-9)",
    message: "Password must contain at least one number",
  },
  special: {
    label: "At least one special character (e.g., $&!@%)",
    message: "Password must contain at least one special character (e.g., $&!@%)",
  },
} as const;

export const passwordSchema = z
  .string()
  .min(8, PASSWORD_REQUIREMENTS.length.message)
  .max(128, "Password must be 128 characters or fewer")
  .regex(/[A-Z]/, PASSWORD_REQUIREMENTS.uppercase.message)
  .regex(/[a-z]/, PASSWORD_REQUIREMENTS.lowercase.message)
  .regex(/[0-9]/, PASSWORD_REQUIREMENTS.number.message)
  .regex(SPECIAL_CHAR_REGEX, PASSWORD_REQUIREMENTS.special.message);

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
  const result = passwordSchema.safeParse(password);
  const failedMessages = new Set(
    result.success ? [] : result.error.issues.map((issue) => issue.message)
  );

  return Object.entries(PASSWORD_REQUIREMENTS).map(([id, { label, message }]) => ({
    id,
    label,
    satisfied: !failedMessages.has(message),
  }));
}
