import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_API_URL: z.url(),
});

export const clientEnv = schema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
