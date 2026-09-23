import { locationSchema } from "@/lib/validators/location";
import z from "zod";

export type Location = z.infer<typeof locationSchema>;
