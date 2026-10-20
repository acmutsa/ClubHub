import * as z from "zod";

export const requestResetSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  code: z
    .string()
    .length(6, "Verification code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Verification code must contain only numbers"),
});

export const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>\-_+=\[\]\\/`~]/;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be 128 characters or fewer")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        SPECIAL_CHAR_REGEX,
        "Password must contain at least one special character (e.g., $&!@%)"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RequestResetInput = z.infer<typeof requestResetSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
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

export type PasswordStrength = {
  score: number;
  label: "Weak" | "Fair" | "Good" | "Strong";
  colorClass: string;
  percentage: number;
};

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: "Weak", colorClass: "bg-muted", percentage: 0 };
  }

  const requirements = getPasswordRequirements(password);
  const passedCount = requirements.filter((r) => r.satisfied).length;

  if (passedCount <= 2) {
    return {
      score: 1,
      label: "Weak",
      colorClass: "bg-red-500",
      percentage: 25,
    };
  }
  if (passedCount === 3 || passedCount === 4) {
    return {
      score: 2,
      label: "Fair",
      colorClass: "bg-amber-500",
      percentage: 50,
    };
  }
  if (passedCount === 5 && password.length < 12) {
    return {
      score: 3,
      label: "Good",
      colorClass: "bg-blue-500",
      percentage: 75,
    };
  }
  return {
    score: 4,
    label: "Strong",
    colorClass: "bg-emerald-500",
    percentage: 100,
  };
}
