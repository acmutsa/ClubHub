import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { sendPasswordResetEmail } from "./email/password-reset";
export const auth = betterAuth({
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "user",
        input: false,
      },
    },
  },
    emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ user,url });
    },
    revokeSessionsOnPasswordReset: true, //disable use of link twice
    resetPasswordTokenExpiresIn: 900, // 15 min timeout of link after generation
  },
  
  database: drizzleAdapter(db, {
    provider: "sqlite", // or "mysql", "sqlite"
  }),
  trustedOrigins: [
    "https://*.localhost:3000","http://*.localhost:3000"
  ]
});

