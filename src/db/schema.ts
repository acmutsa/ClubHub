import { int, sqliteTable, text,primaryKey } from "drizzle-orm/sqlite-core";
import { user } from "./auth.schema";

export const clubs = sqliteTable("clubs", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text().notNull(),
});

export const membership = sqliteTable("membership", {
  userId: text().references(() => user.id),
  clubId: int().references(() => clubs.id),
}, (table) => [
  primaryKey({ columns: [table.userId, table.clubId] }),
]);


export * from "./auth.schema";
