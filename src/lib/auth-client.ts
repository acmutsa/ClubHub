import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins"
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
})

export const {
    signIn,
    signOut,
    signUp,
    useSession
} = authClient;
