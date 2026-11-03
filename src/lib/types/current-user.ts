import type { getCurrentUser } from "@/lib/auth/current-user";

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
