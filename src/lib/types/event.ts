import { z } from "zod";
import {
  adminEventSelectSchema,
  baseEventSelectSchema,
} from "@/lib/validators/event";

export type SelectEvent = z.infer<typeof baseEventSelectSchema>;
export type AdminSelectEvent = z.infer<typeof adminEventSelectSchema>;

export interface AdminEventRow {
  id: number;
  title: string;
  description: string;

  start: Date;
  end: Date;
  checkInStart: Date;
  checkInEnd: Date;

  createdById: string | null;
  createdByName: string;

  updatedById: string | null;
  updatedByName: string;

  location: number | null;
  eventTypeId: number;
  points: number;
  hidden: boolean;
}