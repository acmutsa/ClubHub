import { z } from "zod";
import {
  adminEventSelectSchema,
  baseEventSelectSchema,
} from "@/features/club-admin/events/lib/validators/event";

export type SelectEvent = z.infer<typeof baseEventSelectSchema>;
export type AdminSelectEvent = z.infer<typeof adminEventSelectSchema>;
