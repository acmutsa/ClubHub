import { baseLocationSelectSchema } from "@/lib/validators/location";
import z from "zod";

export type SelectLocation = z.infer<typeof baseLocationSelectSchema>;
