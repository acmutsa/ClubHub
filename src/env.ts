import { z } from "zod";

const schema = z.object({
  TURSO_DATABASE_URL: z.url(),
  TURSO_AUTH_TOKEN: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  NEXT_PUBLIC_API_URL: z.url(),
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
});

export const env = schema.parse(process.env);
