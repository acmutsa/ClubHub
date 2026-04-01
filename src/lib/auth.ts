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
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }
  },
  database: drizzleAdapter(db, {
    provider: "sqlite", // or "mysql", "sqlite"
  }),
  trustedOrigins: [
    "https://*.localhost:3000", "http://*.localhost:3000", "http://*.localtest.me:3000", "http://localtest.me:3000"
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: ".localtest.me",
    },
    defaultCookieAttributes: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
    },
  },
});

