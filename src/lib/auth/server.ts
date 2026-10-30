import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "USER", input: false },
      deletedAt: { type: "date", required: false, input: false },
    },
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data, request) {

            // Send an email to the user with a link to reset their password

        },
  },
  database: drizzleAdapter(db, {
    provider: "sqlite", // or "mysql", "sqlite"
  }),
  databaseHooks: {
    session: {
      create: {
        // Soft-deleted accounts can't sign in. Existing sessions are rejected in getCurrentUser.
        async before(session) {
          const [account] = await db
            .select({ deletedAt: user.deletedAt })
            .from(user)
            .where(eq(user.id, session.userId))
            .limit(1);

          if (account?.deletedAt) {
            throw new APIError("FORBIDDEN", { message: "This account is no longer active." });
          }
        },
      },
    },
  },
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

