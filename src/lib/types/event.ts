import { z } from "zod";
import {
  adminEventSchema,
  eventSchema,
} from "@/lib/validators/event";

export type Event = z.infer<typeof eventSchema>;
export type AdminEvent = z.infer<typeof adminEventSchema>;
