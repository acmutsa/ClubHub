import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "USER", input: false },
      deletedAt: { type: "date", required: false, input: false },
    },
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword() {

            // Send an email to the user with a link to reset their password

        },
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
    "https://*.localhost:3000","http://*.localhost:3000"
  ]
});
