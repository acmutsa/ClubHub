import { z } from "zod";
import type { getClubEventById } from "@/app/clubs/[clubId]/queries";
import {
  createEventFormSchema,
  eventFiltersSchema,
  eventSchema,
  insertEventFormSchema,
  updateEventSchema,
} from "@/lib/validators/event";
import {
  createEventCategorySchema,
  eventCategorySchema,
  updateEventCategorySchema,
} from "@/lib/validators/event-category";
import {
  checkInSchema,
  createCheckInSchema,
  insertCheckInSchema,
} from "@/lib/validators/check-in";
import {
  createNotificationLogSchema,
  insertNotificationLogSchema,
  notificationLogFiltersSchema,
  notificationLogSchema,
  updateNotificationLogSchema,
} from "@/lib/validators/notification-log";

// Event
export type Event = z.infer<typeof eventSchema>;
export type AdminEvent = NonNullable<Awaited<ReturnType<typeof getClubEventById>>>;
export type CreateEventInput = z.infer<typeof createEventFormSchema>;
export type InsertEventInput = z.infer<typeof insertEventFormSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type EventFilters = z.infer<typeof eventFiltersSchema>;

// Event category
export type EventCategory = z.infer<typeof eventCategorySchema>;
export type CreateEventCategoryInput = z.infer<typeof createEventCategorySchema>;
export type UpdateEventCategoryInput = z.infer<typeof updateEventCategorySchema>;

// Event check-in
export type CheckIn = z.infer<typeof checkInSchema>;
export type CreateCheckInInput = z.infer<typeof createCheckInSchema>;
export type InsertCheckInInput = z.infer<typeof insertCheckInSchema>;

// Event notification log
export type NotificationLog = z.infer<typeof notificationLogSchema>;
export type CreateNotificationLogInput = z.infer<typeof createNotificationLogSchema>;
export type InsertNotificationLogInput = z.infer<typeof insertNotificationLogSchema>;
export type UpdateNotificationLogInput = z.infer<typeof updateNotificationLogSchema>;
export type NotificationLogFilters = z.infer<typeof notificationLogFiltersSchema>;
