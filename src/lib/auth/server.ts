import { db } from "@/db";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins/email-otp";
import { passwordSchema } from "@/lib/validators/password-reset";

export const auth = betterAuth({
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "USER", input: false },
      deletedAt: { type: "date", required: false, input: false },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    async sendResetPassword({ url }) {
      // Send an email to the user with a link to reset their password=
      console.log("Password reset link: \n", url);
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  hooks: {
    before: createAuthMiddleware(async (context) => {
      const password =
        context.path === "/email-otp/reset-password"
          ? context.body.password
          : context.path === "/reset-password"
            ? context.body.newPassword
            : undefined;

      if (password === undefined) return;

      const result = passwordSchema.safeParse(password);
      if (!result.success) {
        throw new APIError("BAD_REQUEST", {
          message: result.error.issues[0]?.message ?? "Password does not meet the requirements.",
        });
      }
    }),
  },

  database: drizzleAdapter(db, {
    provider: "sqlite", // or "mysql", "sqlite"
  }),
  advanced: {
    database: {
      // UUIDs so user ids pass idSchema like every other table's id
      generateId: () => crypto.randomUUID(),
    },
  },
  trustedOrigins: [
    "https://*.localhost:3000", "http://*.localhost:3000"
  ],
  plugins: [
    emailOTP({
        otpLength: 6,
        expiresIn: 300,
        allowedAttempts: 3,
        async sendVerificationOTP({ email, otp, type }){
          if( type === "forget-password"){
          console.log(`User with email: ${email} requested reset \n'OTP is: ${otp}'`)
          }
      }
    })
  ]
});
