import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { notificationLogs } from "@/db/schema";
import { idSchema, paginationSchema } from "@/lib/validators/common";


export const notificationLogSchema = createSelectSchema(notificationLogs);

export const createNotificationLogSchema = z.object({
  eventId: idSchema,
  scheduledAt: z.date({ message: "Scheduled time is required" }).refine((date) => date > new Date(), "Scheduled time must be in the future"),
});

export const insertNotificationLogSchema = createNotificationLogSchema.extend({
  userId: idSchema,
});

export const updateNotificationLogSentSchema = z.object({
  status: z.literal("sent"),
  sentAt: z.date({ message: "Sent time is required" }),
  error: z.null().default(null),
});

export const updateNotificationLogFailedSchema = z.object({
  status: z.literal("failed"),
  error: z.string({ message: "Error is required" }).trim().min(1, "Error is required").max(1000, "Error is too long"),
  sentAt: z.null().default(null),
});

export const updateNotificationLogSkippedSchema = z.object({
  status: z.literal("skipped"),
  error: z.string({ message: "Error is required" }).trim().min(1, "Error is required").max(1000, "Error is too long").nullable().default(null),
  sentAt: z.null().default(null),
});

export const updateNotificationLogSchema = z.discriminatedUnion("status", [
  updateNotificationLogSentSchema,
  updateNotificationLogFailedSchema,
  updateNotificationLogSkippedSchema,
]);

export const notificationLogFiltersSchema = paginationSchema.extend({
  status: z.enum(notificationLogs.status.enumValues).optional(),
  eventId: idSchema,
});
