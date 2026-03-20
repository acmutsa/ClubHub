import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Resend } from 'resend'; 
const resend = new Resend(process.env.RESEND_API_KEY);

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
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: "diego.medina@my.utsa.edu",
        subject: "Reset password",
        html: `<a href="${url}">Reset</a>`,
      });
    },
  },
  
  database: drizzleAdapter(db, {
    provider: "sqlite", // or "mysql", "sqlite"
  }),
  trustedOrigins: [
    "https://*.localhost:3000","http://*.localhost:3000"
  ]
});

