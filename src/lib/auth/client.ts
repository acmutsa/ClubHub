import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { clientEnv } from "@/env.client";
import type { auth } from "./server";

export const authClient = createAuthClient({
  baseURL: clientEnv.NEXT_PUBLIC_API_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
})

export const {
    signIn,
    signOut,
    signUp,
    useSession
} = authClient;
