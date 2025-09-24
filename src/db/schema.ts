import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth.schema";

export const clubs = sqliteTable("clubs", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text().notNull(),
});

export const membership = sqliteTable("membership", {
  id: int().primaryKey({ autoIncrement: true }),
  userId: int().references(() => user.id),
  clubId: int().references(() => clubs.id),
});

export * from "./auth.schema";
