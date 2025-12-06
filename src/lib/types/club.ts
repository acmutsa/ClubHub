import { clubs } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Club = InferSelectModel<typeof clubs>;
