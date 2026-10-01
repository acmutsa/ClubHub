import { createSelectSchema } from "drizzle-zod";
import { notificationLogs } from "@/db/schema";

// Notification Log (written by the server only, so there is no input schema)
export const notificationLogSchema = createSelectSchema(notificationLogs);
